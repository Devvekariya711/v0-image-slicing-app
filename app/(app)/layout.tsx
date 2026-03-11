import { Sidebar } from "@/components/app/sidebar"
import { SchedulerPoll } from "@/components/app/scheduler-poll"

export default function AppLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-16 flex flex-col">
                {children}
            </main>
            <SchedulerPoll />
        </div>
    )
}
