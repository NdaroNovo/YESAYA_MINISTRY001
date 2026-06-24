import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  MapPin,
  Church,
  Users,
  Banknote,
  Droplets,
  HeartHandshake,
  ArrowUpRight,
  Activity,
} from "lucide-react"

const stats = [
  { title: "Jumla ya Mitaa", value: 12, icon: MapPin, color: "bg-blue-100 text-blue-600" },
  { title: "Jumla ya Makanisa", value: 48, icon: Church, color: "bg-gold-100 text-gold-600" },
  { title: "Wanachama", value: 1240, icon: Users, color: "bg-green-100 text-green-600" },
  { title: "Matoleo (Mwezi)", value: "TSh 4.2M", icon: Banknote, color: "bg-purple-100 text-purple-600" },
  { title: "Waliobatizwa", value: 86, icon: Droplets, color: "bg-cyan-100 text-cyan-600" },
  { title: "Waliokombolewa", value: 134, icon: HeartHandshake, color: "bg-pink-100 text-pink-600" },
]

const recentActivities = [
  { action: "Mtaa mpya umeongezwa", target: "Mtaa wa Kijitonyama", time: "Dakika 5 zilizopita" },
  { action: "Ripoti ya matoleo imehifadhiwa", target: "Kanisa la YESAYA", time: "Saa 1 iliyopita" },
  { action: "Mtumiaji mpya ameundwa", target: "Mchungaji Joseph", time: "Saa 3 zilizopita" },
  { action: "Taarifa ya uinjilisti imetolewa", target: "Mwezi Juni", time: "Jana" },
]

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Muhtasari wa mfumo wa YESAYA MINISTRY
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border border-border hover:shadow-sm transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold text-navy mt-1">{stat.value}</p>
                </div>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs text-green-600">
                <ArrowUpRight className="w-3 h-3" />
                <span>+12% mwezi huu</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="w-4 h-4 text-gold" />
              Shughuli za hivi karibuni
            </CardTitle>
            <CardDescription>
              Orodha ya vitendo vya hivi karibuni katika mfumo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-navy">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.target}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Vituo vya Haraka</CardTitle>
            <CardDescription>
              Fikia sehemu muhimu za mfumo haraka
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <button className="w-full text-left px-4 py-3 rounded-md bg-navy text-white text-sm hover:bg-navy-700 transition-colors">
              Sajili Mtaa Mpya
            </button>
            <button className="w-full text-left px-4 py-3 rounded-md bg-gold text-white text-sm hover:bg-gold-600 transition-colors">
              Ingiza Matoleo
            </button>
            <button className="w-full text-left px-4 py-3 rounded-md bg-green-600 text-white text-sm hover:bg-green-700 transition-colors">
              Tengeneza Ripoti
            </button>
            <button className="w-full text-left px-4 py-3 rounded-md bg-white border text-navy text-sm hover:bg-muted transition-colors">
              Ongeza Mtumiaji
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
