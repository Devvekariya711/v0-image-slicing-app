import { NextResponse } from "next/server"
import { assignRandomTimes, getDuePosts, executePublish } from "@/lib/scheduler"

// GET /api/scheduler — Called every 5 minutes (by frontend setInterval or cron)
// 1. Assigns random times (8am–11pm) to any new scheduled posts
// 2. Checks if any posts are due within the next 5 minutes
// 3. Triggers publishing for due posts
export async function GET() {
    try {
        // Step 1: Assign random times to unprocessed posts
        assignRandomTimes()

        // Step 2: Find posts due in the next 5 minutes
        const duePosts = getDuePosts()

        if (duePosts.length === 0) {
            return NextResponse.json({ processed: 0, message: "No posts due" })
        }

        // Step 3: Execute publishing for each due post (sequentially to avoid rate limits)
        const results: Array<{ id: string; platform: string; status: string }> = []

        for (const post of duePosts) {
            try {
                await executePublish(post)
                results.push({ id: post.id, platform: post.platform, status: "triggered" })
            } catch (err) {
                const errMsg = err instanceof Error ? err.message : String(err)
                results.push({ id: post.id, platform: post.platform, status: `error: ${errMsg}` })
            }
        }

        return NextResponse.json({
            processed: results.length,
            results,
        })
    } catch (error) {
        console.error("Scheduler error:", error)
        return NextResponse.json({ error: "Scheduler failed" }, { status: 500 })
    }
}
