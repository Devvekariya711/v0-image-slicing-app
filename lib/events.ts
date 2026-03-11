// Simple event bus for cross-component communication
// Uses globalThis to survive hot-reload in dev

type Listener = () => void

declare global {
    // eslint-disable-next-line no-var
    var __eventBus: Map<string, Set<Listener>> | undefined
}

const bus: Map<string, Set<Listener>> =
    globalThis.__eventBus ?? (globalThis.__eventBus = new Map())

export function emit(event: string) {
    const listeners = bus.get(event)
    if (listeners) {
        listeners.forEach((fn) => fn())
    }
}

export function on(event: string, fn: Listener): () => void {
    if (!bus.has(event)) bus.set(event, new Set())
    bus.get(event)!.add(fn)
    return () => { bus.get(event)?.delete(fn) }
}
