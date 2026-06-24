import { MapPin, MapPinOff, RefreshCw } from "lucide-react"
import { useLocation } from "@/hooks/useLocation"

export default function LocationCapture() {
  const { enabled, latitude, longitude, accuracy, loading, error, capture, toggle } = useLocation()

  return (
    <div className="rounded-lg border border-border bg-card p-4 text-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className={`w-4 h-4 ${enabled ? "text-green-600" : "text-muted-foreground"}`} />
          <span className="font-medium text-navy">Location</span>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-muted-foreground">Tumia location</span>
          <input
            type="checkbox"
            checked={enabled}
            onChange={toggle}
            className="rounded border-gray-300"
          />
        </label>
      </div>

      {enabled && (
        <div className="mt-3 space-y-1">
          {loading ? (
            <p className="text-muted-foreground flex items-center gap-2">
              <RefreshCw className="w-3 h-3 animate-spin" />
              Inapata location...
            </p>
          ) : error ? (
            <div className="flex items-start gap-2 text-red-500">
              <MapPinOff className="w-4 h-4 mt-0.5" />
              <div>
                <p>{error}</p>
                <button
                  onClick={capture}
                  className="text-xs underline text-navy mt-1"
                >
                  Jaribu tena
                </button>
              </div>
            </div>
          ) : latitude && longitude ? (
            <div className="text-green-700">
              <p>Latitude: {latitude.toFixed(6)}</p>
              <p>Longitude: {longitude.toFixed(6)}</p>
              {accuracy && <p className="text-muted-foreground">Sahihi: {Math.round(accuracy)} m</p>}
            </div>
          ) : (
            <p className="text-muted-foreground">Location haijapatikana.</p>
          )}
        </div>
      )}

      {!enabled && (
        <p className="mt-3 text-muted-foreground">
          Location imezimwa. Taarifa zitaokolewa bila maelezo ya eneo.
        </p>
      )}
    </div>
  )
}
