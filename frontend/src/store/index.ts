import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { ACCESS_KEY, USER_KEY, clearSession } from "@/api/axios"

export type AuthUserRole = "super_admin" | "jimbo_admin" | "mtaa_leader" | "church_leader" | "viewer"

export interface User {
  id: number
  username: string
  email: string
  role: AuthUserRole
  fullName: string
  phone?: string
  assignedMtaa?: number | null
  assignedChurch?: number | null
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

function loadUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

const initialState: AuthState = {
  user: loadUser(),
  token: localStorage.getItem(ACCESS_KEY) || null,
  isAuthenticated: !!localStorage.getItem(ACCESS_KEY),
  isLoading: false,
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
      state.isLoading = false
      localStorage.setItem(ACCESS_KEY, action.payload.token)
      localStorage.setItem(USER_KEY, JSON.stringify(action.payload.user))
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      localStorage.setItem(USER_KEY, JSON.stringify(action.payload))
    },
    loginFailure: (state) => {
      state.isLoading = false
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      clearSession()
    },
  },
})

export const { loginStart, loginSuccess, setUser, loginFailure, logout } = authSlice.actions

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["auth/loginSuccess", "auth/logout"],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
