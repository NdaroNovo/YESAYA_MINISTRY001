import { useCallback, useEffect, useState } from "react"
import api from "@/api/axios"
import { errorMessage, toList } from "@/lib/format"

/** Pakua orodha kutoka API; inapakia upya pale params zinapobadilika. */
export function useList<T>(url: string | null, params?: Record<string, string | number | undefined>) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const paramsKey = JSON.stringify(params || {})

  const reload = useCallback(async () => {
    if (!url) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const clean = Object.fromEntries(
        Object.entries(JSON.parse(paramsKey) as Record<string, unknown>).filter(([, v]) => v !== "" && v != null)
      )
      const res = await api.get(url, { params: { page_size: 5000, ...clean } })
      setData(toList<T>(res.data))
    } catch (e) {
      setError(errorMessage(e, "Imeshindwa kupakia taarifa."))
    } finally {
      setLoading(false)
    }
  }, [url, paramsKey])

  useEffect(() => {
    reload()
  }, [reload])

  return { data, loading, error, reload, setData }
}
