"use client"

import { useTheme } from "next-themes"
import { Header } from "@/components/app/header"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Monitor, Palette, Info } from "lucide-react"

export default function SettingsPage() {
    const { theme, setTheme } = useTheme()

    return (
        <>
            <Header title="Settings" subtitle="App preferences" />
            <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-2xl">
                {/* Download Settings */}
                <div className="rounded-xl border border-border bg-card p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Monitor className="h-5 w-5 text-primary" />
                        <h2 className="text-sm font-semibold">Download Settings</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <Label>Save Directory</Label>
                            <Input defaultValue="./media/downloads" className="mt-1.5" readOnly />
                            <p className="text-[10px] text-muted-foreground mt-1">Videos will be saved to this directory</p>
                        </div>
                        <div>
                            <Label>Default Quality</Label>
                            <Select defaultValue="best">
                                <SelectTrigger className="mt-1.5 w-48"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="best">Best Available (Highest)</SelectItem>
                                    <SelectItem value="1080">1080p</SelectItem>
                                    <SelectItem value="720">720p</SelectItem>
                                    <SelectItem value="480">480p</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-[10px] text-muted-foreground mt-1">
                                &quot;Best Available&quot; = highest resolution + audio merged into MP4
                            </p>
                        </div>
                    </div>
                </div>

                {/* Appearance */}
                <div className="rounded-xl border border-border bg-card p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Palette className="h-5 w-5 text-primary" />
                        <h2 className="text-sm font-semibold">Appearance</h2>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">Dark Mode</p>
                            <p className="text-xs text-muted-foreground">
                                {theme === "dark" ? "Dark theme active" : "Light theme active"}
                            </p>
                        </div>
                        <Switch
                            checked={theme === "dark"}
                            onCheckedChange={(checked: boolean) => setTheme(checked ? "dark" : "light")}
                        />
                    </div>
                </div>

                {/* About */}
                <div className="rounded-xl border border-border bg-card p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Info className="h-5 w-5 text-primary" />
                        <h2 className="text-sm font-semibold">About</h2>
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex justify-between"><span>Version</span><span className="text-foreground">1.0.0</span></div>
                        <Separator />
                        <div className="flex justify-between"><span>Framework</span><span className="text-foreground">Next.js 16</span></div>
                        <Separator />
                        <div className="flex justify-between"><span>Database</span><span className="text-foreground">SQLite</span></div>
                        <Separator />
                        <div className="flex justify-between"><span>Downloader</span><span className="text-foreground">yt-dlp</span></div>
                    </div>
                </div>
            </div>
        </>
    )
}
