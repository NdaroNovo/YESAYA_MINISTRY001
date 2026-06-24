import axios from "axios"
import { getStoredLocation } from "@/hooks/useLocation"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("ym_access_token")
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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("ym_access_token")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  }
)

export default api
