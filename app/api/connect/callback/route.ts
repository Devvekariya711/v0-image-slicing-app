import { NextRequest, NextResponse } from "next/server"
import { google } from "googleapis"
import fs from "fs"
import path from "path"
import { insert, getOne, run } from "@/lib/db"
import { saveYouTubeTokens } from "@/lib/session-manager"
import { randomUUID } from "crypto"

const CLIENT_SECRET_PATH = path.join(process.cwd(), "config", "client_secret.json")
const REDIRECT_URI = "http://localhost:3000/api/connect/callback"

function getOAuth2Client() {
  const credentials = JSON.parse(fs.readFileSync(CLIENT_SECRET_PATH, "utf8"))
  const { client_secret, client_id } = credentials.installed || credentials.web
  return new google.auth.OAuth2(client_id, client_secret, REDIRECT_URI)
}

// GET /api/connect/callback — Google OAuth2 auto-exchange
// Google redirects here with ?code=...
// We automatically exchange the code, fetch channel info, create the account, and redirect to /accounts
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code")
  const error = req.nextUrl.searchParams.get("error")

  if (error || !code) {
    return NextResponse.redirect(new URL("/accounts?error=auth_failed", req.url))
  }

  try {
    // 1. Exchange code for tokens
    const oauth2Client = getOAuth2Client()
    const { tokens } = await oauth2Client.getToken(code)
    if (!tokens.access_token) throw new Error("No access token")

    oauth2Client.setCredentials(tokens)

    // 2. Fetch YouTube channel info automatically
    const youtube = google.youtube({ version: "v3", auth: oauth2Client })
    const channelRes = await youtube.channels.list({
      part: ["snippet", "statistics"],
      mine: true,
    })

    const channel = channelRes.data.items?.[0]
    const username = channel?.snippet?.customUrl?.replace("@", "") || channel?.snippet?.title || "unknown"
    const displayName = channel?.snippet?.title || username
    const profileUrl = `https://youtube.com/${channel?.snippet?.customUrl || ""}`
    const followers = parseInt(channel?.statistics?.subscriberCount || "0")

    // 3. Create or update account in DB
    const existing = getOne<{ id: string }>(
      `SELECT id FROM accounts WHERE platform = 'youtube' AND username = ?`,
      [username]
    )

    let accountId: string
    if (existing) {
      accountId = existing.id
      run(
        `UPDATE accounts SET display_name = ?, profile_url = ?, followers = ? WHERE id = ?`,
        [displayName, profileUrl, followers, accountId]
      )
    } else {
      accountId = randomUUID()
      insert("accounts", {
        id: accountId,
        platform: "youtube",
        username,
        display_name: displayName,
        profile_url: profileUrl,
        followers,
        is_active: 1,
      })
    }

    // 4. Save OAuth tokens (encrypted) linked to this account
    saveYouTubeTokens(accountId, {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token ?? "",
      expiry_date: tokens.expiry_date ?? Date.now() + 3600 * 1000,
      token_type: tokens.token_type ?? "Bearer",
    })

    // 5. Redirect back to accounts page with success
    return NextResponse.redirect(new URL(`/accounts?connected=youtube&name=${encodeURIComponent(displayName)}`, req.url))
  } catch (err) {
    console.error("YouTube OAuth callback error:", err)
    const msg = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.redirect(new URL(`/accounts?error=${encodeURIComponent(msg)}`, req.url))
  }
}
