"use client"

import { useEffect } from "react"

const SCHEDULER_INTERVAL = 5 * 60 * 1000 // 5 minutes

/**
 * Invisible component that polls /api/scheduler every 5 minutes.
 * Mount once in the app layout — handles assigning random times
 * and triggering due publishers automatically.
 */
export function SchedulerPoll() {
    useEffect(() => {
        let active = true

        async function poll() {
            if (!active) return
            try {
                const res = await fetch("/api/scheduler")
                if (res.ok) {
                    const data = await res.json()
                    if (data.processed > 0) {
                        console.log(`[Scheduler] Published ${data.processed} post(s)`)
                    }
                }
            } catch {
                // Silent fail — scheduler will retry next cycle
            }
        }

        // First poll after 30s (give app time to load)
        const initialTimer = setTimeout(poll, 30000)

        // Then every 5 minutes
        const interval = setInterval(poll, SCHEDULER_INTERVAL)

        return () => {
            active = false
            clearTimeout(initialTimer)
            clearInterval(interval)
        }
    }, [])

    return null // Invisible — no render output
}
