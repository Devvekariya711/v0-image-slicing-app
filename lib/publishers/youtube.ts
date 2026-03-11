// ─── YouTube Publisher — Official Google API (OAuth2) ────────────────────────
// Uses googleapis npm package with YouTube Data API v3.
// No bot risk — this is the official, approved upload method.
// 🔗 Source: https://developers.google.com/youtube/v3/docs/videos/insert

import fs from "fs"
import path from "path"
import { google } from "googleapis"
import { saveYouTubeTokens, loadYouTubeTokens } from "@/lib/session-manager"

const CLIENT_SECRET_PATH = path.join(process.cwd(), "config", "client_secret.json")
const SCOPES = ["https://www.googleapis.com/auth/youtube.upload"]
// Override redirect — Google allows any localhost port for Desktop apps
const REDIRECT_URI = "http://localhost:3000/api/connect/callback"

// ─── OAuth2 Client ───────────────────────────────────────────────────────────

function getOAuth2Client() {
    if (!fs.existsSync(CLIENT_SECRET_PATH)) {
        throw new Error(
            `client_secret.json not found at ${CLIENT_SECRET_PATH}. ` +
            `Please place your Google Cloud OAuth2 credentials there.`
        )
    }

    const credentials = JSON.parse(fs.readFileSync(CLIENT_SECRET_PATH, "utf8"))
    const { client_secret, client_id } = credentials.installed || credentials.web

    return new google.auth.OAuth2(client_id, client_secret, REDIRECT_URI)
}

/**
 * Generate a URL the user must visit to authorize the app.
 * Call this on first setup — returns a URL to open in browser.
 */
export function getYouTubeAuthUrl(): string {
    const oauth2Client = getOAuth2Client()
    return oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: SCOPES,
        prompt: "consent", // Force consent to always get refresh_token
    })
}

/**
 * Exchange the authorization code (from redirect URL) for tokens.
 * Save tokens to DB for this account.
 */
export async function exchangeYouTubeCode(accountId: string, code: string): Promise<void> {
    const oauth2Client = getOAuth2Client()
    const { tokens } = await oauth2Client.getToken(code)
    if (!tokens.access_token) throw new Error("No access token received")

    saveYouTubeTokens(accountId, {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token ?? "",
        expiry_date: tokens.expiry_date ?? Date.now() + 3600 * 1000,
        token_type: tokens.token_type ?? "Bearer",
    })
}

/**
 * Upload a video to YouTube.
 * Automatically refreshes tokens if expired.
 */
export async function uploadToYouTube(
    accountId: string,
    options: {
        filepath: string
        title: string
        description?: string
        tags?: string[]
        privacyStatus?: "private" | "public" | "unlisted"
        categoryId?: string
    }
): Promise<{ videoId: string; url: string }> {
    const storedTokens = loadYouTubeTokens(accountId)
    if (!storedTokens) {
        throw new Error(`No YouTube session for account ${accountId}. Please authenticate first.`)
    }

    const oauth2Client = getOAuth2Client()
    oauth2Client.setCredentials({
        access_token: storedTokens.access_token,
        refresh_token: storedTokens.refresh_token,
        expiry_date: storedTokens.expiry_date,
    })

    // Auto-refresh listener — saves new tokens if refreshed
    oauth2Client.on("tokens", (newTokens) => {
        saveYouTubeTokens(accountId, {
            access_token: newTokens.access_token ?? storedTokens.access_token,
            refresh_token: newTokens.refresh_token ?? storedTokens.refresh_token,
            expiry_date: newTokens.expiry_date ?? Date.now() + 3600 * 1000,
            token_type: "Bearer",
        })
    })

    const youtube = google.youtube({ version: "v3", auth: oauth2Client })

    const fileSize = fs.statSync(options.filepath).size
    const fileStream = fs.createReadStream(options.filepath)

    const response = await youtube.videos.insert({
        part: ["snippet", "status"],
        requestBody: {
            snippet: {
                title: options.title,
                description: options.description ?? "",
                tags: options.tags ?? [],
                categoryId: options.categoryId ?? "22", // 22 = People & Blogs
            },
            status: {
                privacyStatus: options.privacyStatus ?? "private",
                selfDeclaredMadeForKids: false,
            },
        },
        media: {
            body: fileStream,
        },
    }, {
        onUploadProgress: (evt) => {
            const progress = Math.round((evt.bytesRead / fileSize) * 100)
            console.log(`YouTube upload progress: ${progress}%`)
        },
    })

    const videoId = response.data.id!
    return {
        videoId,
        url: `https://www.youtube.com/watch?v=${videoId}`,
    }
}
