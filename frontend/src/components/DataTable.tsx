import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface Column<T> {
  header: string
  cell: (row: T) => React.ReactNode
  align?: "left" | "right" | "center"
  /** Ficha safu hii kwenye kadi za simu */
  hideOnMobile?: boolean
}

interface DataTableProps<T> {
  rows: T[]
  columns: Column<T>[]
  rowKey: (row: T) => string | number
  /** Kichwa cha kadi kwenye simu */
  mobileTitle: (row: T) => React.ReactNode
  actions?: (row: T) => React.ReactNode
  footer?: React.ReactNode
}

/** Jedwali kwenye skrini kubwa, kadi kwenye simu. */
export default function DataTable<T>({ rows, columns, rowKey, mobileTitle, actions, footer }: DataTableProps<T>) {
  return (
    <>
      <Card className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead className="bg-navy text-white">
            <tr>
              {columns.map((c) => (
                <th key={c.header} className={cn("px-4 py-3 font-medium", alignClass(c.align))}>
                  {c.header}
                </th>
              ))}
              {actions && <th className="px-4 py-3 text-right font-medium">Vitendo</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={rowKey(row)} className="border-b last:border-0 hover:bg-muted/50">
                {columns.map((c) => (
                  <td key={c.header} className={cn("px-4 py-3", alignClass(c.align))}>
                    {c.cell(row)}
                  </td>
                ))}
                {actions && (
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">{actions(row)}</div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
          {footer && <tfoot className="bg-muted/60 font-semibold">{footer}</tfoot>}
        </table>
      </Card>

      <div className="space-y-3 md:hidden">
        {rows.map((row) => (
          <Card key={rowKey(row)} className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="font-semibold text-navy">{mobileTitle(row)}</div>
              {actions && <div className="flex shrink-0 gap-1">{actions(row)}</div>}
            </div>
            <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
              {columns
                .filter((c) => !c.hideOnMobile)
                .map((c) => (
                  <div key={c.header} className="min-w-0">
                    <dt className="text-xs text-muted-foreground">{c.header}</dt>
                    <dd className="truncate font-medium">{c.cell(row)}</dd>
                  </div>
                ))}
            </dl>
          </Card>
        ))}
      </div>
    </>
  )
}

function alignClass(align?: "left" | "right" | "center") {
  if (align === "right") return "text-right"
  if (align === "center") return "text-center"
  return "text-left"
}
