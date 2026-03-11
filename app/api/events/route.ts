import { NextRequest, NextResponse } from "next/server"
import { getAll } from "@/lib/db"

// Event types for the calendar activity hub
export type EventType = "download" | "upload" | "scheduled" | "published" | "failed" | "manual_publish"

interface CalendarEvent {
    type: EventType
    date: string        // YYYY-MM-DD
    time: string        // HH:MM
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

// GET /api/events?month=2026-03
export async function GET(req: NextRequest) {
    try {
        const month = req.nextUrl.searchParams.get("month") // e.g. "2026-03"
        if (!month) {
            return NextResponse.json({ error: "month param required (YYYY-MM)" }, { status: 400 })
        }

        const startDate = `${month}-01`
        const [y, m] = month.split("-").map(Number)
        const endDate = `${y}-${String(m + 1).padStart(2, "0")}-01`

        // ─── Downloads ───
        const downloads = getAll<{
            title: string; created_at: string; platform: string; url: string; id: string
        }>(
            `SELECT id, title, created_at, platform, url
             FROM media
             WHERE source = 'download' AND status = 'completed'
               AND created_at >= ? AND created_at < ?
             ORDER BY created_at`,
            [startDate, endDate]
        ).map((r) => ({
            type: "download" as EventType,
            date: r.created_at.substring(0, 10),
            time: r.created_at.substring(11, 16) || "00:00",
            title: r.title,
            platform: r.platform,
            media_id: r.id,
            source_url: r.url,
        }))

        // ─── Uploads from device ───
        const uploads = getAll<{
            title: string; created_at: string; id: string
        }>(
            `SELECT id, title, created_at
             FROM media
             WHERE source = 'upload' AND status = 'completed'
               AND created_at >= ? AND created_at < ?
             ORDER BY created_at`,
            [startDate, endDate]
        ).map((r) => ({
            type: "upload" as EventType,
            date: r.created_at.substring(0, 10),
            time: r.created_at.substring(11, 16) || "00:00",
            title: r.title,
            media_id: r.id,
        }))

        // ─── Scheduled posts (all statuses) ───
        const postRows = getAll<{
            id: string; scheduled_at: string; caption: string; status: string;
            publish_status: string; publish_error: string; published_at: string;
            post_url: string; media_title: string; platform: string;
            username: string; display_name: string
        }>(
            `SELECT sp.id, sp.scheduled_at, sp.caption, sp.status,
                    COALESCE(sp.publish_status, '') as publish_status,
                    COALESCE(sp.publish_error, '') as publish_error,
                    COALESCE(sp.published_at, '') as published_at,
                    COALESCE(sp.post_url, '') as post_url,
                    m.title as media_title, a.platform, a.username, a.display_name
             FROM scheduled_posts sp
             JOIN media m ON sp.media_id = m.id
             JOIN accounts a ON sp.account_id = a.id
             WHERE sp.scheduled_at >= ? AND sp.scheduled_at < ?
             ORDER BY sp.scheduled_at`,
            [startDate, endDate]
        )

        const postEvents: CalendarEvent[] = postRows.map((p) => {
            let type: EventType = "scheduled"

            if (p.publish_status === "done" || p.status === "posted") {
                type = "published"
            } else if (p.publish_status === "failed" || p.status === "failed") {
                type = "failed"
            }

            return {
                type,
                date: p.scheduled_at.substring(0, 10),
                time: p.scheduled_at.substring(11, 16) || "12:00",
                title: p.media_title || p.caption || "Untitled",
                platform: p.platform,
                account_username: p.username,
                account_display_name: p.display_name,
                post_id: p.id,
                post_url: p.post_url || undefined,
                error: p.publish_error || undefined,
            }
        })

        const events: CalendarEvent[] = [...downloads, ...uploads, ...postEvents]
            .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`))

        return NextResponse.json({ events })
    } catch (error) {
        console.error("Events API error:", error)
        return NextResponse.json({ events: [] })
    }
}
