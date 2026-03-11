"use client"

import { useState, useEffect } from "react"
import { PLATFORMS, type PlatformKey } from "@/lib/constants"
import { CalendarDays, Clock } from "lucide-react"
import { format } from "date-fns"

interface PostItem {
    id: string
    caption: string | null
    scheduled_at: string
    status: string
    media_title: string
    platform: PlatformKey
}

export function UpcomingPosts() {
    const [posts, setPosts] = useState<PostItem[]>([])

    useEffect(() => {
        fetch("/api/schedule?limit=3&upcoming=true")
            .then((r) => r.json())
            .then((data) => setPosts(data.posts || []))
            .catch(console.error)
    }, [])

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Upcoming Posts
                </h2>
                <a href="/calendar" className="text-xs text-primary hover:underline">
                    View calendar
                </a>
            </div>

            {posts.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-6 text-center">
                    <CalendarDays className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No upcoming posts</p>
                    <p className="text-xs text-muted-foreground mt-1">Schedule from the calendar page</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {posts.map((post) => {
                        const platform = PLATFORMS[post.platform]
                        const date = new Date(post.scheduled_at)
                        return (
                            <div key={post.id} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 hover:border-primary/50 transition-colors">
                                <div
                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                                    style={{ backgroundColor: platform.color + "20", color: platform.color }}
                                >
                                    <platform.icon className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">
                                        {post.caption || post.media_title}
                                    </p>
                                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                                        <Clock className="h-3 w-3" />
                                        {format(date, "MMM d, h:mm a")}
                                    </div>
                                </div>
                                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${post.status === "scheduled" ? "bg-primary/10 text-primary" :
                                        post.status === "posted" ? "bg-green-500/10 text-green-400" :
                                            "bg-muted text-muted-foreground"
                                    }`}>
                                    {post.status}
                                </span>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
