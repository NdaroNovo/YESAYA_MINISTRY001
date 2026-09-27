import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FormError, Textarea } from "@/components/ui/form"
import { Modal } from "@/components/ui/modal"
import { EmptyState, Loading, PageHeader, RowActions } from "@/components/PageParts"
import { Building2, Plus } from "lucide-react"
import type { Jimbo } from "@/api/types"
import { useList } from "@/hooks/useApi"
import { useCrud } from "@/hooks/useCrud"
import { useAuth } from "@/hooks/useAuth"

const EMPTY = { name: "", district: "", region: "", address: "", phone: "", email: "" }

export default function JimboPage() {
  const { can } = useAuth()
  const canEdit = can("jimbo_admin")
  const { data: list, loading, error, reload } = useList<Jimbo>("/jimbo/")
  const crud = useCrud("/jimbo/", EMPTY, reload)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    crud.save(crud.form, crud.editingId ? "Taarifa za Jimbo zimesasishwa." : "Jimbo limesajiliwa.")
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Jimbo"
        subtitle="Taarifa za Jimbo"
        action={
          canEdit && (
            <Button variant="gold" onClick={() => crud.openNew()}>
              <Plus className="mr-2 h-4 w-4" /> Sajili Jimbo
            </Button>
          )
        }
      />

      <FormError message={error} />
      {loading ? (
        <Loading />
      ) : list.length === 0 ? (
        <EmptyState
          icon={Building2}
          message="Hakuna Jimbo lililosajiliwa bado."
          action={canEdit && <Button variant="gold" onClick={() => crud.openNew()}>Sajili Jimbo</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {list.map((j) => (
            <Card key={j.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="h-5 w-5 text-gold" />
                  {j.name}
                </CardTitle>
                {canEdit && (
                  <div className="flex">
                    <RowActions
                      onEdit={() =>
                        crud.openEdit(j.id, {
                          name: j.name,
                          district: j.district,
                          region: j.region,
                          address: j.address,
                          phone: j.phone,
                          email: j.email,
                        })
                      }
                      onDelete={() =>
                        crud.remove(j.id, `Futa Jimbo "${j.name}"? (Inawezekana tu kama halina mitaa.)`)
                      }
                    />
                  </div>
                )}
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 text-sm">
                <Info label="Wilaya" value={j.district} />
                <Info label="Mkoa" value={j.region} />
                <Info label="Simu" value={j.phone} />
                <Info label="Barua pepe" value={j.email} />
                <Info label="Anwani" value={j.address} className="col-span-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={crud.open}
        title={crud.editingId ? "Hariri Jimbo" : "Sajili Jimbo"}
        onClose={crud.close}
        footer={
          <>
            <Button variant="outline" onClick={crud.close}>Ghairi</Button>
            <Button variant="gold" type="submit" form="jimbo-form" disabled={crud.saving}>
              {crud.saving ? "Inahifadhi..." : "Hifadhi"}
            </Button>
          </>
        }
      >
        <form id="jimbo-form" onSubmit={submit} className="space-y-4">
          <Field label="Jina la Jimbo" required>
            <Input required value={crud.form.name} onChange={(e) => crud.setField("name", e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Wilaya">
              <Input value={crud.form.district} onChange={(e) => crud.setField("district", e.target.value)} />
            </Field>
            <Field label="Mkoa">
              <Input value={crud.form.region} onChange={(e) => crud.setField("region", e.target.value)} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Simu">
              <Input type="tel" value={crud.form.phone} onChange={(e) => crud.setField("phone", e.target.value)} />
            </Field>
            <Field label="Barua pepe">
              <Input type="email" value={crud.form.email} onChange={(e) => crud.setField("email", e.target.value)} />
            </Field>
          </div>
          <Field label="Anwani">
            <Textarea value={crud.form.address} onChange={(e) => crud.setField("address", e.target.value)} />
          </Field>
          <FormError message={crud.error} />
        </form>
      </Modal>
    </div>
  )
}

function Info({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value || "—"}</p>
    </div>
  )
}
