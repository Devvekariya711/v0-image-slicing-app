import { type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
    icon: LucideIcon
    label: string
    value: string | number
    trend?: { value: number; positive: boolean }
    className?: string
}

export function StatCard({ icon: Icon, label, value, trend, className }: StatCardProps) {
    return (
        <div className={cn("rounded-xl border border-border bg-card p-4 transition-colors hover:bg-card/80", className)}>
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
                    <p className="text-2xl font-bold tabular-nums">{typeof value === "number" ? value.toLocaleString() : value}</p>
                </div>
                {trend && (
                    <span className={cn(
                        "text-xs font-medium px-1.5 py-0.5 rounded",
                        trend.positive ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                    )}>
                        {trend.positive ? "+" : ""}{trend.value}%
                    </span>
                )}
            </div>
        </div>
    )
}
