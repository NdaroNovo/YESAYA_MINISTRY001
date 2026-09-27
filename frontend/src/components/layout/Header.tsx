import { Menu, User } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { ROLE_LABELS } from "@/lib/format"
import { navItems } from "./Sidebar"

interface HeaderProps {
  onToggleSidebar: () => void
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const current = navItems.find((n) => (n.to === "/" ? pathname === "/" || pathname === "/dashboard" : pathname.startsWith(n.to)))

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-white px-3 md:h-16 md:px-6 print:hidden">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onToggleSidebar} aria-label="Fungua menyu">
          <Menu className="h-5 w-5" />
        </Button>
        <h2 className="text-base font-semibold text-navy md:text-lg">{current?.label || "YESAYA MINISTRY"}</h2>
      </div>

      <Link to="/profile" className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-muted">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-100">
          <User className="h-4 w-4 text-navy" />
        </div>
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-navy">{user?.fullName || user?.username || "—"}</p>
          <p className="text-xs text-muted-foreground">{user ? ROLE_LABELS[user.role] || user.role : ""}</p>
        </div>
      </Link>
    </header>
  )
}
