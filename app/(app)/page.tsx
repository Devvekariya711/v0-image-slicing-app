"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/app/header"
import { StatCard } from "@/components/app/stat-card"
import { LinkInput } from "@/components/dashboard/link-input"
import { UploadZone } from "@/components/dashboard/upload-zone"
import { RecentMedia } from "@/components/dashboard/recent-media"
import { UpcomingPosts } from "@/components/dashboard/upcoming-posts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { on } from "@/lib/events"
import { FolderOpen, Users, CalendarDays, Eye, Link2, Upload } from "lucide-react"

interface DashboardStats {
    total_media: number
    connected_accounts: number
    scheduled_posts: number
    total_views: number
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats>({
        total_media: 0, connected_accounts: 0, scheduled_posts: 0, total_views: 0,
    })
    const [refreshKey, setRefreshKey] = useState(0)

    function loadStats() {
        fetch("/api/stats")
            .then((r) => r.json())
            .then(setStats)
            .catch(console.error)
    }

    useEffect(() => {
        loadStats()
        // Listen for media additions (download/upload complete)
        const unsub = on("media:added", () => {
            loadStats()
            setRefreshKey((k) => k + 1)
        })
        return unsub
    }, [])

    return (
        <>
            <Header title="Dashboard" subtitle="Welcome back — manage your content" />
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Input Zone */}
                <div className="rounded-xl border border-border bg-card p-6">
                    <Tabs defaultValue="link" className="w-full">
                        <TabsList className="mb-4">
                            <TabsTrigger value="link" className="gap-2">
                                <Link2 className="h-4 w-4" />
                                Paste Link
                            </TabsTrigger>
                            <TabsTrigger value="upload" className="gap-2">
                                <Upload className="h-4 w-4" />
                                Upload Video
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="link">
                            <LinkInput />
                        </TabsContent>
                        <TabsContent value="upload">
                            <UploadZone />
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <StatCard icon={FolderOpen} label="Total Media" value={stats.total_media} />
                    <StatCard icon={Users} label="Accounts" value={stats.connected_accounts} />
                    <StatCard icon={CalendarDays} label="Scheduled" value={stats.scheduled_posts} />
                    <StatCard icon={Eye} label="Total Views" value={stats.total_views} />
                </div>

                {/* Recent & Upcoming */}
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <RecentMedia key={refreshKey} />
                    </div>
                    <div>
                        <UpcomingPosts />
                    </div>
                </div>
            </div>
        </>
    )
}
