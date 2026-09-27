import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FormError, Select } from "@/components/ui/form"
import { Modal } from "@/components/ui/modal"
import DataTable from "@/components/DataTable"
import { EmptyState, Loading, PageHeader, RowActions } from "@/components/PageParts"
import { MapPin, Plus } from "lucide-react"
import type { Jimbo, Mtaa } from "@/api/types"
import { useList } from "@/hooks/useApi"
import { useCrud } from "@/hooks/useCrud"
import { useAuth } from "@/hooks/useAuth"

const EMPTY = { jimbo: "", name: "", leader_name: "", phone: "", location: "" }

export default function MitaaPage() {
  const { can } = useAuth()
  const canEdit = can("jimbo_admin")
  const [jimboFilter, setJimboFilter] = useState("")
  const { data: jimbos } = useList<Jimbo>("/jimbo/")
  const { data: mitaa, loading, error, reload } = useList<Mtaa>("/mitaa/", { jimbo: jimboFilter })
  const crud = useCrud("/mitaa/", EMPTY, reload)

  const openNew = () => crud.openNew({ jimbo: jimboFilter || (jimbos[0] ? String(jimbos[0].id) : "") })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    crud.save({ ...crud.form, jimbo: Number(crud.form.jimbo) }, crud.editingId ? "Mtaa umesasishwa." : "Mtaa umeongezwa.")
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Mitaa"
        subtitle="Mitaa iliyo chini ya Jimbo"
        action={
          canEdit && (
            <Button variant="gold" onClick={openNew} disabled={jimbos.length === 0}>
              <Plus className="mr-2 h-4 w-4" /> Ongeza Mtaa
            </Button>
          )
        }
      />

      {canEdit && jimbos.length === 0 && !loading && (
        <p className="rounded-md bg-gold-50 p-3 text-sm">
          Sajili <Link to="/jimbo" className="font-medium text-gold-700 underline">Jimbo</Link> kwanza kabla ya kuongeza mitaa.
        </p>
      )}

      {jimbos.length > 1 && (
        <Select value={jimboFilter} onChange={(e) => setJimboFilter(e.target.value)} className="sm:w-64">
          <option value="">Majimbo yote</option>
          {jimbos.map((j) => (
            <option key={j.id} value={j.id}>{j.name}</option>
          ))}
        </Select>
      )}

      <FormError message={error} />
      {loading ? (
        <Loading />
      ) : mitaa.length === 0 ? (
        <EmptyState icon={MapPin} message="Hakuna mitaa bado." />
      ) : (
        <DataTable
          rows={mitaa}
          rowKey={(m) => m.id}
          mobileTitle={(m) => m.name}
          columns={[
            { header: "Jina la Mtaa", cell: (m) => <span className="font-medium">{m.name}</span>, hideOnMobile: true },
            { header: "Jimbo", cell: (m) => m.jimbo_name },
            { header: "Kiongozi", cell: (m) => m.leader_name || "—" },
            { header: "Simu", cell: (m) => m.phone || "—" },
            { header: "Eneo", cell: (m) => m.location || "—" },
            {
              header: "Makanisa",
              align: "center",
              cell: (m) => (
                <Link to={`/churches?mtaa=${m.id}`} className="text-gold-700 underline">
                  {m.church_count}
                </Link>
              ),
            },
          ]}
          actions={
            canEdit
              ? (m) => (
                  <RowActions
                    onEdit={() =>
                      crud.openEdit(m.id, {
                        jimbo: String(m.jimbo),
                        name: m.name,
                        leader_name: m.leader_name,
                        phone: m.phone,
                        location: m.location,
                      })
                    }
                    onDelete={() =>
                      crud.remove(m.id, `Ondoa mtaa "${m.name}"? Makanisa yake pia yataondolewa kwenye orodha.`)
                    }
                  />
                )
              : undefined
          }
        />
      )}

      <Modal
        open={crud.open}
        title={crud.editingId ? "Hariri Mtaa" : "Ongeza Mtaa"}
        onClose={crud.close}
        footer={
          <>
            <Button variant="outline" onClick={crud.close}>Ghairi</Button>
            <Button variant="gold" type="submit" form="mtaa-form" disabled={crud.saving}>
              {crud.saving ? "Inahifadhi..." : "Hifadhi"}
            </Button>
          </>
        }
      >
        <form id="mtaa-form" onSubmit={submit} className="space-y-4">
          <Field label="Jimbo" required>
            <Select required value={crud.form.jimbo} onChange={(e) => crud.setField("jimbo", e.target.value)}>
              <option value="">— Chagua Jimbo —</option>
              {jimbos.map((j) => (
                <option key={j.id} value={j.id}>{j.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Jina la Mtaa" required>
            <Input required value={crud.form.name} onChange={(e) => crud.setField("name", e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Jina la Kiongozi">
              <Input value={crud.form.leader_name} onChange={(e) => crud.setField("leader_name", e.target.value)} />
            </Field>
            <Field label="Simu">
              <Input type="tel" value={crud.form.phone} onChange={(e) => crud.setField("phone", e.target.value)} />
            </Field>
          </div>
          <Field label="Eneo (Location)">
            <Input value={crud.form.location} onChange={(e) => crud.setField("location", e.target.value)} />
          </Field>
          <FormError message={crud.error} />
        </form>
      </Modal>
    </div>
  )
}
