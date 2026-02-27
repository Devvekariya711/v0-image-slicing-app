"use client"

import { useState } from "react"
import {
  Link2,
  ScanSearch,
  Scissors,
  Upload,
  DollarSign,
  ChevronRight,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface FlowStep {
  icon: LucideIcon
  title: string
  subtitle: string
  description: string
  technical: string[]
}

const steps: FlowStep[] = [
  {
    icon: Link2,
    title: "Connect Channel",
    subtitle: "OAuth + Channel Setup",
    description:
      "User authenticates via Google OAuth 2.0. The app stores refresh tokens and subscribes to YouTube push notifications via PubSubHubbub.",
    technical: [
      "Google OAuth 2.0 with offline access scope",
      "Store encrypted refresh tokens in database",
      "Subscribe to YouTube PubSubHubbub for channel feed",
      "Verify channel ownership via Data API v3",
    ],
  },
  {
    icon: ScanSearch,
    title: "Detect Upload",
    subtitle: "Webhook + Polling",
    description:
      "YouTube push notifications trigger a webhook. A fallback polling job runs every 5 minutes to catch any missed notifications.",
    technical: [
      "PubSubHubbub webhook endpoint receives Atom feed",
      "Parse video ID, title, and metadata from notification",
      "Fallback cron via Vercel Cron or Inngest scheduler",
      "Deduplicate using video ID in database",
    ],
  },
  {
    icon: Scissors,
    title: "AI Clip Extraction",
    subtitle: "Transcript Analysis + Scene Detection",
    description:
      "The AI pipeline downloads the transcript, analyzes it for viral moments, identifies scene boundaries, and renders short-form clips.",
    technical: [
      "Fetch transcript via YouTube Transcript API",
      "LLM analysis (GPT/Claude) to identify top 3-5 moments",
      "FFmpeg in serverless/container for clip extraction",
      "Generate captions, thumbnails, and metadata per clip",
    ],
  },
  {
    icon: Upload,
    title: "Auto-Publish",
    subtitle: "Multi-Platform Distribution",
    description:
      "Clips are uploaded directly to TikTok, Instagram Reels, and YouTube Shorts via their respective APIs with optimized metadata.",
    technical: [
      "TikTok Content Posting API (OAuth + upload)",
      "Instagram Graph API for Reels publishing",
      "YouTube Data API v3 for Shorts upload",
      "Platform-specific format/aspect ratio optimization",
    ],
  },
  {
    icon: DollarSign,
    title: "Monetization",
    subtitle: "Whop Campaigns Integration",
    description:
      "Optionally enroll clips in Whop reward campaigns, tracking views and earnings per clip with real-time analytics.",
    technical: [
      "Whop API integration for campaign enrollment",
      "Webhook listeners for view count and payment events",
      "Earnings dashboard with per-clip breakdown",
      "Automated payout tracking and history",
    ],
  },
]

export function PipelineFlow() {
  const [activeStep, setActiveStep] = useState(0)
  const current = steps[activeStep]

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* Step selector */}
      <div className="lg:col-span-2 flex flex-col gap-1">
        {steps.map((step, index) => {
          const Icon = step.icon
          const isActive = index === activeStep
          return (
            <button
              key={step.title}
              onClick={() => setActiveStep(index)}
              className={`flex items-center gap-3 rounded-lg p-3 text-left transition-all ${
                isActive
                  ? "bg-primary/10 border border-primary/30"
                  : "hover:bg-secondary/50 border border-transparent"
              }`}
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className={`text-sm font-medium ${
                    isActive ? "text-primary" : "text-foreground"
                  }`}
                >
                  {step.title}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {step.subtitle}
                </div>
              </div>
              {isActive && (
                <ChevronRight className="h-4 w-4 shrink-0 text-primary" />
              )}
            </button>
          )
        })}
      </div>

      {/* Step detail */}
      <div className="lg:col-span-3 rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <current.icon className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">{current.title}</h4>
            <p className="text-xs text-muted-foreground">{current.subtitle}</p>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-foreground/80 mb-4">
          {current.description}
        </p>
        <div className="space-y-2">
          <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Technical Details
          </h5>
          <ul className="space-y-2">
            {current.technical.map((detail) => (
              <li
                key={detail}
                className="flex items-start gap-2 text-sm text-foreground/70"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {detail}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
