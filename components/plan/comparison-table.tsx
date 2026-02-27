"use client"

import { Check, X } from "lucide-react"

interface TableRow {
  category: string
  easyslice: string
  manual: string
  automatedBetter: boolean
}

const rows: TableRow[] = [
  {
    category: "New Upload Detection",
    easyslice: "Instant via webhook push notification",
    manual: "Manually check each time you upload",
    automatedBetter: true,
  },
  {
    category: "Clip Identification",
    easyslice: "AI scans full transcript for viral moments",
    manual: "Watch entire video and pick clips yourself",
    automatedBetter: true,
  },
  {
    category: "Clip Rendering",
    easyslice: "Automated FFmpeg pipeline (9:16 vertical)",
    manual: "Screen record or manually edit in Premiere/CapCut",
    automatedBetter: true,
  },
  {
    category: "Captioning",
    easyslice: "Auto-generated with styled word-by-word captions",
    manual: "Type captions manually or pay for a separate tool",
    automatedBetter: true,
  },
  {
    category: "Multi-Platform Publish",
    easyslice: "Simultaneous to TikTok, IG Reels, and Shorts",
    manual: "Upload separately to each platform",
    automatedBetter: true,
  },
  {
    category: "Consistency",
    easyslice: "Every video processed automatically, 24/7",
    manual: "Depends on your availability and motivation",
    automatedBetter: true,
  },
  {
    category: "Time per Video",
    easyslice: "~2 minutes (fully automated)",
    manual: "~45-90 minutes of manual work",
    automatedBetter: true,
  },
  {
    category: "Monetization Tracking",
    easyslice: "Built-in analytics with per-clip earnings",
    manual: "Spreadsheets and manual platform checks",
    automatedBetter: true,
  },
]

export function ComparisonTable() {
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground w-1/4">
                Feature
              </th>
              <th className="px-4 py-3 text-left font-medium text-primary w-[37.5%]">
                <span className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20">
                    <Check className="h-3 w-3 text-primary" />
                  </span>
                  AI Automated Platform
                </span>
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground w-[37.5%]">
                <span className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive/20">
                    <X className="h-3 w-3 text-destructive" />
                  </span>
                  Manual Method
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={row.category}
                className={`border-b border-border/50 ${
                  index % 2 === 0 ? "bg-card" : "bg-secondary/10"
                }`}
              >
                <td className="px-4 py-3 font-medium text-foreground text-sm">
                  {row.category}
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-primary/90">{row.easyslice}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-muted-foreground">{row.manual}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-center">
          <div className="text-2xl font-bold text-primary">45x</div>
          <div className="text-xs text-muted-foreground mt-1">Faster per video</div>
        </div>
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-center">
          <div className="text-2xl font-bold text-primary">3</div>
          <div className="text-xs text-muted-foreground mt-1">Platforms simultaneously</div>
        </div>
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-center">
          <div className="text-2xl font-bold text-primary">24/7</div>
          <div className="text-xs text-muted-foreground mt-1">Always-on automation</div>
        </div>
      </div>
    </div>
  )
}
