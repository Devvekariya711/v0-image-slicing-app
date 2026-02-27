"use client"

import { useState } from "react"
import {
  Monitor,
  PanelLeft,
  Layout,
  Video,
  BarChart3,
  Settings,
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
  wireframeBlocks: { label: string; span: string }[]
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
      "Comparison Table: AI Platform vs Manual (side-by-side)",
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
    wireframeBlocks: [
      { label: "Nav", span: "col-span-4" },
      { label: "Hero + CTA", span: "col-span-4 row-span-2" },
      { label: "How It Works", span: "col-span-4" },
      { label: "Comparison", span: "col-span-4" },
      { label: "Pricing", span: "col-span-4" },
      { label: "Footer", span: "col-span-4" },
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
    wireframeBlocks: [
      { label: "Progress Bar", span: "col-span-4" },
      { label: "Step Content", span: "col-span-4 row-span-3" },
      { label: "Back / Next", span: "col-span-4" },
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
    wireframeBlocks: [
      { label: "Sidebar", span: "col-span-1 row-span-5" },
      { label: "Header + Search", span: "col-span-3" },
      { label: "Stat", span: "col-span-1" },
      { label: "Stat", span: "col-span-1" },
      { label: "Stat", span: "col-span-1" },
      { label: "Recent Clips Grid", span: "col-span-2 row-span-2" },
      { label: "Activity Feed", span: "col-span-1 row-span-2" },
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
    wireframeBlocks: [
      { label: "Sidebar", span: "col-span-1 row-span-5" },
      { label: "Filters + Sort", span: "col-span-3" },
      { label: "Clip", span: "col-span-1 row-span-2" },
      { label: "Clip", span: "col-span-1 row-span-2" },
      { label: "Clip", span: "col-span-1 row-span-2" },
      { label: "Load More", span: "col-span-3" },
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
    wireframeBlocks: [
      { label: "Sidebar", span: "col-span-1 row-span-5" },
      { label: "Date Range + Export", span: "col-span-3" },
      { label: "Line Chart", span: "col-span-2 row-span-2" },
      { label: "Pie Chart", span: "col-span-1 row-span-2" },
      { label: "Top Clips Table", span: "col-span-3 row-span-2" },
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
    wireframeBlocks: [
      { label: "Sidebar", span: "col-span-1 row-span-5" },
      { label: "Settings Tabs", span: "col-span-3" },
      { label: "Form Content", span: "col-span-2 row-span-3" },
      { label: "Preview / Status", span: "col-span-1 row-span-3" },
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
        <div className="flex items-start justify-between gap-4">
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

        {/* Wireframe Preview */}
        <div>
          <h5 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Layout Wireframe
          </h5>
          <div className="grid grid-cols-4 gap-1.5 rounded-lg border border-border/50 bg-background/50 p-3">
            {current.wireframeBlocks.map((block, i) => (
              <div
                key={`${block.label}-${i}`}
                className={`flex items-center justify-center rounded border border-dashed border-primary/20 bg-primary/5 p-2 text-center ${block.span}`}
              >
                <span className="text-[10px] leading-tight text-primary/60 font-medium">
                  {block.label}
                </span>
              </div>
            ))}
          </div>
        </div>

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
