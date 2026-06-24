import { MapPin } from "lucide-react"

interface LocationDisplayProps {
  latitude: number | string | null | undefined
  longitude: number | string | null | undefined
  accuracy?: number | string | null | undefined
  capturedAt?: string | null | undefined
}

export default function LocationDisplay({
  latitude,
  longitude,
  accuracy,
  capturedAt,
}: LocationDisplayProps) {
  const lat = latitude !== null && latitude !== undefined ? Number(latitude) : null
  const lng = longitude !== null && longitude !== undefined ? Number(longitude) : null

  if (lat === null || lng === null || Number.isNaN(lat) || Number.isNaN(lng)) {
    return (
      <span className="inline-flex items-center gap-1 text-muted-foreground text-xs">
        <MapPin className="w-3 h-3" />
        Location haijashirikishwa
      </span>
    )
  }

  const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`

  return (
    <div className="text-xs space-y-0.5">
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-blue-600 hover:underline"
      >
        <MapPin className="w-3 h-3" />
        {lat.toFixed(6)}, {lng.toFixed(6)}
      </a>
      {accuracy && <p className="text-muted-foreground">Sahihi: {Math.round(Number(accuracy))} m</p>}
      {capturedAt && <p className="text-muted-foreground">Imekamatka: {new Date(capturedAt).toLocaleString("sw")}</p>}
    </div>
  )
}
