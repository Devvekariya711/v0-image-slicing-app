# SocialHub — Known Issues & Blockers

## Pre-Existing (from repo analysis)
- [ ] `ignoreBuildErrors: true` in next.config.mjs — must fix TypeScript errors
- [ ] `images.unoptimized: true` — should enable optimization
- [ ] Duplicate `globals.css` (app/ + styles/) — consolidate
- [ ] Duplicate `use-mobile.ts` (hooks/ + root) — remove root copy
- [ ] 57 unused shadcn/ui components — cleanup after build
- [ ] No README.md — create one

## Blockers
- [] **yt-dlp must be installed** — Check on startup, show error if missing
- [] **FFmpeg must be installed** — Required for merging video+audio streams

## Known Limitations
- Analytics data is simulated/mock — not real platform data
- Account connections are manual (no OAuth) — display only
- Scheduled posts are status-tracked only — no actual auto-posting
- Single user, no authentication
