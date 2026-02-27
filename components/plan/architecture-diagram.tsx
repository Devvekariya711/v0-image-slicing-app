"use client"

import { useState } from "react"
import {
  ChevronDown,
  ChevronRight,
  Globe,
  Server,
  Database,
  Cpu,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface LayerComponent {
  name: string
  detail: string
}

interface Layer {
  id: string
  label: string
  icon: LucideIcon
  colorActive: string
  colorIcon: string
  description: string
  components: LayerComponent[]
}

const layers: Layer[] = [
  {
    id: "frontend",
    label: "Frontend Layer",
    icon: Globe,
    colorActive: "bg-primary/10 border-primary/30",
    colorIcon: "bg-primary text-primary-foreground",
    description:
      "Next.js 16 App Router with SSR, Server Components, and Client Interactivity. Tailwind CSS 4 + shadcn/ui for a polished, accessible component library.",
    components: [
      {
        name: "Marketing Pages",
        detail:
          "Landing, Pricing, and FAQ pages built as Server Components for SEO. Hero, How-it-Works, Comparison Table, and CTA sections.",
      },
      {
        name: "Dashboard Shell",
        detail:
          "Authenticated layout with collapsible sidebar, top header with user menu, and breadcrumbs. Uses (dashboard) route group.",
      },
      {
        name: "Clips Library",
        detail:
          "Grid/List toggle view with filters (channel, status, date). Each clip card shows thumbnail, title, duration, and publish status badges.",
      },
      {
        name: "Realtime Updates",
        detail:
          "Pipeline progress rendered via polling or Server-Sent Events. Clip cards update status badges as processing completes.",
      },
    ],
  },
  {
    id: "api",
    label: "API & Server Layer",
    icon: Server,
    colorActive: "bg-accent/10 border-accent/30",
    colorIcon: "bg-accent text-accent-foreground",
    description:
      "Next.js API Routes + Server Actions for all data mutations. Handles authentication, webhook ingestion, CRUD, and job dispatching.",
    components: [
      {
        name: "Auth (NextAuth v5)",
        detail:
          "Google OAuth with YouTube API scopes (youtube.readonly, youtube.upload). Session persisted in DB with encrypted tokens.",
      },
      {
        name: "Webhook Endpoints",
        detail:
          "YouTube PubSubHubbub callback (GET for challenge, POST for Atom XML parse). Stripe webhook handler with signature verification.",
      },
      {
        name: "Social OAuth Routes",
        detail:
          "Separate callback routes for TikTok (Authorization Code flow) and Instagram (Facebook Login). Token storage encrypted at rest.",
      },
      {
        name: "Job Dispatcher",
        detail:
          "Receives new video events and dispatches durable step functions via Inngest/QStash. Each step is idempotent and retryable.",
      },
    ],
  },
  {
    id: "background",
    label: "Background Pipeline",
    icon: Cpu,
    colorActive: "bg-chart-3/10 border-chart-3/30",
    colorIcon: "bg-chart-3 text-background",
    description:
      "Durable, multi-step processing pipeline. Each step is independently scalable, retryable, and tracked in the jobs table.",
    components: [
      {
        name: "Video Download",
        detail:
          "Downloads full YouTube video to temporary blob storage. Extracts audio track as WAV via FFmpeg for transcription.",
      },
      {
        name: "AI Transcription",
        detail:
          "Sends audio to OpenAI Whisper API. Returns word-level timestamps stored as JSONB in the videos table.",
      },
      {
        name: "Highlight Detection",
        detail:
          "LLM analyzes transcript for viral moments: emotional peaks, humor, actionable advice. Returns 3-5 clip boundaries with titles.",
      },
      {
        name: "Clip Slicing & Publishing",
        detail:
          "FFmpeg slices segments into 9:16 vertical clips (1080x1920). Uploads to blob storage, then publishes to TikTok, IG Reels, and Shorts.",
      },
    ],
  },
  {
    id: "data",
    label: "Data & Storage Layer",
    icon: Database,
    colorActive: "bg-chart-4/10 border-chart-4/30",
    colorIcon: "bg-chart-4 text-background",
    description:
      "PostgreSQL (Supabase/Neon) with Row Level Security. Blob storage for video files. CDN for clip delivery.",
    components: [
      {
        name: "PostgreSQL Database",
        detail:
          "6 core tables: users, channels, videos, clips, publications, social_accounts. Connection pooling via Supabase/Neon serverless driver.",
      },
      {
        name: "Blob / Object Storage",
        detail:
          "Vercel Blob or AWS S3 for source videos and generated clips. Lifecycle policies auto-delete source videos after processing.",
      },
      {
        name: "Encrypted Token Vault",
        detail:
          "Social platform OAuth tokens encrypted with AES-256-GCM before database storage. Refresh cron proactively renews before expiry.",
      },
      {
        name: "CDN & Edge Caching",
        detail:
          "Clip thumbnails and preview URLs served via Vercel Edge Network or CloudFront. Cache headers set for optimal performance.",
      },
    ],
  },
]

export function ArchitectureDiagram() {
  const [expanded, setExpanded] = useState<string | null>("frontend")

  return (
    <div className="space-y-3">
      {layers.map((layer, index) => {
        const Icon = layer.icon
        const isExpanded = expanded === layer.id
        return (
          <div key={layer.id}>
            <div
              className={`rounded-xl border transition-all ${
                isExpanded
                  ? `${layer.colorActive}`
                  : "border-border bg-card hover:border-primary/20"
              }`}
            >
              <button
                onClick={() =>
                  setExpanded(isExpanded ? null : layer.id)
                }
                className="flex w-full items-center gap-3 p-4 text-left"
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    isExpanded ? layer.colorIcon : "bg-secondary text-muted-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-foreground">
                    {layer.label}
                  </div>
                  {!isExpanded && (
                    <div className="text-xs text-muted-foreground truncate mt-0.5">
                      {layer.description.slice(0, 90)}...
                    </div>
                  )}
                </div>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
              </button>
              {isExpanded && (
                <div className="px-4 pb-4 space-y-4">
                  <p className="text-sm text-foreground/70 leading-relaxed">
                    {layer.description}
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {layer.components.map((comp) => (
                      <div
                        key={comp.name}
                        className="rounded-lg border border-border/50 bg-background/50 p-3"
                      >
                        <div className="text-sm font-medium text-foreground mb-1">
                          {comp.name}
                        </div>
                        <div className="text-xs text-muted-foreground leading-relaxed">
                          {comp.detail}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {index < layers.length - 1 && (
              <div className="flex justify-center py-1">
                <div className="h-3 w-px bg-border" />
              </div>
            )}
          </div>
        )
      })}

      {/* Data Flow Legend */}
      <div className="rounded-xl border border-border bg-card p-4 mt-2">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Data Flow
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-foreground/60">
          <span className="flex items-center gap-2">
            <span className="h-0.5 w-6 rounded bg-primary" />
            User requests (HTTP / WebSocket)
          </span>
          <span className="flex items-center gap-2">
            <span className="h-0.5 w-6 rounded bg-accent" />
            Webhook events (YouTube, Stripe)
          </span>
          <span className="flex items-center gap-2">
            <span className="h-0.5 w-6 rounded bg-chart-3" />
            Background job dispatch
          </span>
          <span className="flex items-center gap-2">
            <span className="h-0.5 w-6 rounded bg-chart-4" />
            Storage read / write
          </span>
        </div>
      </div>
    </div>
  )
}
