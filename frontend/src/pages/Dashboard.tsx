import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  MapPin,
  Church,
  Users,
  Banknote,
  Droplets,
  HeartHandshake,
  Activity,
  CheckCircle2,
  Circle,
} from "lucide-react"
import api from "@/api/axios"
import type { DashboardStats } from "@/api/types"
import { Loading, StatCard } from "@/components/PageParts"
import { FormError } from "@/components/ui/form"
import { useAuth } from "@/hooks/useAuth"
import { MONTHS, MONTHS_SHORT, errorMessage, formatMoney, formatNumber, timeAgo } from "@/lib/format"

export default function Dashboard() {
  const { user, can } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api
      .get<DashboardStats>("/dashboard-stats/")
      .then((res) => setStats(res.data))
      .catch((e) => setError(errorMessage(e, "Imeshindwa kupakia takwimu.")))
  }, [])

  if (error) return <FormError message={error} />
  if (!stats) return <Loading />

  const chartData = stats.monthly.map((m) => ({ ...m, name: MONTHS_SHORT[m.month] }))
  const hasOfferings = stats.monthly.some((m) => m.offerings > 0)

  const setupSteps = [
    { done: stats.total_jimbo > 0, label: "Sajili Jimbo", to: "/jimbo" },
    { done: stats.total_mitaa > 0, label: "Ongeza Mitaa", to: "/mitaa" },
    { done: stats.total_churches > 0, label: "Ongeza Makanisa", to: "/churches" },
    { done: Number(stats.total_offerings) > 0, label: "Ingiza Matoleo ya kwanza", to: "/offerings" },
  ]
  const setupIncomplete = can("jimbo_admin") && setupSteps.some((s) => !s.done)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-navy">Karibu, {user?.fullName || user?.username}</h1>
        <p className="text-sm text-muted-foreground">
          Muhtasari wa YESAYA MINISTRY — {MONTHS[stats.current_month]} {stats.year}
        </p>
      </div>

      {setupIncomplete && (
        <Card className="border-gold-300 bg-gold-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Hatua za kuanza kutumia mfumo</CardTitle>
            <CardDescription>Ingiza taarifa halisi za huduma yako kwa mpangilio huu.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {setupSteps.map((s, i) => (
              <Link
                key={s.to}
                to={s.to}
                className="flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm hover:shadow-sm"
              >
                {s.done ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                )}
                <span className={s.done ? "text-muted-foreground line-through" : "font-medium text-navy"}>
                  {i + 1}. {s.label}
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard title="Mitaa" value={formatNumber(stats.total_mitaa)} icon={MapPin} color="bg-blue-100 text-blue-600" />
        <StatCard title="Makanisa" value={formatNumber(stats.total_churches)} icon={Church} color="bg-gold-100 text-gold-600" />
        <StatCard title="Wanachama" value={formatNumber(stats.total_members)} icon={Users} color="bg-green-100 text-green-600" />
        <StatCard
          title={`Matoleo ${MONTHS[stats.current_month]}`}
          value={formatMoney(stats.month_offerings)}
          icon={Banknote}
          color="bg-purple-100 text-purple-600"
          note={`Mwaka ${stats.year}: ${formatMoney(stats.year_offerings)}`}
        />
        <StatCard title="Waliobatizwa" value={formatNumber(stats.total_baptized)} icon={Droplets} color="bg-cyan-100 text-cyan-600" note="Jumla ya kumbukumbu zote" />
        <StatCard title="Waliokombolewa" value={formatNumber(stats.total_converted)} icon={HeartHandshake} color="bg-pink-100 text-pink-600" note="Jumla ya kumbukumbu zote" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Matoleo kwa mwezi — {stats.year}</CardTitle>
            <CardDescription>
              Jumla: {formatMoney(stats.year_offerings)} · Kanisa: {formatMoney(stats.church_share)} · Jimbo:{" "}
              {formatMoney(stats.field_share)} (muda wote)
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            {hasOfferings ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ left: 0, right: 8, top: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" fontSize={11} tickLine={false} />
                    <YAxis
                      fontSize={11}
                      tickLine={false}
                      width={48}
                      tickFormatter={(v) => (v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `${Math.round(v / 1e3)}K` : v)}
                    />
                    <Tooltip formatter={(v) => formatMoney(Number(v))} />
                    <Bar dataKey="offerings" name="Matoleo" fill="#d4af37" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="py-12 text-center text-sm text-muted-foreground">
                Hakuna matoleo yaliyoingizwa kwa mwaka {stats.year} bado.
              </p>
            )}
            {stats.offerings_by_type.length > 0 && (
              <div className="mt-4 space-y-2 px-2 sm:px-0">
                {stats.offerings_by_type.map((t) => (
                  <div key={t.name} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t.name}</span>
                    <span className="font-medium">{formatMoney(t.total)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-4 w-4 text-gold" />
              Shughuli za hivi karibuni
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recent_activity.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Hakuna shughuli bado.</p>
            ) : (
              <div className="space-y-2">
                {stats.recent_activity.map((a) => (
                  <div key={a.id} className="rounded-lg bg-muted/50 p-3">
                    <p className="text-sm font-medium text-navy">{a.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.user_name || "Mfumo"} · {timeAgo(a.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {can("church_leader") && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Link to="/offerings?new=1" className="rounded-md bg-gold px-4 py-3 text-center text-sm font-medium text-white hover:bg-gold-600">
            Ingiza Matoleo
          </Link>
          <Link to="/evangelism?new=1" className="rounded-md bg-navy px-4 py-3 text-center text-sm font-medium text-white hover:bg-navy-700">
            Ingiza Uinjilisti
          </Link>
          <Link to="/reports" className="rounded-md bg-green-600 px-4 py-3 text-center text-sm font-medium text-white hover:bg-green-700">
            Tengeneza Ripoti
          </Link>
          <Link to="/churches" className="rounded-md border bg-white px-4 py-3 text-center text-sm font-medium text-navy hover:bg-muted">
            Makanisa
          </Link>
        </div>
      )}
    </div>
  )
}
