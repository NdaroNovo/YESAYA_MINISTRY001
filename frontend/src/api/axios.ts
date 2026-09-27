import axios, { AxiosError, InternalAxiosRequestConfig } from "axios"
import { getStoredLocation } from "@/hooks/useLocation"

export const ACCESS_KEY = "ym_access_token"
export const REFRESH_KEY = "ym_refresh_token"
export const USER_KEY = "ym_user"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_KEY)
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    const { latitude, longitude } = getStoredLocation()
    if (latitude && longitude && config.headers) {
      config.headers["X-Location-Lat"] = String(latitude)
      config.headers["X-Location-Lng"] = String(longitude)
    }
    return config
  },
  (error) => Promise.reject(error)
)

export function clearSession() {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem(USER_KEY)
}

let refreshing: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  const refresh = localStorage.getItem(REFRESH_KEY)
  if (!refresh) throw new Error("no refresh token")
  const { data } = await axios.post(`${api.defaults.baseURL}/auth/refresh/`, { refresh })
  localStorage.setItem(ACCESS_KEY, data.access)
  if (data.refresh) localStorage.setItem(REFRESH_KEY, data.refresh)
  return data.access
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined
    const isAuthCall = original?.url?.includes("/auth/")
    if (error.response?.status === 401 && original && !original._retry && !isAuthCall) {
      original._retry = true
      try {
        refreshing = refreshing || refreshAccessToken()
        const token = await refreshing
        refreshing = null
        original.headers.Authorization = `Bearer ${token}`
        return api(original)
      } catch {
        refreshing = null
        clearSession()
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  }
)

export default api
