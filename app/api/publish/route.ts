import { NextRequest, NextResponse } from "next/server"
import { getOne, getAll, run } from "@/lib/db"
import { uploadToYouTube } from "@/lib/publishers/youtube"
import { uploadToTikTok } from "@/lib/publishers/tiktok"
import { uploadToInstagram } from "@/lib/publishers/instagram"

// POST /api/publish — Direct publish (no scheduling needed)
// Body: { account_id, media_id, caption?, hashtags?, title? }
// OR: { post_id } to publish a scheduled post
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()

        // Option 1: Direct publish — pick a media file + account
        if (body.account_id && body.media_id) {
            const { account_id, media_id, caption, hashtags, title } = body

            const account = getOne<{ id: string; platform: string; username: string }>(
                `SELECT * FROM accounts WHERE id = ?`, [account_id]
            )
            if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 })

            const media = getOne<{ filepath: string; title: string }>(
                `SELECT * FROM media WHERE id = ?`, [media_id]
            )
            if (!media) return NextResponse.json({ error: "Media not found" }, { status: 404 })

            const hashtagList = hashtags
                ? (typeof hashtags === "string" ? hashtags.split(" ").filter(Boolean) : hashtags)
                : []

            let result: { success: boolean; url?: string; videoId?: string; error?: string }

            switch (account.platform) {
                case "youtube":
                    try {
                        const ytResult = await uploadToYouTube(account_id, {
                            filepath: media.filepath,
                            title: title || media.title || "Untitled",
                            description: caption || "",
                            tags: hashtagList,
                            privacyStatus: "public",
                        })
                        result = { success: true, url: ytResult.url }
                    } catch (err) {
                        result = { success: false, error: err instanceof Error ? err.message : String(err) }
                    }
                    break

                case "tiktok":
                    result = await uploadToTikTok(account_id, {
                        filepath: media.filepath,
                        caption: caption || media.title || "",
                        hashtags: hashtagList,
                    })
                    break

                case "instagram":
                    result = await uploadToInstagram(account_id, {
                        filepath: media.filepath,
                        caption: caption || media.title || "",
                        hashtags: hashtagList,
                    })
                    break

                default:
                    result = { success: false, error: `Platform '${account.platform}' not supported` }
            }

            if (result.success) {
                return NextResponse.json({
                    success: true,
                    message: `Published to ${account.platform}`,
                    url: result.url,
                })
            } else {
                return NextResponse.json({ error: result.error || "Publish failed" }, { status: 500 })
            }
        }

        // Option 2: Publish a scheduled post (legacy)
        if (body.post_id) {
            const { executePublish } = await import("@/lib/scheduler")
            const post = getOne<{
                id: string; media_id: string; account_id: string; caption: string;
                hashtags: string | null; scheduled_at: string; publish_status: string;
                retry_count: number; filepath: string; title: string; platform: string; username: string
            }>(
                `SELECT sp.*, m.filepath, m.title, a.platform, a.username
                 FROM scheduled_posts sp
                 JOIN media m ON sp.media_id = m.id
                 JOIN accounts a ON sp.account_id = a.id
                 WHERE sp.id = ?`,
                [body.post_id]
            )

            if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 })
            if (post.publish_status === "done") return NextResponse.json({ error: "Already published" }, { status: 409 })

            executePublish(post).catch(console.error)
            return NextResponse.json({ success: true, message: "Publishing started" })
        }

        return NextResponse.json({ error: "Provide account_id + media_id, or post_id" }, { status: 400 })
    } catch (error) {
        console.error("Publish error:", error)
        return NextResponse.json({ error: "Publish failed" }, { status: 500 })
    }
}

// GET /api/publish — List available media and connected accounts for publish UI
export async function GET() {
    try {
        const media = getAll<{ id: string; title: string; filename: string; filepath: string; source: string }>(
            `SELECT id, title, filename, filepath, source FROM media WHERE status = 'completed' ORDER BY created_at DESC LIMIT 50`
        )

        const accounts = getAll<{ id: string; platform: string; username: string; display_name: string }>(
            `SELECT a.id, a.platform, a.username, a.display_name
             FROM accounts a
             JOIN platform_sessions ps ON a.id = ps.account_id
             WHERE ps.session_status = 'active' AND a.is_active = 1`
        )

        return NextResponse.json({ media, accounts })
    } catch (error) {
        console.error("Publish data error:", error)
        return NextResponse.json({ media: [], accounts: [] })
    }
}
