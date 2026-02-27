"use client"

import { useState } from "react"
import {
  Layers,
  GitBranch,
  Boxes,
  Monitor,
  Calendar,
  Scale,
  Database,
  Cpu,
  Scissors,
} from "lucide-react"
import { ArchitectureDiagram } from "@/components/plan/architecture-diagram"
import { PipelineFlow } from "@/components/plan/pipeline-flow"
import { ModuleBreakdown } from "@/components/plan/module-breakdown"
import { ScreenMap } from "@/components/plan/screen-map"
import { PhaseTimeline } from "@/components/plan/phase-timeline"
import { ComparisonTable } from "@/components/plan/comparison-table"
import { CrossCuttingConcerns } from "@/components/plan/cross-cutting"
import { TechStack } from "@/components/plan/tech-stack"
import { DatabaseSchema } from "@/components/plan/database-schema"

interface Section {
  id: string
  label: string
  icon: typeof Layers
}

const sections: Section[] = [
  { id: "overview", label: "Overview", icon: Scissors },
  { id: "architecture", label: "Architecture", icon: Layers },
  { id: "pipeline", label: "Core Pipeline", icon: GitBranch },
  { id: "modules", label: "Modules", icon: Boxes },
  { id: "screens", label: "Screens & UX", icon: Monitor },
  { id: "database", label: "Database", icon: Database },
  { id: "tech", label: "Tech Stack", icon: Cpu },
  { id: "comparison", label: "vs Manual", icon: Scale },
  { id: "phases", label: "Roadmap", icon: Calendar },
  { id: "concerns", label: "Cross-Cutting", icon: Layers },
]

