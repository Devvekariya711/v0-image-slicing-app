"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/app/header"
import { StatCard } from "@/components/app/stat-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PLATFORMS, type PlatformKey } from "@/lib/constants"
import { Eye, Heart, MessageCircle, Share2 } from "lucide-react"
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { format } from "date-fns"

interface AnalyticsData {
    summary: { views: number; likes: number; comments: number; shares: number }
    daily: Array<{ date: string; views: number; likes: number; comments: number; shares: number }>
    by_platform: Record<string, { views: number; likes: number; comments: number; shares: number }>
}

export default function AnalyticsPage() {
    const [range, setRange] = useState("7d")
    const [platform, setPlatform] = useState("all")
    const [data, setData] = useState<AnalyticsData>({
        summary: { views: 0, likes: 0, comments: 0, shares: 0 },
        daily: [],
        by_platform: {},
    })

    useEffect(() => {
        fetch(`/api/analytics?range=${range}&platform=${platform}`)
            .then((r) => r.json())
            .then(setData)
            .catch(console.error)
    }, [range, platform])

    const chartData = data.daily.map((d) => ({
        ...d,
        date: format(new Date(d.date), "MMM d"),
    }))

    const platformData = Object.entries(data.by_platform).map(([key, val]) => ({
        platform: PLATFORMS[key as PlatformKey]?.label || key,
        color: PLATFORMS[key as PlatformKey]?.color || "#888",
        ...val,
    }))

    return (
        <>
            <Header title="Analytics" subtitle="Cross-platform performance" actions={
                <div className="flex items-center gap-2">
                    <Select value={range} onValueChange={setRange}>
                        <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7d">Last 7 days</SelectItem>
                            <SelectItem value="30d">Last 30 days</SelectItem>
                            <SelectItem value="90d">Last 90 days</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={platform} onValueChange={setPlatform}>
                        <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All platforms</SelectItem>
                            {Object.entries(PLATFORMS).map(([key, p]) => (
                                <SelectItem key={key} value={key}>{p.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            } />
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Metric Cards */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <StatCard icon={Eye} label="Account Views" value={data.summary.views} />
                    <StatCard icon={Heart} label="Account Likes" value={data.summary.likes} />
                    <StatCard icon={MessageCircle} label="Comments" value={data.summary.comments} />
                    <StatCard icon={Share2} label="Shares" value={data.summary.shares} />
                </div>

                {/* Charts Row */}
                <div className="grid gap-6 lg:grid-cols-5">
                    {/* Views Over Time */}
                    <div className="lg:col-span-3 rounded-xl border border-border bg-card p-4">
                        <h3 className="text-sm font-semibold mb-4">Account Views</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="oklch(0.7 0.18 155)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="oklch(0.7 0.18 155)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.01 260)" />
                                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "oklch(0.55 0.01 260)" }} />
                                <YAxis tick={{ fontSize: 11, fill: "oklch(0.55 0.01 260)" }} />
                                <Tooltip contentStyle={{ backgroundColor: "oklch(0.14 0.007 260)", borderColor: "oklch(0.22 0.01 260)", borderRadius: 8, fontSize: 12 }} />
                                <Area type="monotone" dataKey="views" stroke="oklch(0.7 0.18 155)" fill="url(#viewsGradient)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Platform Comparison */}
                    <div className="lg:col-span-2 rounded-xl border border-border bg-card p-4">
                        <h3 className="text-sm font-semibold mb-4">Platform Comparison</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={platformData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.01 260)" />
                                <XAxis dataKey="platform" tick={{ fontSize: 10, fill: "oklch(0.55 0.01 260)" }} />
                                <YAxis tick={{ fontSize: 11, fill: "oklch(0.55 0.01 260)" }} />
                                <Tooltip contentStyle={{ backgroundColor: "oklch(0.14 0.007 260)", borderColor: "oklch(0.22 0.01 260)", borderRadius: 8, fontSize: 12 }} />
                                <Bar dataKey="views" fill="oklch(0.7 0.18 155)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Engagement Chart */}
                <div className="rounded-xl border border-border bg-card p-4">
                    <h3 className="text-sm font-semibold mb-4">Engagement Over Time</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.01 260)" />
                            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "oklch(0.55 0.01 260)" }} />
                            <YAxis tick={{ fontSize: 11, fill: "oklch(0.55 0.01 260)" }} />
                            <Tooltip contentStyle={{ backgroundColor: "oklch(0.14 0.007 260)", borderColor: "oklch(0.22 0.01 260)", borderRadius: 8, fontSize: 12 }} />
                            <Legend />
                            <Line type="monotone" dataKey="likes" stroke="#FF6B6B" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="comments" stroke="#4ECDC4" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="shares" stroke="#45B7D1" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </>
    )
}
