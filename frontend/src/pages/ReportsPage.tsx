import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download } from "lucide-react"

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Reports</h1>
          <p className="text-sm text-muted-foreground">Ripoti za mfumo</p>
        </div>
        <Button variant="gold">
          <Download className="w-4 h-4 mr-2" /> Tengeneza Ripoti
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <FileText className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="font-semibold text-navy">Ripoti ya Matoleo</h3>
            <p className="text-sm text-muted-foreground mt-1">Matoleo yote kwa mwezi/mwaka</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <FileText className="w-8 h-8 text-green-600 mb-3" />
            <h3 className="font-semibold text-navy">Ripoti ya Uinjilisti</h3>
            <p className="text-sm text-muted-foreground mt-1">Takwimu za uinjilisti kwa kipindi</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <FileText className="w-8 h-8 text-purple-600 mb-3" />
            <h3 className="font-semibold text-navy">Ripoti ya Makanisa</h3>
            <p className="text-sm text-muted-foreground mt-1">Orodha na takwimu za makanisa</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <FileText className="w-8 h-8 text-gold mb-3" />
            <h3 className="font-semibold text-navy">Ripoti ya Jumla</h3>
            <p className="text-sm text-muted-foreground mt-1">Muhtasari wa mfumo wote</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
