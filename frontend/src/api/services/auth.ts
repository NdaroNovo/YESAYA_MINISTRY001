import api from "@/api/axios"

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
    role: string
    full_name: string
    assigned_mtaa: number | null
    assigned_church: number | null
  }
}

export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  const { data } = await api.post("/auth/login/", payload)
  api.defaults.headers.Authorization = `Bearer ${data.access}`
  return data
}

export const logout = () => {
  localStorage.removeItem("ym_access_token")
  delete api.defaults.headers.Authorization
}
