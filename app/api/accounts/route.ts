import { NextRequest, NextResponse } from "next/server"
import { v4 as uuid } from "uuid"
import { getAll, insert, deleteById, run } from "@/lib/db"
import { seedDatabase } from "@/lib/seed"

export async function GET(req: NextRequest) {
    try {
        seedDatabase()
        const platform = req.nextUrl.searchParams.get("platform")

        let sql = "SELECT * FROM accounts WHERE is_active = 1"
        const params: unknown[] = []

        if (platform) {
            sql += " AND platform = ?"
            params.push(platform)
        }

        sql += " ORDER BY created_at DESC"
        const accounts = getAll(sql, params)
        return NextResponse.json({ accounts })
    } catch (error) {
        console.error("Accounts list error:", error)
        return NextResponse.json({ accounts: [] })
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { platform, username, display_name, profile_url } = body

        if (!platform || !username) {
            return NextResponse.json({ error: "Platform and username are required" }, { status: 400 })
        }

        // Check for duplicate
        const existing = getAll(
            "SELECT id FROM accounts WHERE platform = ? AND username = ?",
            [platform, username]
        )
        if (existing.length > 0) {
            return NextResponse.json({ error: "Account already exists" }, { status: 409 })
        }

        const id = uuid()
        insert("accounts", {
            id,
            platform,
            username,
            display_name: display_name || username,
            profile_url: profile_url || "",
        })

        const account = getAll("SELECT * FROM accounts WHERE id = ?", [id])[0]
        return NextResponse.json(account, { status: 201 })
    } catch (error) {
        console.error("Account create error:", error)
        return NextResponse.json({ error: "Failed to create account" }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const id = req.nextUrl.searchParams.get("id")
        if (!id) {
            return NextResponse.json({ error: "id required" }, { status: 400 })
        }

        deleteById("accounts", id)
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Account delete error:", error)
        return NextResponse.json({ error: "Delete failed" }, { status: 500 })
    }
}
