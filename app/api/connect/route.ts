import { NextRequest, NextResponse } from "next/server"
import { getYouTubeAuthUrl } from "@/lib/publishers/youtube"
import { getAllSessionStatuses, saveCookieSession } from "@/lib/session-manager"
import { insert, getOne } from "@/lib/db"
import { randomUUID } from "crypto"

// GET /api/connect — Get YouTube auth URL or list session statuses
export async function GET(req: NextRequest) {
    const action = req.nextUrl.searchParams.get("action")

    try {
        if (action === "youtube-auth-url") {
            const url = getYouTubeAuthUrl()
            return NextResponse.json({ url })
        }

        if (action === "session-statuses") {
            const statuses = getAllSessionStatuses()
            return NextResponse.json({ sessions: statuses })
        }

        return NextResponse.json({ error: "Unknown action" }, { status: 400 })
    } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error)
        return NextResponse.json({ error: errMsg }, { status: 500 })
    }
}

// Helper: find or create account
function findOrCreateAccount(platform: string, username: string): string {
    const existing = getOne<{ id: string }>(
        `SELECT id FROM accounts WHERE platform = ? AND username = ?`,
        [platform, username]
    )
    if (existing) return existing.id

    const id = randomUUID()
    insert("accounts", {
        id,
        platform,
        username,
        display_name: username,
        is_active: 1,
    })
    return id
}

// POST /api/connect — Instagram login or TikTok cookie save
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { action } = body

        if (action === "instagram-login") {
            const { username, password } = body
            if (!username || !password) {
                return NextResponse.json({ error: "Username and password required" }, { status: 400 })
            }

            // Auto-create account
            const accountId = findOrCreateAccount("instagram", username)

            const { authenticateInstagram } = await import("@/lib/publishers/instagram")
            const result = await authenticateInstagram(accountId, username, password)
            if (result.success) {
                return NextResponse.json({ success: true, message: "Instagram connected" })
            }
            return NextResponse.json({ error: result.error || "Login failed" }, { status: 401 })
        }

        if (action === "tiktok-save-cookies") {
            if (!body.cookies || !body.user_agent) {
                return NextResponse.json({ error: "Cookies and user_agent required" }, { status: 400 })
            }

            // Try to extract username from cookies, or use "tiktok_user"
            const username = body.username || "tiktok_user"
            const accountId = findOrCreateAccount("tiktok", username)

            saveCookieSession(accountId, "tiktok", {
                cookies: body.cookies,
                userAgent: body.user_agent,
                platform: "tiktok",
            })
            return NextResponse.json({ success: true, message: "TikTok session saved" })
        }

        return NextResponse.json({ error: "Unknown action" }, { status: 400 })
    } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error)
        return NextResponse.json({ error: errMsg }, { status: 500 })
    }
}
