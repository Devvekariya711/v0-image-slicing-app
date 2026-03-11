// ─── Session Manager ─────────────────────────────────────────────────────────
// Stores OAuth tokens (YouTube) and browser cookies (TikTok/Instagram) in SQLite.
// Encrypts tokens at rest using a simple XOR + base64 (sufficient for local personal use).

import { getDb, getOne, run } from "@/lib/db"
import crypto from "crypto"

// Use machine-specific key derived from hostname (personal use — no user-specific secrets)
const SESSION_KEY = crypto
    .createHash("sha256")
    .update(require("os").hostname() + "socialhub_session_v1")
    .digest("hex")
    .slice(0, 32)

// ─── Encryption Helpers ──────────────────────────────────────────────────────

function encrypt(text: string): string {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(SESSION_KEY), iv)
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()])
    return iv.toString("hex") + ":" + encrypted.toString("hex")
}

function decrypt(text: string): string {
    try {
        const [ivHex, encHex] = text.split(":")
        const iv = Buffer.from(ivHex, "hex")
        const encrypted = Buffer.from(encHex, "hex")
        const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(SESSION_KEY), iv)
        return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString()
    } catch {
        return text // Fallback: return as-is if not encrypted (migration safety)
    }
}

// ─── Types ───────────────────────────────────────────────────────────────────

export type SessionStatus = "pending" | "active" | "captcha_needed" | "expired"

export interface PlatformSession {
    id: string
    account_id: string
    platform: string
    access_token: string | null
    refresh_token: string | null
    cookies_json: string | null
    user_agent: string | null
    session_status: SessionStatus
    last_validated: string | null
    expires_at: string | null
    created_at: string
}

export interface YouTubeTokens {
    access_token: string
    refresh_token: string
    expiry_date: number
    token_type: string
}

export interface CookieSession {
    cookies: object[]    // Playwright cookie format
    userAgent: string
    platform: string
}

// ─── Session CRUD ────────────────────────────────────────────────────────────

export function getSession(accountId: string, platform: string): PlatformSession | null {
    const row = getOne<PlatformSession>(
        `SELECT * FROM platform_sessions WHERE account_id = ? AND platform = ?`,
        [accountId, platform]
    )
    if (!row) return null

    // Decrypt sensitive fields before returning
    return {
        ...row,
        access_token: row.access_token ? decrypt(row.access_token) : null,
        refresh_token: row.refresh_token ? decrypt(row.refresh_token) : null,
        cookies_json: row.cookies_json ? decrypt(row.cookies_json) : null,
    }
}

export function saveYouTubeTokens(accountId: string, tokens: YouTubeTokens): void {
    const db = getDb()
    const existing = getOne(
        `SELECT id FROM platform_sessions WHERE account_id = ? AND platform = 'youtube'`,
        [accountId]
    )

    const expiresAt = new Date(tokens.expiry_date).toISOString()

    if (existing) {
        run(
            `UPDATE platform_sessions SET
        access_token = ?, refresh_token = ?,
        session_status = 'active', last_validated = datetime('now'),
        expires_at = ?
       WHERE account_id = ? AND platform = 'youtube'`,
            [encrypt(tokens.access_token), encrypt(tokens.refresh_token), expiresAt, accountId]
        )
    } else {
        const { randomUUID } = require("crypto")
        run(
            `INSERT INTO platform_sessions
        (id, account_id, platform, access_token, refresh_token, session_status, last_validated, expires_at)
       VALUES (?, ?, 'youtube', ?, ?, 'active', datetime('now'), ?)`,
            [randomUUID(), accountId, encrypt(tokens.access_token), encrypt(tokens.refresh_token), expiresAt]
        )
    }
}

export function saveCookieSession(accountId: string, platform: string, session: CookieSession): void {
    const existing = getOne(
        `SELECT id FROM platform_sessions WHERE account_id = ? AND platform = ?`,
        [accountId, platform]
    )

    const encCookies = encrypt(JSON.stringify(session.cookies))

    if (existing) {
        run(
            `UPDATE platform_sessions SET
        cookies_json = ?, user_agent = ?,
        session_status = 'active', last_validated = datetime('now')
       WHERE account_id = ? AND platform = ?`,
            [encCookies, session.userAgent, accountId, platform]
        )
    } else {
        const { randomUUID } = require("crypto")
        run(
            `INSERT INTO platform_sessions
        (id, account_id, platform, cookies_json, user_agent, session_status, last_validated)
       VALUES (?, ?, ?, ?, ?, 'active', datetime('now'))`,
            [randomUUID(), accountId, platform, encCookies, session.userAgent]
        )
    }
}

export function markSessionStatus(accountId: string, platform: string, status: SessionStatus): void {
    run(
        `UPDATE platform_sessions SET session_status = ? WHERE account_id = ? AND platform = ?`,
        [status, accountId, platform]
    )
}

export function markSessionExpired(accountId: string, platform: string): void {
    markSessionStatus(accountId, platform, "expired")
}

export function markCaptchaNeeded(accountId: string, platform: string): void {
    markSessionStatus(accountId, platform, "captcha_needed")
}

export function loadCookies(accountId: string, platform: string): CookieSession | null {
    const session = getSession(accountId, platform)
    if (!session?.cookies_json || !session.user_agent) return null

    try {
        return {
            cookies: JSON.parse(session.cookies_json),
            userAgent: session.user_agent,
            platform,
        }
    } catch {
        return null
    }
}

export function loadYouTubeTokens(accountId: string): YouTubeTokens | null {
    const session = getSession(accountId, "youtube")
    if (!session?.access_token) return null

    return {
        access_token: session.access_token,
        refresh_token: session.refresh_token ?? "",
        expiry_date: session.expires_at ? new Date(session.expires_at).getTime() : 0,
        token_type: "Bearer",
    }
}

export function getAllSessionStatuses(): Array<{ account_id: string; platform: string; session_status: string }> {
    const db = getDb()
    return db.prepare(
        `SELECT account_id, platform, session_status FROM platform_sessions`
    ).all() as Array<{ account_id: string; platform: string; session_status: string }>
}
