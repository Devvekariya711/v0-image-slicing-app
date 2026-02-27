"use client"

interface TechItem {
  name: string
  purpose: string
  category: string
}

const techStack: TechItem[] = [
  { name: "Next.js 16", purpose: "Full-stack React framework with App Router, RSC, and edge runtime", category: "Framework" },
  { name: "React 19", purpose: "UI library with Server Components, Actions, and Suspense", category: "Framework" },
  { name: "TypeScript", purpose: "End-to-end type safety across client and server", category: "Framework" },
  { name: "Tailwind CSS 4", purpose: "Utility-first styling with design token system", category: "Styling" },
  { name: "shadcn/ui", purpose: "Accessible, composable component library", category: "Styling" },
  { name: "Framer Motion", purpose: "Declarative animations and page transitions", category: "Styling" },
  { name: "Supabase / Neon", purpose: "PostgreSQL database with auth and real-time features", category: "Backend" },
  { name: "Upstash Redis", purpose: "Serverless cache, rate limiting, and job queues", category: "Backend" },
  { name: "Vercel Blob / S3", purpose: "Object storage for video clips and thumbnails", category: "Backend" },
  { name: "Inngest", purpose: "Durable workflow engine for multi-step AI pipeline", category: "Backend" },
  { name: "Vercel AI SDK", purpose: "Unified interface for LLM calls (moment detection)", category: "AI" },
  { name: "FFmpeg", purpose: "Video slicing, format conversion, and caption burning", category: "AI" },
  { name: "YouTube Data API v3", purpose: "Channel data, video metadata, and Shorts upload", category: "APIs" },
  { name: "TikTok Content API", purpose: "Automated video posting to TikTok", category: "APIs" },
  { name: "Instagram Graph API", purpose: "Reels publishing and insights", category: "APIs" },
  { name: "Stripe", purpose: "Subscription billing and payment processing", category: "Business" },
  { name: "Whop API", purpose: "Creator monetization campaign enrollment", category: "Business" },
  { name: "Resend", purpose: "Transactional email notifications", category: "Business" },
  { name: "SWR", purpose: "Client-side data fetching with caching and revalidation", category: "DX" },
  { name: "Zod", purpose: "Runtime schema validation for API inputs", category: "DX" },
  { name: "Sentry", purpose: "Error tracking and performance monitoring", category: "DX" },
]

const categories = [...new Set(techStack.map((t) => t.category))]

const categoryColors: Record<string, string> = {
  Framework: "bg-primary/15 text-primary border-primary/20",
  Styling: "bg-accent/15 text-accent border-accent/20",
  Backend: "bg-chart-3/15 text-chart-3 border-chart-3/20",
  AI: "bg-chart-4/15 text-chart-4 border-chart-4/20",
  APIs: "bg-chart-5/15 text-chart-5 border-chart-5/20",
  Business: "bg-destructive/15 text-destructive border-destructive/20",
  DX: "bg-muted-foreground/15 text-muted-foreground border-muted-foreground/20",
}

export function TechStack() {
  return (
    <div className="space-y-5">
      {categories.map((category) => (
        <div key={category}>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {category}
          </h4>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {techStack
              .filter((t) => t.category === category)
              .map((tech) => (
                <div
                  key={tech.name}
                  className={`rounded-lg border p-3 ${categoryColors[category] || "bg-card border-border"}`}
                >
                  <div className="font-medium text-sm">{tech.name}</div>
                  <div className="text-xs opacity-70 mt-0.5 leading-relaxed">
                    {tech.purpose}
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}
