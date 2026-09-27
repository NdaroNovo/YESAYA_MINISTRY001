import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FormError, Textarea } from "@/components/ui/form"
import { Modal } from "@/components/ui/modal"
import DataTable from "@/components/DataTable"
import { Loading, PageHeader, RowActions } from "@/components/PageParts"
import { Plus, Server, Settings } from "lucide-react"
import api from "@/api/axios"
import type { OfferingType } from "@/api/types"
import { useList } from "@/hooks/useApi"
import { useCrud } from "@/hooks/useCrud"
import { useAuth } from "@/hooks/useAuth"

const EMPTY = { name: "", slug: "", church_percentage: "0", field_percentage: "100", description: "" }

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50)
}

export default function SettingsPage() {
  const { can } = useAuth()
  const canEdit = can("jimbo_admin")
  const { data: types, loading, error, reload } = useList<OfferingType>("/offering-types/")
  const crud = useCrud("/offering-types/", EMPTY, reload)
  const [health, setHealth] = useState<{ status: string; latest_app_version: string } | null>(null)

  useEffect(() => {
    api.get("/health/").then((r) => setHealth(r.data)).catch(() => setHealth(null))
  }, [])

  const cp = Number(crud.form.church_percentage || 0)
  const fp = Number(crud.form.field_percentage || 0)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload: Record<string, unknown> = {
      name: crud.form.name,
      church_percentage: cp,
      field_percentage: fp,
      description: crud.form.description,
    }
    if (!crud.editingId) {
      payload.slug = crud.form.slug || slugify(crud.form.name)
      payload.kind = "custom"
    }
    crud.save(payload, "Aina ya toleo imehifadhiwa.")
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Mipangilio" subtitle="Aina za matoleo na hali ya mfumo" />

      <Card>
        <CardHeader className="flex flex-col gap-3 space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings className="h-5 w-5 text-gold" /> Aina za Matoleo na Mgawanyo
            </CardTitle>
            <CardDescription>Asilimia zinazotumika kugawa kila toleo kati ya Kanisa na Jimbo.</CardDescription>
          </div>
          {canEdit && (
            <Button variant="gold" onClick={() => crud.openNew()}>
              <Plus className="mr-2 h-4 w-4" /> Ongeza Aina
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <FormError message={error} />
          {loading ? (
            <Loading />
          ) : (
            <DataTable
              rows={types}
              rowKey={(t) => t.id}
              mobileTitle={(t) => t.name}
              columns={[
                { header: "Aina", cell: (t) => <span className="font-medium">{t.name}</span>, hideOnMobile: true },
                { header: "Kanisa", align: "right", cell: (t) => `${Number(t.church_percentage)}%` },
                { header: "Jimbo", align: "right", cell: (t) => `${Number(t.field_percentage)}%` },
                { header: "Maelezo", cell: (t) => t.description || "—", hideOnMobile: true },
              ]}
              actions={
                canEdit
                  ? (t) => (
                      <RowActions
                        onEdit={() =>
                          crud.openEdit(t.id, {
                            name: t.name,
                            slug: t.slug,
                            church_percentage: String(Number(t.church_percentage)),
                            field_percentage: String(Number(t.field_percentage)),
                            description: t.description,
                          })
                        }
                        onDelete={() => crud.remove(t.id, `Ondoa aina ya toleo "${t.name}"? Matoleo yaliyokwisha ingizwa hayataathirika.`)}
                      />
                    )
                  : undefined
              }
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Server className="h-5 w-5 text-gold" /> Hali ya Mfumo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>
            Server:{" "}
            {health?.status === "ok" ? (
              <span className="font-medium text-green-600">Inafanya kazi</span>
            ) : (
              <span className="font-medium text-red-600">Haipatikani</span>
            )}
          </p>
          {health && <p>Toleo la app ya simu: {health.latest_app_version}</p>}
          <p>Backup ya database: fanywa na msimamizi wa server (nakili faili la database au pg_dump).</p>
        </CardContent>
      </Card>

      <Modal
        open={crud.open}
        title={crud.editingId ? "Hariri Aina ya Toleo" : "Ongeza Aina ya Toleo"}
        onClose={crud.close}
        footer={
          <>
            <Button variant="outline" onClick={crud.close}>Ghairi</Button>
            <Button variant="gold" type="submit" form="type-form" disabled={crud.saving || cp + fp !== 100}>
              {crud.saving ? "Inahifadhi..." : "Hifadhi"}
            </Button>
          </>
        }
      >
        <form id="type-form" onSubmit={submit} className="space-y-4">
          <Field label="Jina la Aina" required>
            <Input required value={crud.form.name} onChange={(e) => crud.setField("name", e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Kanisa %" required>
              <Input
                type="number"
                min={0}
                max={100}
                step="0.01"
                value={crud.form.church_percentage}
                onChange={(e) => {
                  crud.setField("church_percentage", e.target.value)
                  crud.setField("field_percentage", String(Math.max(0, 100 - Number(e.target.value || 0))))
                }}
              />
            </Field>
            <Field label="Jimbo %" required>
              <Input
                type="number"
                min={0}
                max={100}
                step="0.01"
                value={crud.form.field_percentage}
                onChange={(e) => {
                  crud.setField("field_percentage", e.target.value)
                  crud.setField("church_percentage", String(Math.max(0, 100 - Number(e.target.value || 0))))
                }}
              />
            </Field>
          </div>
          {cp + fp !== 100 && <p className="text-xs text-red-600">Jumla ya asilimia lazima iwe 100%.</p>}
          <Field label="Maelezo">
            <Textarea value={crud.form.description} onChange={(e) => crud.setField("description", e.target.value)} />
          </Field>
          <FormError message={crud.error} />
        </form>
      </Modal>
    </div>
  )
}
