import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Plus } from "lucide-react"
import api from "@/api/axios"

interface Church {
  id: number
  name: string
  mtaa: number
  pastor_name: string
  phone: string
  member_count: number
  is_active: boolean
}

export default function ChurchesPage() {
  const [churches, setChurches] = useState<Church[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get("/churches/")
      .then((res) => setChurches(res.data.results || res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-muted-foreground">Inapakia...</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Church Management</h1>
          <p className="text-sm text-muted-foreground">Usimamizi wa Makanisa yote</p>
        </div>
        <Button variant="gold">
          <Plus className="w-4 h-4 mr-2" /> Ongeza Kanisa
        </Button>
      </div>

      {churches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {churches.map((c) => (
            <Card key={c.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4 text-gold" />
                  {c.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <p><span className="text-muted-foreground">Mchungaji:</span> {c.pastor_name || "—"}</p>
                <p><span className="text-muted-foreground">Simu:</span> {c.phone || "—"}</p>
                <p><span className="text-muted-foreground">Wanachama:</span> {c.member_count}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>Hakuna Makanisa bado. Ongeza kupitia Django Admin au bonyeza "Ongeza Kanisa".</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
