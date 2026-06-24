import { Routes, Route, Navigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { RootState } from "./store"
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

function App() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/"
        element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" replace />}
      >
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="jimbo" element={<JimboPage />} />
        <Route path="mitaa" element={<MitaaPage />} />
        <Route path="churches" element={<ChurchesPage />} />
        <Route path="evangelism" element={<EvangelismPage />} />
        <Route path="offerings" element={<OfferingsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="*" element={<div className="p-8 text-center text-muted-foreground">Page not found</div>} />
      </Route>
    </Routes>
  )
}

export default App
