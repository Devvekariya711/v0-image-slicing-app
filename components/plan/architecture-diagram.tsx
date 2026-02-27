"use client"

import { useState } from "react"

const layers = [
  {
    id: "client",
    label: "Client Layer",
    color: "bg-primary/20 border-primary/40",
    textColor: "text-primary",
    items: [
      "Next.js App Router (SSR + CSR)",
      "React Components (shadcn/ui)",
      "Tailwind CSS + Framer Motion",
      "SWR for data fetching",
    ],
  },
  {
    id: "api",
    label: "API Layer",
    color: "bg-accent/20 border-accent/40",
    textColor: "text-accent",
    items: [
      "Next.js Route Handlers",
      "OAuth 2.0 Flows (Google, TikTok, IG)",
      "Webhook Endpoints (YouTube PubSubHubbub)",
      "REST + Server Actions",
    ],
  },
  {
    id: "services",
    label: "Service Layer",
    color: "bg-chart-3/20 border-chart-3/40",
    textColor: "text-chart-3",
    items: [
      "Video Detection Service (YouTube Data API)",
      "AI Clipping Engine (Transcript + Vision)",
      "Publishing Pipeline (TikTok, IG, Shorts)",
      "Queue & Job Scheduler (BullMQ / Inngest)",
    ],
  },
  {
    id: "data",
    label: "Data Layer",
    color: "bg-chart-4/20 border-chart-4/40",
    textColor: "text-chart-4",
    items: [
      "PostgreSQL (Supabase / Neon)",
      "Blob Storage (Vercel Blob / S3)",
      "Redis (Upstash) for caching & queues",
      "Row Level Security & Auth",
    ],
  },
]

export function ArchitectureDiagram() {
  const [activeLayer, setActiveLayer] = useState<string | null>(null)

  return (
    <div className="space-y-3">
      {layers.map((layer, index) => (
        <div key={layer.id}>
          <button
            onClick={() =>
              setActiveLayer(activeLayer === layer.id ? null : layer.id)
            }
            className={`w-full rounded-lg border p-4 text-left transition-all ${layer.color} ${
              activeLayer === layer.id
                ? "ring-1 ring-ring"
                : "hover:ring-1 hover:ring-ring/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`font-semibold ${layer.textColor}`}>
                {layer.label}
              </span>
              <span className="text-xs text-muted-foreground">
                {activeLayer === layer.id ? "Click to collapse" : "Click to expand"}
              </span>
            </div>
            {activeLayer === layer.id && (
              <ul className="mt-3 space-y-1.5">
                {layer.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-sm text-foreground/80"
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${layer.textColor} bg-current shrink-0`} />
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </button>
          {index < layers.length - 1 && (
            <div className="flex justify-center py-1">
              <div className="h-4 w-px bg-border" />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
