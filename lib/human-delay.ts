// ─── Gaussian Random Delay (Anti-Bot Human Timing) ───────────────────────────
// Based on Box-Muller transform for true Gaussian distribution
// Used to make automated actions indistinguishable from human timing

/**
 * Box-Muller transform — generates a normally distributed random number.
 * @param mean  Centre of the distribution in milliseconds
 * @param std   Standard deviation in milliseconds
 */
function gaussianRandom(mean: number, std: number): number {
    let u = 0
    let v = 0
    // Avoid exact 0 (log(0) = -∞)
    while (u === 0) u = Math.random()
    while (v === 0) v = Math.random()
    const normal = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
    return Math.max(0, mean + std * normal)
}

/**
 * Wait for a Gaussian-distributed duration.
 * Default: mean 2s, std 800ms → most delays 1.2s–2.8s, occasional spikes.
 */
export function gaussianDelay(meanMs = 2000, stdMs = 800): Promise<void> {
    const delay = gaussianRandom(meanMs, stdMs)
    return new Promise((resolve) => setTimeout(resolve, delay))
}

/**
 * Wait for a uniformly random duration between min and max ms.
 * Use for simple "human pause" situations.
 */
export function humanDelay(minMs = 500, maxMs = 5000): Promise<void> {
    const delay = minMs + Math.random() * (maxMs - minMs)
    return new Promise((resolve) => setTimeout(resolve, delay))
}

/**
 * Wait between actions (typing, clicking, scrolling).
 * Short delays — feels like natural hesitation.
 */
export function actionDelay(): Promise<void> {
    return gaussianDelay(1200, 400) // ~0.8s–1.6s
}

/**
 * Wait between major steps (navigation, form submission, page load).
 * Medium delays — feels like reading/thinking.
 */
export function stepDelay(): Promise<void> {
    return gaussianDelay(3000, 1000) // ~2s–4s
}

/**
 * Pick a random Date/Time within today's posting window.
 * Default window: 8am–11pm (avoids bot-flagged night hours).
 *
 * @param startHour  Earliest hour (24h, inclusive). Default: 8 (8am)
 * @param endHour    Latest hour (24h, exclusive). Default: 23 (11pm)
 */
export function randomTimeInWindow(startHour = 8, endHour = 23): Date {
    const now = new Date()
    const start = new Date(now)
    start.setHours(startHour, 0, 0, 0)
    const end = new Date(now)
    end.setHours(endHour, 0, 0, 0)

    // If the window has passed today (e.g. it's 11:30pm), pick tomorrow
    if (now >= end) {
        start.setDate(start.getDate() + 1)
        end.setDate(end.getDate() + 1)
    }

    // If we're already inside the window, pick from NOW to end
    const windowStart = now > start ? now : start
    const rangeMs = end.getTime() - windowStart.getTime()
    return new Date(windowStart.getTime() + Math.random() * rangeMs)
}

/**
 * Simulate a human typing speed for a text input.
 * Types each character with a small random delay.
 *
 * @param typeFn  Callback that types a single character (e.g. page.keyboard.type)
 * @param text    The full text to type out
 */
export async function humanType(
    typeFn: (char: string) => Promise<void>,
    text: string
): Promise<void> {
    for (const char of text) {
        await typeFn(char)
        // Typing speed: 80–200ms per character (human average ~150ms)
        await humanDelay(60, 220)
    }
}
