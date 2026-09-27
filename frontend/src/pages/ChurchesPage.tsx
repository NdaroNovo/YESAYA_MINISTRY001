import { useMemo, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FormError, Select, Textarea } from "@/components/ui/form"
import { Modal } from "@/components/ui/modal"
import DataTable from "@/components/DataTable"
import { EmptyState, Loading, PageHeader, RowActions } from "@/components/PageParts"
import { Church as ChurchIcon, Plus, Search } from "lucide-react"
import type { Church, Mtaa } from "@/api/types"
import { useList } from "@/hooks/useApi"
import { useCrud } from "@/hooks/useCrud"
import { useAuth } from "@/hooks/useAuth"
import { formatNumber } from "@/lib/format"

const EMPTY = { mtaa: "", name: "", pastor_name: "", phone: "", address: "", member_count: "0" }

export default function ChurchesPage() {
  const { user, can } = useAuth()
  const canEdit = can("mtaa_leader")
  const [params, setParams] = useSearchParams()
  const mtaaFilter = params.get("mtaa") || ""
  const [search, setSearch] = useState("")
  const { data: mitaa } = useList<Mtaa>("/mitaa/")
  const { data: churches, loading, error, reload } = useList<Church>("/churches/", { mtaa: mtaaFilter })
  const crud = useCrud("/churches/", EMPTY, reload)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return churches
    return churches.filter((c) =>
      [c.name, c.pastor_name, c.mtaa_name, c.phone].some((v) => v?.toLowerCase().includes(q))
    )
  }, [churches, search])

  const totalMembers = filtered.reduce((s, c) => s + (c.member_count || 0), 0)

  const openNew = () => {
    const defaultMtaa =
      mtaaFilter || (user?.role === "mtaa_leader" && user.assignedMtaa ? String(user.assignedMtaa) : mitaa[0] ? String(mitaa[0].id) : "")
    crud.openNew({ mtaa: defaultMtaa })
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    crud.save(
      { ...crud.form, mtaa: Number(crud.form.mtaa), member_count: Number(crud.form.member_count || 0) },
      crud.editingId ? "Kanisa limesasishwa." : "Kanisa limeongezwa."
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Makanisa"
        subtitle={`${formatNumber(filtered.length)} makanisa · ${formatNumber(totalMembers)} wanachama`}
        action={
          canEdit && (
            <Button variant="gold" onClick={openNew} disabled={mitaa.length === 0}>
              <Plus className="mr-2 h-4 w-4" /> Ongeza Kanisa
            </Button>
          )
        }
      />

      {canEdit && mitaa.length === 0 && !loading && (
        <p className="rounded-md bg-gold-50 p-3 text-sm">
          Ongeza <Link to="/mitaa" className="font-medium text-gold-700 underline">Mtaa</Link> kwanza kabla ya kuongeza makanisa.
        </p>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Tafuta kanisa, mchungaji..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        {mitaa.length > 1 && (
          <Select
            value={mtaaFilter}
            onChange={(e) => setParams(e.target.value ? { mtaa: e.target.value } : {})}
            className="sm:w-64"
          >
            <option value="">Mitaa yote</option>
            {mitaa.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </Select>
        )}
      </div>

      <FormError message={error} />
      {loading ? (
        <Loading />
      ) : filtered.length === 0 ? (
        <EmptyState icon={ChurchIcon} message="Hakuna makanisa yaliyopatikana." />
      ) : (
        <DataTable
          rows={filtered}
          rowKey={(c) => c.id}
          mobileTitle={(c) => c.name}
          columns={[
            { header: "Kanisa", cell: (c) => <span className="font-medium">{c.name}</span>, hideOnMobile: true },
            { header: "Mtaa", cell: (c) => c.mtaa_name },
            { header: "Mchungaji", cell: (c) => c.pastor_name || "—" },
            { header: "Simu", cell: (c) => (c.phone ? <a href={`tel:${c.phone}`} className="text-blue-600">{c.phone}</a> : "—") },
            { header: "Wanachama", align: "right", cell: (c) => formatNumber(c.member_count) },
          ]}
          actions={
            canEdit
              ? (c) => (
                  <RowActions
                    onEdit={() =>
                      crud.openEdit(c.id, {
                        mtaa: String(c.mtaa),
                        name: c.name,
                        pastor_name: c.pastor_name,
                        phone: c.phone,
                        address: c.address,
                        member_count: String(c.member_count),
                      })
                    }
                    onDelete={() => crud.remove(c.id, `Ondoa kanisa "${c.name}" kwenye orodha?`)}
                  />
                )
              : undefined
          }
        />
      )}

      <Modal
        open={crud.open}
        title={crud.editingId ? "Hariri Kanisa" : "Ongeza Kanisa"}
        onClose={crud.close}
        footer={
          <>
            <Button variant="outline" onClick={crud.close}>Ghairi</Button>
            <Button variant="gold" type="submit" form="church-form" disabled={crud.saving}>
              {crud.saving ? "Inahifadhi..." : "Hifadhi"}
            </Button>
          </>
        }
      >
        <form id="church-form" onSubmit={submit} className="space-y-4">
          <Field label="Mtaa" required>
            <Select required value={crud.form.mtaa} onChange={(e) => crud.setField("mtaa", e.target.value)}>
              <option value="">— Chagua Mtaa —</option>
              {mitaa.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Jina la Kanisa" required>
            <Input required value={crud.form.name} onChange={(e) => crud.setField("name", e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Mchungaji">
              <Input value={crud.form.pastor_name} onChange={(e) => crud.setField("pastor_name", e.target.value)} />
            </Field>
            <Field label="Simu">
              <Input type="tel" value={crud.form.phone} onChange={(e) => crud.setField("phone", e.target.value)} />
            </Field>
          </div>
          <Field label="Idadi ya Wanachama">
            <Input
              type="number"
              min={0}
              inputMode="numeric"
              value={crud.form.member_count}
              onChange={(e) => crud.setField("member_count", e.target.value)}
            />
          </Field>
          <Field label="Anwani">
            <Textarea value={crud.form.address} onChange={(e) => crud.setField("address", e.target.value)} />
          </Field>
          <FormError message={crud.error} />
        </form>
      </Modal>
    </div>
  )
}
