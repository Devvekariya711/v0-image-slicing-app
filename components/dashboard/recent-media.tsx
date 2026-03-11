"use client"

import { useState, useEffect } from "react"
import { PLATFORMS, type PlatformKey, formatDuration } from "@/lib/constants"
import { FileVideo, ExternalLink } from "lucide-react"

interface MediaItem {
    id: string
    title: string
    platform: PlatformKey | null
    source: "download" | "upload"
    duration: number | null
    thumbnail: string | null
    created_at: string
}

export function RecentMedia() {
    const [items, setItems] = useState<MediaItem[]>([])

    useEffect(() => {
        fetch("/api/media?limit=6&sort=newest")
            .then((r) => r.json())
            .then((data) => setItems(data.items || []))
            .catch(console.error)
    }, [])

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Recent Media
                </h2>
                <a href="/library" className="text-xs text-primary hover:underline flex items-center gap-1">
                    View all <ExternalLink className="h-3 w-3" />
                </a>
            </div>

            {items.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-8 text-center">
                    <FileVideo className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No media yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Paste a link or upload a video to get started</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {items.map((item) => {
                        const platform = item.platform ? PLATFORMS[item.platform] : null
                        return (
                            <div key={item.id} className="group rounded-lg border border-border bg-card overflow-hidden hover:border-primary/50 transition-colors">
                                <div className="aspect-video bg-muted relative flex items-center justify-center">
                                    <FileVideo className="h-8 w-8 text-muted-foreground" />
                                    {item.duration && (
                                        <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-mono text-white">
                                            {formatDuration(item.duration)}
                                        </span>
                                    )}
                                    {platform && (
                                        <span
                                            className="absolute top-1 left-1 flex h-5 w-5 items-center justify-center rounded"
                                            style={{ color: platform.color }}
                                        >
                                            <platform.icon className="h-3.5 w-3.5" />
                                        </span>
                                    )}
                                </div>
                                <div className="p-2">
                                    <p className="text-xs font-medium truncate">{item.title}</p>
                                    <p className="text-[10px] text-muted-foreground mt-0.5 capitalize">{item.source}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
