
## Decision 1: SQLite over PostgreSQL/Supabase
- **Date:** 2026-03-02
- **Choice:** SQLite via `better-sqlite3`
- **Reasoning:** Personal/educational project — zero config, no external services, single file, perfect for single-user local app. Can migrate to Postgres later if needed.
- **Trade-off:** No concurrent writes, no remote access. Acceptable for personal use.

## Decision 2: yt-dlp Subprocess over API-based Downloaders
- **Date:** 2026-03-02
- **Choice:** Spawn `yt-dlp` as child process from Node.js
- **Reasoning:** 1000+ supported sites, highest quality downloads, actively maintained, no API keys needed. FFmpeg handles stream merging.
- **Trade-off:** Requires yt-dlp + FFmpeg installed on system. Subprocess management adds complexity.

## Decision 3: Custom Calendar over FullCalendar/React Big Calendar
- **Date:** 2026-03-02
- **Choice:** Custom React calendar component
- **Reasoning:** Lighter bundle, exact OpusClip visual match, no heavy library dependencies. Calendar is simple enough (month grid + events) to not need a full library.
- **Trade-off:** More code to write, but full control over design.

## Decision 4: Mock Analytics over Real API Integration
- **Date:** 2026-03-02
- **Choice:** Seeded mock data with manual entry capability
- **Reasoning:** Real APIs (YouTube Data API, TikTok API, Instagram Graph API) require developer accounts, OAuth apps, and API keys. Educational purpose doesn't justify the setup complexity.
- **Trade-off:** Analytics won't reflect real data. Can add real APIs later.

## Decision 5: Video-Only Uploads (No Images)
- **Date:** 2026-03-02
- **Choice:** Only accept video file uploads (mp4, webm, mkv, avi, mov)
- **Reasoning:** Platform is focused on short-form video (Shorts, Reels, TikToks). Images can't be posted as video content on these platforms.

## Decision 6: Manual Account Entry over OAuth
- **Date:** 2026-03-02
- **Choice:** Users manually enter username, platform, profile URL
- **Reasoning:** OAuth requires registered developer apps on each platform (Google, Meta, TikTok, X). Educational project doesn't need real API access. OAuth integration slots will be visually present but disabled.

## Decision 7: Keep Existing Repo + Transform
- **Date:** 2026-03-02
- **Choice:** Transform `v0-image-slicing-app` repo rather than create new project
- **Reasoning:** Repo already has Next.js 16, React 19, Tailwind v4, shadcn/ui, Recharts — all needed tech. Reuse the design system and component library. Just replace plan viewer pages with the real app.
