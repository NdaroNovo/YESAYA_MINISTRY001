import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Settings</h1>
        <p className="text-sm text-muted-foreground">Mipangilio ya mfumo</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="w-5 h-5 text-gold" />
            Mipangilio ya Jumla
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div>
              <p className="font-medium text-navy">Jina la Jimbo</p>
              <p className="text-sm text-muted-foreground">Badilisha jina la Jimbo linaloonekana kwenye mfumo</p>
            </div>
            <span className="text-sm text-muted-foreground">Pitia Django Admin</span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div>
              <p className="font-medium text-navy">Aina za Matoleo</p>
              <p className="text-sm text-muted-foreground">Ongeza au badilisha aina za matoleo na asilimia</p>
            </div>
            <span className="text-sm text-muted-foreground">Pitia Django Admin</span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div>
              <p className="font-medium text-navy">Backup</p>
              <p className="text-sm text-muted-foreground">Hifadhi nakala ya database</p>
            </div>
            <span className="text-sm text-muted-foreground">Itakuja</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
