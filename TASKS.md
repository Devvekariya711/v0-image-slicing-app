# SocialHub — Atomic Task List

> Every task is single-responsibility, independently testable, ≤1 hour.
> Execution order matters — each phase depends on the previous.

---

## Phase 1: Foundation
> **Goal:** App shell with sidebar, routing, database ready

### 1.1 Update .gitignore
- **Objective:** Add `media/`, `data/`, `*.db` to gitignore
- **Expected Output:** Git ignores local media and database files
- **Validation:** `git status` doesn't show media/data dirs

### 1.2 Install dependencies
- **Objective:** Add `better-sqlite3`, `uuid`, `@types/*`
- **Expected Output:** `pnpm install` succeeds, packages in node_modules
- **Validation:** `pnpm ls better-sqlite3` shows installed version

### 1.3 Create lib/constants.ts
- **Objective:** Define platform configs (YouTube/TikTok/Instagram/X), colors, sidebar nav items, accepted file types, quality options
- **Expected Output:** Typed constants exported
- **Validation:** Import in any file without TypeScript errors

### 1.4 Create lib/db.ts
- **Objective:** Initialize SQLite database, create all 4 tables (media, accounts, scheduled_posts, analytics_data) with indexes, export helper functions (getDb, runQuery, getAll, getOne, insert, deleteById)
- **Expected Output:** `data/socialhub.db` auto-created on first import
- **Validation:** Check file exists, tables created via `sqlite3 data/socialhub.db ".tables"`

### 1.5 Create lib/seed.ts
- **Objective:** Seed function that populates mock data: 4 accounts (one per platform), 30 days of analytics data per account, 3 sample scheduled posts
- **Expected Output:** `seedDatabase()` function callable from API or script
- **Validation:** Tables have rows after seed runs

### 1.6 Create components/app/sidebar.tsx
- **Objective:** Slim icon sidebar (w-16) with 7 nav items (Dashboard, Accounts, Library, Calendar, Analytics, Downloads, Settings). Uses Lucide icons. Highlights active route. Tooltip on hover.
- **Expected Output:** Sidebar renders with correct icons and active states
- **Validation:** Click each icon → URL changes to correct route

### 1.7 Create components/app/header.tsx
- **Objective:** Top bar component accepting `title` prop. Shows page title on left, search icon + notification bell on right.
- **Expected Output:** Header renders with dynamic title
- **Validation:** Each page shows correct title

### 1.8 Create app/(app)/layout.tsx
- **Objective:** App shell layout — sidebar on left, header on top, `{children}` in main content area. Handles responsive: sidebar → bottom tab bar on mobile.
- **Expected Output:** All child pages render inside the shell
- **Validation:** Navigate between pages, shell stays persistent

### 1.9 Modify app/layout.tsx
- **Objective:** Strip old plan viewer content. Keep fonts, metadata, analytics. Root layout wraps everything.
- **Expected Output:** Clean root layout, no old page references
- **Validation:** No 404 errors, app loads

---

## Phase 2: Dashboard
> **Goal:** Functional dashboard with dual input and stats

### 2.1 Create app/api/stats/route.ts
- **Objective:** GET endpoint returning `{ total_media, connected_accounts, scheduled_posts, total_views }` from SQLite
- **Expected Output:** JSON response with correct counts
- **Validation:** `curl http://localhost:3000/api/stats` returns JSON

### 2.2 Create components/app/stat-card.tsx
- **Objective:** Reusable card: icon + label + value + optional trend indicator. Accepts `icon`, `label`, `value`, `trend` props.
- **Expected Output:** Renders styled dark card with green accent
- **Validation:** Renders in Storybook-style isolation

### 2.3 Create components/dashboard/link-input.tsx
- **Objective:** URL input field with "Download" button. Validates URL format. Shows platform icon after detection. On submit → POST to /api/download. Shows progress bar during download.
- **Expected Output:** Functional paste-and-download UI
- **Validation:** Paste YouTube URL → button activates → platform icon shown

