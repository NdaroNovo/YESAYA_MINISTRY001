import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Plus } from "lucide-react"
import api from "@/api/axios"

interface Mtaa {
  id: number
  name: string
  jimbo: number
  leader_name: string
  phone: string
  location: string
  is_active: boolean
}

export default function MitaaPage() {
  const [mitaa, setMitaa] = useState<Mtaa[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get("/mitaa/")
      .then((res) => setMitaa(res.data.results || res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-muted-foreground">Inapakia...</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Mitaa Management</h1>
          <p className="text-sm text-muted-foreground">Usimamizi wa Mitaa yote</p>
        </div>
        <Button variant="gold">
          <Plus className="w-4 h-4 mr-2" /> Ongeza Mtaa
        </Button>
      </div>

      {mitaa.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mitaa.map((m) => (
            <Card key={m.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  {m.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <p><span className="text-muted-foreground">Kiongozi:</span> {m.leader_name || "—"}</p>
                <p><span className="text-muted-foreground">Simu:</span> {m.phone || "—"}</p>
                <p><span className="text-muted-foreground">Eneo:</span> {m.location || "—"}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>Hakuna Mitaa bado. Ongeza kupitia Django Admin au bonyeza "Ongeza Mtaa".</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
