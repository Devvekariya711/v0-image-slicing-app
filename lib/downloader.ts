import { spawn } from "child_process"
import path from "path"
import fs from "fs"
import os from "os"
import { run, insert } from "./db"
import { detectPlatform } from "./constants"
import { v4 as uuid } from "uuid"

// ─── Shared In-Memory Download Tracker ──────────────────────────────
// Must live in a single module so both /api/download and /api/download/status
// share the same Map instance within the Node.js process.

export interface DownloadEntry {
    id: string
    status: "downloading" | "completed" | "failed"
    progress: number
    title: string
    speed: string
    eta: string
    error: string
    url: string
}

// Attach to globalThis so the Map survives hot-reload in dev
declare global {
    // eslint-disable-next-line no-var
    var __downloadMap: Map<string, DownloadEntry> | undefined
}

export const downloadMap: Map<string, DownloadEntry> =
    globalThis.__downloadMap ?? (globalThis.__downloadMap = new Map())

// ─── Find yt-dlp executable ─────────────────────────────────────────
function findYtDlp(): { cmd: string; args: string[] } {
    // 1. Check known Windows Python user scripts location
    const userScripts = path.join(
        os.homedir(),
        "AppData", "Roaming", "Python",
        `Python${process.version.slice(1).split(".")[0]}11`, // heuristic
        "Scripts", "yt-dlp.exe"
    )
    // Try common Python311 path directly
    const knownPath = path.join(
        os.homedir(),
        "AppData", "Roaming", "Python", "Python311", "Scripts", "yt-dlp.exe"
    )
    if (fs.existsSync(knownPath)) return { cmd: knownPath, args: [] }
    if (fs.existsSync(userScripts)) return { cmd: userScripts, args: [] }

    // 2. Try python -m yt_dlp as universal fallback
    return { cmd: "python", args: ["-m", "yt_dlp"] }
}

// ─── Start Download ──────────────────────────────────────────────────

export async function startDownload(url: string, quality = "best"): Promise<string> {
    const id = uuid()
    const platform = detectPlatform(url)
    const outputDir = path.join(process.cwd(), "media", "downloads")
    fs.mkdirSync(outputDir, { recursive: true })

    // Init tracker
    downloadMap.set(id, {
        id, url,
        status: "downloading",
        progress: 0,
        title: "Fetching info...",
        speed: "", eta: "", error: "",
    })

    // Insert pending DB record
    insert("media", {
        id,
        title: "Downloading...",
        filename: "",
        filepath: "",
        source: "download",
        platform,
        url,
        status: "downloading",
        progress: 0,
    })

    const formatArg =
        quality === "best" || !quality
            ? "bestvideo+bestaudio/best"
            : `bestvideo[height<=${quality}]+bestaudio/best[height<=${quality}]`

    const outputTemplate = path.join(outputDir, "%(title)s.%(ext)s")

    const downloadArgs = [
        "-f", formatArg,
        "--merge-output-format", "mp4",
        "-o", outputTemplate,
        "--newline",
        "--no-playlist",
        "--progress",
        url,
    ]

    const { cmd, args: prefixArgs } = findYtDlp()
    const fullArgs = [...prefixArgs, ...downloadArgs]

    console.log(`[downloader] Running: ${cmd} ${fullArgs.slice(0, 4).join(" ")} ... ${url}`)

    const proc = spawn(cmd, fullArgs, { windowsHide: true })
    let lastTitle = ""

    proc.stdout.on("data", (chunk: Buffer) => {
        const line = chunk.toString()
        console.log(`[yt-dlp stdout] ${line.trim()}`)
        const entry = downloadMap.get(id)
        if (!entry) return

        const pct = line.match(/(\d+\.?\d*)%/)
        if (pct) entry.progress = Math.min(Math.round(parseFloat(pct[1])), 99)

        const speed = line.match(/at\s+([\d.]+\S+\/s)/)
        if (speed) entry.speed = speed[1]

        const eta = line.match(/ETA\s+(\S+)/)
        if (eta) entry.eta = eta[1]

        const dest = line.match(/Destination:\s+(.+)/)
        if (dest) {
            lastTitle = path.basename(dest[1].trim()).replace(/\.[^.]+$/, "")
            entry.title = lastTitle
        }
    })

    proc.stderr.on("data", (chunk: Buffer) => {
        const line = chunk.toString().trim()
        console.log(`[yt-dlp stderr] ${line}`)
        const entry = downloadMap.get(id)
        if (entry && line.includes("ERROR")) {
            entry.error = line
        }
    })

    proc.on("close", (code) => {
        const entry = downloadMap.get(id)
        if (!entry) return

        if (code === 0) {
            entry.status = "completed"
            entry.progress = 100

            // Find most recently created file
            const files = fs
                .readdirSync(outputDir)
                .filter((f) => !f.endsWith(".json") && !f.endsWith(".part"))
                .sort((a, b) => {
                    const sa = fs.statSync(path.join(outputDir, a)).mtimeMs
                    const sb = fs.statSync(path.join(outputDir, b)).mtimeMs
                    return sb - sa
                })

            if (files[0]) {
                const fullPath = path.join(outputDir, files[0])
                const stat = fs.statSync(fullPath)
                const title = lastTitle || files[0].replace(/\.[^.]+$/, "")
                run(
                    `UPDATE media
           SET title=?, filename=?, filepath=?, status='completed', progress=100, filesize=?, updated_at=datetime('now')
           WHERE id=?`,
                    [title, files[0], `media/downloads/${files[0]}`, stat.size, id]
                )
                entry.title = title
            }
        } else {
            entry.status = "failed"
            entry.error = entry.error || `yt-dlp exited with code ${code}`
            run(`UPDATE media SET status='failed', error=?, updated_at=datetime('now') WHERE id=?`, [
                entry.error, id,
            ])
        }

        // Auto-clean from memory after 10 min
        setTimeout(() => downloadMap.delete(id), 10 * 60 * 1000)
    })

    return id
}
