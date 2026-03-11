import Database from "better-sqlite3"
import path from "path"
import fs from "fs"

// ─── Database Singleton ──────────────────────────────────────────────

let db: Database.Database | null = null

export function getDb(): Database.Database {
  if (db) return db

  const dataDir = path.join(process.cwd(), "data")
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }

  db = new Database(path.join(dataDir, "socialhub.db"))
  db.pragma("journal_mode = WAL")
  db.pragma("foreign_keys = ON")

  initTables(db)
  return db
}

// ─── Table Creation ──────────────────────────────────────────────────

function initTables(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS media (
      id          TEXT PRIMARY KEY,
      title       TEXT NOT NULL,
      filename    TEXT NOT NULL,
      filepath    TEXT NOT NULL,
      source      TEXT NOT NULL CHECK(source IN ('download','upload')),
      platform    TEXT,
      url         TEXT,
      thumbnail   TEXT,
      duration    INTEGER,
      filesize    INTEGER,
      quality     TEXT,
      status      TEXT NOT NULL DEFAULT 'completed'
                  CHECK(status IN ('downloading','uploading','completed','failed')),
      progress    INTEGER DEFAULT 0,
      error       TEXT,
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_media_source ON media(source);
    CREATE INDEX IF NOT EXISTS idx_media_status ON media(status);
    CREATE INDEX IF NOT EXISTS idx_media_platform ON media(platform);
    CREATE INDEX IF NOT EXISTS idx_media_created ON media(created_at);

    CREATE TABLE IF NOT EXISTS accounts (
      id          TEXT PRIMARY KEY,
      platform    TEXT NOT NULL CHECK(platform IN ('youtube','tiktok','instagram','x')),
      username    TEXT NOT NULL,
      display_name TEXT,
      avatar_url  TEXT,
      profile_url TEXT,
      followers   INTEGER DEFAULT 0,
      is_active   INTEGER NOT NULL DEFAULT 1,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_accounts_platform_username
      ON accounts(platform, username);

    CREATE TABLE IF NOT EXISTS scheduled_posts (
      id          TEXT PRIMARY KEY,
      media_id    TEXT NOT NULL REFERENCES media(id) ON DELETE CASCADE,
      account_id  TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      caption     TEXT,
      hashtags    TEXT,
      scheduled_at TEXT NOT NULL,
      status      TEXT NOT NULL DEFAULT 'draft'
                  CHECK(status IN ('draft','scheduled','posted','failed')),
      posted_at   TEXT,
      post_url    TEXT,
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_posts_scheduled ON scheduled_posts(scheduled_at);
    CREATE INDEX IF NOT EXISTS idx_posts_status ON scheduled_posts(status);
    CREATE INDEX IF NOT EXISTS idx_posts_media ON scheduled_posts(media_id);

    CREATE TABLE IF NOT EXISTS analytics_data (
      id          TEXT PRIMARY KEY,
      account_id  TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      date        TEXT NOT NULL,
      views       INTEGER NOT NULL DEFAULT 0,
      likes       INTEGER NOT NULL DEFAULT 0,
      comments    INTEGER NOT NULL DEFAULT 0,
      shares      INTEGER NOT NULL DEFAULT 0,
      followers   INTEGER NOT NULL DEFAULT 0,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_analytics_account_date
      ON analytics_data(account_id, date);
    CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics_data(date);

    CREATE TABLE IF NOT EXISTS platform_sessions (
      id              TEXT PRIMARY KEY,
      account_id      TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      platform        TEXT NOT NULL CHECK(platform IN ('youtube','tiktok','instagram','x')),
      access_token    TEXT,
      refresh_token   TEXT,
      cookies_json    TEXT,
      user_agent      TEXT,
      session_status  TEXT NOT NULL DEFAULT 'pending'
                      CHECK(session_status IN ('pending','active','captcha_needed','expired')),
      last_validated  TEXT,
      expires_at      TEXT,
      created_at      TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(account_id, platform)
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_account ON platform_sessions(account_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_status ON platform_sessions(session_status);
  `)

  // Safe migrations for scheduled_posts — add columns if not exist
  const existingCols = db
    .prepare(`PRAGMA table_info(scheduled_posts)`)
    .all() as Array<{ name: string }>
  const colNames = existingCols.map((c) => c.name)

  if (!colNames.includes("publish_status")) {
    db.exec(`ALTER TABLE scheduled_posts ADD COLUMN publish_status TEXT DEFAULT 'pending'`)
  }
  if (!colNames.includes("publish_error")) {
    db.exec(`ALTER TABLE scheduled_posts ADD COLUMN publish_error TEXT`)
  }
  if (!colNames.includes("published_at")) {
    db.exec(`ALTER TABLE scheduled_posts ADD COLUMN published_at TEXT`)
  }
  if (!colNames.includes("retry_count")) {
    db.exec(`ALTER TABLE scheduled_posts ADD COLUMN retry_count INTEGER DEFAULT 0`)
  }
  if (!colNames.includes("random_schedule_set")) {
    db.exec(`ALTER TABLE scheduled_posts ADD COLUMN random_schedule_set INTEGER DEFAULT 0`)
  }
}


// ─── Helper Functions ────────────────────────────────────────────────

export function getAll<T>(sql: string, params: unknown[] = []): T[] {
  return getDb().prepare(sql).all(...params) as T[]
}

export function getOne<T>(sql: string, params: unknown[] = []): T | undefined {
  return getDb().prepare(sql).get(...params) as T | undefined
}

export function run(sql: string, params: unknown[] = []) {
  return getDb().prepare(sql).run(...params)
}

export function insert(table: string, data: Record<string, unknown>) {
  const keys = Object.keys(data)
  const placeholders = keys.map(() => "?").join(", ")
  const sql = `INSERT INTO ${table} (${keys.join(", ")}) VALUES (${placeholders})`
  return getDb().prepare(sql).run(...Object.values(data))
}

export function deleteById(table: string, id: string) {
  return getDb().prepare(`DELETE FROM ${table} WHERE id = ?`).run(id)
}
