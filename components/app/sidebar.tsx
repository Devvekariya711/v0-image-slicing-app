"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { NAV_ITEMS } from "@/lib/constants"
import { cn } from "@/lib/utils"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

export function Sidebar() {
    const pathname = usePathname()

    function isActive(href: string, matchExact?: boolean) {
        if (matchExact) return pathname === href
        return pathname.startsWith(href)
    }

    return (
        <TooltipProvider delayDuration={0}>
            <aside className="fixed left-0 top-0 z-40 flex h-screen w-16 flex-col border-r border-border bg-sidebar">
                {/* Logo */}
                <div className="flex h-14 items-center justify-center border-b border-sidebar-border">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
                        S
                    </div>
                </div>

                {/* Nav Items */}
                <nav className="flex flex-1 flex-col items-center gap-1 px-2 py-3">
                    {NAV_ITEMS.map((item) => {
                        const active = isActive(item.href, item.matchExact)
                        return (
                            <Tooltip key={item.href}>
                                <TooltipTrigger asChild>
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                                            active
                                                ? "bg-sidebar-accent text-sidebar-primary"
                                                : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                                        )}
                                    >
                                        <item.icon className="h-5 w-5" />
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent side="right" className="font-medium">
                                    {item.label}
                                </TooltipContent>
                            </Tooltip>
                        )
                    })}
                </nav>

                {/* User Avatar */}
                <div className="flex items-center justify-center border-t border-sidebar-border py-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-semibold">
                        D
                    </div>
                </div>
            </aside>
        </TooltipProvider>
    )
}
