interface SchemaTable {
  name: string
  columns: { name: string; type: string; notes?: string }[]
}

const tables: SchemaTable[] = [
  {
    name: "users",
    columns: [
      { name: "id", type: "uuid", notes: "PK, default gen_random_uuid()" },
      { name: "email", type: "text", notes: "unique, not null" },
      { name: "password_hash", type: "text", notes: "bcrypt, nullable (OAuth users)" },
      { name: "name", type: "text" },
      { name: "avatar_url", type: "text" },
      { name: "plan", type: "enum", notes: "free | pro | enterprise" },
      { name: "stripe_customer_id", type: "text" },
      { name: "created_at", type: "timestamptz", notes: "default now()" },
    ],
  },
  {
    name: "channels",
    columns: [
      { name: "id", type: "uuid", notes: "PK" },
      { name: "user_id", type: "uuid", notes: "FK -> users.id" },
      { name: "youtube_channel_id", type: "text", notes: "unique" },
      { name: "title", type: "text" },
      { name: "thumbnail_url", type: "text" },
      { name: "access_token_enc", type: "bytea", notes: "AES-256-GCM encrypted" },
      { name: "refresh_token_enc", type: "bytea", notes: "AES-256-GCM encrypted" },
      { name: "webhook_active", type: "boolean", notes: "default false" },
      { name: "is_active", type: "boolean", notes: "default true" },
      { name: "created_at", type: "timestamptz" },
    ],
  },
  {
    name: "videos",
    columns: [
      { name: "id", type: "uuid", notes: "PK" },
      { name: "channel_id", type: "uuid", notes: "FK -> channels.id" },
      { name: "youtube_video_id", type: "text", notes: "unique" },
      { name: "title", type: "text" },
      { name: "duration_seconds", type: "integer" },
      { name: "detected_at", type: "timestamptz" },
      { name: "status", type: "enum", notes: "detected | processing | done | failed" },
    ],
  },
  {
    name: "clips",
    columns: [
      { name: "id", type: "uuid", notes: "PK" },
      { name: "video_id", type: "uuid", notes: "FK -> videos.id" },
      { name: "title", type: "text" },
      { name: "start_time", type: "float", notes: "seconds" },
      { name: "end_time", type: "float", notes: "seconds" },
      { name: "duration", type: "float" },
      { name: "blob_url", type: "text", notes: "Vercel Blob / S3 URL" },
      { name: "thumbnail_url", type: "text" },
      { name: "caption_srt", type: "text" },
      { name: "status", type: "enum", notes: "rendering | ready | publishing | published | failed" },
      { name: "ai_score", type: "float", notes: "virality confidence 0-1" },
      { name: "created_at", type: "timestamptz" },
    ],
  },
  {
    name: "publications",
    columns: [
      { name: "id", type: "uuid", notes: "PK" },
      { name: "clip_id", type: "uuid", notes: "FK -> clips.id" },
      { name: "platform", type: "enum", notes: "tiktok | instagram | youtube_shorts" },
      { name: "platform_post_id", type: "text" },
      { name: "status", type: "enum", notes: "pending | published | failed" },
      { name: "views", type: "integer", notes: "default 0" },
      { name: "likes", type: "integer", notes: "default 0" },
      { name: "published_at", type: "timestamptz" },
    ],
  },
  {
    name: "social_accounts",
    columns: [
      { name: "id", type: "uuid", notes: "PK" },
      { name: "user_id", type: "uuid", notes: "FK -> users.id" },
      { name: "platform", type: "enum", notes: "tiktok | instagram" },
      { name: "platform_user_id", type: "text" },
      { name: "username", type: "text" },
      { name: "access_token_enc", type: "bytea" },
      { name: "refresh_token_enc", type: "bytea" },
      { name: "connected_at", type: "timestamptz" },
    ],
  },
]

export function DatabaseSchema() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tables.map((table) => (
        <div
          key={table.name}
          className="rounded-xl border border-border bg-card overflow-hidden"
        >
          <div className="bg-secondary/30 px-4 py-2.5 border-b border-border">
            <code className="font-mono text-sm font-semibold text-primary">
              {table.name}
            </code>
          </div>
          <div className="p-3 space-y-1">
            {table.columns.map((col) => (
              <div key={col.name} className="flex items-baseline gap-2 text-xs">
                <code className="font-mono text-foreground/80 shrink-0">
                  {col.name}
                </code>
                <span className="text-muted-foreground">{col.type}</span>
                {col.notes && (
                  <span className="text-muted-foreground/60 truncate">
                    {"// "}
                    {col.notes}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
