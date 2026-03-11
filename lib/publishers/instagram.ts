// ─── Instagram Publisher — Python instagrapi Bridge ──────────────────────────
// Calls Python instagrapi_bridge.py via child_process.
// instagrapi uses Instagram's private mobile API — same as the official app.
// 🔗 Source: https://github.com/subzeroid/instagrapi

import { spawn } from "child_process"
import path from "path"
import { loadCookies, markCaptchaNeeded, markSessionExpired } from "@/lib/session-manager"

const BRIDGE_SCRIPT = path.join(process.cwd(), "scripts", "instagrapi_bridge.py")
const SESSION_DIR = path.join(process.cwd(), "data", "ig_sessions")

interface InstaResult {
    success: boolean
    media_id?: string
    url?: string
    error?: string
    action?: string
}

/**
 * Run the Python instagrapi bridge script with given arguments.
 */
function runPythonBridge(args: string[]): Promise<InstaResult> {
    return new Promise((resolve) => {
        const proc = spawn("python", [BRIDGE_SCRIPT, ...args], {
            env: { ...process.env, PYTHONUNBUFFERED: "1" },
        })

        let stdout = ""
        let stderr = ""

        proc.stdout.on("data", (d: Buffer) => { stdout += d.toString() })
        proc.stderr.on("data", (d: Buffer) => { stderr += d.toString() })

        proc.on("close", (code) => {
            try {
                const result = JSON.parse(stdout.trim())
                resolve(result)
            } catch {
                resolve({ success: false, error: stderr || `Python exit code ${code}` })
            }
        })

        proc.on("error", (err) => {
            resolve({
                success: false,
                error: `Failed to start Python: ${err.message}. Make sure Python 3.10+ and instagrapi are installed.`,
            })
        })
    })
}

/**
 * Upload a Reel to Instagram.
 */
export async function uploadToInstagram(
    accountId: string,
    options: {
        filepath: string
        caption: string
        hashtags?: string[]
        thumbnailTimestamp?: number // seconds into video for cover frame
    }
): Promise<{ success: boolean; url?: string; error?: string }> {
    const hashtags = (options.hashtags ?? []).map((h) => (h.startsWith("#") ? h : `#${h}`)).join(" ")
    const fullCaption = `${options.caption}\n\n${hashtags}`.trim()

    const result = await runPythonBridge([
        "--action", "upload_reel",
        "--account-id", accountId,
        "--filepath", options.filepath,
        "--caption", fullCaption,
        "--session-dir", SESSION_DIR,
    ])

    if (!result.success) {
        if (result.error?.includes("challenge_required") || result.error?.includes("ChallengeRequired")) {
            markCaptchaNeeded(accountId, "instagram")
            return { success: false, error: "Instagram challenge required. Please open Instagram and complete the verification." }
        }
        if (result.error?.includes("login_required") || result.error?.includes("LoginRequired")) {
            markSessionExpired(accountId, "instagram")
            return { success: false, error: "Instagram session expired. Please re-authenticate." }
        }
        return { success: false, error: result.error }
    }

    return { success: true, url: result.url }
}

/**
 * Authenticate to Instagram and save session for reuse.
 * Only needs to be run once per account.
 */
export async function authenticateInstagram(
    accountId: string,
    username: string,
    password: string
): Promise<{ success: boolean; error?: string }> {
    const result = await runPythonBridge([
        "--action", "login",
        "--account-id", accountId,
        "--username", username,
        "--password", password,
        "--session-dir", SESSION_DIR,
    ])

    return result.success
        ? { success: true }
        : { success: false, error: result.error }
}

/**
 * Validate existing Instagram session.
 */
export async function validateInstagramSession(accountId: string): Promise<{ valid: boolean }> {
    const result = await runPythonBridge([
        "--action", "validate_session",
        "--account-id", accountId,
        "--session-dir", SESSION_DIR,
    ])
    return { valid: result.success }
}
