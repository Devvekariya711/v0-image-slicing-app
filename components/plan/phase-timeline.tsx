"use client"

interface Phase {
  number: number
  title: string
  subtitle: string
  color: string
  milestones: string[]
  deliverables: string[]
}

const phases: Phase[] = [
  {
    number: 1,
    title: "Foundation",
    subtitle: "Auth, Database, Landing Page",
    color: "border-primary",
    milestones: [
      "Project scaffolding with Next.js 16 + Tailwind + shadcn/ui",
      "Database schema design and migration (Supabase/Neon)",
      "Authentication system (email/password + Google OAuth)",
      "Landing page with all marketing sections",
      "Responsive layout system and design tokens",
    ],
    deliverables: [
      "Deployable marketing site with auth flow",
      "Database with users, channels, clips tables",
      "OAuth token management infrastructure",
    ],
  },
  {
    number: 2,
    title: "Core Pipeline",
    subtitle: "Channel Connection + AI Clipping",
    color: "border-accent",
    milestones: [
      "YouTube channel connection via OAuth + Data API",
      "PubSubHubbub webhook for upload detection",
      "Transcript fetching and AI analysis pipeline",
      "FFmpeg integration for clip extraction",
      "Job queue system (Inngest/BullMQ)",
    ],
    deliverables: [
      "End-to-end: YouTube upload triggers clip generation",
      "Clip storage in Vercel Blob / S3",
      "Background job monitoring dashboard",
    ],
  },
  {
    number: 3,
    title: "Publishing + Dashboard",
    subtitle: "Multi-Platform Distribution + UI",
    color: "border-chart-3",
    milestones: [
      "TikTok Content Posting API integration",
      "Instagram Reels publishing via Graph API",
      "YouTube Shorts upload automation",
      "Dashboard: Clip library, activity feed, quick actions",
      "Onboarding wizard for new users",
    ],
    deliverables: [
      "Auto-publish to 3 platforms from a single source video",
      "Full dashboard with clip management",
      "User onboarding with guided channel connection",
    ],
  },
  {
    number: 4,
    title: "Analytics + Monetization",
    subtitle: "Metrics, Billing, Whop Integration",
    color: "border-chart-4",
    milestones: [
      "Analytics dashboard with Recharts visualizations",
      "Per-clip and per-platform performance tracking",
      "Stripe subscription billing (Free / Pro / Enterprise)",
      "Whop campaign enrollment and earnings tracking",
      "Usage metering and plan limits enforcement",
    ],
    deliverables: [
      "Complete analytics with export capability",
      "Working subscription billing with Stripe",
      "Creator monetization pipeline via Whop",
    ],
  },
  {
    number: 5,
    title: "Polish + Scale",
    subtitle: "Performance, Accessibility, Edge Cases",
    color: "border-destructive",
    milestones: [
      "Error handling, retry logic, and fallback mechanisms",
      "Rate limiting and API quota management",
      "Accessibility audit (WCAG 2.1 AA compliance)",
      "Performance optimization (Core Web Vitals)",
      "Email notifications (Resend / SendGrid)",
      "Admin panel for system monitoring",
    ],
    deliverables: [
      "Production-hardened platform",
      "Monitoring and alerting infrastructure",
      "Complete notification system",
    ],
  },
]

export function PhaseTimeline() {
  return (
    <div className="space-y-6">
      {phases.map((phase, index) => (
        <div key={phase.number} className="relative">
          {/* Connector line */}
          {index < phases.length - 1 && (
            <div className="absolute left-5 top-14 bottom-0 w-px bg-border translate-x-[-0.5px]" />
          )}

          <div className="flex gap-4">
            {/* Phase number */}
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 bg-background text-sm font-bold ${phase.color}`}
            >
              {phase.number}
            </div>

            {/* Phase content */}
            <div className="flex-1 pb-6">
              <div className="mb-1">
                <h4 className="font-semibold text-foreground">{phase.title}</h4>
                <p className="text-xs text-muted-foreground">
                  {phase.subtitle}
                </p>
              </div>

              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-border bg-secondary/20 p-3">
                  <h5 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Milestones
                  </h5>
                  <ul className="space-y-1.5">
                    {phase.milestones.map((milestone) => (
                      <li
                        key={milestone}
                        className="flex items-start gap-2 text-sm text-foreground/70"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground" />
                        {milestone}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-lg border border-border bg-secondary/20 p-3">
                  <h5 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Deliverables
                  </h5>
                  <ul className="space-y-1.5">
                    {phase.deliverables.map((deliverable) => (
                      <li
                        key={deliverable}
                        className="flex items-start gap-2 text-sm text-foreground/70"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        {deliverable}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
