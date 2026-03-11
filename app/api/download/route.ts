import { NextRequest, NextResponse } from "next/server"
import { startDownload } from "@/lib/downloader"

export async function POST(req: NextRequest) {
    try {
        const { url, quality } = await req.json()

        if (!url || typeof url !== "string") {
            return NextResponse.json({ error: "URL is required" }, { status: 400 })
        }

        // Basic URL sanity check
        try { new URL(url) } catch {
            return NextResponse.json({ error: "Invalid URL" }, { status: 400 })
        }

        const id = await startDownload(url, quality || "best")
        return NextResponse.json({ id, status: "downloading" })
    } catch (error) {
        console.error("Download start error:", error)
        return NextResponse.json({ error: "Failed to start download" }, { status: 500 })
    }
}
