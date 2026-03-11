// ─── Scheduler — Random Post Time Engine ────────────────────────────────────
// Picks a random time between 8am–11pm for each queued post.
// Avoids predictable patterns that look like bots.

import { getAll, run } from "@/lib/db"
import { randomTimeInWindow } from "@/lib/human-delay"
import { uploadToYouTube } from "@/lib/publishers/youtube"
import { uploadToTikTok } from "@/lib/publishers/tiktok"
import { uploadToInstagram } from "@/lib/publishers/instagram"

interface QueuedPost {
    id: string
    media_id: string
    account_id: string
    caption: string
    hashtags: string | null
    scheduled_at: string
    publish_status: string
    retry_count: number
    // Joined fields
    filepath: string
    title: string
    platform: string
    username: string
}

const MAX_RETRIES = 2
const SCHEDULER_WINDOW_START = 8   // 8am
const SCHEDULER_WINDOW_END = 23    // 11pm

/**
 * Assign a random scheduled_at time (within 8am–11pm today) to all posts
 * that have status='scheduled' but no random time assigned yet.
 */
export function assignRandomTimes(): void {
    const unassigned = getAll<{ id: string }>(
        `SELECT id FROM scheduled_posts
     WHERE status = 'scheduled'
       AND (random_schedule_set = 0 OR random_schedule_set IS NULL)
       AND date(scheduled_at) = date('now')`
    )

    for (const post of unassigned) {
        const randomTime = randomTimeInWindow(SCHEDULER_WINDOW_START, SCHEDULER_WINDOW_END)
        run(
            `UPDATE scheduled_posts SET scheduled_at = ?, random_schedule_set = 1 WHERE id = ?`,
            [randomTime.toISOString(), post.id]
        )
    }
}

/**
 * Get posts that are due within the next 5 minutes.
 * Avoids double-triggering by checking publish_status = 'pending'.
 */
export function getDuePosts(): QueuedPost[] {
    const now = new Date()
    const windowEnd = new Date(now.getTime() + 5 * 60 * 1000) // +5 min

    return getAll<QueuedPost>(
        `SELECT sp.*, m.filepath, m.title, a.platform, a.username
     FROM scheduled_posts sp
     JOIN media m ON sp.media_id = m.id
     JOIN accounts a ON sp.account_id = a.id
     WHERE sp.status = 'scheduled'
       AND (sp.publish_status = 'pending' OR sp.publish_status IS NULL)
       AND sp.retry_count < ?
       AND sp.scheduled_at > ?
       AND sp.scheduled_at <= ?
     ORDER BY sp.scheduled_at ASC`,
        [MAX_RETRIES + 1, now.toISOString(), windowEnd.toISOString()]
    )
}

/**
 * Execute a single publish job for a queued post.
 */
export async function executePublish(post: QueuedPost): Promise<void> {
    // Mark as publishing immediately to prevent double-trigger
    run(
        `UPDATE scheduled_posts SET publish_status = 'publishing', updated_at = datetime('now') WHERE id = ?`,
        [post.id]
    )

    const hashtags = post.hashtags ? post.hashtags.split(" ").filter(Boolean) : []

    try {
        let result: { success: boolean; url?: string; error?: string }

        switch (post.platform) {
            case "youtube":
                const ytResult = await uploadToYouTube(post.account_id, {
                    filepath: post.filepath,
                    title: post.title,
                    description: post.caption,
                    tags: hashtags,
                    privacyStatus: "public",
                })
                result = { success: true, url: ytResult.url }
                break

            case "tiktok":
                result = await uploadToTikTok(post.account_id, {
                    filepath: post.filepath,
                    caption: post.caption,
                    hashtags,
                })
                break

            case "instagram":
                result = await uploadToInstagram(post.account_id, {
                    filepath: post.filepath,
                    caption: post.caption,
                    hashtags,
                })
                break

            default:
                result = { success: false, error: `Platform '${post.platform}' not supported yet` }
        }

        if (result.success) {
            run(
                `UPDATE scheduled_posts SET
          publish_status = 'done',
          status = 'posted',
          published_at = datetime('now'),
          post_url = ?,
          updated_at = datetime('now')
         WHERE id = ?`,
                [result.url ?? null, post.id]
            )
        } else {
            const newRetry = post.retry_count + 1
            const finalStatus = newRetry >= MAX_RETRIES ? "failed" : "pending"

            // If CAPTCHA needed, mark as captcha and don't retry automatically
            if (result.error?.includes("CAPTCHA") || result.error?.includes("challenge_required")) {
                run(
                    `UPDATE scheduled_posts SET
            publish_status = 'captcha_needed',
            publish_error = ?,
            retry_count = ?,
            updated_at = datetime('now')
           WHERE id = ?`,
                    [result.error, newRetry, post.id]
                )
            } else {
                run(
                    `UPDATE scheduled_posts SET
            publish_status = ?,
            publish_error = ?,
            retry_count = ?,
            updated_at = datetime('now')
           WHERE id = ?`,
                    [finalStatus, result.error ?? "Unknown error", newRetry, post.id]
                )
            }
        }
    } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err)
        run(
            `UPDATE scheduled_posts SET
        publish_status = 'failed',
        publish_error = ?,
        retry_count = retry_count + 1,
        updated_at = datetime('now')
       WHERE id = ?`,
            [errorMsg, post.id]
        )
    }
}
