import { NextResponse } from "next/server"
import { getAll } from "@/lib/db"

// Notifications are derived from recent media activity (downloads + uploads)
// No separate notifications table needed — just query recent media events.

export async function GET() {
    try {
        const recentMedia = getAll<{
            id: string
            title: string
            source: string
            status: string
            created_at: string
        }>(
            `SELECT id, title, source, status, created_at FROM media
       ORDER BY created_at DESC
       LIMIT 10`
        )

        const notifications = recentMedia.map((m) => {
            const action = m.source === "download" ? "Downloaded" : "Uploaded"
            const status = m.status === "completed" ? "✅" : m.status === "failed" ? "❌" : "⏳"
            return {
                id: m.id,
                message: `${status} ${action}: ${m.title || "Untitled"}`,
                time: formatTimeAgo(m.created_at),
            }
        })

        // Count items from last 24h as "unread"
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        const unread = recentMedia.filter((m) => m.created_at > oneDayAgo).length

        return NextResponse.json({ notifications, unread })
    } catch (error) {
        console.error("Notifications error:", error)
        return NextResponse.json({ notifications: [], unread: 0 })
    }
}

function formatTimeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "Just now"
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    return `${days}d ago`
}
