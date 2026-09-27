import { useEffect } from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { RootState, setUser } from "./store"
import api from "./api/axios"
import type { ApiUser } from "./api/types"
import { roleAtLeast } from "./lib/format"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import JimboPage from "./pages/JimboPage"
import MitaaPage from "./pages/MitaaPage"
import ChurchesPage from "./pages/ChurchesPage"
import EvangelismPage from "./pages/EvangelismPage"
import OfferingsPage from "./pages/OfferingsPage"
import ReportsPage from "./pages/ReportsPage"
import UsersPage from "./pages/UsersPage"
import AuditLogsPage from "./pages/AuditLogsPage"
import SettingsPage from "./pages/SettingsPage"
import ProfilePage from "./pages/ProfilePage"
import MainLayout from "./components/layout/MainLayout"
import { Toaster } from "./components/Toast"

function AdminOnly({ children }: { children: JSX.Element }) {
  const role = useSelector((state: RootState) => state.auth.user?.role)
  if (role && !roleAtLeast(role, "jimbo_admin")) return <Navigate to="/" replace />
  return children
}

function App() {
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)

  // Hakikisha taarifa za mtumiaji ni za sasa (role inaweza kuwa imebadilishwa na admin)
  useEffect(() => {
    if (!isAuthenticated) return
    api
      .get<ApiUser>("/users/me/")
      .then(({ data }) =>
        dispatch(
          setUser({
            id: data.id,
            username: data.username,
            email: data.email,
            role: data.role,
            fullName: data.full_name,
            phone: data.phone,
            assignedMtaa: data.assigned_mtaa,
            assignedChurch: data.assigned_church,
          })
        )
      )
      .catch(() => {})
  }, [isAuthenticated, dispatch])

  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/" element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" replace />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="jimbo" element={<JimboPage />} />
          <Route path="mitaa" element={<MitaaPage />} />
          <Route path="churches" element={<ChurchesPage />} />
          <Route path="evangelism" element={<EvangelismPage />} />
          <Route path="offerings" element={<OfferingsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="users" element={<AdminOnly><UsersPage /></AdminOnly>} />
          <Route path="audit-logs" element={<AdminOnly><AuditLogsPage /></AdminOnly>} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="*" element={<div className="p-8 text-center text-muted-foreground">Ukurasa haupatikani</div>} />
        </Route>
      </Routes>
    </>
  )
}

export default App