### 2.4 Create components/dashboard/upload-zone.tsx
- **Objective:** Drag-and-drop zone with dashed border. Click to open file picker. Accepts only video files (mp4/webm/mkv/avi/mov). Shows file name + size after selection. Upload progress bar. POST to /api/upload.
- **Expected Output:** Functional drag-drop upload UI
- **Validation:** Drop .mp4 → uploads → progress shown. Drop .jpg → rejected with error.

### 2.5 Create app/(app)/page.tsx
- **Objective:** Dashboard page assembly: Tabs (Paste Link / Upload Video) → 4 StatCards → Recent Media grid → Upcoming Posts list
- **Expected Output:** Full dashboard page
- **Validation:** All sections render, stats show correct numbers

---

## Phase 3: Downloader + Uploader Backend
> **Goal:** yt-dlp downloads and file uploads work end-to-end

### 3.1 Create lib/downloader.ts
- **Objective:** `startDownload(url, quality)` function. Spawns yt-dlp child process. Parses stdout for progress (%, speed, ETA). Returns download ID. Stores progress in in-memory Map. Writes metadata to SQLite on completion.
- **Expected Output:** Download triggers, progress updates, file saved to `./media/downloads/`
- **Validation:** Call function with YouTube URL → file appears on disk

### 3.2 Create app/api/download/route.ts
- **Objective:** POST endpoint: `{ url, quality? }`. Validates URL. Calls `startDownload()`. Returns `{ id, status: "downloading" }`.
- **Expected Output:** 200 with download ID
- **Validation:** `curl -X POST -d '{"url":"..."}' /api/download`

### 3.3 Create app/api/download/status/route.ts
- **Objective:** GET `?id=uuid`. Returns `{ id, status, progress, title, speed, eta }` from in-memory Map.
- **Expected Output:** Real-time progress data
- **Validation:** Poll endpoint during download → progress increases

### 3.4 Create app/api/upload/route.ts
- **Objective:** POST multipart/form-data. Validates file extension (video only). Saves to `./media/uploads/`. Extracts metadata (size, name). Generates UUID. Inserts into `media` table with `source='upload'`.
- **Expected Output:** File saved + DB record created
- **Validation:** Upload .mp4 via form → file exists in media/uploads/ → row in DB

### 3.5 Create components/dashboard/recent-media.tsx
- **Objective:** Grid of 6 most recent media items. Each shows thumbnail (or video icon placeholder), title, platform badge, duration. Fetches from GET /api/media?limit=6.
- **Expected Output:** Grid of recent downloads/uploads
- **Validation:** After download/upload → item appears in grid

### 3.6 Create components/dashboard/upcoming-posts.tsx
- **Objective:** List of 3 next scheduled posts. Each shows thumbnail, caption preview, date/time, platform icon. Fetches from GET /api/schedule?limit=3&upcoming=true.
- **Expected Output:** List of upcoming posts (or "No posts scheduled" empty state)
- **Validation:** After scheduling → post appears in list

---

## Phase 4: Social Accounts
> **Goal:** Full account management CRUD

### 4.1 Create app/api/accounts/route.ts
- **Objective:** GET: list all accounts (optional ?platform filter). POST: create account `{ platform, username, display_name, profile_url }`. DELETE ?id=uuid: remove account. Handle 409 duplicate.
- **Expected Output:** Full CRUD API
- **Validation:** POST → GET shows new account → DELETE → GET no longer shows

### 4.2 Create components/accounts/account-list.tsx
- **Objective:** Renders list of connected accounts. Each row: platform icon (colored) + avatar circle (initials) + username + display name + "Remove" button. Platform filter dropdown at top.
- **Expected Output:** Account rows matching OpusClip's modal UI
- **Validation:** Accounts from API render correctly

