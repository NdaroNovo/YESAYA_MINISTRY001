import { useCallback, useEffect, useState } from "react"

export interface LocationState {
  latitude: number | null
  longitude: number | null
  accuracy: number | null
  enabled: boolean
  loading: boolean
  error: string | null
}

const LOCATION_KEY = "ym_use_location"
const LOCATION_COORDS_KEY = "ym_last_location"

function getStoredPreference(): boolean {
  const stored = localStorage.getItem(LOCATION_KEY)
  return stored === null ? true : stored === "true"
}

export function getStoredLocation(): { latitude: number | null; longitude: number | null } {
  try {
    const stored = localStorage.getItem(LOCATION_COORDS_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return { latitude: parsed.latitude ?? null, longitude: parsed.longitude ?? null }
    }
  } catch {
    // ignore
  }
  return { latitude: null, longitude: null }
}

export function useLocation() {
  const [state, setState] = useState<LocationState>(() => ({
    latitude: null,
    longitude: null,
    accuracy: null,
    enabled: getStoredPreference(),
    loading: false,
    error: null,
  }))

  const capture = useCallback((): Promise<{ latitude: number | null; longitude: number | null }> => {
    return new Promise((resolve) => {
      if (!state.enabled || !navigator.geolocation) {
        setState((s) => ({ ...s, loading: false, error: null }))
        resolve({ latitude: null, longitude: null })
        return
      }

      setState((s) => ({ ...s, loading: true, error: null }))

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          }
          localStorage.setItem(LOCATION_COORDS_KEY, JSON.stringify(coords))
          setState((s) => ({
            ...s,
            ...coords,
            loading: false,
            error: null,
          }))
          resolve({ latitude: coords.latitude, longitude: coords.longitude })
        },
        (err) => {
          setState((s) => ({
            ...s,
            loading: false,
            error: err.message || "Imeshindwa kupata location",
          }))
          resolve({ latitude: null, longitude: null })
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      )
    })
  }, [state.enabled])

  const toggle = useCallback(() => {
    setState((s) => {
      const next = !s.enabled
      localStorage.setItem(LOCATION_KEY, String(next))
      return { ...s, enabled: next, error: null }
    })
  }, [])

  useEffect(() => {
    if (state.enabled) {
      capture()
    }
  }, [state.enabled, capture])

  return { ...state, capture, toggle }
}
