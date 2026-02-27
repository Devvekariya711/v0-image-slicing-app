"use client"

import { useState } from "react"
import { ChevronDown, Key, Link2 } from "lucide-react"

interface SchemaColumn {
  name: string
  type: string
  notes?: string
  isPK?: boolean
  isFK?: boolean
  fkRef?: string
}

interface SchemaTable {
  name: string
  description: string
  columns: SchemaColumn[]
}

const tables: SchemaTable[] = [
  {
    name: "users",
    description: "User accounts extended from NextAuth. Stores plan and Stripe billing info.",
    columns: [
      { name: "id", type: "uuid", notes: "gen_random_uuid()", isPK: true },
      { name: "email", type: "text", notes: "unique, not null" },
      { name: "password_hash", type: "text", notes: "bcrypt, nullable for OAuth" },
      { name: "name", type: "text" },
      { name: "avatar_url", type: "text" },
      { name: "plan", type: "enum", notes: "free | pro | enterprise" },
      { name: "stripe_customer_id", type: "text" },
      { name: "stripe_subscription_id", type: "text" },
      { name: "stripe_current_period_end", type: "timestamptz" },
      { name: "created_at", type: "timestamptz", notes: "default now()" },
      { name: "updated_at", type: "timestamptz", notes: "default now()" },
    ],
  },
  {
    name: "channels",
    description: "Connected YouTube channels with webhook subscription state.",
    columns: [
      { name: "id", type: "uuid", isPK: true },
      { name: "user_id", type: "uuid", isFK: true, fkRef: "users.id" },
      { name: "youtube_channel_id", type: "text", notes: "unique" },
      { name: "title", type: "text" },
      { name: "thumbnail_url", type: "text" },
      { name: "access_token_enc", type: "bytea", notes: "AES-256-GCM" },
      { name: "refresh_token_enc", type: "bytea", notes: "AES-256-GCM" },
      { name: "webhook_active", type: "boolean", notes: "default false" },
      { name: "pubsub_lease_expires_at", type: "timestamptz" },
      { name: "is_active", type: "boolean", notes: "default true" },
      { name: "created_at", type: "timestamptz" },
    ],
  },
  {
    name: "videos",
    description: "Source videos detected from YouTube uploads. Stores transcript and processing state.",
    columns: [
      { name: "id", type: "uuid", isPK: true },
      { name: "channel_id", type: "uuid", isFK: true, fkRef: "channels.id" },
      { name: "youtube_video_id", type: "text", notes: "unique" },
      { name: "title", type: "text" },
      { name: "description", type: "text" },
      { name: "duration_seconds", type: "integer" },
      { name: "thumbnail_url", type: "text" },
      { name: "published_at", type: "timestamptz" },
      { name: "processing_status", type: "enum", notes: "pending | downloading | transcribing | analyzing | clipping | complete | failed" },
      { name: "transcript", type: "jsonb", notes: "timestamped transcript" },
      { name: "highlights", type: "jsonb", notes: "detected highlight segments" },
      { name: "detected_at", type: "timestamptz" },
    ],
  },
  {
    name: "clips",
    description: "Generated short-form clips with storage URLs and AI-generated metadata.",
    columns: [
      { name: "id", type: "uuid", isPK: true },
      { name: "video_id", type: "uuid", isFK: true, fkRef: "videos.id" },
      { name: "user_id", type: "uuid", isFK: true, fkRef: "users.id" },
      { name: "title", type: "text" },
      { name: "description", type: "text" },
      { name: "hashtags", type: "text[]" },
      { name: "start_time", type: "float", notes: "seconds" },
      { name: "end_time", type: "float", notes: "seconds" },
      { name: "duration", type: "float" },
      { name: "blob_url", type: "text", notes: "Vercel Blob / S3" },
      { name: "thumbnail_url", type: "text" },
      { name: "caption_srt", type: "text" },
      { name: "aspect_ratio", type: "text", notes: "default 9:16" },
      { name: "ai_score", type: "float", notes: "virality confidence 0-1" },
      { name: "status", type: "enum", notes: "rendering | ready | publishing | published | failed" },
      { name: "created_at", type: "timestamptz" },
    ],
  },
  {
    name: "publications",
    description: "Tracks publication state per clip per platform. One clip can publish to multiple platforms.",
    columns: [
      { name: "id", type: "uuid", isPK: true },
      { name: "clip_id", type: "uuid", isFK: true, fkRef: "clips.id" },
      { name: "platform", type: "enum", notes: "tiktok | instagram | youtube_shorts" },
      { name: "platform_post_id", type: "text" },
      { name: "platform_url", type: "text" },
      { name: "status", type: "enum", notes: "pending | uploading | published | failed" },
      { name: "error_message", type: "text" },
      { name: "views", type: "integer", notes: "default 0" },
      { name: "likes", type: "integer", notes: "default 0" },
      { name: "published_at", type: "timestamptz" },
      { name: "created_at", type: "timestamptz" },
    ],
  },
  {
    name: "social_accounts",
    description: "Connected social platform accounts with encrypted OAuth tokens.",
    columns: [
      { name: "id", type: "uuid", isPK: true },
      { name: "user_id", type: "uuid", isFK: true, fkRef: "users.id" },
      { name: "platform", type: "enum", notes: "tiktok | instagram" },
      { name: "platform_user_id", type: "text" },
      { name: "username", type: "text" },
      { name: "access_token_enc", type: "bytea", notes: "AES-256-GCM" },
      { name: "refresh_token_enc", type: "bytea", notes: "AES-256-GCM" },
      { name: "token_expires_at", type: "timestamptz" },
      { name: "is_active", type: "boolean", notes: "default true" },
      { name: "connected_at", type: "timestamptz" },
    ],
  },
]

