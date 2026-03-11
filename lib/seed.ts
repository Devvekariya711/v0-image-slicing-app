import { v4 as uuid } from "uuid"
import { getDb } from "./db"

export function seedDatabase() {
    const db = getDb()

    // Check if already seeded
    const count = db.prepare("SELECT COUNT(*) as c FROM accounts").get() as { c: number }
    if (count.c > 0) return

    // ─── Seed Accounts ───────────────────────────────────────────────
    const accounts = [
        { id: uuid(), platform: "youtube", username: "my cat", display_name: "My Cat Channel", profile_url: "https://youtube.com/@mycat" },
        { id: uuid(), platform: "tiktok", username: "petlaughterhub1", display_name: "Pet Laugher Hub", profile_url: "https://tiktok.com/@petlaughterhub1" },
        { id: uuid(), platform: "instagram", username: "petlaughterhub", display_name: "Pet Laugher Hub", profile_url: "https://instagram.com/petlaughterhub" },
        { id: uuid(), platform: "x", username: "wormhole", display_name: "Wormhole", profile_url: "https://x.com/wormhole" },
    ]

    const insertAccount = db.prepare(
        "INSERT INTO accounts (id, platform, username, display_name, profile_url) VALUES (?, ?, ?, ?, ?)"
    )

    for (const a of accounts) {
        insertAccount.run(a.id, a.platform, a.username, a.display_name, a.profile_url)
    }

    // ─── Seed Analytics Data (30 days per account) ────────────────────
    const insertAnalytics = db.prepare(
        "INSERT INTO analytics_data (id, account_id, date, views, likes, comments, shares, followers) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    )

    for (const account of accounts) {
        let followerBase = Math.floor(Math.random() * 5000) + 500
        for (let i = 29; i >= 0; i--) {
            const date = new Date()
            date.setDate(date.getDate() - i)
            const dateStr = date.toISOString().split("T")[0]

            const views = Math.floor(Math.random() * 50000) + 1000
            const likes = Math.floor(views * (Math.random() * 0.05 + 0.01))
            const comments = Math.floor(likes * (Math.random() * 0.15 + 0.02))
            const shares = Math.floor(likes * (Math.random() * 0.1 + 0.01))
            followerBase += Math.floor(Math.random() * 50)

            insertAnalytics.run(
                uuid(), account.id, dateStr,
                views, likes, comments, shares, followerBase
            )
        }
    }

    console.log("✅ Database seeded with mock data")
}
