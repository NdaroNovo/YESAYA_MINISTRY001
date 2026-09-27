import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FormError, Select, Textarea } from "@/components/ui/form"
import { Modal } from "@/components/ui/modal"
import DataTable from "@/components/DataTable"
import RecordFilters, { RecordFilterValues, locationPayload } from "@/components/RecordFilters"
import { EmptyState, Loading, PageHeader, RowActions } from "@/components/PageParts"
import LocationDisplay from "@/components/LocationDisplay"
import { HeartHandshake, Plus } from "lucide-react"
import type { Church, EvangelismRecord, Mtaa } from "@/api/types"
import { useList } from "@/hooks/useApi"
import { useCrud } from "@/hooks/useCrud"
import { useAuth } from "@/hooks/useAuth"
import { useLocation } from "@/hooks/useLocation"
import { CURRENT_MONTH, CURRENT_YEAR, MONTHS, YEARS, formatNumber } from "@/lib/format"

const EMPTY = {
  church: "",
  month: String(CURRENT_MONTH),
  year: String(CURRENT_YEAR),
  baptized: "0",
  converted: "0",
  visited: "0",
  supported: "0",
  comments: "",
}

const COUNT_FIELDS = [
  { key: "baptized", label: "Waliobatizwa" },
  { key: "converted", label: "Waliokombolewa" },
  { key: "visited", label: "Waliotembelewa" },
  { key: "supported", label: "Waliosaidika" },
] as const

