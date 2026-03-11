"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { detectPlatform, PLATFORMS, QUALITY_OPTIONS } from "@/lib/constants"
import { emit } from "@/lib/events"
import { Download, Loader2, LinkIcon, CheckCircle2, XCircle } from "lucide-react"

type Status = "idle" | "downloading" | "completed" | "failed"

export function LinkInput() {
    const [url, setUrl] = useState("")
    const [quality, setQuality] = useState("best")
    const [status, setStatus] = useState<Status>("idle")
    const [progress, setProgress] = useState(0)
    const [error, setError] = useState("")
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

    const platform = url ? detectPlatform(url) : null
    const PlatformIcon = platform ? PLATFORMS[platform].icon : null
    const platformColor = platform ? PLATFORMS[platform].color : undefined

    function cleanup() {
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
        }
    }

    async function handleDownload() {
        if (!url.trim()) return
        cleanup()
        setStatus("downloading")
        setProgress(0)
        setError("")

        try {
            const res = await fetch("/api/download", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url, quality }),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || "Download failed")
            }

            const data = await res.json()

            // Poll progress
            intervalRef.current = setInterval(async () => {
                try {
                    const statusRes = await fetch(`/api/download/status?id=${data.id}`)
                    const statusData = await statusRes.json()
                    setProgress(statusData.progress || 0)

                    if (statusData.status === "completed") {
                        cleanup()
                        setStatus("completed")
                        setProgress(100)
                        emit("media:added")
                        setTimeout(() => {
                            setStatus("idle")
                            setUrl("")
                            setProgress(0)
                        }, 3000)
                    } else if (statusData.status === "failed") {
                        cleanup()
                        setStatus("failed")
                        setError(statusData.error || "Download failed")
                    }
                } catch {
                    // Keep polling
                }
            }, 1000)
        } catch (err) {
            setStatus("failed")
            setError(err instanceof Error ? err.message : "Download failed")
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex gap-3">
                <div className="relative flex-1">
                    <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    {PlatformIcon && (
                        <div
                            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded"
                            style={{ color: platformColor }}
                        >
                            <PlatformIcon className="h-4 w-4" />
                        </div>
                    )}
                    <Input
                        placeholder="Paste YouTube, TikTok, Instagram, or X link..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleDownload()}
                        className="pl-10 pr-10 h-12 text-base"
                        disabled={status === "downloading"}
                    />
                </div>
                <Select value={quality} onValueChange={setQuality} disabled={status === "downloading"}>
                    <SelectTrigger className="w-44 h-12">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {QUALITY_OPTIONS.map((q) => (
                            <SelectItem key={q.value} value={q.value}>
                                {q.value === "best" ? "Best (Highest)" : q.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button
                    onClick={handleDownload}
                    disabled={!url.trim() || status === "downloading"}
                    className="h-12 px-6 gap-2"
                >
                    {status === "downloading" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : status === "completed" ? (
                        <CheckCircle2 className="h-4 w-4" />
                    ) : (
                        <Download className="h-4 w-4" />
                    )}
                    {status === "downloading" ? "Downloading..." : status === "completed" ? "Done!" : "Download"}
                </Button>
            </div>

            {status === "downloading" && (
                <div className="space-y-1.5">
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-muted-foreground">{progress}% complete</p>
                </div>
            )}

            {status === "failed" && (
                <div className="flex items-center gap-2 text-destructive text-sm">
                    <XCircle className="h-4 w-4" />
                    {error}
                </div>
            )}

            <p className="text-xs text-muted-foreground">
                Supports YouTube, TikTok, Instagram, X, Reddit, and 1000+ other sites via yt-dlp
            </p>
        </div>
    )
}
