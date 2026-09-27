import { useCallback, useState } from "react"
import api from "@/api/axios"
import { errorMessage } from "@/lib/format"
import { toast } from "@/components/Toast"

/**
 * Hali ya fomu ya kuongeza/kuhariri ndani ya Modal, pamoja na kuhifadhi na kufuta kupitia API.
 * `endpoint` ni kama "/churches/".
 */
export function useCrud<F extends Record<string, unknown>>(endpoint: string, emptyForm: F, onSaved: () => void) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<F>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const setField = useCallback(<K extends keyof F>(key: K, value: F[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
  }, [])

  const openNew = useCallback(
    (overrides?: Partial<F>) => {
      setForm({ ...emptyForm, ...overrides })
      setEditingId(null)
      setError(null)
      setOpen(true)
    },
    [emptyForm]
  )

  const openEdit = useCallback((id: number, values: F) => {
    setForm(values)
    setEditingId(id)
    setError(null)
    setOpen(true)
  }, [])

  const close = useCallback(() => setOpen(false), [])

  const save = useCallback(
    async (payload: Record<string, unknown>, successMessage = "Imehifadhiwa.") => {
      setSaving(true)
      setError(null)
      try {
        if (editingId) {
          await api.patch(`${endpoint}${editingId}/`, payload)
        } else {
          await api.post(endpoint, payload)
        }
        setOpen(false)
        toast(successMessage)
        onSaved()
        return true
      } catch (e) {
        setError(errorMessage(e))
        return false
      } finally {
        setSaving(false)
      }
    },
    [editingId, endpoint, onSaved]
  )

  const remove = useCallback(
    async (id: number, confirmText: string) => {
      if (!window.confirm(confirmText)) return
      try {
        await api.delete(`${endpoint}${id}/`)
        toast("Imefutwa.")
        onSaved()
      } catch (e) {
        toast(errorMessage(e), "error")
      }
    },
    [endpoint, onSaved]
  )

  return { open, form, setForm, setField, editingId, saving, error, openNew, openEdit, close, save, remove }
}
