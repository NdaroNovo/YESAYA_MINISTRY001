import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Field, FormError, Select } from "@/components/ui/form"
import { Loading, PageHeader } from "@/components/PageParts"
import { Download, FileText, Printer } from "lucide-react"
import api from "@/api/axios"
import type { Church, EvangelismRecord, Jimbo, Mtaa, Offering, OfferingType } from "@/api/types"
import { useList } from "@/hooks/useApi"
import { useAuth } from "@/hooks/useAuth"
import { CURRENT_YEAR, MONTHS, YEARS, errorMessage, formatMoney, formatNumber, toList } from "@/lib/format"

type Level = "jimbo" | "mtaa" | "church"

const LEVEL_LABELS: Record<Level, string> = { jimbo: "Jimbo", mtaa: "Mtaa", church: "Kanisa" }

interface ReportData {
  title: string
  period: string
  evangelism: EvangelismRecord[]
  offerings: Offering[]
}

export default function ReportsPage() {
  const { user } = useAuth()
  const { data: jimbos } = useList<Jimbo>("/jimbo/")
  const { data: mitaa } = useList<Mtaa>("/mitaa/")
  const { data: churches } = useList<Church>("/churches/")
  const { data: types } = useList<OfferingType>("/offering-types/")

  const defaultLevel: Level = user?.role === "church_leader" ? "church" : user?.role === "mtaa_leader" ? "mtaa" : "jimbo"
  const [level, setLevel] = useState<Level>(defaultLevel)
  const [entity, setEntity] = useState("")
  const [year, setYear] = useState(String(CURRENT_YEAR))
  const [month, setMonth] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [report, setReport] = useState<ReportData | null>(null)

  const options = level === "jimbo" ? jimbos : level === "mtaa" ? mitaa : churches

  useEffect(() => {
    if (!options.find((o) => String(o.id) === entity)) {
      setEntity(options[0] ? String(options[0].id) : "")
    }
  }, [level, options, entity])

  const generate = async () => {
    if (!entity) return
    setLoading(true)
    setError(null)
    try {
      const params = { [level]: entity, year, month: month || undefined, page_size: 5000 }
      const [ev, off] = await Promise.all([
        api.get("/evangelism/", { params }),
        api.get("/offerings/", { params }),
      ])
      const name = options.find((o) => String(o.id) === entity)?.name || ""
      setReport({
        title: `${LEVEL_LABELS[level]}: ${name}`,
        period: month ? `${MONTHS[Number(month)]} ${year}` : `Mwaka ${year}`,
        evangelism: toList<EvangelismRecord>(ev.data),
        offerings: toList<Offering>(off.data),
      })
    } catch (e) {
      setError(errorMessage(e, "Imeshindwa kutengeneza ripoti."))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Ripoti" subtitle="Tengeneza ripoti rasmi ya Jimbo, Mtaa au Kanisa" />

      <Card className="print:hidden">
        <CardContent className="grid grid-cols-2 gap-3 p-4 lg:grid-cols-5 lg:items-end">
          <Field label="Ngazi">
            <Select value={level} onChange={(e) => setLevel(e.target.value as Level)}>
              <option value="jimbo">Jimbo</option>
              <option value="mtaa">Mtaa</option>
              <option value="church">Kanisa</option>
            </Select>
          </Field>
          <Field label={LEVEL_LABELS[level]}>
            <Select value={entity} onChange={(e) => setEntity(e.target.value)}>
              {options.length === 0 && <option value="">— Hakuna —</option>}
              {options.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Mwaka">
            <Select value={year} onChange={(e) => setYear(e.target.value)}>
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </Select>
          </Field>
          <Field label="Mwezi">
            <Select value={month} onChange={(e) => setMonth(e.target.value)}>
              <option value="">Mwaka mzima</option>
              {MONTHS.slice(1).map((m, i) => (
                <option key={m} value={i + 1}>{m}</option>
              ))}
            </Select>
          </Field>
          <Button variant="gold" className="col-span-2 lg:col-span-1" onClick={generate} disabled={!entity || loading}>
            <FileText className="mr-2 h-4 w-4" /> {loading ? "Inatengeneza..." : "Tengeneza Ripoti"}
          </Button>
        </CardContent>
      </Card>

      <FormError message={error} />
      {loading && <Loading />}
      {!loading && report && <ReportView report={report} types={types} preparedBy={user?.fullName || user?.username || ""} />}
    </div>
  )
}

function ReportView({ report, types, preparedBy }: { report: ReportData; types: OfferingType[]; preparedBy: string }) {
  const { evangelism, offerings } = report

  const byType = useMemo(() => {
    const map = new Map<string, { amount: number; church: number; field: number }>()
    offerings.forEach((o) => {
      const cur = map.get(o.offering_type_name) || { amount: 0, church: 0, field: 0 }
      cur.amount += Number(o.amount)
      cur.church += Number(o.church_share)
      cur.field += Number(o.field_share)
      map.set(o.offering_type_name, cur)
    })
    const order = types.map((t) => t.name)
    return [...map.entries()].sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]))
  }, [offerings, types])

  const byChurch = useMemo(() => {
    const map = new Map<string, { mtaa: string; amount: number; church: number; field: number; baptized: number; converted: number; visited: number; supported: number }>()
    const get = (name: string, mtaa: string) => {
      if (!map.has(name)) map.set(name, { mtaa, amount: 0, church: 0, field: 0, baptized: 0, converted: 0, visited: 0, supported: 0 })
      return map.get(name)!
    }
    offerings.forEach((o) => {
      const c = get(o.church_name, o.mtaa_name)
      c.amount += Number(o.amount)
      c.church += Number(o.church_share)
      c.field += Number(o.field_share)
    })
    evangelism.forEach((e) => {
      const c = get(e.church_name, e.mtaa_name)
      c.baptized += e.baptized
      c.converted += e.converted
      c.visited += e.visited
      c.supported += e.supported
    })
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  }, [offerings, evangelism])

  const t = {
    amount: offerings.reduce((s, o) => s + Number(o.amount), 0),
    church: offerings.reduce((s, o) => s + Number(o.church_share), 0),
    field: offerings.reduce((s, o) => s + Number(o.field_share), 0),
    baptized: evangelism.reduce((s, e) => s + e.baptized, 0),
    converted: evangelism.reduce((s, e) => s + e.converted, 0),
    visited: evangelism.reduce((s, e) => s + e.visited, 0),
    supported: evangelism.reduce((s, e) => s + e.supported, 0),
  }

  const downloadCsv = () => {
    const lines = [
      ["YESAYA MINISTRY", report.title, report.period],
      [],
      ["Kanisa", "Mtaa", "Matoleo", "Sehemu ya Kanisa", "Sehemu ya Jimbo", "Waliobatizwa", "Waliokombolewa", "Waliotembelewa", "Waliosaidika"],
      ...byChurch.map(([name, c]) => [name, c.mtaa, c.amount, c.church, c.field, c.baptized, c.converted, c.visited, c.supported]),
      ["JUMLA", "", t.amount, t.church, t.field, t.baptized, t.converted, t.visited, t.supported],
      [],
      ["Aina ya Toleo", "Kiasi", "Sehemu ya Kanisa", "Sehemu ya Jimbo"],
      ...byType.map(([name, v]) => [name, v.amount, v.church, v.field]),
    ]
    const csv = lines.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n")
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `Ripoti-${report.title.replace(/[^\w]+/g, "-")}-${report.period.replace(/\s+/g, "-")}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const empty = offerings.length === 0 && evangelism.length === 0

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 print:hidden">
        <Button variant="navy" onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" /> Print / Hifadhi PDF
        </Button>
        <Button variant="outline" onClick={downloadCsv} disabled={empty}>
          <Download className="mr-2 h-4 w-4" /> Pakua Excel (CSV)
        </Button>
      </div>

      <Card className="print:border-0 print:shadow-none">
        <CardHeader className="border-b text-center">
          <p className="text-xs font-semibold tracking-widest text-gold-700">YESAYA MINISTRY</p>
          <CardTitle className="text-xl">TAARIFA RASMI — {report.title.toUpperCase()}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Kipindi: {report.period} · Imetolewa: {new Date().toLocaleDateString("en-GB")} · Na: {preparedBy}
          </p>
        </CardHeader>
        <CardContent className="space-y-6 p-4 sm:p-6">
          {empty ? (
            <p className="py-8 text-center text-muted-foreground">Hakuna taarifa zilizoingizwa kwa kipindi hiki.</p>
          ) : (
            <>
              <section>
                <h3 className="mb-2 font-semibold text-navy">1. Muhtasari</h3>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <Box label="Jumla ya Matoleo" value={formatMoney(t.amount)} />
                  <Box label="Sehemu ya Kanisa" value={formatMoney(t.church)} />
                  <Box label="Sehemu ya Jimbo" value={formatMoney(t.field)} />
                  <Box label="Waliobatizwa" value={formatNumber(t.baptized)} />
                  <Box label="Waliokombolewa" value={formatNumber(t.converted)} />
                  <Box label="Waliotembelewa" value={formatNumber(t.visited)} />
                  <Box label="Waliosaidika" value={formatNumber(t.supported)} />
                  <Box label="Makanisa yaliyoripoti" value={formatNumber(byChurch.length)} />
                </div>
              </section>

              {byType.length > 0 && (
                <section>
                  <h3 className="mb-2 font-semibold text-navy">2. Matoleo kwa Aina</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[480px] border text-sm">
                      <thead className="bg-navy text-white">
                        <tr>
                          <th className="px-3 py-2 text-left">Aina</th>
                          <th className="px-3 py-2 text-right">Kiasi</th>
                          <th className="px-3 py-2 text-right">Kanisa</th>
                          <th className="px-3 py-2 text-right">Jimbo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {byType.map(([name, v]) => (
                          <tr key={name} className="border-b">
                            <td className="px-3 py-2">{name}</td>
                            <td className="px-3 py-2 text-right">{formatMoney(v.amount)}</td>
                            <td className="px-3 py-2 text-right">{formatMoney(v.church)}</td>
                            <td className="px-3 py-2 text-right">{formatMoney(v.field)}</td>
                          </tr>
                        ))}
                        <tr className="bg-muted/60 font-semibold">
                          <td className="px-3 py-2">JUMLA</td>
                          <td className="px-3 py-2 text-right">{formatMoney(t.amount)}</td>
                          <td className="px-3 py-2 text-right">{formatMoney(t.church)}</td>
                          <td className="px-3 py-2 text-right">{formatMoney(t.field)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              <section>
                <h3 className="mb-2 font-semibold text-navy">3. Mchanganuo kwa Kanisa</h3>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] border text-sm">
                    <thead className="bg-navy text-white">
                      <tr>
                        <th className="px-3 py-2 text-left">Kanisa</th>
                        <th className="px-3 py-2 text-left">Mtaa</th>
                        <th className="px-3 py-2 text-right">Matoleo</th>
                        <th className="px-3 py-2 text-right">Kanisa</th>
                        <th className="px-3 py-2 text-right">Jimbo</th>
                        <th className="px-3 py-2 text-right">Batizwa</th>
                        <th className="px-3 py-2 text-right">Kombolewa</th>
                        <th className="px-3 py-2 text-right">Tembelewa</th>
                        <th className="px-3 py-2 text-right">Saidika</th>
                      </tr>
                    </thead>
                    <tbody>
                      {byChurch.map(([name, c]) => (
                        <tr key={name} className="border-b">
                          <td className="px-3 py-2">{name}</td>
                          <td className="px-3 py-2">{c.mtaa}</td>
                          <td className="px-3 py-2 text-right">{formatMoney(c.amount)}</td>
                          <td className="px-3 py-2 text-right">{formatMoney(c.church)}</td>
                          <td className="px-3 py-2 text-right">{formatMoney(c.field)}</td>
                          <td className="px-3 py-2 text-right">{formatNumber(c.baptized)}</td>
                          <td className="px-3 py-2 text-right">{formatNumber(c.converted)}</td>
                          <td className="px-3 py-2 text-right">{formatNumber(c.visited)}</td>
                          <td className="px-3 py-2 text-right">{formatNumber(c.supported)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {evangelism.length > 0 && (
                <section>
                  <h3 className="mb-2 font-semibold text-navy">4. Uinjilisti kwa Mwezi</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[560px] border text-sm">
                      <thead className="bg-navy text-white">
                        <tr>
                          <th className="px-3 py-2 text-left">Kipindi</th>
                          <th className="px-3 py-2 text-left">Kanisa</th>
                          <th className="px-3 py-2 text-right">Batizwa</th>
                          <th className="px-3 py-2 text-right">Kombolewa</th>
                          <th className="px-3 py-2 text-right">Tembelewa</th>
                          <th className="px-3 py-2 text-right">Saidika</th>
                        </tr>
                      </thead>
                      <tbody>
                        {evangelism.map((e) => (
                          <tr key={e.id} className="border-b">
                            <td className="px-3 py-2">{MONTHS[e.month]} {e.year}</td>
                            <td className="px-3 py-2">{e.church_name}</td>
                            <td className="px-3 py-2 text-right">{e.baptized}</td>
                            <td className="px-3 py-2 text-right">{e.converted}</td>
                            <td className="px-3 py-2 text-right">{e.visited}</td>
                            <td className="px-3 py-2 text-right">{e.supported}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              <section className="grid grid-cols-2 gap-8 pt-8 text-sm">
                <div className="border-t pt-2 text-center text-muted-foreground">Sahihi ya Mwandaaji</div>
                <div className="border-t pt-2 text-center text-muted-foreground">Sahihi ya Mchungaji / Kiongozi</div>
              </section>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function Box({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-bold text-navy">{value}</p>
    </div>
  )
}
