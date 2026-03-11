"use client"

import { useState, useEffect, useMemo } from "react"
import { Header } from "@/components/app/header"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { PLATFORMS, type PlatformKey } from "@/lib/constants"
import { ChevronLeft, ChevronRight, Plus, Send } from "lucide-react"
import { format, startOfMonth, endOfMonth, startOfWeek, eachDayOfInterval, addMonths, subMonths, isSameMonth, isSameDay, isToday, isBefore, startOfDay } from "date-fns"
import { DayDetailPanel, EVENT_CONFIG, type CalendarEvent } from "@/components/app/day-detail-panel"

interface MediaItem { id: string; title: string; filename?: string }
interface Account { id: string; platform: PlatformKey; username: string; display_name: string }

export default function CalendarPage() {
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [events, setEvents] = useState<CalendarEvent[]>([])
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [panelDate, setPanelDate] = useState<Date | null>(null)
    const [mediaList, setMediaList] = useState<MediaItem[]>([])
    const [accountsList, setAccountsList] = useState<Account[]>([])
    const [form, setForm] = useState({ media_id: "", account_id: "", caption: "", scheduled_at: "" })

    // Publish Now state
    const [publishMedia, setPublishMedia] = useState<MediaItem[]>([])
    const [publishAccounts, setPublishAccounts] = useState<Account[]>([])
    const [publishForm, setPublishForm] = useState({ media_id: "", account_id: "", caption: "", hashtags: "" })
    const [publishing, setPublishing] = useState(false)
    const [toast, setToast] = useState("")

    function loadEvents() {
        const month = format(currentMonth, "yyyy-MM")
        fetch(`/api/events?month=${month}`)
            .then((r) => r.json())
            .then((d) => setEvents(d.events || []))
            .catch(console.error)
    }

    function loadPublishData() {
        fetch("/api/publish").then((r) => r.json()).then((d) => {
            setPublishMedia(d.media || [])
            setPublishAccounts(d.accounts || [])
        }).catch(() => { })
    }

    useEffect(() => { loadEvents() }, [currentMonth])
    useEffect(() => { loadPublishData() }, [])

    const today = startOfDay(new Date())
    function isPastDay(date: Date) { return isBefore(startOfDay(date), today) }

    function openScheduleModal(date: Date) {
        if (isPastDay(date)) return
        setSelectedDate(date)
        setForm({ media_id: "", account_id: "", caption: "", scheduled_at: format(date, "yyyy-MM-dd") + "T12:00" })
        fetch("/api/media?limit=50").then((r) => r.json()).then((d) => setMediaList(d.items || []))
        fetch("/api/accounts").then((r) => r.json()).then((d) => setAccountsList(d.accounts || []))
        setModalOpen(true)
    }

    function openDayPanel(date: Date) {
        setPanelDate(date)
    }

    async function handleSchedule() {
        if (!form.media_id || !form.account_id) return
        await fetch("/api/schedule", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...form, status: "scheduled" }),
        })
        setModalOpen(false)
        loadEvents()
    }

    async function publishNow() {
        if (!publishForm.media_id || !publishForm.account_id) return
        setPublishing(true)
        try {
            const res = await fetch("/api/publish", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(publishForm),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setToast(`✅ ${data.message}${data.url ? ` — ${data.url}` : ""}`)
            setPublishForm({ media_id: "", account_id: "", caption: "", hashtags: "" })
            loadEvents()
        } catch (err) {
            setToast(`❌ ${err instanceof Error ? err.message : "Publish failed"}`)
        } finally { setPublishing(false); setTimeout(() => setToast(""), 6000) }
    }

    async function handlePublishPost(postId: string) {
        try {
            const res = await fetch("/api/publish", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ post_id: postId }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setToast(`✅ ${data.message}`)
            loadEvents()
        } catch (err) {
            setToast(`❌ ${err instanceof Error ? err.message : "Publish failed"}`)
        }
        setTimeout(() => setToast(""), 6000)
    }

    // Calendar grid
    const calendarDays = useMemo(() => {
        const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 })
        const end = endOfMonth(currentMonth)
        const endWeek = new Date(end)
        endWeek.setDate(endWeek.getDate() + (7 - endWeek.getDay()))
        return eachDayOfInterval({ start, end: endWeek })
    }, [currentMonth])

    // Group events by date for quick lookup
    const eventsByDate = useMemo(() => {
        const map: Record<string, CalendarEvent[]> = {}
        for (const ev of events) {
            if (!map[ev.date]) map[ev.date] = []
            map[ev.date].push(ev)
        }
        return map
    }, [events])

    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    const panelEvents = panelDate ? (eventsByDate[format(panelDate, "yyyy-MM-dd")] || []) : []

    return (
        <>
            <Header title="Calendar" subtitle={format(currentMonth, "MMMM yyyy")} actions={
                <Button size="sm" className="gap-1.5" onClick={() => openScheduleModal(new Date())}>
                    <Plus className="h-4 w-4" /> Schedule Post
                </Button>
            } />
            <div className={`flex-1 overflow-y-auto p-6 space-y-4 transition-all ${panelDate ? "mr-[380px]" : ""}`}>

                {/* Toast */}
                {toast && (
                    <div className={`rounded-lg px-4 py-3 text-sm font-medium ${toast.startsWith("✅") ? "bg-green-500/15 text-green-400 border border-green-500/20" : "bg-red-500/15 text-red-400 border border-red-500/20"}`}>
                        {toast}
                    </div>
                )}

                {/* ─── Publish Now ─── */}
                <div className="rounded-xl border border-border bg-card p-4">
                    <h2 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
                        <Send className="h-3.5 w-3.5" /> Publish Now
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
                        <div>
                            <Label className="text-xs text-muted-foreground">Video</Label>
                            <select value={publishForm.media_id} onChange={(e) => setPublishForm((f) => ({ ...f, media_id: e.target.value }))} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                                <option value="">Choose video...</option>
                                {publishMedia.map((m) => <option key={m.id} value={m.id}>{m.title || m.filename}</option>)}
                            </select>
                        </div>
                        <div>
                            <Label className="text-xs text-muted-foreground">Account</Label>
                            <select value={publishForm.account_id} onChange={(e) => setPublishForm((f) => ({ ...f, account_id: e.target.value }))} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                                <option value="">Choose account...</option>
                                {publishAccounts.map((a) => { const p = PLATFORMS[a.platform as PlatformKey]; return <option key={a.id} value={a.id}>{p?.label} — @{a.username}</option> })}
                            </select>
                        </div>
                        <div>
                            <Label className="text-xs text-muted-foreground">Caption</Label>
                            <Input placeholder="Caption..." value={publishForm.caption} onChange={(e) => setPublishForm((f) => ({ ...f, caption: e.target.value }))} className="mt-1" />
                        </div>
                        <div>
                            <Label className="text-xs text-muted-foreground">Hashtags</Label>
                            <Input placeholder="#funny #viral" value={publishForm.hashtags} onChange={(e) => setPublishForm((f) => ({ ...f, hashtags: e.target.value }))} className="mt-1" />
                        </div>
                        <Button onClick={publishNow} disabled={publishing || !publishForm.media_id || !publishForm.account_id} className="w-full">
                            {publishing ? "Publishing..." : "Publish Now"}
                        </Button>
                    </div>
                    {publishAccounts.length === 0 && (
                        <p className="text-xs text-muted-foreground mt-2">No connected accounts — go to Social Accounts to connect first.</p>
                    )}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())}>Today</Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <h2 className="text-lg font-semibold">{format(currentMonth, "MMMM yyyy")}</h2>
                    </div>
                    {/* Legend */}
                    <div className="hidden md:flex items-center gap-3 text-[10px] text-muted-foreground">
                        {Object.entries(EVENT_CONFIG).filter(([k]) => k !== "manual_publish").map(([key, cfg]) => (
                            <span key={key} className="flex items-center gap-1">
                                <span className={`h-2 w-2 rounded-full ${cfg.dot}`} /> {cfg.label}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="grid grid-cols-7 border-b border-border">
                        {dayNames.map((d) => (
                            <div key={d} className="px-2 py-2 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">{d}</div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7">
                        {calendarDays.map((day, i) => {
                            const dateKey = format(day, "yyyy-MM-dd")
                            const dayEvents = eventsByDate[dateKey] || []
                            const inMonth = isSameMonth(day, currentMonth)
                            const todayHighlight = isToday(day)
                            const isPast = isPastDay(day)
                            const isSelected = panelDate && isSameDay(day, panelDate)

                            // Get unique event types for this day (for dots)
                            const uniqueTypes = [...new Set(dayEvents.map((e) => e.type))]

                            // Only show publish/schedule mini-cards in preview
                            const previewEvents = dayEvents.filter((e) => ["scheduled", "published", "failed"].includes(e.type))

                            return (
                                <div
                                    key={i}
                                    className={`min-h-[100px] border-b border-r border-border p-1.5 transition-colors cursor-pointer
                                        ${!inMonth ? "opacity-30" : ""}
                                        ${todayHighlight ? "bg-primary/5" : ""}
                                        ${isSelected ? "bg-primary/10 ring-1 ring-primary/30" : "hover:bg-muted/30"}
                                        ${isPast && !dayEvents.length ? "opacity-40" : ""}
                                    `}
                                    onClick={() => openDayPanel(day)}
                                    onDoubleClick={() => !isPast && openScheduleModal(day)}
                                >
                                    {/* Day number + dots */}
                                    <div className="flex items-center justify-between">
                                        <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${todayHighlight ? "bg-primary text-primary-foreground font-bold" : "text-muted-foreground"}`}>
                                            {format(day, "d")}
                                        </span>
                                        {uniqueTypes.length > 0 && (
                                            <div className="flex items-center gap-0.5">
                                                {uniqueTypes.slice(0, 5).map((type) => (
                                                    <span key={type} className={`h-1.5 w-1.5 rounded-full ${EVENT_CONFIG[type]?.dot || "bg-zinc-500"}`} />
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Mini-cards for publish/schedule only */}
                                    <div className="mt-0.5 space-y-0.5">
                                        {previewEvents.slice(0, 2).map((event, idx) => {
                                            const cfg = EVENT_CONFIG[event.type]
                                            const platform = event.platform ? PLATFORMS[event.platform as PlatformKey] : null
                                            return (
                                                <div key={idx} className="flex items-center gap-1 rounded px-1 py-0.5 text-[9px]" style={{ backgroundColor: cfg.color + "15" }}>
                                                    {platform && <platform.icon className="h-2.5 w-2.5 shrink-0" style={{ color: platform.color }} />}
                                                    <span className="truncate" style={{ color: cfg.color }}>{event.title}</span>
                                                </div>
                                            )
                                        })}
                                        {dayEvents.length > 2 && (
                                            <span className="text-[9px] text-muted-foreground px-1">+{dayEvents.length - 2} more</span>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Day Detail Side Panel */}
            {panelDate && (
                <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 z-40" onClick={() => setPanelDate(null)} />
                    <DayDetailPanel
                        date={panelDate}
                        events={panelEvents}
                        onClose={() => setPanelDate(null)}
                        onPublish={handlePublishPost}
                    />
                </>
            )}

            {/* Schedule Modal */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Schedule Post {selectedDate && `— ${format(selectedDate, "MMM d, yyyy")}`}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                        <div>
                            <Label>Select Media</Label>
                            <Select value={form.media_id} onValueChange={(v) => setForm((f) => ({ ...f, media_id: v }))}>
                                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Choose a video..." /></SelectTrigger>
                                <SelectContent>
                                    {mediaList.map((m) => <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Select Account</Label>
                            <Select value={form.account_id} onValueChange={(v) => setForm((f) => ({ ...f, account_id: v }))}>
                                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Choose an account..." /></SelectTrigger>
                                <SelectContent>
                                    {accountsList.map((a) => {
                                        const p = PLATFORMS[a.platform]
                                        return <SelectItem key={a.id} value={a.id}>{p.label}: @{a.username}</SelectItem>
                                    })}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Caption</Label>
                            <Textarea placeholder="Write your caption..." value={form.caption} onChange={(e) => setForm((f) => ({ ...f, caption: e.target.value }))} className="mt-1.5" rows={3} />
                        </div>
                        <div>
                            <Label>Schedule Date & Time</Label>
                            <Input type="datetime-local" value={form.scheduled_at} min={format(new Date(), "yyyy-MM-dd'T'HH:mm")} onChange={(e) => setForm((f) => ({ ...f, scheduled_at: e.target.value }))} className="mt-1.5" />
                        </div>
                        <Button onClick={handleSchedule} className="w-full" disabled={!form.media_id || !form.account_id}>Schedule Post</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
