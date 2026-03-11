import { NextResponse } from "next/server"
import { getAll } from "@/lib/db"
import { seedDatabase } from "@/lib/seed"

export async function GET() {
    try {
        // Ensure seed data exists
        seedDatabase()

        const media = getAll<{ c: number }>("SELECT COUNT(*) as c FROM media")[0]
        const accounts = getAll<{ c: number }>("SELECT COUNT(*) as c FROM accounts")[0]
        const scheduled = getAll<{ c: number }>(
            "SELECT COUNT(*) as c FROM scheduled_posts WHERE status IN ('draft','scheduled')"
        )[0]
        const views = getAll<{ v: number }>(
            "SELECT COALESCE(SUM(views), 0) as v FROM analytics_data"
        )[0]

        return NextResponse.json({
            total_media: media?.c || 0,
            connected_accounts: accounts?.c || 0,
            scheduled_posts: scheduled?.c || 0,
            total_views: views?.v || 0,
        })
    } catch (error) {
        console.error("Stats error:", error)
        return NextResponse.json({ total_media: 0, connected_accounts: 0, scheduled_posts: 0, total_views: 0 })
    }
}