### 4.3 Create components/accounts/add-account-modal.tsx
- **Objective:** Dialog with: platform radio group (4 options with icons) + username input + display name input + profile URL input + Save button. Validation: all required fields. On save → POST /api/accounts → close modal → refresh list.
- **Expected Output:** Functional add account dialog
- **Validation:** Fill form → save → account appears in list

### 4.4 Create app/(app)/accounts/page.tsx
- **Objective:** Accounts page: header "Social Accounts" + "+ Add Account" button → AccountList → AddAccountModal
- **Expected Output:** Full accounts page
- **Validation:** Add/remove accounts works end-to-end

---

## Phase 5: Media Library
> **Goal:** Browse all media with filters

### 5.1 Create app/api/media/route.ts
- **Objective:** GET: list media with filters `?source=all|download|upload&platform=...&page=1&limit=20&sort=newest`. DELETE ?id=uuid: remove media record + delete file from disk.
- **Expected Output:** Paginated media list + delete
- **Validation:** GET returns items, DELETE removes file

### 5.2 Create components/library/media-card.tsx
- **Objective:** Card showing: video thumbnail (or placeholder icon), title (truncated), source badge (↓ download / ↑ upload + platform icon), duration, file size, date. Click → context menu (open/delete/schedule).
- **Expected Output:** Styled media card
- **Validation:** Renders correctly for both download and upload items

### 5.3 Create components/library/media-grid.tsx
- **Objective:** Responsive grid of MediaCards. Toggle between grid (3-4 cols) and list (single col) view. Loading skeletons. Empty state "No media yet".
- **Expected Output:** Grid/list toggle with responsive layout
- **Validation:** Toggle works, responsive on resize

### 5.4 Create app/(app)/library/page.tsx
- **Objective:** Library page: header with view toggle + source tabs (All/Downloads/Uploads) + filter bar (platform dropdown + sort) + MediaGrid
- **Expected Output:** Full library page with working filters
- **Validation:** Filters change displayed items correctly

---

## Phase 6: Calendar / Scheduler
> **Goal:** Monthly calendar with drag-and-schedule

### 6.1 Create app/api/schedule/route.ts
- **Objective:** GET ?month=2026-03&status=all: list posts for month (JOIN media + accounts). POST: create post `{ media_id, account_id, caption, hashtags, scheduled_at, status }`. PUT: update post. DELETE ?id=uuid.
- **Expected Output:** Full schedule CRUD
- **Validation:** Create post → GET includes it → Update status → Delete

### 6.2 Create components/calendar/calendar-header.tsx
- **Objective:** Header bar: "Today" button + ← → month navigation + "March 2026" label + Month/Week toggle buttons. Emits `onMonthChange`, `onViewChange` callbacks.
- **Expected Output:** Functional month navigation
- **Validation:** Click → → month advances, label updates

### 6.3 Create components/calendar/day-cell.tsx
- **Objective:** Single calendar day cell. Shows day number (top-left). Shows up to 3 post thumbnails with platform color dots. "+N more" if >3 posts. Greyed out if outside current month. Highlighted if today. onClick → open schedule modal for that date.
- **Expected Output:** Day cell with post indicators
- **Validation:** Cells show correct day numbers, posts appear on right days

### 6.4 Create components/calendar/calendar-grid.tsx
- **Objective:** 7-column × 5/6-row grid for month view. Day-of-week headers (Mon-Sun). Generates correct days for any month. Fills in prev/next month overflow days. Receives posts data, distributes to correct DayCells.
- **Expected Output:** Full calendar grid for any month
- **Validation:** Navigate months → grid updates correctly

### 6.5 Create components/calendar/schedule-modal.tsx
- **Objective:** Dialog for creating/editing a scheduled post. Fields: media selector (dropdown/grid from library), account selector (dropdown of connected accounts), caption textarea, hashtags input, date picker, time picker, status select (Draft/Scheduled). Save → POST or PUT /api/schedule.
- **Expected Output:** Functional scheduling dialog
- **Validation:** Create post → appears on calendar day

