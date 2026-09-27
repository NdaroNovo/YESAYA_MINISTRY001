import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FormError, Select } from "@/components/ui/form"
import { Modal } from "@/components/ui/modal"
import DataTable from "@/components/DataTable"
import { EmptyState, Loading, PageHeader, RowActions } from "@/components/PageParts"
import { Plus, Search, Users } from "lucide-react"
import type { ApiUser, Church, Mtaa } from "@/api/types"
import { useList } from "@/hooks/useApi"
import { useCrud } from "@/hooks/useCrud"
import { useAuth } from "@/hooks/useAuth"
import { ROLE_LABELS, formatDateTime } from "@/lib/format"

const EMPTY = {
  username: "",
  full_name: "",
  email: "",
  phone: "",
  role: "church_leader",
  assigned_mtaa: "",
  assigned_church: "",
  password: "",
  is_active: true,
}

export default function UsersPage() {
  const { user: me, can } = useAuth()
  const canEdit = can("super_admin")
  const [search, setSearch] = useState("")
  const { data: users, loading, error, reload } = useList<ApiUser>("/users/")
  const { data: mitaa } = useList<Mtaa>("/mitaa/")
  const { data: churches } = useList<Church>("/churches/")
  const crud = useCrud("/users/", EMPTY, reload)

  const q = search.trim().toLowerCase()
  const rows = q
    ? users.filter((u) => [u.username, u.full_name, u.email, u.phone].some((v) => v?.toLowerCase().includes(q)))
    : users

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const f = crud.form
    const payload: Record<string, unknown> = {
      username: f.username.trim(),
      full_name: f.full_name,
      email: f.email,
      phone: f.phone,
      role: f.role,
      is_active: f.is_active,
      assigned_mtaa: f.role === "mtaa_leader" && f.assigned_mtaa ? Number(f.assigned_mtaa) : null,
      assigned_church: f.role === "church_leader" && f.assigned_church ? Number(f.assigned_church) : null,
    }
    if (f.password) payload.password = f.password
    crud.save(payload, crud.editingId ? "Mtumiaji amesasishwa." : "Mtumiaji ameundwa.")
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Watumiaji"
        subtitle="Akaunti za viongozi na wasimamizi wa mfumo"
        action={
          canEdit && (
            <Button variant="gold" onClick={() => crud.openNew()}>
              <Plus className="mr-2 h-4 w-4" /> Ongeza Mtumiaji
            </Button>
          )
        }
      />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Tafuta mtumiaji..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <FormError message={error} />
      {loading ? (
        <Loading />
      ) : rows.length === 0 ? (
        <EmptyState icon={Users} message="Hakuna watumiaji." />
      ) : (
        <DataTable
          rows={rows}
          rowKey={(u) => u.id}
          mobileTitle={(u) => (
            <>
              {u.full_name || u.username}
              <span className="block text-xs font-normal text-muted-foreground">@{u.username}</span>
            </>
          )}
          columns={[
            { header: "Jina", cell: (u) => <span className="font-medium">{u.full_name || "—"}</span>, hideOnMobile: true },
            { header: "Username", cell: (u) => u.username, hideOnMobile: true },
            { header: "Jukumu", cell: (u) => ROLE_LABELS[u.role] || u.role },
            { header: "Eneo", cell: (u) => u.assigned_church_name || u.assigned_mtaa_name || "Jimbo lote" },
            { header: "Simu", cell: (u) => u.phone || "—" },
            { header: "Aliingia mwisho", cell: (u) => formatDateTime(u.last_login), hideOnMobile: true },
            {
              header: "Hali",
              align: "center",
              cell: (u) => (
                <span className={`rounded-full px-2 py-0.5 text-xs ${u.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {u.is_active ? "Hai" : "Imezimwa"}
                </span>
              ),
            },
          ]}
          actions={
            canEdit
              ? (u) => (
                  <RowActions
                    onEdit={() =>
                      crud.openEdit(u.id, {
                        username: u.username,
                        full_name: u.full_name,
                        email: u.email,
                        phone: u.phone,
                        role: u.role,
                        assigned_mtaa: u.assigned_mtaa ? String(u.assigned_mtaa) : "",
                        assigned_church: u.assigned_church ? String(u.assigned_church) : "",
                        password: "",
                        is_active: u.is_active,
                      })
                    }
                    onDelete={
                      u.id !== me?.id && u.is_active
                        ? () => crud.remove(u.id, `Zima akaunti ya "${u.username}"? Hataweza kuingia tena.`)
                        : undefined
                    }
                  />
                )
              : undefined
          }
        />
      )}

      <Modal
        open={crud.open}
        title={crud.editingId ? "Hariri Mtumiaji" : "Ongeza Mtumiaji"}
        onClose={crud.close}
        footer={
          <>
            <Button variant="outline" onClick={crud.close}>Ghairi</Button>
            <Button variant="gold" type="submit" form="user-form" disabled={crud.saving}>
              {crud.saving ? "Inahifadhi..." : "Hifadhi"}
            </Button>
          </>
        }
      >
        <form id="user-form" onSubmit={submit} className="space-y-4">
          <Field label="Jina Kamili" required>
            <Input required value={crud.form.full_name} onChange={(e) => crud.setField("full_name", e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Username" required>
              <Input
                required
                autoCapitalize="none"
                value={crud.form.username}
                onChange={(e) => crud.setField("username", e.target.value)}
              />
            </Field>
            <Field label="Simu">
              <Input type="tel" value={crud.form.phone} onChange={(e) => crud.setField("phone", e.target.value)} />
            </Field>
          </div>
          <Field label="Barua pepe">
            <Input type="email" value={crud.form.email} onChange={(e) => crud.setField("email", e.target.value)} />
          </Field>
          <Field label="Jukumu (Role)" required>
            <Select value={crud.form.role} onChange={(e) => crud.setField("role", e.target.value)}>
              {Object.entries(ROLE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </Select>
          </Field>
          {crud.form.role === "mtaa_leader" && (
            <Field label="Mtaa wake" required>
              <Select required value={crud.form.assigned_mtaa} onChange={(e) => crud.setField("assigned_mtaa", e.target.value)}>
                <option value="">— Chagua Mtaa —</option>
                {mitaa.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </Select>
            </Field>
          )}
          {crud.form.role === "church_leader" && (
            <Field label="Kanisa lake" required>
              <Select required value={crud.form.assigned_church} onChange={(e) => crud.setField("assigned_church", e.target.value)}>
                <option value="">— Chagua Kanisa —</option>
                {churches.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.mtaa_name})</option>
                ))}
              </Select>
            </Field>
          )}
          <Field
            label={crud.editingId ? "Nenosiri jipya (acha wazi usibadilishe)" : "Nenosiri"}
            required={!crud.editingId}
            hint="Angalau herufi 8, lisiwe la kawaida au namba tupu."
          >
            <Input
              type="text"
              autoComplete="new-password"
              required={!crud.editingId}
              value={crud.form.password}
              onChange={(e) => crud.setField("password", e.target.value)}
            />
          </Field>
          {crud.editingId && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={crud.form.is_active} onChange={(e) => crud.setField("is_active", e.target.checked)} />
              Akaunti iko hai (anaweza kuingia)
            </label>
          )}
          <FormError message={crud.error} />
        </form>
      </Modal>
    </div>
  )
}
