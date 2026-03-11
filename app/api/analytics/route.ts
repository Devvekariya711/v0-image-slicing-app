import { NextRequest, NextResponse } from "next/server"
import { getAll } from "@/lib/db"
import { seedDatabase } from "@/lib/seed"

export async function GET(req: NextRequest) {
    try {
        seedDatabase()

        const range = req.nextUrl.searchParams.get("range") || "7d"
        const platform = req.nextUrl.searchParams.get("platform") || "all"

        // Calculate date range
        const days = range === "90d" ? 90 : range === "30d" ? 30 : 7
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)
        const startStr = startDate.toISOString().split("T")[0]

        let platformFilter = ""
        const params: unknown[] = [startStr]

        if (platform !== "all") {
            platformFilter = "AND a.platform = ?"
            params.push(platform)
        }

        // Daily breakdown
        const daily = getAll<{
            date: string; views: number; likes: number; comments: number; shares: number
        }>(
            `SELECT ad.date,
              SUM(ad.views) as views,
              SUM(ad.likes) as likes,
              SUM(ad.comments) as comments,
              SUM(ad.shares) as shares
       FROM analytics_data ad
       JOIN accounts a ON ad.account_id = a.id
       WHERE ad.date >= ? ${platformFilter}
       GROUP BY ad.date
       ORDER BY ad.date ASC`,
            params
        )

        // Summary totals
        const summary = getAll<{
            views: number; likes: number; comments: number; shares: number
        }>(
            `SELECT COALESCE(SUM(ad.views),0) as views,
              COALESCE(SUM(ad.likes),0) as likes,
              COALESCE(SUM(ad.comments),0) as comments,
              COALESCE(SUM(ad.shares),0) as shares
       FROM analytics_data ad
       JOIN accounts a ON ad.account_id = a.id
       WHERE ad.date >= ? ${platformFilter}`,
            params
        )[0]

        // By platform
        const byPlatform = getAll<{
            platform: string; views: number; likes: number; comments: number; shares: number
        }>(
            `SELECT a.platform,
              COALESCE(SUM(ad.views),0) as views,
              COALESCE(SUM(ad.likes),0) as likes,
              COALESCE(SUM(ad.comments),0) as comments,
              COALESCE(SUM(ad.shares),0) as shares
       FROM analytics_data ad
       JOIN accounts a ON ad.account_id = a.id
       WHERE ad.date >= ?
       GROUP BY a.platform`,
            [startStr]
        )

        const byPlatformMap: Record<string, unknown> = {}
        for (const p of byPlatform) {
            byPlatformMap[p.platform] = p
        }

        return NextResponse.json({
            summary: summary || { views: 0, likes: 0, comments: 0, shares: 0 },
            daily,
            by_platform: byPlatformMap,
        })
    } catch (error) {
        console.error("Analytics error:", error)
        return NextResponse.json({
            summary: { views: 0, likes: 0, comments: 0, shares: 0 },
            daily: [],
            by_platform: {},
        })
    }
}
