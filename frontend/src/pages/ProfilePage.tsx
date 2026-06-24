import { useSelector } from "react-redux"
import { RootState } from "@/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserCircle } from "lucide-react"

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  jimbo_admin: "Jimbo Admin",
  mtaa_leader: "Mtaa Leader",
  church_leader: "Church Leader",
  viewer: "Viewer",
}

export default function ProfilePage() {
  const { user } = useSelector((state: RootState) => state.auth)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Profile</h1>
        <p className="text-sm text-muted-foreground">Taarifa za akaunti yako</p>
      </div>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserCircle className="w-5 h-5 text-gold" />
            Taarifa za Mtumiaji
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Jina kamili</p>
            <p className="font-medium text-navy">{user?.fullName || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Username</p>
            <p className="font-medium text-navy">{user?.username || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium text-navy">{user?.email || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Jukumu</p>
            <p className="font-medium text-navy">{user?.role ? ROLE_LABELS[user.role] || user.role : "—"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