### 6.6 Create app/(app)/calendar/page.tsx
- **Objective:** Calendar page: CalendarHeader + CalendarGrid + FloatingActionButton (+ Schedule Post) + ScheduleModal. Fetches posts for current month from API.
- **Expected Output:** Full calendar page
- **Validation:** View month, create post, see it on calendar, navigate months

---

## Phase 7: Analytics
> **Goal:** Charts and metrics with mock data

### 7.1 Create app/api/analytics/route.ts
- **Objective:** GET ?range=7d|30d|90d&platform=all|youtube|tiktok|instagram|x. Returns `{ summary: {views,likes,comments,shares}, daily: [{date,views,likes,...}], by_platform: {youtube:{views,...},...} }`. Aggregates from analytics_data table.
- **Expected Output:** Analytics JSON with correct aggregation
- **Validation:** Different ranges return different data counts

### 7.2 Create components/analytics/views-chart.tsx
- **Objective:** Recharts AreaChart showing views over time. X-axis: dates. Y-axis: view count. Green gradient fill. Tooltip on hover. Responsive width.
- **Expected Output:** Smooth area chart
- **Validation:** Chart renders with data, tooltip shows values

### 7.3 Create components/analytics/platform-chart.tsx
- **Objective:** Recharts BarChart comparing metrics across platforms. Grouped bars per platform. Platform-colored bars. Legend at bottom.
- **Expected Output:** Platform comparison bar chart
- **Validation:** 4 platform bars with correct colors

### 7.4 Create components/analytics/engagement-chart.tsx
- **Objective:** Recharts LineChart showing engagement (likes + comments + shares) over time. Multiple lines for each metric. Smooth curves.
- **Expected Output:** Multi-line engagement chart
- **Validation:** 3 lines visible with legend

### 7.5 Create components/analytics/top-content-table.tsx
- **Objective:** Table with columns: #, Title, Platform (icon), Views, Likes, Comments, Date. Sorted by views DESC. Top 10 items. Data from scheduled_posts JOIN media.
- **Expected Output:** Ranked content table
- **Validation:** Table renders with mock data, sorted correctly

### 7.6 Create app/(app)/analytics/page.tsx
- **Objective:** Analytics page: header with date range selector + platform filter → 4 MetricCards (Views/Likes/Comments/Shares) → ViewsChart + PlatformChart row → EngagementChart → TopContentTable
- **Expected Output:** Full analytics page matching OpusClip style
- **Validation:** All charts render, filters change data

---

## Phase 8: Polish
> **Goal:** Remaining pages, cleanup, responsive

### 8.1 Create downloads page
- **Objective:** `/downloads` page with active downloads (progress bars) + history table (title, source, quality, size, date, status). Filters: platform, status, date.
- **Expected Output:** Download management page
- **Validation:** In-progress and completed downloads visible

### 8.2 Create settings page
- **Objective:** `/settings` page with download settings (save directory, default quality), appearance (theme toggle), about (version info).
- **Expected Output:** Settings page with persistence
- **Validation:** Change setting → persists across page reload

### 8.3 Delete old plan components
- **Objective:** Remove all 9 files in `components/plan/`. Remove old `app/page.tsx`. Remove unused shadcn/ui components (~30 files).
- **Expected Output:** Clean component directory
- **Validation:** `pnpm run build` succeeds with no dead imports

### 8.4 Responsive & empty states
- **Objective:** Test all pages at mobile (375px), tablet (768px), desktop (1280px). Add empty state UIs ("No media yet", "No accounts connected", etc.). Add loading skeleton states.
- **Expected Output:** Responsive layout, no broken UI at any size
- **Validation:** Browser resize → sidebar becomes bottom nav, grids reflow

### 8.5 Fix pre-existing issues
- **Objective:** Remove `ignoreBuildErrors: true` from next.config.mjs. Fix any TypeScript errors. Enable image optimization. Add README.md.
- **Expected Output:** Clean build with `pnpm run build`
- **Validation:** Build completes with zero errors
