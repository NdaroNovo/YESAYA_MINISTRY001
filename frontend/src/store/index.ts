import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit"

export type AuthUserRole = "super_admin" | "jimbo_admin" | "mtaa_leader" | "church_leader" | "viewer"

export interface User {
  id: number
  username: string
  email: string
  role: AuthUserRole
  fullName: string
  assignedMtaa?: number | null
  assignedChurch?: number | null
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem("ym_access_token") || null,
  isAuthenticated: !!localStorage.getItem("ym_access_token"),
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
      localStorage.setItem("ym_access_token", action.payload.token)
    },
    loginFailure: (state) => {
      state.isLoading = false
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      localStorage.removeItem("ym_access_token")
    },
  },
})

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions

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