export default function PlanPage() {
  const [activeSection, setActiveSection] = useState("overview")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Scissors className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <span className="font-semibold text-foreground text-sm">
                  AutoClip.AI
                </span>
                <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                  Project Plan
                </span>
              </div>
            </div>
            <span className="text-xs text-muted-foreground hidden sm:block">
              AI-Powered Video Clipping Platform
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <nav className="lg:w-56 shrink-0">
            <div className="lg:sticky lg:top-20 space-y-1 flex lg:flex-col flex-row flex-wrap gap-1 lg:gap-0">
              {sections.map((section) => {
                const Icon = section.icon
                const isActive = section.id === activeSection
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all w-full text-left ${
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="hidden lg:inline">{section.label}</span>
                  </button>
                )
              })}
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {activeSection === "overview" && <OverviewSection />}
            {activeSection === "architecture" && (
              <PlanSection
                title="System Architecture"
                subtitle="Four-layer architecture designed for scalability and separation of concerns. Click each layer to explore its components."
              >
                <ArchitectureDiagram />
              </PlanSection>
            )}
            {activeSection === "pipeline" && (
              <PlanSection
                title="Core Processing Pipeline"
                subtitle="The end-to-end flow from YouTube upload detection to multi-platform clip publishing. Each step is independently scalable."
              >
                <PipelineFlow />
              </PlanSection>
            )}
            {activeSection === "modules" && (
              <PlanSection
                title="Module Breakdown"
                subtitle="Six distinct modules with clear boundaries, each owning its file structure, API contracts, and external service integrations."
              >
                <ModuleBreakdown />
              </PlanSection>
            )}
            {activeSection === "screens" && (
              <PlanSection
                title="Screens & User Experience"
                subtitle="Every screen in the application with key UI elements and UX considerations. All screens are mobile-first and responsive."
              >
                <ScreenMap />
              </PlanSection>
            )}
            {activeSection === "database" && (
              <PlanSection
                title="Database Schema"
                subtitle="PostgreSQL schema with six core tables. All tokens encrypted at rest. RLS policies enforce tenant isolation."
              >
                <DatabaseSchema />
              </PlanSection>
            )}
            {activeSection === "tech" && (
              <PlanSection
                title="Technology Stack"
                subtitle="Modern, production-proven technologies organized by concern. Every choice optimized for developer experience and scalability."
              >
                <TechStack />
              </PlanSection>
            )}
            {activeSection === "comparison" && (
              <PlanSection
                title="Automated vs Manual"
                subtitle="Side-by-side comparison showing the value proposition of the AI-powered automation platform versus traditional manual workflow."
              >
                <ComparisonTable />
              </PlanSection>
            )}
            {activeSection === "phases" && (
              <PlanSection
                title="Development Roadmap"
                subtitle="Five-phase implementation plan progressing from foundation to production-ready. Each phase produces a deployable increment."
              >
                <PhaseTimeline />
              </PlanSection>
            )}
            {activeSection === "concerns" && (
              <PlanSection
                title="Cross-Cutting Concerns"
                subtitle="Non-functional requirements that span all modules. These should be addressed continuously throughout development, not as an afterthought."
              >
                <CrossCuttingConcerns />
              </PlanSection>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

function OverviewSection() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="rounded-2xl border border-border bg-card p-8 sm:p-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <Scissors className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground text-balance">
              AutoClip.AI Project Plan
            </h1>
            <p className="text-sm text-muted-foreground">
              AI-Powered Video Clipping Platform
            </p>
          </div>
        </div>
        <p className="text-foreground/70 leading-relaxed max-w-3xl">
          A comprehensive development plan for building an automated video clipping
          service similar to EasySlice.ai. The platform detects new YouTube uploads,
          uses AI to identify viral moments, automatically slices them into
          short-form clips, and publishes to TikTok, Instagram Reels, and YouTube
          Shorts. This document covers architecture, modules, screens, database
          design, technology choices, and a phased delivery roadmap.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Modules", value: "6", detail: "Auth, Channels, AI Pipeline, Publishing, Dashboard, Billing" },
          { label: "Screens", value: "6+", detail: "Landing, Onboarding, Dashboard, Clips Library, Analytics, Settings" },
          { label: "API Integrations", value: "8", detail: "YouTube, TikTok, Instagram, Stripe, Whop, OpenAI, FFmpeg, Resend" },
          { label: "DB Tables", value: "6", detail: "users, channels, videos, clips, publications, social_accounts" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-card p-4"
          >
            <div className="text-2xl font-bold text-primary">{stat.value}</div>
            <div className="text-sm font-medium text-foreground mt-1">
              {stat.label}
            </div>
            <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {stat.detail}
            </div>
          </div>
        ))}
      </div>

      {/* Core User Journey */}
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-foreground mb-5">
          Core User Journey
        </h2>
        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          {[
            { step: "1", title: "Connect", detail: "Link YouTube channel via OAuth" },
            { step: "2", title: "Detect", detail: "Webhook fires on new upload" },
            { step: "3", title: "Analyze", detail: "AI finds viral moments" },
            { step: "4", title: "Clip", detail: "FFmpeg renders 9:16 clips" },
            { step: "5", title: "Publish", detail: "Auto-post to 3 platforms" },
          ].map((item, i) => (
            <div key={item.step} className="flex sm:flex-col items-center gap-3 flex-1">
              <div className="flex sm:flex-col items-center gap-3 flex-1 w-full">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-sm font-bold text-primary">
                  {item.step}
                </div>
                <div className="sm:text-center">
                  <div className="text-sm font-semibold text-foreground">{item.title}</div>
                  <div className="text-xs text-muted-foreground">{item.detail}</div>
                </div>
              </div>
              {i < 4 && (
                <div className="hidden sm:block h-px w-full bg-border" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Product Vision */}
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Product Vision
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <h3 className="text-sm font-medium text-primary mb-2">
              Core Value Proposition
            </h3>
            <p className="text-sm text-foreground/70 leading-relaxed">
              Creators upload once to YouTube and the platform handles everything
              else: detecting the upload, analyzing for viral moments, rendering
              clips with captions, and publishing to all short-form platforms. Zero
              manual effort after initial setup.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-primary mb-2">
              Target Audience
            </h3>
            <p className="text-sm text-foreground/70 leading-relaxed">
              YouTube content creators who want to maximize reach across TikTok,
              Instagram, and Shorts without spending hours manually clipping and
              repurposing. From solo creators to media companies with multiple
              channels.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-primary mb-2">
              Key Differentiators
            </h3>
            <ul className="space-y-1.5 text-sm text-foreground/70">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                Fully automated: Set once, clips flow passively
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                AI-powered viral moment detection via LLM analysis
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                True multi-platform publishing (TikTok, IG Reels, Shorts)
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                Built-in monetization via Whop campaigns
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-medium text-primary mb-2">
              Revenue Model
            </h3>
            <ul className="space-y-1.5 text-sm text-foreground/70">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                <span><strong className="text-foreground/80">Free:</strong> 1 channel, 3 clips/month, manual publish</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                <span><strong className="text-foreground/80">Pro ($29/mo):</strong> 5 channels, unlimited clips, auto-publish</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                <span><strong className="text-foreground/80">Enterprise ($99/mo):</strong> Unlimited channels, priority, API access</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Navigation hint */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
        <p className="text-sm text-foreground/70">
          Use the navigation on the left to explore each section of this plan in detail.
          Each section is interactive with expandable content.
        </p>
      </div>
    </div>
  )
}

function PlanSection({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground text-balance">
          {title}
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed max-w-3xl">
          {subtitle}
        </p>
      </div>
      {children}
    </div>
  )
}
