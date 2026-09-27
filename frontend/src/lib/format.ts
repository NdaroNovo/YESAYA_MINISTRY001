export const MONTHS = [
  "",
  "Januari",
  "Februari",
  "Machi",
  "Aprili",
  "Mei",
  "Juni",
  "Julai",
  "Agosti",
  "Septemba",
  "Oktoba",
  "Novemba",
  "Desemba",
]

export const MONTHS_SHORT = ["", "Jan", "Feb", "Mac", "Apr", "Mei", "Jun", "Jul", "Ago", "Sep", "Okt", "Nov", "Des"]

export const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  jimbo_admin: "Jimbo Admin",
  mtaa_leader: "Kiongozi wa Mtaa",
  church_leader: "Kiongozi wa Kanisa",
  viewer: "Mwangaliaji",
}

export const ROLE_LEVELS: Record<string, number> = {
  viewer: 0,
  church_leader: 1,
  mtaa_leader: 2,
  jimbo_admin: 3,
  super_admin: 4,
}

export function roleAtLeast(role: string | undefined | null, min: keyof typeof ROLE_LEVELS) {
  if (!role) return false
  return (ROLE_LEVELS[role] ?? -1) >= ROLE_LEVELS[min]
}

export function formatMoney(value: number | string | null | undefined) {
  const n = Number(value || 0)
  return `TSh ${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`
}

export function formatNumber(value: number | string | null | undefined) {
  return Number(value || 0).toLocaleString("en-US")
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return "—"
  const d = new Date(value)
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function timeAgo(value: string) {
  const diff = (Date.now() - new Date(value).getTime()) / 1000
  if (diff < 60) return "Sasa hivi"
  if (diff < 3600) return `Dakika ${Math.floor(diff / 60)} zilizopita`
  if (diff < 86400) return `Saa ${Math.floor(diff / 3600)} zilizopita`
  if (diff < 172800) return "Jana"
  return `Siku ${Math.floor(diff / 86400)} zilizopita`
}

export const CURRENT_YEAR = new Date().getFullYear()
export const CURRENT_MONTH = new Date().getMonth() + 1
export const YEARS = Array.from({ length: 8 }, (_, i) => CURRENT_YEAR - i)

export function toList<T>(data: T[] | { results: T[] }): T[] {
  return Array.isArray(data) ? data : data?.results ?? []
}

/** Geuza kosa la API (DRF) kuwa ujumbe unaosomeka. */
export function errorMessage(error: unknown, fallback = "Kuna tatizo. Jaribu tena."): string {
  const err = error as { response?: { status?: number; data?: unknown }; request?: unknown }
  if (err?.response) {
    const data = err.response.data
    if (err.response.status === 403) {
      const detail = (data as { detail?: string })?.detail
      return detail && !detail.startsWith("You do not") ? detail : "Huna ruhusa ya kufanya kitendo hiki."
    }
    if (typeof data === "string") return fallback
    if (data && typeof data === "object") {
      const parts: string[] = []
      for (const [key, val] of Object.entries(data as Record<string, unknown>)) {
        const msg = Array.isArray(val) ? val.join(" ") : String(val)
        parts.push(key === "detail" || key === "non_field_errors" ? msg : `${FIELD_LABELS[key] || key}: ${msg}`)
      }
      if (parts.length) return parts.join("\n")
    }
    return fallback
  }
  if (err?.request) return "Haiwezi kufikia server. Hakikisha una mtandao."
  return fallback
}

const FIELD_LABELS: Record<string, string> = {
  name: "Jina",
  username: "Jina la mtumiaji",
  password: "Nenosiri",
  email: "Barua pepe",
  jimbo: "Jimbo",
  mtaa: "Mtaa",
  church: "Kanisa",
  amount: "Kiasi",
  month: "Mwezi",
  year: "Mwaka",
  offering_type: "Aina ya toleo",
  assigned_mtaa: "Mtaa",
  assigned_church: "Kanisa",
  slug: "Kitambulisho",
  member_count: "Wanachama",
}
