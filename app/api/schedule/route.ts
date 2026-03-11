import { NextRequest, NextResponse } from "next/server"
import { v4 as uuid } from "uuid"
import { getAll, insert, run, deleteById } from "@/lib/db"

export async function GET(req: NextRequest) {
    try {
        const month = req.nextUrl.searchParams.get("month")
        const limit = req.nextUrl.searchParams.get("limit")
        const upcoming = req.nextUrl.searchParams.get("upcoming")

        let sql = `
      SELECT sp.*, m.title as media_title, m.thumbnail, a.platform, a.username as account_username
      FROM scheduled_posts sp
      LEFT JOIN media m ON sp.media_id = m.id
      LEFT JOIN accounts a ON sp.account_id = a.id
    `
        const params: unknown[] = []

        if (upcoming === "true") {
            sql += " WHERE sp.scheduled_at >= datetime('now') AND sp.status IN ('draft','scheduled')"
            sql += " ORDER BY sp.scheduled_at ASC"
            if (limit) {
                sql += " LIMIT ?"
                params.push(parseInt(limit))
            }
        } else if (month) {
            sql += " WHERE sp.scheduled_at LIKE ?"
            params.push(`${month}%`)
            sql += " ORDER BY sp.scheduled_at ASC"
        } else {
            sql += " ORDER BY sp.scheduled_at DESC"
            if (limit) {
                sql += " LIMIT ?"
                params.push(parseInt(limit))
            }
        }

        const posts = getAll(sql, params)
        return NextResponse.json({ posts })
    } catch (error) {
        console.error("Schedule list error:", error)
        return NextResponse.json({ posts: [] })
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { media_id, account_id, caption, hashtags, scheduled_at, status } = body

        if (!media_id || !account_id || !scheduled_at) {
            return NextResponse.json(
                { error: "media_id, account_id, and scheduled_at are required" },
                { status: 400 }
            )
        }

        const id = uuid()
        insert("scheduled_posts", {
            id,
            media_id,
            account_id,
            caption: caption || "",
            hashtags: hashtags || "",
            scheduled_at,
            status: status || "scheduled",
        })

        const post = getAll("SELECT * FROM scheduled_posts WHERE id = ?", [id])[0]
        return NextResponse.json(post, { status: 201 })
    } catch (error) {
        console.error("Schedule create error:", error)
        return NextResponse.json({ error: "Failed to create scheduled post" }, { status: 500 })
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json()
        const { id, ...updates } = body

        if (!id) {
            return NextResponse.json({ error: "id required" }, { status: 400 })
        }

        const sets = Object.keys(updates).map((k) => `${k} = ?`).join(", ")
        const values = Object.values(updates)

        run(`UPDATE scheduled_posts SET ${sets}, updated_at = datetime('now') WHERE id = ?`, [...values, id])

        const post = getAll("SELECT * FROM scheduled_posts WHERE id = ?", [id])[0]
        return NextResponse.json(post)
    } catch (error) {
        console.error("Schedule update error:", error)
        return NextResponse.json({ error: "Update failed" }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const id = req.nextUrl.searchParams.get("id")
        if (!id) {
            return NextResponse.json({ error: "id required" }, { status: 400 })
        }

        deleteById("scheduled_posts", id)
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Schedule delete error:", error)
        return NextResponse.json({ error: "Delete failed" }, { status: 500 })
    }
}
