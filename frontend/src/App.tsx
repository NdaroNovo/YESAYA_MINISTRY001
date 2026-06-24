import { Routes, Route, Navigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { RootState } from "./store"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
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
        <Route path="*" element={<div>Page not found</div>} />
      </Route>
    </Routes>
  )
}

export default App
