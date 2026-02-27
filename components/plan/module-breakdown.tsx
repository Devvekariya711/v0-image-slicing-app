"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

interface ModuleSection {
  id: string
  title: string
  badge: string
  badgeColor: string
  description: string
  files: { path: string; purpose: string }[]
  apis: string[]
  dependencies: string[]
}

const modules: ModuleSection[] = [
  {
    id: "auth",
    title: "Authentication & OAuth",
    badge: "Core",
    badgeColor: "bg-primary/20 text-primary",
    description:
      "Handles user signup/login and third-party OAuth flows for YouTube, TikTok, and Instagram. Manages token refresh, revocation, and session persistence.",
    files: [
      { path: "app/(auth)/login/page.tsx", purpose: "Login page with OAuth buttons" },
      { path: "app/(auth)/signup/page.tsx", purpose: "Registration with email/password" },
      { path: "app/api/auth/[...provider]/route.ts", purpose: "OAuth callback handlers" },
      { path: "lib/auth/session.ts", purpose: "Session creation, validation, refresh" },
      { path: "lib/auth/tokens.ts", purpose: "Encrypted token storage and rotation" },
    ],
    apis: [
      "Google OAuth 2.0 (YouTube channel access)",
      "TikTok Login Kit (content posting scope)",
      "Instagram Basic Display + Graph API (Reels)",
    ],
    dependencies: ["Supabase Auth (or custom JWT)", "bcrypt", "jose (JWT signing)"],
  },
  {
    id: "channel",
    title: "Channel Management",
    badge: "Core",
    badgeColor: "bg-primary/20 text-primary",
    description:
      "Allows users to connect, configure, and monitor their YouTube channels. Manages webhook subscriptions and channel verification.",
    files: [
      { path: "app/dashboard/channels/page.tsx", purpose: "Channel list and connection UI" },
      { path: "app/api/channels/connect/route.ts", purpose: "Channel verification endpoint" },
      { path: "app/api/webhooks/youtube/route.ts", purpose: "PubSubHubbub callback" },
      { path: "lib/youtube/subscribe.ts", purpose: "Manage hub subscriptions" },
      { path: "lib/youtube/data-api.ts", purpose: "Channel and video metadata queries" },
    ],
    apis: [
      "YouTube Data API v3",
      "YouTube PubSubHubbub (push notifications)",
    ],
    dependencies: ["google-auth-library", "xml2js (Atom feed parsing)"],
  },
  {
    id: "clipping",
    title: "AI Clipping Engine",
    badge: "AI",
    badgeColor: "bg-accent/20 text-accent",
    description:
      "The core AI pipeline that analyzes video transcripts, identifies viral moments, and orchestrates clip extraction with FFmpeg. Supports configurable clip durations and styles.",
    files: [
      { path: "lib/clipping/analyzer.ts", purpose: "LLM-powered moment detection" },
      { path: "lib/clipping/transcript.ts", purpose: "Transcript fetching and parsing" },
      { path: "lib/clipping/renderer.ts", purpose: "FFmpeg clip extraction orchestration" },
      { path: "lib/clipping/captions.ts", purpose: "Auto-caption generation and styling" },
      { path: "app/api/clips/process/route.ts", purpose: "Job initiation endpoint" },
    ],
    apis: [
      "OpenAI / Anthropic (viral moment analysis via AI SDK)",
      "YouTube Transcript API",
      "FFmpeg (video processing in container runtime)",
    ],
    dependencies: [
      "ai (Vercel AI SDK)",
      "fluent-ffmpeg",
      "Inngest / BullMQ (job orchestration)",
    ],
  },
  {
    id: "publishing",
    title: "Multi-Platform Publishing",
    badge: "Integration",
    badgeColor: "bg-chart-3/20 text-chart-3",
    description:
      "Manages the distribution pipeline to TikTok, Instagram Reels, and YouTube Shorts. Handles format optimization, scheduling, and upload status tracking.",
    files: [
      { path: "lib/publishing/tiktok.ts", purpose: "TikTok Content Posting API client" },
      { path: "lib/publishing/instagram.ts", purpose: "Instagram Graph API Reels upload" },
      { path: "lib/publishing/youtube-shorts.ts", purpose: "YouTube Shorts upload via Data API" },
      { path: "lib/publishing/scheduler.ts", purpose: "Optimal posting time calculation" },
      { path: "app/api/publish/route.ts", purpose: "Publish trigger and status endpoint" },
    ],
    apis: [
      "TikTok Content Posting API",
      "Instagram Graph API",
      "YouTube Data API v3",
    ],
    dependencies: ["form-data", "sharp (thumbnail processing)"],
  },
  {
    id: "dashboard",
    title: "Dashboard & Analytics",
    badge: "Frontend",
    badgeColor: "bg-chart-4/20 text-chart-4",
    description:
      "The main user-facing dashboard showing clips, analytics, connected accounts, and activity feed. Real-time updates via SWR and server-sent events.",
    files: [
      { path: "app/dashboard/page.tsx", purpose: "Main dashboard overview" },
      { path: "app/dashboard/clips/page.tsx", purpose: "Clip library and management" },
      { path: "app/dashboard/analytics/page.tsx", purpose: "Performance metrics and charts" },
      { path: "app/dashboard/settings/page.tsx", purpose: "Account and preferences" },
      { path: "components/dashboard/clip-card.tsx", purpose: "Individual clip preview card" },
      { path: "components/dashboard/activity-feed.tsx", purpose: "Real-time activity log" },
    ],
    apis: ["Internal API routes", "SSE for real-time updates"],
    dependencies: ["SWR", "Recharts", "date-fns"],
  },
  {
    id: "billing",
    title: "Billing & Monetization",
    badge: "Business",
    badgeColor: "bg-destructive/20 text-destructive",
    description:
      "Stripe-powered subscription management with tiered plans. Optional Whop integration for creator monetization campaigns.",
    files: [
      { path: "app/api/webhooks/stripe/route.ts", purpose: "Stripe webhook handler" },
      { path: "app/dashboard/billing/page.tsx", purpose: "Plan selection and management" },
      { path: "lib/billing/stripe.ts", purpose: "Stripe client and subscription logic" },
      { path: "lib/billing/whop.ts", purpose: "Whop campaign enrollment" },
      { path: "lib/billing/usage.ts", purpose: "Usage metering and limits" },
    ],
    apis: ["Stripe Checkout + Billing Portal", "Whop API"],
    dependencies: ["stripe", "@stripe/stripe-js"],
  },
]

