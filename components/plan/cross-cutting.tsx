"use client"

import { Shield, Zap, Globe, Server, Lock, Eye } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface Consideration {
  icon: LucideIcon
  title: string
  items: string[]
}

const considerations: Consideration[] = [
  {
    icon: Shield,
    title: "Security",
    items: [
      "Encrypt all OAuth tokens at rest (AES-256-GCM)",
      "Row Level Security (RLS) for multi-tenant data isolation",
      "CSRF protection on all mutation endpoints",
      "Rate limiting per user and per IP (Upstash Redis)",
      "Content Security Policy headers via middleware",
    ],
  },
  {
    icon: Zap,
    title: "Performance",
    items: [
      "Edge caching for static assets and landing page",
      "ISR (Incremental Static Regeneration) for marketing pages",
      "SWR for dashboard data with stale-while-revalidate",
      "Virtual scrolling for large clip libraries",
      "Image optimization via next/image with WebP/AVIF",
    ],
  },
  {
    icon: Globe,
    title: "Accessibility",
    items: [
      "WCAG 2.1 AA compliance across all screens",
      "Keyboard navigation for all interactive elements",
      "Screen reader labels for icons and status badges",
      "Reduced motion preferences respected",
      "Color contrast ratios verified (4.5:1 minimum)",
    ],
  },
  {
    icon: Server,
    title: "Scalability",
    items: [
      "Serverless architecture scales with demand",
      "Queue-based processing prevents bottlenecks",
      "Database connection pooling (Supabase/Neon)",
      "CDN-served clip thumbnails and previews",
      "Horizontal scaling via container-based FFmpeg workers",
    ],
  },
  {
    icon: Lock,
    title: "Reliability",
    items: [
      "Retry logic with exponential backoff for API calls",
      "Dead letter queue for failed processing jobs",
      "Health check endpoints for monitoring",
      "Graceful degradation when third-party APIs are down",
      "Database backups with point-in-time recovery",
    ],
  },
  {
    icon: Eye,
    title: "Observability",
    items: [
      "Structured logging with correlation IDs",
      "Error tracking via Sentry integration",
      "Custom metrics for clip processing pipeline",
      "Uptime monitoring for webhook endpoints",
      "Analytics on user behavior and feature usage",
    ],
  },
]

export function CrossCuttingConcerns() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {considerations.map((concern) => {
        const Icon = concern.icon
        return (
          <div
            key={concern.title}
            className="rounded-xl border border-border bg-card p-4"
          >
            <div className="flex items-center gap-2.5 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <h4 className="font-semibold text-foreground text-sm">
                {concern.title}
              </h4>
            </div>
            <ul className="space-y-1.5">
              {concern.items.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-xs text-foreground/60 leading-relaxed"
                >
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}
