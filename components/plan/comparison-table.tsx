"use client"

interface TableRow {
  category: string
  easyslice: string
  manual: string
}

const rows: TableRow[] = [
  {
    category: "New Upload Detection",
    easyslice: "Instant via webhook",
    manual: "Check manually each time",
  },
  {
    category: "Clip Identification",
    easyslice: "AI scans full transcript",
    manual: "Watch entire video yourself",
  },
  {
    category: "Clip Rendering",
    easyslice: "Auto FFmpeg pipeline",
    manual: "Screen record or edit in Premiere",
  },
  {
    category: "Captioning",
    easyslice: "Auto-generated, styled",
    manual: "Type captions manually or pay for tool",
  },
  {
    category: "Multi-Platform Publish",
    easyslice: "One-click to 3 platforms",
    manual: "Upload separately to each",
  },
  {
    category: "Consistency",
    easyslice: "Every video, every time",
    manual: "Depends on your availability",
  },
  {
    category: "Monetization Tracking",
    easyslice: "Built-in Whop analytics",
    manual: "Spreadsheets and manual tracking",
  },
]

export function ComparisonTable() {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-secondary/30">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Feature
            </th>
            <th className="px-4 py-3 text-left font-medium text-primary">
              Automated (AI Platform)
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Manual Method
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={row.category}
              className={`border-b border-border/50 ${
                index % 2 === 0 ? "bg-card" : "bg-secondary/10"
              }`}
            >
              <td className="px-4 py-3 font-medium text-foreground">
                {row.category}
              </td>
              <td className="px-4 py-3 text-primary/80">
                {row.easyslice}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {row.manual}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
