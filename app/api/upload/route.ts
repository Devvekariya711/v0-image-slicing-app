import { NextRequest, NextResponse } from "next/server"
import { v4 as uuid } from "uuid"
import path from "path"
import fs from "fs"
import { insert } from "@/lib/db"
import { ACCEPTED_VIDEO_EXTENSIONS } from "@/lib/constants"

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData()
        const file = formData.get("file") as File | null

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 })
        }

        // Validate file type
        const ext = "." + file.name.split(".").pop()?.toLowerCase()
        if (!ACCEPTED_VIDEO_EXTENSIONS.includes(ext)) {
            return NextResponse.json(
                { error: `Invalid file type. Only video files allowed: ${ACCEPTED_VIDEO_EXTENSIONS.join(", ")}` },
                { status: 400 }
            )
        }

        // Check file size (2GB limit)
        if (file.size > 2 * 1024 * 1024 * 1024) {
            return NextResponse.json({ error: "File too large. Maximum size is 2GB." }, { status: 413 })
        }

        const id = uuid()
        const uploadDir = path.join(process.cwd(), "media", "uploads")
        fs.mkdirSync(uploadDir, { recursive: true })

        // Create safe filename
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
        const filename = `${Date.now()}_${safeName}`
        const filepath = path.join(uploadDir, filename)

        // Write file to disk
        const bytes = await file.arrayBuffer()
        fs.writeFileSync(filepath, Buffer.from(bytes))

        // Get title from filename (without extension)
        const title = file.name.replace(/\.[^.]+$/, "")

        // Insert into database
        insert("media", {
            id,
            title,
            filename,
            filepath: `media/uploads/${filename}`,
            source: "upload",
            platform: null,
            url: null,
            filesize: file.size,
            status: "completed",
            progress: 100,
        })

        return NextResponse.json({
            id,
            status: "completed",
            filename,
            filesize: file.size,
            title,
        })
    } catch (error) {
        console.error("Upload error:", error)
        return NextResponse.json({ error: "Upload failed" }, { status: 500 })
    }
}
