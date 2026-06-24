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
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useDispatch } from "react-redux"
import { logout } from "@/store"

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/jimbo", label: "Jimbo Information", icon: Church },
  { to: "/mitaa", label: "Mitaa Management", icon: MapPin },
  { to: "/churches", label: "Church Management", icon: Users },
  { to: "/evangelism", label: "Evangelism", icon: HeartHandshake },
  { to: "/offerings", label: "Offerings", icon: Banknote },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/users", label: "Users", icon: Users },
  { to: "/audit-logs", label: "Audit Logs", icon: ClipboardList },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/profile", label: "Profile", icon: UserCircle },
]

export default function Sidebar() {
  const dispatch = useDispatch()

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen bg-navy text-white border-r border-navy-700 fixed left-0 top-0">
      <div className="flex items-center gap-3 px-6 py-6 border-b border-navy-700">
        <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center text-navy font-bold">
          YM
        </div>
        <div>
          <h1 className="text-sm font-bold leading-tight">YESAYA MINISTRY</h1>
          <p className="text-xs text-navy-300">Management System</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors",
                isActive
                  ? "bg-gold text-navy font-medium"
                  : "text-navy-100 hover:bg-navy-700 hover:text-white"
              )
            }
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-navy-700">
        <button
          onClick={() => dispatch(logout())}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-md text-sm text-navy-100 hover:bg-navy-700 hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  )
}
