import api, { ACCESS_KEY, REFRESH_KEY, clearSession } from "@/api/axios"
import type { Role } from "@/api/types"

export interface LoginPayload {
  username: string
  password: string
}

export interface LoginResponse {
  access: string
  refresh: string
  user: {
    id: number
    username: string
    email: string
    role: Role
    full_name: string
    phone: string
    assigned_mtaa: number | null
    assigned_church: number | null
    use_location: boolean
  }
}

export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  const { data } = await api.post<LoginResponse>("/auth/login/", payload)
  localStorage.setItem(ACCESS_KEY, data.access)
  localStorage.setItem(REFRESH_KEY, data.refresh)
  return data
}

export const logout = () => {
  clearSession()
}
