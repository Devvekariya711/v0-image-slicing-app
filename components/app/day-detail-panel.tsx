"use client"

import { PLATFORMS, type PlatformKey } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { X, Download, Upload, Clock, Check, AlertTriangle, Send, ExternalLink, RotateCcw } from "lucide-react"
import { format } from "date-fns"
import { useState } from "react"

export interface CalendarEvent {
    type: "download" | "upload" | "scheduled" | "published" | "failed" | "manual_publish"
    date: string
    time: string
    title: string
    platform?: string
    account_username?: string
    account_display_name?: string
    post_id?: string
    post_url?: string
    error?: string
    media_id?: string
    source_url?: string
}

const EVENT_CONFIG = {
    download: { label: "Downloads", icon: Download, color: "#3b82f6", bg: "bg-blue-500/10", dot: "bg-blue-500" },
    upload: { label: "Uploads", icon: Upload, color: "#a855f7", bg: "bg-purple-500/10", dot: "bg-purple-500" },
    scheduled: { label: "Scheduled", icon: Clock, color: "#f59e0b", bg: "bg-amber-500/10", dot: "bg-amber-500" },
    published: { label: "Published", icon: Check, color: "#22c55e", bg: "bg-green-500/10", dot: "bg-green-500" },
    failed: { label: "Failed", icon: AlertTriangle, color: "#ef4444", bg: "bg-red-500/10", dot: "bg-red-500" },
    manual_publish: { label: "Manual Publish", icon: Send, color: "#14b8a6", bg: "bg-teal-500/10", dot: "bg-teal-500" },
}

export { EVENT_CONFIG }

interface Props {
    date: Date
    events: CalendarEvent[]
    onClose: () => void
    onPublish?: (postId: string) => void
}

export function DayDetailPanel({ date, events, onClose, onPublish }: Props) {
    const [publishingId, setPublishingId] = useState<string | null>(null)

    const grouped = Object.entries(EVENT_CONFIG).map(([type, config]) => ({
        type,
        config,
        items: events.filter((e) => e.type === type),
    })).filter((g) => g.items.length > 0)

    async function handlePublish(postId: string) {
        setPublishingId(postId)
        try {
            await onPublish?.(postId)
        } finally {
            setPublishingId(null)
        }
    }

    return (
        <div className="fixed top-0 right-0 h-full w-[380px] bg-card border-l border-border shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div>
                    <h3 className="text-sm font-semibold">{format(date, "EEEE, MMMM d")}</h3>
                    <p className="text-xs text-muted-foreground">{events.length} event{events.length !== 1 ? "s" : ""}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* Events */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
                {grouped.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No events on this day</p>
                ) : (
                    grouped.map(({ type, config, items }) => {
                        const Icon = config.icon
                        return (
                            <div key={type}>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className={`h-5 w-5 rounded flex items-center justify-center ${config.bg}`}>
                                        <Icon className="h-3 w-3" style={{ color: config.color }} />
                                    </div>
                                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: config.color }}>
                                        {config.label} ({items.length})
                                    </span>
                                </div>
                                <div className="space-y-1.5 pl-7">
                                    {items.map((event, idx) => {
                                        const platform = event.platform ? PLATFORMS[event.platform as PlatformKey] : null
                                        return (
                                            <div key={`${type}-${idx}`} className="rounded-lg border border-border/50 bg-muted/20 p-2.5">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-medium truncate">{event.title}</p>
                                                        <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
                                                            <span>{event.time}</span>
                                                            {platform && (
                                                                <>
                                                                    <span>·</span>
                                                                    <platform.icon className="h-3 w-3" style={{ color: platform.color }} />
                                                                    <span>{platform.label}</span>
                                                                </>
                                                            )}
                                                            {event.account_username && (
                                                                <>
                                                                    <span>·</span>
                                                                    <span>@{event.account_username}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                        {event.error && (
                                                            <p className="text-xs text-red-400 mt-1">⚠ {event.error}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Action buttons */}
                                                <div className="flex items-center gap-1.5 mt-2">
                                                    {event.type === "scheduled" && event.post_id && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-6 text-[10px] gap-1 px-2"
                                                            disabled={publishingId === event.post_id}
                                                            onClick={() => handlePublish(event.post_id!)}
                                                        >
                                                            <Send className="h-2.5 w-2.5" />
                                                            {publishingId === event.post_id ? "Publishing..." : "Publish Now"}
                                                        </Button>
                                                    )}
                                                    {event.type === "failed" && event.post_id && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-6 text-[10px] gap-1 px-2 text-red-400 border-red-500/30"
                                                            disabled={publishingId === event.post_id}
                                                            onClick={() => handlePublish(event.post_id!)}
                                                        >
                                                            <RotateCcw className="h-2.5 w-2.5" />
                                                            {publishingId === event.post_id ? "Retrying..." : "Retry"}
                                                        </Button>
                                                    )}
                                                    {event.type === "published" && event.post_url && (
                                                        <Button variant="outline" size="sm" className="h-6 text-[10px] gap-1 px-2" asChild>
                                                            <a href={event.post_url} target="_blank" rel="noopener noreferrer">
                                                                <ExternalLink className="h-2.5 w-2.5" /> View Post
                                                            </a>
                                                        </Button>
                                                    )}
                                                    {event.type === "download" && event.source_url && (
                                                        <Button variant="outline" size="sm" className="h-6 text-[10px] gap-1 px-2" asChild>
                                                            <a href={event.source_url} target="_blank" rel="noopener noreferrer">
                                                                <ExternalLink className="h-2.5 w-2.5" /> Source
                                                            </a>
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
