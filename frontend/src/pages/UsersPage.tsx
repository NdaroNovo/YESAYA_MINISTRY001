import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Plus } from "lucide-react"
import api from "@/api/axios"

interface UserItem {
  id: number
  username: string
  email: string
  full_name: string
  role: string
  is_active: boolean
}

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  jimbo_admin: "Jimbo Admin",
  mtaa_leader: "Mtaa Leader",
  church_leader: "Church Leader",
  viewer: "Viewer",
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get("/users/")
      .then((res) => setUsers(res.data.results || res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-muted-foreground">Inapakia...</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Users</h1>
          <p className="text-sm text-muted-foreground">Usimamizi wa Watumiaji</p>
        </div>
        <Button variant="gold">
          <Plus className="w-4 h-4 mr-2" /> Ongeza Mtumiaji
        </Button>
      </div>

      {users.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border rounded-lg overflow-hidden">
            <thead className="bg-navy text-white">
              <tr>
                <th className="px-4 py-3 text-left">Jina</th>
                <th className="px-4 py-3 text-left">Username</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Jukumu</th>
                <th className="px-4 py-3 text-center">Hali</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b hover:bg-muted/50">
                  <td className="px-4 py-3 font-medium">{u.full_name || "—"}</td>
                  <td className="px-4 py-3">{u.username}</td>
                  <td className="px-4 py-3">{u.email || "—"}</td>
                  <td className="px-4 py-3">{ROLE_LABELS[u.role] || u.role}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${u.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {u.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>Hakuna watumiaji wengine bado.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
