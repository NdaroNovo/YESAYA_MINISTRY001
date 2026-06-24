import { Card, CardContent } from "@/components/ui/card"
import { ClipboardList } from "lucide-react"

export default function AuditLogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Audit Logs</h1>
        <p className="text-sm text-muted-foreground">Kumbukumbu za vitendo vyote vya mfumo</p>
      </div>

      <Card>
        <CardContent className="p-12 text-center text-muted-foreground">
          <ClipboardList className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
          <p>Kumbukumbu za mfumo zinapatikana kwenye Django Admin.</p>
          <a
            href="http://localhost:8000/admin/core/auditlog/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 text-sm text-gold hover:underline"
          >
            Fungua Django Admin →
          </a>
        </CardContent>
      </Card>
    </div>
  )
}
