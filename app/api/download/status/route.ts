import { NextRequest, NextResponse } from "next/server"
import { downloadMap } from "@/lib/downloader"

export async function GET(req: NextRequest) {
    const id = req.nextUrl.searchParams.get("id")

    if (!id) {
        return NextResponse.json({ error: "id parameter required" }, { status: 400 })
    }

    const entry = downloadMap.get(id)

    if (!entry) {
        // ID not in memory — check DB for completed/failed state
        return NextResponse.json({
            id,
            status: "failed",
            progress: 0,
            title: "",
            speed: "",
            eta: "",
            error: "Download not found — may have expired from memory",
        })
    }

    return NextResponse.json({
        id: entry.id,
        status: entry.status,
        progress: entry.progress,
        title: entry.title,
        speed: entry.speed,
        eta: entry.eta,
        error: entry.error,
    })
}
