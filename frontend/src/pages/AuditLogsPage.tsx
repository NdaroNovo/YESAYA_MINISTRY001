import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { FormError, Select } from "@/components/ui/form"
import DataTable from "@/components/DataTable"
import LocationDisplay from "@/components/LocationDisplay"
import { EmptyState, Loading, PageHeader } from "@/components/PageParts"
import { ClipboardList } from "lucide-react"
import api from "@/api/axios"
import type { AuditLogEntry } from "@/api/types"
import { errorMessage, formatDateTime } from "@/lib/format"

const ACTIONS: Record<string, string> = {
  LOGIN: "Kuingia",
  CREATE: "Kuongeza",
  UPDATE: "Kuhariri",
  DELETE: "Kufuta",
}

const PAGE_SIZE = 30

export default function AuditLogsPage() {
  const [action, setAction] = useState("")
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState<AuditLogEntry[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    api
      .get("/audit-logs/", { params: { page, page_size: PAGE_SIZE, action: action || undefined } })
      .then((res) => {
        setRows(res.data.results)
        setCount(res.data.count)
        setError(null)
      })
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false))
  }, [page, action])

  const pages = Math.max(1, Math.ceil(count / PAGE_SIZE))

  return (
    <div className="space-y-5">
      <PageHeader title="Kumbukumbu za Mfumo" subtitle={`Vitendo vyote vilivyofanyika (${count})`} />
      <Select
        value={action}
        onChange={(e) => {
          setAction(e.target.value)
          setPage(1)
        }}
        className="sm:w-60"
      >
        <option value="">Vitendo vyote</option>
        {Object.entries(ACTIONS).map(([k, v]) => (
          <option key={k} value={k}>{v}</option>
        ))}
      </Select>

      <FormError message={error} />
      {loading ? (
        <Loading />
      ) : rows.length === 0 ? (
        <EmptyState icon={ClipboardList} message="Hakuna kumbukumbu." />
      ) : (
        <DataTable
          rows={rows}
          rowKey={(r) => r.id}
          mobileTitle={(r) => r.description}
          columns={[
            { header: "Muda", cell: (r) => formatDateTime(r.created_at) },
            { header: "Mtumiaji", cell: (r) => r.user_name || "—" },
            { header: "Kitendo", cell: (r) => ACTIONS[r.action] || r.action },
            { header: "Maelezo", cell: (r) => r.description, hideOnMobile: true },
            { header: "IP", cell: (r) => r.ip_address || "—", hideOnMobile: true },
            { header: "Location", cell: (r) => <LocationDisplay latitude={r.latitude} longitude={r.longitude} />, hideOnMobile: true },
          ]}
        />
      )}

      {pages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Nyuma
          </Button>
          <span className="text-sm text-muted-foreground">
            Ukurasa {page} / {pages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
            Mbele
          </Button>
        </div>
      )}
    </div>
  )
}
