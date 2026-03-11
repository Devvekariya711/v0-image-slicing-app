"use client"

import { useState, useEffect, useRef } from "react"
import { Bell, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { on } from "@/lib/events"
import Link from "next/link"

interface HeaderProps {
    title: string
    subtitle?: string
    actions?: React.ReactNode
}

interface SearchResult {
    id: string
    title: string
    source: string
    platform: string
}

interface Notification {
    id: string
    message: string
    time: string
}

export function Header({ title, subtitle, actions }: HeaderProps) {
    const [searchOpen, setSearchOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState<SearchResult[]>([])
    const [notifOpen, setNotifOpen] = useState(false)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [notifCount, setNotifCount] = useState(0)
    const searchRef = useRef<HTMLInputElement>(null)
    const notifRef = useRef<HTMLDivElement>(null)

    // Search media
    useEffect(() => {
        if (!searchQuery.trim()) { setSearchResults([]); return }
        const timer = setTimeout(() => {
            fetch(`/api/media?search=${encodeURIComponent(searchQuery)}&limit=8`)
                .then((r) => r.json())
                .then((d) => setSearchResults(d.items || []))
                .catch(() => setSearchResults([]))
        }, 300) // Debounce 300ms
        return () => clearTimeout(timer)
    }, [searchQuery])

    // Load notifications
    function loadNotifications() {
        fetch("/api/notifications")
            .then((r) => r.json())
            .then((d) => {
                setNotifications(d.notifications || [])
                setNotifCount(d.unread || 0)
            })
            .catch(() => { })
    }

    useEffect(() => {
        loadNotifications()
        const unsub = on("media:added", loadNotifications)
        return unsub
    }, [])

    // Focus search input when opened
    useEffect(() => {
        if (searchOpen) searchRef.current?.focus()
    }, [searchOpen])

    // Close popups on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
                setNotifOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClick)
        return () => document.removeEventListener("mousedown", handleClick)
    }, [])

    return (
        <header className="flex h-14 items-center justify-between border-b border-border bg-background/80 backdrop-blur-sm px-6">
            <div>
                <h1 className="text-lg font-semibold">{title}</h1>
                {subtitle && (
                    <p className="text-xs text-muted-foreground">{subtitle}</p>
                )}
            </div>

            <div className="flex items-center gap-2">
                {actions}

                {/* Search */}
                <div className="relative">
                    {searchOpen ? (
                        <div className="flex items-center gap-1">
                            <Input
                                ref={searchRef}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search media..."
                                className="w-56 h-8 text-sm"
                                onKeyDown={(e) => {
                                    if (e.key === "Escape") { setSearchOpen(false); setSearchQuery("") }
                                }}
                            />
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSearchOpen(false); setSearchQuery("") }}>
                                <X className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    ) : (
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => setSearchOpen(true)}>
                            <Search className="h-4 w-4" />
                        </Button>
                    )}

                    {/* Search Results Dropdown */}
                    {searchOpen && searchResults.length > 0 && (
                        <div className="absolute right-0 top-10 z-50 w-80 rounded-xl border border-border bg-card shadow-lg p-2 space-y-1">
                            {searchResults.map((r) => (
                                <Link
                                    key={r.id}
                                    href="/library"
                                    onClick={() => { setSearchOpen(false); setSearchQuery("") }}
                                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="truncate font-medium">{r.title}</p>
                                        <p className="text-xs text-muted-foreground capitalize">{r.source} • {r.platform || "local"}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                    {searchOpen && searchQuery.trim() && searchResults.length === 0 && (
                        <div className="absolute right-0 top-10 z-50 w-64 rounded-xl border border-border bg-card shadow-lg p-4 text-center text-sm text-muted-foreground">
                            No media found
                        </div>
                    )}
                </div>

                {/* Notifications */}
                <div className="relative" ref={notifRef}>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-foreground relative"
                        onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen) loadNotifications() }}
                    >
                        <Bell className="h-4 w-4" />
                        {notifCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-primary-foreground">
                                {notifCount > 9 ? "9+" : notifCount}
                            </span>
                        )}
                    </Button>

                    {notifOpen && (
                        <div className="absolute right-0 top-10 z-50 w-80 rounded-xl border border-border bg-card shadow-lg overflow-hidden">
                            <div className="px-4 py-3 border-b border-border">
                                <h3 className="text-sm font-semibold">Notifications</h3>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-4 text-center text-sm text-muted-foreground">No notifications yet</div>
                                ) : (
                                    notifications.map((n) => (
                                        <div key={n.id} className="px-4 py-3 border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                                            <p className="text-sm">{n.message}</p>
                                            <p className="text-[10px] text-muted-foreground mt-0.5">{n.time}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
