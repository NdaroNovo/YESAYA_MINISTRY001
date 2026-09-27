import { useState } from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"
import Header from "./Header"

export default function MainLayout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-muted/40 print:bg-white">
      <Sidebar open={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setIsMobileSidebarOpen(false)} />
      )}
      <div className="md:ml-64 print:ml-0">
        <Header onToggleSidebar={() => setIsMobileSidebarOpen((s) => !s)} />
        <main className="mx-auto max-w-7xl p-3 pb-10 sm:p-4 md:p-6 print:p-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