export default function EvangelismPage() {
  const { user, can } = useAuth()
  const canEdit = can("church_leader")
  const location = useLocation()
  const [params, setParams] = useSearchParams()
  const [filters, setFilters] = useState<RecordFilterValues>({ mtaa: "", church: "", year: String(CURRENT_YEAR), month: "" })
  const { data: mitaa } = useList<Mtaa>("/mitaa/")
  const { data: churches } = useList<Church>("/churches/")
  const { data: records, loading, error, reload } = useList<EvangelismRecord>("/evangelism/", { ...filters })
  const crud = useCrud("/evangelism/", EMPTY, reload)

  const defaultChurch = () =>
    filters.church || (user?.assignedChurch ? String(user.assignedChurch) : churches.length === 1 ? String(churches[0].id) : "")

  useEffect(() => {
    if (params.get("new") && canEdit && churches.length > 0) {
      crud.openNew({ church: defaultChurch() })
      setParams({}, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, churches.length])

  const totals = COUNT_FIELDS.reduce(
    (acc, f) => ({ ...acc, [f.key]: records.reduce((s, r) => s + (r[f.key] || 0), 0) }),
    {} as Record<(typeof COUNT_FIELDS)[number]["key"], number>
  )

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const coords = location.enabled ? await location.capture() : { latitude: null, longitude: null }
    crud.save(
      {
        church: Number(crud.form.church),
        month: Number(crud.form.month),
        year: Number(crud.form.year),
        baptized: Number(crud.form.baptized || 0),
        converted: Number(crud.form.converted || 0),
        visited: Number(crud.form.visited || 0),
        supported: Number(crud.form.supported || 0),
        comments: crud.form.comments,
        ...locationPayload(coords),
      },
      crud.editingId ? "Taarifa imesasishwa." : "Taarifa ya uinjilisti imehifadhiwa."
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Uinjilisti"
        subtitle="Taarifa za kila mwezi za uinjilisti kwa kila kanisa"
        action={
          canEdit && (
            <Button variant="gold" onClick={() => crud.openNew({ church: defaultChurch() })} disabled={churches.length === 0}>
              <Plus className="mr-2 h-4 w-4" /> Ingiza Taarifa
            </Button>
          )
        }
      />

      {canEdit && churches.length === 0 && (
        <p className="rounded-md bg-gold-50 p-3 text-sm">
          Hakuna kanisa bado. <Link to="/churches" className="font-medium text-gold-700 underline">Ongeza kanisa</Link> kwanza.
        </p>
      )}

      <RecordFilters value={filters} onChange={setFilters} mitaa={mitaa} churches={churches} />

      {!loading && records.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {COUNT_FIELDS.map((f) => (
            <div key={f.key} className="rounded-lg border bg-white p-3">
              <p className="text-xs text-muted-foreground">{f.label}</p>
              <p className="text-xl font-bold text-navy">{formatNumber(totals[f.key])}</p>
            </div>
          ))}
        </div>
      )}

      <FormError message={error} />
      {loading ? (
        <Loading />
      ) : records.length === 0 ? (
        <EmptyState icon={HeartHandshake} message="Hakuna taarifa za uinjilisti kwa vichujio ulivyochagua." />
      ) : (
        <DataTable
          rows={records}
          rowKey={(r) => r.id}
          mobileTitle={(r) => (
            <>
              {r.church_name}
              <span className="block text-xs font-normal text-muted-foreground">
                {MONTHS[r.month]} {r.year}
              </span>
            </>
          )}
          columns={[
            { header: "Kipindi", cell: (r) => `${MONTHS[r.month]} ${r.year}`, hideOnMobile: true },
            { header: "Kanisa", cell: (r) => r.church_name, hideOnMobile: true },
            { header: "Mtaa", cell: (r) => r.mtaa_name, hideOnMobile: true },
            ...COUNT_FIELDS.map((f) => ({
              header: f.label,
              align: "right" as const,
              cell: (r: EvangelismRecord) => formatNumber(r[f.key]),
            })),
            { header: "Location", cell: (r) => <LocationDisplay latitude={r.latitude} longitude={r.longitude} />, hideOnMobile: true },
          ]}
          footer={
            <tr>
              <td className="px-4 py-3" colSpan={3}>Jumla</td>
              {COUNT_FIELDS.map((f) => (
                <td key={f.key} className="px-4 py-3 text-right">{formatNumber(totals[f.key])}</td>
              ))}
              <td />
              {canEdit && <td />}
            </tr>
          }
          actions={
            canEdit
              ? (r) => (
                  <RowActions
                    onEdit={() =>
                      crud.openEdit(r.id, {
                        church: String(r.church),
                        month: String(r.month),
                        year: String(r.year),
                        baptized: String(r.baptized),
                        converted: String(r.converted),
                        visited: String(r.visited),
                        supported: String(r.supported),
                        comments: r.comments,
                      })
                    }
                    onDelete={() => crud.remove(r.id, `Futa taarifa ya ${r.church_name} — ${MONTHS[r.month]} ${r.year}?`)}
                  />
                )
              : undefined
          }
        />
      )}

      <Modal
        open={crud.open}
        title={crud.editingId ? "Hariri Taarifa ya Uinjilisti" : "Ingiza Taarifa ya Uinjilisti"}
        onClose={crud.close}
        footer={
          <>
            <Button variant="outline" onClick={crud.close}>Ghairi</Button>
            <Button variant="gold" type="submit" form="ev-form" disabled={crud.saving || location.loading}>
              {crud.saving || location.loading ? "Inahifadhi..." : "Hifadhi"}
            </Button>
          </>
        }
      >
        <form id="ev-form" onSubmit={submit} className="space-y-4">
          <Field label="Kanisa" required>
            <Select required value={crud.form.church} onChange={(e) => crud.setField("church", e.target.value)}>
              <option value="">— Chagua Kanisa —</option>
              {churches.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.mtaa_name})</option>
              ))}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Mwezi" required>
              <Select value={crud.form.month} onChange={(e) => crud.setField("month", e.target.value)}>
                {MONTHS.slice(1).map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </Select>
            </Field>
            <Field label="Mwaka" required>
              <Select value={crud.form.year} onChange={(e) => crud.setField("year", e.target.value)}>
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {COUNT_FIELDS.map((f) => (
              <Field key={f.key} label={f.label}>
                <Input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={crud.form[f.key]}
                  onChange={(e) => crud.setField(f.key, e.target.value)}
                />
              </Field>
            ))}
          </div>
          <Field label="Maoni">
            <Textarea value={crud.form.comments} onChange={(e) => crud.setField("comments", e.target.value)} />
          </Field>
          <p className="text-xs text-muted-foreground">
            {location.enabled ? "Location itahifadhiwa pamoja na taarifa hii." : "Location imezimwa (badilisha kwenye Wasifu)."}
          </p>
          <FormError message={crud.error} />
        </form>
      </Modal>
    </div>
  )
}
