"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/app/header"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PLATFORMS, type PlatformKey } from "@/lib/constants"
import { ExternalLink, Check, AlertTriangle, Clock, Trash2 } from "lucide-react"

interface Account {
    id: string
    platform: PlatformKey
    username: string
    display_name: string
    profile_url: string
    followers: number
    created_at: string
}

interface SessionInfo {
    account_id: string
    platform: string
    session_status: string
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    active: { label: "Connected", color: "text-green-500", bg: "bg-green-500/10" },
    pending: { label: "Not Connected", color: "text-zinc-400", bg: "bg-zinc-500/10" },
    expired: { label: "Session Expired", color: "text-yellow-500", bg: "bg-yellow-500/10" },
    captcha_needed: { label: "Action Required", color: "text-red-500", bg: "bg-red-500/10" },
}

export default function AccountsPage() {
    const [accounts, setAccounts] = useState<Account[]>([])
    const [sessions, setSessions] = useState<SessionInfo[]>([])
    const [igModal, setIgModal] = useState<{ open: boolean; accountId?: string }>({ open: false })
    const [ttModal, setTtModal] = useState<{ open: boolean; accountId?: string }>({ open: false })
    const [igForm, setIgForm] = useState({ username: "", password: "" })
    const [ttCookies, setTtCookies] = useState("")
    const [loading, setLoading] = useState("")
    const [toast, setToast] = useState("")
    const searchParams = useSearchParams()

    function loadAccounts() {
        fetch("/api/accounts").then((r) => r.json()).then((d) => setAccounts(d.accounts || []))
    }
    function loadSessions() {
        fetch("/api/connect?action=session-statuses").then((r) => r.json()).then((d) => setSessions(d.sessions || []))
    }

    useEffect(() => { loadAccounts(); loadSessions() }, [])


    // Show toast if redirected from YouTube OAuth
    useEffect(() => {
        const connected = searchParams.get("connected")
        const name = searchParams.get("name")
        const error = searchParams.get("error")
        if (connected) {
            setToast(`✅ ${name || connected} connected successfully!`)
            loadAccounts(); loadSessions()
            // Clean URL
            window.history.replaceState({}, "", "/accounts")
            setTimeout(() => setToast(""), 5000)
        }
        if (error) {
            setToast(`❌ Error: ${error}`)
            window.history.replaceState({}, "", "/accounts")
            setTimeout(() => setToast(""), 8000)
        }
    }, [searchParams])

    function getStatus(accountId: string) {
        return sessions.find((s) => s.account_id === accountId)?.session_status ?? "pending"
    }

    // ─── YouTube: one click → Google popup (auto-exchanges on callback)
    function connectYouTube() {
        setLoading("youtube")
        fetch("/api/connect?action=youtube-auth-url")
            .then((r) => r.json())
            .then(({ url }) => { window.location.href = url }) // Full redirect, not popup
            .catch(() => { setToast("❌ Failed to get YouTube auth URL"); setLoading("") })
    }

    // ─── Instagram: simple email + password modal
    async function connectInstagram() {
        if (!igForm.username || !igForm.password) return
        setLoading("instagram")
        try {
            const res = await fetch("/api/connect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "instagram-login",
                    account_id: igModal.accountId || "new",
                    username: igForm.username,
                    password: igForm.password,
                }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setIgModal({ open: false })
            setIgForm({ username: "", password: "" })
            setToast(`✅ Instagram @${igForm.username} connected!`)
            loadAccounts(); loadSessions()
        } catch (err) {
            setToast(`❌ ${err instanceof Error ? err.message : "Instagram login failed"}`)
        } finally { setLoading("") }
    }

    // ─── TikTok: paste cookies
    async function connectTikTok() {
        if (!ttCookies.trim()) return
        setLoading("tiktok")
        try {
            const cookies = JSON.parse(ttCookies)
            const res = await fetch("/api/connect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "tiktok-save-cookies",
                    account_id: ttModal.accountId || "new",
                    cookies,
                    user_agent: navigator.userAgent,
                }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setTtModal({ open: false })
            setTtCookies("")
            setToast("✅ TikTok connected!")
            loadAccounts(); loadSessions()
        } catch (err) {
            setToast(`❌ ${err instanceof Error ? err.message : "Invalid cookies"}`)
        } finally { setLoading("") }
    }

    async function removeAccount(id: string) {
        await fetch(`/api/accounts?id=${id}`, { method: "DELETE" })
        loadAccounts(); loadSessions()
    }

    const connectedPlatforms = new Set(accounts.map((a) => a.platform))

    return (
        <>
            <Header title="Social Accounts" subtitle={`${accounts.length} connected`} />
            <div className="flex-1 overflow-y-auto p-6 space-y-6">

                {/* Toast notification */}
                {toast && (
                    <div className={`rounded-lg px-4 py-3 text-sm font-medium transition-all ${toast.startsWith("✅") ? "bg-green-500/15 text-green-400 border border-green-500/20" : "bg-red-500/15 text-red-400 border border-red-500/20"}`}>
                        {toast}
                    </div>
                )}

                {/* ─── Connect Buttons (only for platforms not yet added) ─── */}
                <div className="rounded-xl border border-border bg-card p-5">
                    <h2 className="text-sm font-semibold mb-4">Connect a Platform</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* YouTube */}
                        <button
                            onClick={connectYouTube}
                            disabled={loading === "youtube"}
                            className="flex items-center gap-3 rounded-xl border border-border p-4 hover:bg-muted/40 transition-all group disabled:opacity-50"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: PLATFORMS.youtube.color + "20" }}>
                                <PLATFORMS.youtube.icon className="h-5 w-5" style={{ color: PLATFORMS.youtube.color }} />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-medium group-hover:text-foreground">
                                    {loading === "youtube" ? "Redirecting..." : connectedPlatforms.has("youtube") ? "Reconnect YouTube" : "Connect YouTube"}
                                </p>
                                <p className="text-[11px] text-muted-foreground">Sign in with Google</p>
                            </div>
                        </button>

                        {/* Instagram */}
                        <button
                            onClick={() => setIgModal({ open: true })}
                            className="flex items-center gap-3 rounded-xl border border-border p-4 hover:bg-muted/40 transition-all group"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: PLATFORMS.instagram.color + "20" }}>
                                <PLATFORMS.instagram.icon className="h-5 w-5" style={{ color: PLATFORMS.instagram.color }} />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-medium group-hover:text-foreground">
                                    {connectedPlatforms.has("instagram") ? "Reconnect Instagram" : "Connect Instagram"}
                                </p>
                                <p className="text-[11px] text-muted-foreground">Login with email & password</p>
                            </div>
                        </button>

                        {/* TikTok */}
                        <button
                            onClick={() => setTtModal({ open: true })}
                            className="flex items-center gap-3 rounded-xl border border-border p-4 hover:bg-muted/40 transition-all group"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: PLATFORMS.tiktok.color + "20" }}>
                                <PLATFORMS.tiktok.icon className="h-5 w-5" style={{ color: PLATFORMS.tiktok.color }} />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-medium group-hover:text-foreground">
                                    {connectedPlatforms.has("tiktok") ? "Reconnect TikTok" : "Connect TikTok"}
                                </p>
                                <p className="text-[11px] text-muted-foreground">Via browser cookies</p>
                            </div>
                        </button>
                    </div>
                </div>

                {/* ─── Connected Accounts List ─── */}
                {accounts.length > 0 && (
                    <div className="rounded-xl border border-border bg-card">
                        <div className="px-5 py-3 border-b border-border">
                            <h2 className="text-sm font-semibold">Connected Accounts</h2>
                        </div>
                        <div className="divide-y divide-border">
                            {accounts.map((account) => {
                                const platform = PLATFORMS[account.platform]
                                const status = getStatus(account.id)
                                const badge = STATUS_CONFIG[status] || STATUS_CONFIG.pending

                                return (
                                    <div key={account.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/20 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: platform.color + "20" }}>
                                                <platform.icon className="h-4 w-4" style={{ color: platform.color }} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium">{account.display_name || account.username}</span>
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${badge.bg} ${badge.color}`}>
                                                        {badge.label}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground">@{account.username}{account.followers > 0 ? ` · ${account.followers.toLocaleString()} followers` : ""}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {account.profile_url && (
                                                <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-muted-foreground">
                                                    <a href={account.profile_url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3.5 w-3.5" /></a>
                                                </Button>
                                            )}
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeAccount(account.id)}>
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Instagram Login Modal */}
            <Dialog open={igModal.open} onOpenChange={(v) => setIgModal({ open: v })}>
                <DialogContent className="max-w-sm">
                    <DialogHeader><DialogTitle>Connect Instagram</DialogTitle></DialogHeader>
                    <div className="space-y-4 pt-1">
                        <p className="text-xs text-muted-foreground">Uses Instagram&apos;s mobile API — same as the official app. Credentials stored locally &amp; encrypted.</p>
                        <div>
                            <Label className="text-xs">Username</Label>
                            <Input placeholder="your.username" value={igForm.username} onChange={(e) => setIgForm((f) => ({ ...f, username: e.target.value }))} className="mt-1" />
                        </div>
                        <div>
                            <Label className="text-xs">Password</Label>
                            <Input type="password" placeholder="••••••••" value={igForm.password} onChange={(e) => setIgForm((f) => ({ ...f, password: e.target.value }))} className="mt-1" />
                        </div>
                        <Button onClick={connectInstagram} disabled={loading === "instagram" || !igForm.username || !igForm.password} className="w-full">
                            {loading === "instagram" ? "Connecting..." : "Connect"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* TikTok Cookie Modal */}
            <Dialog open={ttModal.open} onOpenChange={(v) => setTtModal({ open: v })}>
                <DialogContent className="max-w-sm">
                    <DialogHeader><DialogTitle>Connect TikTok</DialogTitle></DialogHeader>
                    <div className="space-y-4 pt-1">
                        <ol className="text-xs text-muted-foreground space-y-1 list-decimal pl-3.5">
                            <li>Log in to TikTok in Chrome</li>
                            <li>Install &quot;Cookie-Editor&quot; extension</li>
                            <li>Go to tiktok.com → click extension → Export</li>
                            <li>Paste below</li>
                        </ol>
                        <textarea
                            placeholder='[{"name":"...","value":"..."}]'
                            value={ttCookies}
                            onChange={(e) => setTtCookies(e.target.value)}
                            className="w-full rounded-lg border border-border bg-background p-3 text-xs font-mono h-28 resize-none"
                        />
                        <Button onClick={connectTikTok} disabled={loading === "tiktok" || !ttCookies.trim()} className="w-full">
                            {loading === "tiktok" ? "Saving..." : "Connect"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
