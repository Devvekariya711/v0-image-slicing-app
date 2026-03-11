# SocialHub — Project Overview

## Goal
Build a **personal all-in-one social media management platform** (educational use) inspired by OpusClip's UI. A centralized hub to download content, connect social accounts, schedule posts, and view cross-platform analytics — all from one dark-mode dashboard.

## Tech Stack
| Layer | Choice |
|-------|--------|
| **Framework** | Next.js 16 (App Router), React 19 |
| **Language** | TypeScript (strict mode) |
| **Styling** | Tailwind CSS v4 + shadcn/ui (new-york) |
| **Icons** | Lucide React |
| **Database** | SQLite via better-sqlite3 (local file) |
| **Charts** | Recharts |
| **Downloader** | yt-dlp (subprocess) + FFmpeg |
| **File Storage** | Local filesystem (`./media/`) |
| **Fonts** | Geist + Geist Mono |

## Core Features
1. **Dashboard** — Paste link (yt-dlp download) OR upload video file, quick stats, recent activity
2. **Social Accounts** — Connect/manage YouTube, TikTok, Instagram, X accounts (manual entry)
3. **Media Library** — Browse downloaded + uploaded videos with filters and actions
4. **Calendar Scheduler** — Monthly/weekly grid to plan and schedule posts per platform
5. **Analytics Dashboard** — Cross-platform views, likes, comments, shares with charts
6. **Download History** — Active downloads with progress bars + completed history
7. **Settings** — Download preferences, theme toggle, about

## Constraints
- **NO payments/subscriptions** — Zero monetization logic
- **NO video editing/clipping** — No AI processing of video content
- **NO image uploads** — Video files only (mp4, webm, mkv, avi, mov)
- **NO real OAuth** — Manual account entry (OAuth slots for future)
- **Mock analytics data** — Seeded/simulated metrics (real APIs optional later)
- **Personal use only** — Single user, local SQLite, no auth needed
- **Must have yt-dlp + FFmpeg installed** on the system

## Definition of Done
- [ ] All 7 pages render without errors
- [ ] Link paste → yt-dlp download → file saved + metadata in DB
- [ ] Video upload → file saved + metadata in DB
- [ ] Social accounts CRUD works (add/list/remove)
- [ ] Calendar displays scheduled posts with correct platform colors
- [ ] Analytics charts render with mock data, filters work
- [ ] Responsive layout (sidebar → bottom nav on mobile)
- [ ] No TypeScript errors, no console errors
- [ ] Dark mode throughout, matches OpusClip aesthetic
