import { Select } from "@/components/ui/form"
import type { Church, Mtaa } from "@/api/types"
import { MONTHS, YEARS } from "@/lib/format"

export interface RecordFilterValues {
  mtaa: string
  church: string
  year: string
  month: string
}

export default function RecordFilters({
  value,
  onChange,
  mitaa,
  churches,
}: {
  value: RecordFilterValues
  onChange: (v: RecordFilterValues) => void
  mitaa: Mtaa[]
  churches: Church[]
}) {
  const visibleChurches = value.mtaa ? churches.filter((c) => String(c.mtaa) === value.mtaa) : churches
  return (
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-4 print:hidden">
      {mitaa.length > 1 && (
        <Select value={value.mtaa} onChange={(e) => onChange({ ...value, mtaa: e.target.value, church: "" })}>
          <option value="">Mitaa yote</option>
          {mitaa.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </Select>
      )}
      {churches.length > 1 && (
        <Select value={value.church} onChange={(e) => onChange({ ...value, church: e.target.value })}>
          <option value="">Makanisa yote</option>
          {visibleChurches.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Select>
      )}
      <Select value={value.year} onChange={(e) => onChange({ ...value, year: e.target.value })}>
        <option value="">Miaka yote</option>
        {YEARS.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </Select>
      <Select value={value.month} onChange={(e) => onChange({ ...value, month: e.target.value })}>
        <option value="">Miezi yote</option>
        {MONTHS.slice(1).map((m, i) => (
          <option key={m} value={i + 1}>{m}</option>
        ))}
      </Select>
    </div>
  )
}

/** Location ya sasa (ikiwa mtumiaji ameruhusu) kwa ajili ya kuhifadhi pamoja na taarifa. */
export function locationPayload(coords: { latitude: number | null; longitude: number | null }) {
  if (coords.latitude == null || coords.longitude == null) return {}
  return {
    latitude: Number(coords.latitude.toFixed(6)),
    longitude: Number(coords.longitude.toFixed(6)),
  }
}
