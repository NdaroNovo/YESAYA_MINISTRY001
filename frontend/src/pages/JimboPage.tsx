import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Church, Plus } from "lucide-react"
import api from "@/api/axios"

interface Jimbo {
  id: number
  name: string
  district: string
  region: string
  phone: string
  email: string
  created_at: string
}

export default function JimboPage() {
  const [jimbo, setJimbo] = useState<Jimbo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get("/jimbo/")
      .then((res) => {
        const results = res.data.results || res.data
        if (results.length > 0) setJimbo(results[0])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-muted-foreground">Inapakia...</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Jimbo Information</h1>
          <p className="text-sm text-muted-foreground">Taarifa za Jimbo</p>
        </div>
        {!jimbo && (
          <Button variant="gold">
            <Plus className="w-4 h-4 mr-2" /> Ongeza Jimbo
          </Button>
        )}
      </div>

      {jimbo ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Church className="w-5 h-5 text-gold" />
              {jimbo.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Wilaya</p>
              <p className="font-medium">{jimbo.district || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Mkoa</p>
              <p className="font-medium">{jimbo.region || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Simu</p>
              <p className="font-medium">{jimbo.phone || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Barua pepe</p>
              <p className="font-medium">{jimbo.email || "—"}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <Church className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>Hakuna taarifa za Jimbo bado. Ongeza kupitia Django Admin.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