const relationships = [
  { from: "channels.user_id", to: "users.id" },
  { from: "videos.channel_id", to: "channels.id" },
  { from: "clips.video_id", to: "videos.id" },
  { from: "clips.user_id", to: "users.id" },
  { from: "publications.clip_id", to: "clips.id" },
  { from: "social_accounts.user_id", to: "users.id" },
]

export function DatabaseSchema() {
  const [expandedTable, setExpandedTable] = useState<string | null>("users")

  return (
    <div className="space-y-4">
      {/* Relationship Diagram */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Relationships
        </h5>
        <div className="flex flex-wrap gap-2">
          {relationships.map((rel) => (
            <div
              key={`${rel.from}-${rel.to}`}
              className="flex items-center gap-1.5 rounded-lg bg-secondary/50 px-2.5 py-1.5 text-xs"
            >
              <code className="font-mono text-primary">{rel.from.split(".")[0]}</code>
              <Link2 className="h-3 w-3 text-muted-foreground" />
              <code className="font-mono text-accent">{rel.to.split(".")[0]}</code>
            </div>
          ))}
        </div>
      </div>

      {/* Table Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tables.map((table) => {
          const isExpanded = expandedTable === table.name
          const pkCount = table.columns.filter((c) => c.isPK).length
          const fkCount = table.columns.filter((c) => c.isFK).length

          return (
            <div
              key={table.name}
              className={`rounded-xl border overflow-hidden transition-all ${
                isExpanded ? "border-primary/30 bg-card sm:col-span-2 lg:col-span-3" : "border-border bg-card"
              }`}
            >
              <button
                onClick={() => setExpandedTable(isExpanded ? null : table.name)}
                className="w-full text-left"
              >
                <div className="flex items-center justify-between bg-secondary/30 px-4 py-2.5 border-b border-border">
                  <div className="flex items-center gap-2">
                    <code className="font-mono text-sm font-semibold text-primary">
                      {table.name}
                    </code>
                    <span className="text-xs text-muted-foreground">
                      {table.columns.length} cols
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {pkCount > 0 && (
                      <span className="flex items-center gap-1 rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
                        <Key className="h-2.5 w-2.5" />
                        PK
                      </span>
                    )}
                    {fkCount > 0 && (
                      <span className="flex items-center gap-1 rounded bg-accent/10 px-1.5 py-0.5 text-xs text-accent">
                        <Link2 className="h-2.5 w-2.5" />
                        {fkCount} FK
                      </span>
                    )}
                    <ChevronDown
                      className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${
                        isExpanded ? "rotate-0" : "-rotate-90"
                      }`}
                    />
                  </div>
                </div>
              </button>

              {!isExpanded && (
                <div className="px-4 py-2.5">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {table.description}
                  </p>
                </div>
              )}

              {isExpanded && (
                <div className="p-4 space-y-3">
                  <p className="text-sm text-foreground/70 leading-relaxed">
                    {table.description}
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="pb-2 text-left font-medium text-muted-foreground pr-4">Column</th>
                          <th className="pb-2 text-left font-medium text-muted-foreground pr-4">Type</th>
                          <th className="pb-2 text-left font-medium text-muted-foreground">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {table.columns.map((col) => (
                          <tr key={col.name} className="border-b border-border/30">
                            <td className="py-1.5 pr-4">
                              <span className="flex items-center gap-1.5">
                                {col.isPK && <Key className="h-2.5 w-2.5 text-primary shrink-0" />}
                                {col.isFK && <Link2 className="h-2.5 w-2.5 text-accent shrink-0" />}
                                <code className="font-mono text-foreground/80">{col.name}</code>
                              </span>
                            </td>
                            <td className="py-1.5 pr-4">
                              <code className="font-mono text-muted-foreground">{col.type}</code>
                            </td>
                            <td className="py-1.5">
                              <span className="text-muted-foreground/70">
                                {col.fkRef && (
                                  <span className="text-accent">
                                    {"-> "}{col.fkRef}
                                    {col.notes ? ` | ${col.notes}` : ""}
                                  </span>
                                )}
                                {!col.fkRef && col.notes}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
