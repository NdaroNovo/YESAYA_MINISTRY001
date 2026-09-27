import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FormError, Select, Textarea } from "@/components/ui/form"
import { Modal } from "@/components/ui/modal"
import DataTable from "@/components/DataTable"
import RecordFilters, { RecordFilterValues, locationPayload } from "@/components/RecordFilters"
import { EmptyState, Loading, PageHeader, RowActions } from "@/components/PageParts"
import { Banknote, Plus } from "lucide-react"
import type { Church, Mtaa, Offering, OfferingType } from "@/api/types"
import { useList } from "@/hooks/useApi"
import { useCrud } from "@/hooks/useCrud"
import { useAuth } from "@/hooks/useAuth"
import { useLocation } from "@/hooks/useLocation"
import { CURRENT_MONTH, CURRENT_YEAR, MONTHS, YEARS, formatMoney } from "@/lib/format"

const EMPTY = {
  church: "",
  offering_type: "",
  amount: "",
  month: String(CURRENT_MONTH),
  year: String(CURRENT_YEAR),
  notes: "",
}

export default function OfferingsPage() {
  const { user, can } = useAuth()
  const canEdit = can("church_leader")
  const location = useLocation()
  const [params, setParams] = useSearchParams()
  const [filters, setFilters] = useState<RecordFilterValues>({ mtaa: "", church: "", year: String(CURRENT_YEAR), month: "" })
  const [typeFilter, setTypeFilter] = useState("")
  const { data: mitaa } = useList<Mtaa>("/mitaa/")
  const { data: churches } = useList<Church>("/churches/")
  const { data: types } = useList<OfferingType>("/offering-types/")
  const { data: offerings, loading, error, reload } = useList<Offering>("/offerings/", { ...filters })
  const crud = useCrud("/offerings/", EMPTY, reload)

  const rows = typeFilter ? offerings.filter((o) => String(o.offering_type) === typeFilter) : offerings
  const total = rows.reduce((s, o) => s + Number(o.amount), 0)
  const churchTotal = rows.reduce((s, o) => s + Number(o.church_share), 0)
  const fieldTotal = rows.reduce((s, o) => s + Number(o.field_share), 0)

  const defaultChurch = () =>
    filters.church || (user?.assignedChurch ? String(user.assignedChurch) : churches.length === 1 ? String(churches[0].id) : "")

  useEffect(() => {
    if (params.get("new") && canEdit && churches.length > 0) {
      crud.openNew({ church: defaultChurch() })
      setParams({}, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, churches.length])

  const selectedType = types.find((t) => String(t.id) === crud.form.offering_type)
  const amount = Number(crud.form.amount || 0)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const coords = location.enabled ? await location.capture() : { latitude: null, longitude: null }
    crud.save(
      {
        church: Number(crud.form.church),
        offering_type: Number(crud.form.offering_type),
        amount: crud.form.amount,
        month: Number(crud.form.month),
        year: Number(crud.form.year),
        notes: crud.form.notes,
        ...locationPayload(coords),
      },
      crud.editingId ? "Toleo limesasishwa." : "Toleo limehifadhiwa."
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Matoleo"
        subtitle="Zaka na sadaka, pamoja na mgawanyo wa Kanisa na Jimbo"
        action={
          canEdit && (
            <Button variant="gold" onClick={() => crud.openNew({ church: defaultChurch() })} disabled={churches.length === 0}>
              <Plus className="mr-2 h-4 w-4" /> Ingiza Matoleo
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
      <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="sm:w-72 print:hidden">
        <option value="">Aina zote za matoleo</option>
        {types.map((t) => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </Select>

      {!loading && rows.length > 0 && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <Summary label="Jumla ya Matoleo" value={formatMoney(total)} />
          <Summary label="Sehemu ya Kanisa" value={formatMoney(churchTotal)} />
          <Summary label="Sehemu ya Jimbo" value={formatMoney(fieldTotal)} />
        </div>
      )}

      <FormError message={error} />
      {loading ? (
        <Loading />
      ) : rows.length === 0 ? (
        <EmptyState icon={Banknote} message="Hakuna matoleo kwa vichujio ulivyochagua." />
      ) : (
        <DataTable
          rows={rows}
          rowKey={(o) => o.id}
          mobileTitle={(o) => (
            <>
              {o.church_name}
              <span className="block text-xs font-normal text-muted-foreground">
                {o.offering_type_name} · {MONTHS[o.month]} {o.year}
              </span>
            </>
          )}
          columns={[
            { header: "Kipindi", cell: (o) => `${MONTHS[o.month]} ${o.year}`, hideOnMobile: true },
            { header: "Kanisa", cell: (o) => o.church_name, hideOnMobile: true },
            { header: "Aina", cell: (o) => o.offering_type_name, hideOnMobile: true },
            { header: "Kiasi", align: "right", cell: (o) => <span className="font-semibold">{formatMoney(o.amount)}</span> },
            { header: "Kanisa (share)", align: "right", cell: (o) => formatMoney(o.church_share) },
            { header: "Jimbo (share)", align: "right", cell: (o) => formatMoney(o.field_share) },
          ]}
          footer={
            <tr>
              <td className="px-4 py-3" colSpan={3}>Jumla</td>
              <td className="px-4 py-3 text-right">{formatMoney(total)}</td>
              <td className="px-4 py-3 text-right">{formatMoney(churchTotal)}</td>
              <td className="px-4 py-3 text-right">{formatMoney(fieldTotal)}</td>
              {canEdit && <td />}
            </tr>
          }
          actions={
            canEdit
              ? (o) => (
                  <RowActions
                    onEdit={() =>
                      crud.openEdit(o.id, {
                        church: String(o.church),
                        offering_type: String(o.offering_type),
                        amount: String(Number(o.amount)),
                        month: String(o.month),
                        year: String(o.year),
                        notes: o.notes,
                      })
                    }
                    onDelete={() =>
                      crud.remove(o.id, `Futa toleo la ${formatMoney(o.amount)} (${o.offering_type_name}) la ${o.church_name}?`)
                    }
                  />
                )
              : undefined
          }
        />
      )}

      <Modal
        open={crud.open}
        title={crud.editingId ? "Hariri Toleo" : "Ingiza Matoleo"}
        onClose={crud.close}
        footer={
          <>
            <Button variant="outline" onClick={crud.close}>Ghairi</Button>
            <Button variant="gold" type="submit" form="off-form" disabled={crud.saving || location.loading}>
              {crud.saving || location.loading ? "Inahifadhi..." : "Hifadhi"}
            </Button>
          </>
        }
      >
        <form id="off-form" onSubmit={submit} className="space-y-4">
          <Field label="Kanisa" required>
            <Select required value={crud.form.church} onChange={(e) => crud.setField("church", e.target.value)}>
              <option value="">— Chagua Kanisa —</option>
              {churches.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.mtaa_name})</option>
              ))}
            </Select>
          </Field>
          <Field label="Aina ya Toleo" required>
            <Select required value={crud.form.offering_type} onChange={(e) => crud.setField("offering_type", e.target.value)}>
              <option value="">— Chagua Aina —</option>
              {types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} (Kanisa {Number(t.church_percentage)}% / Jimbo {Number(t.field_percentage)}%)
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Kiasi (TSh)" required>
            <Input
              required
              type="number"
              min={1}
              step="0.01"
              inputMode="decimal"
              value={crud.form.amount}
              onChange={(e) => crud.setField("amount", e.target.value)}
            />
          </Field>
          {selectedType && amount > 0 && (
            <div className="grid grid-cols-2 gap-2 rounded-md bg-muted/60 p-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Kanisa ({Number(selectedType.church_percentage)}%)</p>
                <p className="font-semibold">{formatMoney((amount * Number(selectedType.church_percentage)) / 100)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Jimbo ({Number(selectedType.field_percentage)}%)</p>
                <p className="font-semibold">{formatMoney((amount * Number(selectedType.field_percentage)) / 100)}</p>
              </div>
            </div>
          )}
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
          <Field label="Maelezo">
            <Textarea value={crud.form.notes} onChange={(e) => crud.setField("notes", e.target.value)} />
          </Field>
          <FormError message={crud.error} />
        </form>
      </Modal>
    </div>
  )
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-white p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-bold text-navy">{value}</p>
    </div>
  )
}
