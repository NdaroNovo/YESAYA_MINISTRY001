import { Loader2, Pencil, Trash2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-navy">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action && <div className="flex flex-wrap gap-2 print:hidden">{action}</div>}
    </div>
  )
}

export function Loading() {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin" /> Inapakia...
    </div>
  )
}

export function EmptyState({
  icon: Icon,
  message,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>
  message: string
  action?: React.ReactNode
}) {
  return (
    <Card>
      <CardContent className="p-10 text-center text-muted-foreground">
        <Icon className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
        <p>{message}</p>
        {action && <div className="mt-4">{action}</div>}
      </CardContent>
    </Card>
  )
}

export function RowActions({ onEdit, onDelete }: { onEdit?: () => void; onDelete?: () => void }) {
  return (
    <>
      {onEdit && (
        <button
          onClick={onEdit}
          className="rounded-md p-2 text-navy-600 hover:bg-muted"
          aria-label="Hariri"
          title="Hariri"
        >
          <Pencil className="h-4 w-4" />
        </button>
      )}
      {onDelete && (
        <button
          onClick={onDelete}
          className="rounded-md p-2 text-red-600 hover:bg-red-50"
          aria-label="Futa"
          title="Futa"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </>
  )
}

export function StatCard({
  title,
  value,
  icon: Icon,
  color,
  note,
}: {
  title: string
  value: React.ReactNode
  icon: React.ComponentType<{ className?: string }>
  color: string
  note?: string
}) {
  return (
    <Card className="border">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground sm:text-sm">{title}</p>
            <p className="mt-1 truncate text-xl font-bold text-navy sm:text-2xl">{value}</p>
          </div>
          <div className={`shrink-0 rounded-lg p-2 ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        {note && <p className="mt-2 text-xs text-muted-foreground">{note}</p>}
      </CardContent>
    </Card>
  )
}
