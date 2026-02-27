"use client"

import { useState } from "react"
import {
  Monitor,
  Smartphone,
  Layout,
  PanelLeft,
  BarChart3,
  Settings,
  Video,
  Bell,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface ScreenSpec {
  id: string
  icon: LucideIcon
  name: string
  route: string
  description: string
  keyElements: string[]
  uxNotes: string[]
}

const screens: ScreenSpec[] = [
  {
    id: "landing",
    icon: Monitor,
    name: "Landing Page",
    route: "/",
    description:
      "Marketing homepage with hero section, animated how-it-works flow, comparison table, pricing tiers, and social proof. Dark theme with vibrant green accents.",
    keyElements: [
      "Hero: Bold headline + animated clip preview",
      "How It Works: 4-step animated pipeline diagram",
      "Comparison Table: EasySlice vs Manual (side-by-side)",
      "Pricing Cards: Free / Pro / Enterprise tiers",
      "Social Proof: Creator testimonials + stats",
      "CTA: Persistent sticky bar on scroll",
    ],
    uxNotes: [
      "Above-the-fold CTA converts within 3 seconds",
      "Animate elements on scroll using Intersection Observer",
      "Mobile: Stack comparison into accordion format",
      "Lazy-load video previews below the fold",
    ],
  },
  {
    id: "onboarding",
    icon: PanelLeft,
    name: "Onboarding Flow",
    route: "/onboarding",
    description:
      "Multi-step wizard: connect YouTube channel, link social accounts, configure clipping preferences, and activate automation.",
    keyElements: [
      "Step 1: Google OAuth for YouTube channel",
      "Step 2: Link TikTok / Instagram accounts",
      "Step 3: Set clip preferences (duration, style, frequency)",
      "Step 4: Review and activate automation",
      "Progress indicator with animated step transitions",
    ],
    uxNotes: [
      "Each step validates before proceeding",
      "Skip optional platforms with easy re-entry later",
      "Show channel verification status in real-time",
      "Mobile-first: Full-screen steps with bottom navigation",
    ],
  },
  {
    id: "dashboard",
    icon: Layout,
    name: "Dashboard Overview",
    route: "/dashboard",
    description:
      "Central command center showing recent clips, active channels, automation status, and key metrics at a glance.",
    keyElements: [
      "Stats Row: Total clips, views, earnings, active channels",
      "Recent Clips: Grid of latest generated clips with status",
      "Activity Feed: Real-time log of system events",
      "Quick Actions: Reconnect channel, force-clip, view settings",
      "Automation Toggle: Global on/off with status indicator",
    ],
    uxNotes: [
      "SWR for real-time data refresh (15s interval)",
      "Skeleton loading states for all data cards",
      "Responsive grid: 3-col desktop, 2-col tablet, 1-col mobile",
      "Toast notifications for background job completions",
    ],
  },
  {
    id: "clips",
    icon: Video,
    name: "Clip Library",
    route: "/dashboard/clips",
    description:
      "Full clip management with preview, status tracking, manual editing controls, and batch publishing options.",
    keyElements: [
      "Filter Bar: By channel, status, platform, date range",
      "Clip Cards: Thumbnail, title, duration, publish status",
      "Preview Modal: Video player with timestamp scrubber",
      "Batch Actions: Select multiple, publish, delete, re-clip",
      "Status Badges: Processing, Ready, Published, Failed",
    ],
    uxNotes: [
      "Infinite scroll with virtual list for performance",
      "Optimistic UI updates for publish actions",
      "Drag-to-reorder for scheduling queue",
      "Keyboard shortcuts for power users (j/k navigation)",
    ],
  },
  {
    id: "analytics",
    icon: BarChart3,
    name: "Analytics",
    route: "/dashboard/analytics",
    description:
      "Performance metrics across all platforms with time-series charts, per-clip breakdown, and earnings tracking.",
    keyElements: [
      "Time Series Chart: Views, engagement, earnings over time",
      "Platform Breakdown: Pie chart of views by platform",
      "Top Clips Table: Sortable by views, likes, shares",
      "Earnings Widget: Revenue per clip with Whop integration",
      "Export: CSV download for accounting",
    ],
    uxNotes: [
      "Recharts with custom tooltips matching app theme",
      "Date range picker with presets (7d, 30d, 90d, all)",
      "Responsive charts that resize gracefully",
      "Loading states show chart skeletons, not spinners",
    ],
  },
  {
    id: "settings",
    icon: Settings,
    name: "Settings",
    route: "/dashboard/settings",
    description:
      "Account management, connected platforms, clipping preferences, notification configuration, and billing.",
    keyElements: [
      "Profile: Email, password, avatar, timezone",
      "Connected Accounts: YouTube, TikTok, Instagram status cards",
      "Clip Preferences: Default duration, style, captioning",
      "Notifications: Email/push preferences per event type",
      "Billing: Current plan, usage, upgrade/downgrade",
    ],
    uxNotes: [
      "Tab-based navigation within settings",
      "Inline editing with auto-save and toast confirmation",
      "Destructive actions require typed confirmation",
      "Mobile: Tabs become a scrollable list",
    ],
  },
]

export function ScreenMap() {
  const [activeScreen, setActiveScreen] = useState("landing")
  const current = screens.find((s) => s.id === activeScreen)!

  return (
    <div className="space-y-4">
      {/* Screen selector */}
      <div className="flex flex-wrap gap-2">
        {screens.map((screen) => {
          const Icon = screen.icon
          const isActive = screen.id === activeScreen
          return (
            <button
              key={screen.id}
              onClick={() => setActiveScreen(screen.id)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all ${
                isActive
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/20 hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {screen.name}
            </button>
          )
        })}
      </div>

      {/* Screen detail */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="text-lg font-semibold text-foreground">
              {current.name}
            </h4>
            <code className="text-xs text-muted-foreground font-mono">
              {current.route}
            </code>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-foreground/70">
          {current.description}
        </p>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <h5 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Key UI Elements
            </h5>
            <ul className="space-y-2">
              {current.keyElements.map((el) => (
                <li
                  key={el}
                  className="flex items-start gap-2 text-sm text-foreground/70"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {el}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              UX Considerations
            </h5>
            <ul className="space-y-2">
              {current.uxNotes.map((note) => (
                <li
                  key={note}
                  className="flex items-start gap-2 text-sm text-foreground/70"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  {note}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