export function ModuleBreakdown() {
  const [openModules, setOpenModules] = useState<string[]>(["auth"])

  const toggleModule = (id: string) => {
    setOpenModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    )
  }

  return (
    <div className="space-y-3">
      {modules.map((mod) => {
        const isOpen = openModules.includes(mod.id)
        return (
          <div
            key={mod.id}
            className="rounded-xl border border-border bg-card overflow-hidden"
          >
            <button
              onClick={() => toggleModule(mod.id)}
              className="flex w-full items-center gap-3 p-4 text-left hover:bg-secondary/30 transition-colors"
            >
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                  isOpen ? "rotate-0" : "-rotate-90"
                }`}
              />
              <div className="flex-1">
                <span className="font-semibold text-foreground">
                  {mod.title}
                </span>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${mod.badgeColor}`}
              >
                {mod.badge}
              </span>
            </button>

            {isOpen && (
              <div className="border-t border-border px-4 pb-4 pt-3 space-y-4">
                <p className="text-sm leading-relaxed text-foreground/70">
                  {mod.description}
                </p>

                {/* File Structure */}
                <div>
                  <h5 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    File Structure
                  </h5>
                  <div className="space-y-1.5">
                    {mod.files.map((file) => (
                      <div
                        key={file.path}
                        className="flex items-start gap-2 text-sm"
                      >
                        <code className="shrink-0 rounded bg-secondary px-1.5 py-0.5 font-mono text-xs text-secondary-foreground">
                          {file.path}
                        </code>
                        <span className="text-muted-foreground text-xs mt-0.5">
                          {file.purpose}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* External APIs */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <h5 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      External APIs
                    </h5>
                    <ul className="space-y-1">
                      {mod.apis.map((api) => (
                        <li
                          key={api}
                          className="flex items-start gap-2 text-sm text-foreground/70"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          {api}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Key Dependencies
                    </h5>
                    <ul className="space-y-1">
                      {mod.dependencies.map((dep) => (
                        <li
                          key={dep}
                          className="flex items-start gap-2 text-sm text-foreground/70"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                          {dep}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
