import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HeartHandshake, Plus } from "lucide-react"
import api from "@/api/axios"

interface EvangelismRecord {
  id: number
  church: number
  month: number
  year: number
  baptized: number
  converted: number
  visited: number
  supported: number
  comments: string
}

const MONTHS = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export default function EvangelismPage() {
  const [records, setRecords] = useState<EvangelismRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get("/evangelism/")
      .then((res) => setRecords(res.data.results || res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-muted-foreground">Inapakia...</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Evangelism</h1>
          <p className="text-sm text-muted-foreground">Taarifa za uinjilisti</p>
        </div>
        <Button variant="gold">
          <Plus className="w-4 h-4 mr-2" /> Ingiza Taarifa
        </Button>
      </div>

      {records.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border rounded-lg overflow-hidden">
            <thead className="bg-navy text-white">
              <tr>
                <th className="px-4 py-3 text-left">Kipindi</th>
                <th className="px-4 py-3 text-right">Waliobatizwa</th>
                <th className="px-4 py-3 text-right">Waliokombolewa</th>
                <th className="px-4 py-3 text-right">Waliotembelewa</th>
                <th className="px-4 py-3 text-right">Waliosaidika</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="border-b hover:bg-muted/50">
                  <td className="px-4 py-3">{MONTHS[r.month]} {r.year}</td>
                  <td className="px-4 py-3 text-right font-medium">{r.baptized}</td>
                  <td className="px-4 py-3 text-right font-medium">{r.converted}</td>
                  <td className="px-4 py-3 text-right font-medium">{r.visited}</td>
                  <td className="px-4 py-3 text-right font-medium">{r.supported}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <HeartHandshake className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>Hakuna taarifa za uinjilisti bado.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
