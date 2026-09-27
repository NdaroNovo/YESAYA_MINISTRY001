import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  Church,
  MapPin,
  Users,
  HeartHandshake,
  Banknote,
  FileText,
  Settings,
  ClipboardList,
  UserCircle,
  LogOut,
  Building2,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useDispatch } from "react-redux"
import { logout } from "@/store"
import { useAuth } from "@/hooks/useAuth"
import type { ROLE_LEVELS } from "@/lib/format"

type MinRole = keyof typeof ROLE_LEVELS

export const navItems: { to: string; label: string; icon: typeof LayoutDashboard; min: MinRole }[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, min: "viewer" },
  { to: "/jimbo", label: "Jimbo", icon: Building2, min: "viewer" },
  { to: "/mitaa", label: "Mitaa", icon: MapPin, min: "viewer" },
  { to: "/churches", label: "Makanisa", icon: Church, min: "viewer" },
  { to: "/evangelism", label: "Uinjilisti", icon: HeartHandshake, min: "viewer" },
  { to: "/offerings", label: "Matoleo", icon: Banknote, min: "viewer" },
  { to: "/reports", label: "Ripoti", icon: FileText, min: "viewer" },
  { to: "/users", label: "Watumiaji", icon: Users, min: "jimbo_admin" },
  { to: "/audit-logs", label: "Kumbukumbu (Audit)", icon: ClipboardList, min: "jimbo_admin" },
  { to: "/settings", label: "Mipangilio", icon: Settings, min: "viewer" },
  { to: "/profile", label: "Wasifu Wangu", icon: UserCircle, min: "viewer" },
]

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dispatch = useDispatch()
  const { can } = useAuth()

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-full w-72 flex-col bg-navy text-white transition-transform duration-200 md:w-64 md:translate-x-0 print:hidden",
        open ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex items-center gap-3 border-b border-navy-700 px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold font-bold text-navy">YM</div>
        <div className="flex-1">
          <h1 className="text-sm font-bold leading-tight">YESAYA MINISTRY</h1>
          <p className="text-xs text-navy-300">Mfumo wa Usimamizi</p>
        </div>
        <button onClick={onClose} className="rounded-md p-1 text-navy-200 hover:bg-navy-700 md:hidden" aria-label="Funga menyu">
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems
          .filter((item) => can(item.min))
          .map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                  isActive ? "bg-gold font-medium text-navy" : "text-navy-100 hover:bg-navy-700 hover:text-white"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
      </nav>

      <div className="border-t border-navy-700 p-4">
        <button
          onClick={() => dispatch(logout())}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-navy-100 transition-colors hover:bg-navy-700 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Toka (Logout)
        </button>
      </div>
    </aside>
  )
}
