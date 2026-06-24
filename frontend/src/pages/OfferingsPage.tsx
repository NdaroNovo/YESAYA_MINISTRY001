import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Banknote, Plus } from "lucide-react"
import api from "@/api/axios"

interface Offering {
  id: number
  church: number
  offering_type: number
  amount: string
  church_share: string
  field_share: string
  month: number
  year: number
  notes: string
}

const MONTHS = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export default function OfferingsPage() {
  const [offerings, setOfferings] = useState<Offering[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get("/offerings/")
      .then((res) => setOfferings(res.data.results || res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-muted-foreground">Inapakia...</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Offerings</h1>
          <p className="text-sm text-muted-foreground">Usimamizi wa Matoleo</p>
        </div>
        <Button variant="gold">
          <Plus className="w-4 h-4 mr-2" /> Ingiza Matoleo
        </Button>
      </div>

      {offerings.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border rounded-lg overflow-hidden">
            <thead className="bg-navy text-white">
              <tr>
                <th className="px-4 py-3 text-left">Kipindi</th>
                <th className="px-4 py-3 text-right">Kiasi (TSh)</th>
                <th className="px-4 py-3 text-right">Kanisa Share</th>
                <th className="px-4 py-3 text-right">Jimbo Share</th>
              </tr>
            </thead>
            <tbody>
              {offerings.map((o) => (
                <tr key={o.id} className="border-b hover:bg-muted/50">
                  <td className="px-4 py-3">{MONTHS[o.month]} {o.year}</td>
                  <td className="px-4 py-3 text-right font-medium">{Number(o.amount).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">{Number(o.church_share).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">{Number(o.field_share).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <Banknote className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>Hakuna matoleo bado.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
