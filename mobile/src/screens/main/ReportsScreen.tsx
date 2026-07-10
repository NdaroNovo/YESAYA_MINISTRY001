import React, { useEffect, useState, useCallback, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  TouchableOpacity, Modal, Alert, TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Card, SelectPicker, Button } from "../../components/common";
import { jimboApi, mtaaApi, churchApi, evangelismApi, offeringApi, offeringTypeApi } from "../../api/services";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { formatMoney, MONTHS } from "../../utils/helpers";
import type { Jimbo, Mtaa, Church, EvangelismRecord, Offering, OfferingType } from "../../types";

type ReportType = "jimbo" | "mtaa" | "kanisa";

const YEAR_OPTIONS = Array.from({ length: 10 }, (_, i) => {
  const y = (new Date().getFullYear() - i).toString();
  return { label: y, value: y };
});
const MONTH_OPTIONS = [
  { label: "Mwaka Mzima", value: "" },
  { label: "Januari", value: "1" }, { label: "Februari", value: "2" },
  { label: "Machi", value: "3" }, { label: "Aprili", value: "4" },
  { label: "Mei", value: "5" }, { label: "Juni", value: "6" },
  { label: "Julai", value: "7" }, { label: "Agosti", value: "8" },
  { label: "Septemba", value: "9" }, { label: "Oktoba", value: "10" },
  { label: "Novemba", value: "11" }, { label: "Desemba", value: "12" },
];

export default function ReportsScreen() {
  const [reportType, setReportType] = useState<ReportType>("kanisa");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [month, setMonth] = useState("");
  const [jimboList, setJimboList] = useState<Jimbo[]>([]);
  const [mtaaList, setMtaaList] = useState<Mtaa[]>([]);
  const [churchList, setChurchList] = useState<Church[]>([]);
  const [selectedJimbo, setSelectedJimbo] = useState("");
  const [selectedMtaa, setSelectedMtaa] = useState("");
  const [selectedChurch, setSelectedChurch] = useState("");
  const [evangelism, setEvangelism] = useState<EvangelismRecord[]>([]);
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [offeringTypes, setOfferingTypes] = useState<OfferingType[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [titleModal, setTitleModal] = useState(false);
  const [reportTitle, setReportTitle] = useState("");
  const [generated, setGenerated] = useState(false);
  const listsLoaded = useRef(false);

  const STORAGE_KEY = "reports_last_state";

  const notify = (msg: string) => Alert.alert("✅ Imekamilika", msg);

  useEffect(() => {
    (async () => {
      const [jr, mr, cr, otr] = await Promise.all([
        jimboApi.get(), mtaaApi.get(), churchApi.get(), offeringTypeApi.get(),
      ]);
      setJimboList(jr.data);
      setMtaaList(mr.data);
      setChurchList(cr.data);
      setOfferingTypes(otr.data);

      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const s = JSON.parse(saved);
          if (s.reportType) setReportType(s.reportType);
          if (s.year) setYear(s.year);
          if (s.month !== undefined) setMonth(s.month);
          if (s.selectedJimbo) setSelectedJimbo(s.selectedJimbo);
          else if (jr.data.length) setSelectedJimbo(jr.data[0].id.toString());
          if (s.selectedMtaa) setSelectedMtaa(s.selectedMtaa);
          else if (mr.data.length) setSelectedMtaa(mr.data[0].id.toString());
          if (s.selectedChurch) setSelectedChurch(s.selectedChurch);
          else if (cr.data.length) setSelectedChurch(cr.data[0].id.toString());
          if (s.reportTitle) setReportTitle(s.reportTitle);
          if (s.evangelism) setEvangelism(s.evangelism);
          if (s.offerings) setOfferings(s.offerings);
          if (s.generated) setGenerated(true);
        } else {
          if (jr.data.length) setSelectedJimbo(jr.data[0].id.toString());
          if (mr.data.length) setSelectedMtaa(mr.data[0].id.toString());
          if (cr.data.length) setSelectedChurch(cr.data[0].id.toString());
        }
      } catch {
        if (jr.data.length) setSelectedJimbo(jr.data[0].id.toString());
        if (mr.data.length) setSelectedMtaa(mr.data[0].id.toString());
        if (cr.data.length) setSelectedChurch(cr.data[0].id.toString());
      }
      listsLoaded.current = true;
    })();
  }, []);

  const filteredMtaa = selectedJimbo
    ? mtaaList.filter((m) => m.jimbo.toString() === selectedJimbo)
    : mtaaList;

  const filteredChurches = selectedMtaa
    ? churchList.filter((c) => c.mtaa.toString() === selectedMtaa)
    : churchList;

  const generateReport = useCallback(async () => {
    if (reportType === "kanisa" && !selectedChurch) {
      Alert.alert("Tafadhali", "Chagua kanisa kwanza.");
      return;
    }
    if (reportType === "mtaa" && !selectedMtaa) {
      Alert.alert("Tafadhali", "Chagua mtaa kwanza.");
      return;
    }
    if (reportType === "jimbo" && !selectedJimbo) {
      Alert.alert("Tafadhali", "Chagua jimbo kwanza.");
      return;
    }
    setLoading(true);
    try {
      const filterParams =
        reportType === "kanisa"
          ? { church: parseInt(selectedChurch, 10) }
          : reportType === "mtaa"
          ? { mtaa: parseInt(selectedMtaa, 10) }
          : { jimbo: parseInt(selectedJimbo, 10) };

      const [er, or] = await Promise.all([
        evangelismApi.getByFilter(filterParams),
        offeringApi.getByFilter(filterParams),
      ]);

      let evData = er.data;
      let offData = or.data;

      if (month) {
        evData = evData.filter((e) => e.month.toString() === month && e.year.toString() === year);
        offData = offData.filter((o) => o.month.toString() === month && o.year.toString() === year);
      } else {
        evData = evData.filter((e) => e.year.toString() === year);
        offData = offData.filter((o) => o.year.toString() === year);
      }

      setEvangelism(evData);
      setOfferings(offData);
      setGenerated(true);
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
          reportType, year, month,
          selectedJimbo, selectedMtaa, selectedChurch,
          reportTitle,
          evangelism: evData,
          offerings: offData,
          generated: true,
        }));
      } catch {}
      notify("Ripoti imetengenezwa! Unaweza kushare au kuprint.");
    } catch {
      Alert.alert("Kosa", "Imeshindwa kupakia taarifa. Hakikisha umeunganishwa na mtandao.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [reportType, selectedChurch, selectedMtaa, selectedJimbo, month, year]);

  const evTotals = {
    baptized: evangelism.reduce((s, e) => s + e.baptized, 0),
    converted: evangelism.reduce((s, e) => s + e.converted, 0),
    visited: evangelism.reduce((s, e) => s + e.visited, 0),
    supported: evangelism.reduce((s, e) => s + e.supported, 0),
  };
  const offTotal = offerings.reduce((s, o) => s + parseFloat(o.amount || "0"), 0);
  const churchGrandTotal = offerings.reduce((s, o) => s + parseFloat(o.church_share || "0"), 0);
  const fieldGrandTotal = offerings.reduce((s, o) => s + parseFloat(o.field_share || "0"), 0);

  const getLabel = () => {
    if (reportType === "kanisa") return churchList.find((c) => c.id.toString() === selectedChurch)?.name || "";
    if (reportType === "mtaa") return mtaaList.find((m) => m.id.toString() === selectedMtaa)?.name || "";
    return jimboList.find((j) => j.id.toString() === selectedJimbo)?.name || "";
  };

  const periodLabel = month ? `${MONTHS[parseInt(month, 10)]} ${year}` : `Mwaka ${year}`;

  const buildHTML = () => {
    const title = reportTitle || `TAARIFA RASMI — ${getLabel().toUpperCase()}`;
    const now = new Date().toLocaleString("sw-TZ", {
      year: "numeric", month: "long", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
    const entityName = getLabel();
    const levelLabel = reportType === "jimbo" ? "JIMBO" : reportType === "mtaa" ? "MTAA" : "KANISA";
    const refCode = `${levelLabel.charAt(0)}${year}${month ? month.toString().padStart(2,"0") : "00"}`;

    // ── Mchanganuo wa Matoleo kwa aina ──────────────────────────────
    const offByType: Record<number, { name: string; kind: string; rows: Offering[]; total: number; churchTotal: number; fieldTotal: number }> = {};
    offerings.forEach((o) => {
      if (!offByType[o.offering_type]) {
        const ot = offeringTypes.find((t) => t.id === o.offering_type);
        offByType[o.offering_type] = {
          name: ot?.name || `Aina #${o.offering_type}`,
          kind: ot?.kind || "",
          rows: [],
          total: 0,
          churchTotal: 0,
          fieldTotal: 0,
        };
      }
      offByType[o.offering_type].rows.push(o);
      offByType[o.offering_type].total += parseFloat(o.amount || "0");
      offByType[o.offering_type].churchTotal += parseFloat(o.church_share || "0");
      offByType[o.offering_type].fieldTotal += parseFloat(o.field_share || "0");
    });

    const offTypeBlocks = Object.values(offByType).map((grp, idx) => {
      const rows = grp.rows.map((o, i) => `
        <tr>
          <td class="ctr">${i + 1}</td>
          <td>${MONTHS[o.month] || o.month} ${o.year}</td>
          <td class="num">${formatMoney(parseFloat(o.amount))}</td>
          <td class="num">${formatMoney(parseFloat(o.church_share || "0"))}</td>
          <td class="num">${formatMoney(parseFloat(o.field_share || "0"))}</td>
          <td style="font-size:7.5pt">${o.notes || "—"}</td>
        </tr>`).join("");
      return `
        <tr class="tr-type"><th colspan="6">${idx + 1}. ${grp.name.toUpperCase()}${grp.kind ? ` — ${grp.kind}` : ""}</th></tr>
        ${rows}
        <tr class="tr-sub">
          <td colspan="2" class="num">Jumla ndogo:</td>
          <td class="num">${formatMoney(grp.total)}</td>
          <td class="num">${formatMoney(grp.churchTotal)}</td>
          <td class="num">${formatMoney(grp.fieldTotal)}</td>
          <td></td>
        </tr>`;
    }).join("");

    const offEmpty = offerings.length === 0
      ? `<tr><td colspan="6" style="text-align:center;color:#999;font-style:italic;padding:14px">Hakuna rekodi za matoleo kwa kipindi hiki</td></tr>`
      : "";

    // ── Mchanganuo wa Uinjilisti ──────────────────────────────────────
    const evRows = evangelism.length
      ? evangelism.map((e, i) => `
        <tr>
          <td style="text-align:center">${i + 1}</td>
          <td>${MONTHS[e.month] || e.month} ${e.year}</td>
          <td style="text-align:center">${e.baptized}</td>
          <td style="text-align:center">${e.converted}</td>
          <td style="text-align:center">${e.visited}</td>
          <td style="text-align:center">${e.supported}</td>
          <td>${e.comments || "—"}</td>
        </tr>`).join("")
      : `<tr><td colspan="7" style="text-align:center;color:#999;font-style:italic;padding:14px">Hakuna rekodi za uinjilisti kwa kipindi hiki</td></tr>`;

    // ── Totals ────────────────────────────────────────────────────────
    const churchGrand = offerings.reduce((s, o) => s + parseFloat(o.church_share || "0"), 0);
    const fieldGrand = offerings.reduce((s, o) => s + parseFloat(o.field_share || "0"), 0);

    return `<!DOCTYPE html>
<html lang="sw"><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width"/>
<title>${title}</title>
<style>
  @page { size: A4; margin: 20mm 15mm 20mm 15mm; }
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:Arial,sans-serif;font-size:9.5pt;color:#111;background:#fff;line-height:1.45}

  /* ── TITLE BLOCK ── */
  .tb{background:#1a237e;color:#fff;text-align:center;padding:12px 16px;margin-bottom:10px;border-radius:0}
  .tb h1{font-size:14pt;font-weight:bold;letter-spacing:0.4px;margin-bottom:5px}
  .tb-meta{font-size:8pt;opacity:0.9;line-height:1.6}

  /* ── META TABLE ── */
  .meta-tbl{width:100%;border-collapse:collapse;margin-bottom:12px;font-size:8.5pt}
  .meta-tbl td{padding:4px 8px;border:1px solid #ddd}
  .meta-tbl .lbl{background:#e8eaf6;color:#333;font-weight:bold;width:30%;white-space:nowrap}
  .meta-tbl .val{color:#1a237e;font-weight:bold}

  /* ── SECTION HEADING ── */
  .sh{font-size:10pt;font-weight:bold;color:#fff;background:#1a237e;padding:5px 10px;margin:14px 0 0 0;letter-spacing:0.2px}
  .ss{font-size:7.5pt;color:#444;background:#eef0fb;padding:3px 10px;margin-bottom:5px;border:1px solid #c5cae9;border-top:none}

  /* ── KPI SUMMARY TABLE ── */
  .kpi-tbl{width:100%;border-collapse:collapse;margin-bottom:12px}
  .kpi-tbl td{border:1px solid #ddd;padding:6px 8px;text-align:center;vertical-align:middle}
  .kpi-tbl .kpi-lbl{font-size:7pt;color:#555;display:block;margin-top:2px}
  .kpi-tbl .kpi-val{font-size:11pt;font-weight:bold;color:#1a237e;display:block}
  .kpi-tbl .money{background:#e8f5e9}
  .kpi-tbl .ev{background:#e3f2fd}

  /* ── MAIN TABLES ── */
  table.data{width:100%;border-collapse:collapse;font-size:8.5pt;margin-bottom:4px}
  table.data thead tr{background:#1a237e}
  table.data thead th{color:#fff;padding:5px 6px;text-align:left;font-size:8pt;border:1px solid #283593}
  table.data tbody td{padding:4px 6px;border:1px solid #ddd;vertical-align:middle}
  table.data tbody tr:nth-child(even){background:#f7f8ff}
  .tr-type th{background:#3949ab;color:#fff;font-size:8pt;padding:4px 6px;text-align:left;border:1px solid #283593;letter-spacing:0.2px}
  .tr-sub td{background:#e8eaf6;color:#1a237e;font-weight:bold;font-size:8pt;border:1px solid #c5cae9}
  .tr-grand td{background:#1a237e;color:#fff;font-weight:bold;font-size:8.5pt;padding:5px 6px;border:1px solid #0d1b6e}
  .num{text-align:right;white-space:nowrap}
  .ctr{text-align:center}

  /* ── FOOTER ── */
  .ft{margin-top:20px;border-top:2px solid #1a237e;padding-top:8px;display:table;width:100%;font-size:8pt;color:#555}
  .ft-left{display:table-cell;vertical-align:bottom;width:50%}
  .ft-right{display:table-cell;vertical-align:bottom;text-align:right;width:50%}
  .sig{display:inline-block;text-align:center;width:150px;margin-left:30px}
  .sig-line{border-top:1px solid #555;margin-top:36px;padding-top:3px;font-size:7.5pt}
  .pg{text-align:center;font-size:7.5pt;color:#aaa;margin-top:8px}
</style>
</head><body>

<!-- TITLE (juu kabisa, hakuna chochote juu yake) -->
<div class="tb">
  <h1>${title}</h1>
  <div class="tb-meta">
    ${entityName} &nbsp;|&nbsp; ${levelLabel} &nbsp;|&nbsp; ${periodLabel}
  </div>
</div>

<!-- META INFO -->
<table class="meta-tbl">
  <tr><td class="lbl">Kiwango cha Taarifa</td><td class="val">${levelLabel}</td>
      <td class="lbl">Jina / Eneo</td><td class="val">${entityName}</td></tr>
  <tr><td class="lbl">Kipindi cha Taarifa</td><td class="val">${periodLabel}</td>
      <td class="lbl">Tarehe ya Kutoa</td><td class="val">${now}</td></tr>
  <tr><td class="lbl">Nambari ya Kumbukumbu</td><td class="val">${refCode}</td>
      <td class="lbl">Aina ya Taarifa</td><td class="val">Kifedha na Uinjilisti</td></tr>
</table>

<!-- KPI MUHTASARI -->
<div class="sh">MUHTASARI WA JUMLA</div>
<div class="ss">Nambari kuu za kipindi kilichochaguliwa</div>
<table class="kpi-tbl">
  <tr>
    <td class="money"><span class="kpi-val">${formatMoney(offTotal)}</span><span class="kpi-lbl">Jumla Matoleo (TSh)</span></td>
    <td class="money"><span class="kpi-val">${formatMoney(churchGrand)}</span><span class="kpi-lbl">Sehemu ya Kanisa (TSh)</span></td>
    <td class="money"><span class="kpi-val">${formatMoney(fieldGrand)}</span><span class="kpi-lbl">Inayoelekea Jimboni (TSh)</span></td>
    <td class="ev"><span class="kpi-val">${evTotals.baptized}</span><span class="kpi-lbl">Waliobatizwa</span></td>
    <td class="ev"><span class="kpi-val">${evTotals.converted}</span><span class="kpi-lbl">Walioongolewa</span></td>
    <td class="ev"><span class="kpi-val">${evTotals.visited}</span><span class="kpi-lbl">Waliotembelewa</span></td>
    <td class="ev"><span class="kpi-val">${evTotals.supported}</span><span class="kpi-lbl">Waliosaidika</span></td>
  </tr>
</table>

<!-- SEHEMU I: MATOLEO -->
<div class="sh">SEHEMU I: TAARIFA ZA MATOLEO</div>
<div class="ss">Mchanganuo kwa aina ya toleo — sehemu ya Kanisa na inayoelekea Jimboni imeonyeshwa kwa kila aina</div>
<table class="data">
  <thead>
    <tr>
      <th style="width:22px" class="ctr">#</th>
      <th style="width:90px">Kipindi</th>
      <th class="num">Jumla (TSh)</th>
      <th class="num">Kanisa (TSh)</th>
      <th class="num">Jimbo (TSh)</th>
      <th>Maelezo</th>
    </tr>
  </thead>
  <tbody>
    ${offTypeBlocks}
    ${offEmpty}
    ${offerings.length > 0 ? `<tr class="tr-grand">
      <td colspan="2" class="num">JUMLA KUU — MATOLEO YOTE</td>
      <td class="num">${formatMoney(offTotal)}</td>
      <td class="num">${formatMoney(churchGrand)}</td>
      <td class="num">${formatMoney(fieldGrand)}</td>
      <td></td>
    </tr>` : ""}
  </tbody>
</table>

<!-- SEHEMU II: UINJILISTI -->
<div class="sh" style="margin-top:16px">SEHEMU II: TAARIFA ZA UINJILISTI</div>
<div class="ss">Rekodi za shughuli za kiroho na ufuatiliaji wa waumini kwa kipindi kilichochaguliwa</div>
<table class="data">
  <thead>
    <tr>
      <th style="width:22px" class="ctr">#</th>
      <th style="width:90px">Kipindi</th>
      <th class="ctr">Waliobatizwa</th>
      <th class="ctr">Walioongolewa</th>
      <th class="ctr">Waliotembelewa</th>
      <th class="ctr">Waliosaidika</th>
      <th>Maoni</th>
    </tr>
  </thead>
  <tbody>
    ${evRows}
    ${evangelism.length > 0 ? `<tr class="tr-grand">
      <td colspan="2" class="num">JUMLA KUU</td>
      <td class="ctr">${evTotals.baptized}</td>
      <td class="ctr">${evTotals.converted}</td>
      <td class="ctr">${evTotals.visited}</td>
      <td class="ctr">${evTotals.supported}</td>
      <td></td>
    </tr>` : ""}
  </tbody>
</table>

<!-- FOOTER -->
<div class="ft">
  <div class="ft-left">
    <div>Kumb: ${refCode} &nbsp;|&nbsp; ${entityName} &nbsp;|&nbsp; ${periodLabel}</div>
    <div style="margin-top:2px;color:#999">Taarifa imetolewa kwa mfumo wa kielektroniki</div>
  </div>
  <div class="ft-right">
    <span class="sig"><div class="sig-line">Mhusika wa Fedha</div></span>
    <span class="sig"><div class="sig-line">Msimamizi / Kiongozi</div></span>
  </div>
</div>
<div class="pg">— Mwisho wa Taarifa &mdash; ${now} —</div>

</body></html>`;
  };

  const handlePrint = async () => {
    try {
      await Print.printAsync({ html: buildHTML() });
      notify("Ripoti imepelekwa kwa printa!");
    } catch { Alert.alert("Kosa", "Imeshindwa kuprint."); }
  };

  const handleShare = async () => {
    try {
      const { uri } = await Print.printToFileAsync({ html: buildHTML() });
      await Sharing.shareAsync(uri, { mimeType: "application/pdf", dialogTitle: "Shiriki Ripoti" });
      notify("Ripoti imeshirikiwa!");
    } catch { Alert.alert("Kosa", "Imeshindwa kushare."); }
  };

  const handleTitleSave = async () => {
    setTitleModal(false);
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      const prev = saved ? JSON.parse(saved) : {};
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ ...prev, reportTitle }));
    } catch {}
    notify(`Kichwa cha habari kimewekwa: "${reportTitle}"`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); generateReport(); }} />}
      >
        <Card style={styles.filterCard}>
          <Text style={styles.sectionTitle}>⚙️ Chagua Aina ya Ripoti</Text>
          <View style={styles.typeRow}>
            {(["jimbo", "mtaa", "kanisa"] as ReportType[]).map((t) => (
              <TouchableOpacity key={t} style={[styles.typeBtn, reportType === t && styles.typeBtnActive]} onPress={() => { setReportType(t); setGenerated(false); }}>
                <Text style={[styles.typeBtnText, reportType === t && styles.typeBtnTextActive]}>
                  {t === "jimbo" ? "Jimbo" : t === "mtaa" ? "Mtaa" : "Kanisa"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {reportType === "jimbo" && (
            <SelectPicker label="Chagua Jimbo" options={jimboList.map((j) => ({ label: j.name, value: j.id.toString() }))} value={selectedJimbo} onChange={setSelectedJimbo} emptyText="Hakuna Jimbo" />
          )}
          {reportType === "mtaa" && (
            <>
              <SelectPicker label="Chagua Jimbo" options={jimboList.map((j) => ({ label: j.name, value: j.id.toString() }))} value={selectedJimbo} onChange={(v) => { setSelectedJimbo(v); setSelectedMtaa(""); }} emptyText="Hakuna Jimbo" />
              <SelectPicker label="Chagua Mtaa" options={filteredMtaa.map((m) => ({ label: m.name, value: m.id.toString() }))} value={selectedMtaa} onChange={setSelectedMtaa} emptyText="Hakuna Mtaa" />
            </>
          )}
          {reportType === "kanisa" && (
            <>
              <SelectPicker label="Chagua Jimbo" options={jimboList.map((j) => ({ label: j.name, value: j.id.toString() }))} value={selectedJimbo} onChange={(v) => { setSelectedJimbo(v); setSelectedMtaa(""); setSelectedChurch(""); }} emptyText="Hakuna Jimbo" />
              <SelectPicker label="Chagua Mtaa" options={filteredMtaa.map((m) => ({ label: m.name, value: m.id.toString() }))} value={selectedMtaa} onChange={(v) => { setSelectedMtaa(v); setSelectedChurch(""); }} emptyText="Hakuna Mtaa" />
              <SelectPicker label="Chagua Kanisa" options={filteredChurches.map((c) => ({ label: c.name, value: c.id.toString() }))} value={selectedChurch} onChange={setSelectedChurch} emptyText="Hakuna Kanisa" />
            </>
          )}

          <SelectPicker label="Mwaka" options={YEAR_OPTIONS} value={year} onChange={setYear} />
          <SelectPicker label="Mwezi (au Mwaka Mzima)" options={MONTH_OPTIONS} value={month} onChange={setMonth} />

          <Button title={loading ? "Inapakia..." : "🔍 Tengeneza Ripoti"} onPress={generateReport} variant="primary" style={styles.genBtn} />
        </Card>

        {generated && (
          <>
            {/* ── KPI Muhtasari ── */}
            <Card style={styles.summaryCard}>
              <Text style={styles.sectionTitle}>📊 {getLabel()} — {periodLabel}</Text>

              <Text style={styles.subHeading}>💰 Matoleo</Text>
              <View style={styles.summaryGrid}>
                {[
                  { label: "Jumla", value: `TSh\n${formatMoney(offTotal)}`, icon: "cash-multiple", color: "#1a237e" },
                  { label: "Kanisa", value: `TSh\n${formatMoney(churchGrandTotal)}`, icon: "bank", color: "#43a047" },
                  { label: "Jimbo", value: `TSh\n${formatMoney(fieldGrandTotal)}`, icon: "arrow-up-circle", color: "#c62828" },
                ].map((item) => (
                  <View key={item.label} style={[styles.summaryBox, { borderTopWidth: 3, borderTopColor: item.color }]}>
                    <Icon name={item.icon} size={16} color={item.color} />
                    <Text style={[styles.summaryVal, { color: item.color, fontSize: 10, textAlign: "center" }]}>{item.value}</Text>
                    <Text style={styles.summaryLbl}>{item.label}</Text>
                  </View>
                ))}
              </View>

              <Text style={[styles.subHeading, { marginTop: 10 }]}>🕊️ Uinjilisti</Text>
              <View style={styles.summaryGrid}>
                {[
                  { label: "Batizwa", value: evTotals.baptized, icon: "water", color: "#1e88e5" },
                  { label: "Ongolewa", value: evTotals.converted, icon: "heart", color: "#e53935" },
                  { label: "Tembelewa", value: evTotals.visited, icon: "walk", color: "#43a047" },
                  { label: "Saidika", value: evTotals.supported, icon: "hand-heart", color: "#fb8c00" },
                ].map((item) => (
                  <View key={item.label} style={[styles.summaryBox, { borderTopWidth: 3, borderTopColor: item.color }]}>
                    <Icon name={item.icon} size={16} color={item.color} />
                    <Text style={[styles.summaryVal, { color: item.color }]}>{item.value}</Text>
                    <Text style={styles.summaryLbl}>{item.label}</Text>
                  </View>
                ))}
              </View>
            </Card>

            {/* ── SEHEMU I: MATOLEO kwa aina ── */}
            <Card style={styles.tableCard}>
              <Text style={styles.sectionTitle}>SEHEMU I: MATOLEO</Text>
              <Text style={styles.sectionSub}>Mchanganuo kwa aina — Sehemu ya Kanisa na inayoelekea Jimboni</Text>
              {offerings.length === 0 ? (
                <Text style={styles.emptyRow}>Hakuna rekodi za matoleo kwa kipindi hiki</Text>
              ) : (
                (() => {
                  const byType: Record<number, { name: string; rows: typeof offerings; total: number; church: number; field: number }> = {};
                  offerings.forEach((o) => {
                    if (!byType[o.offering_type]) {
                      const ot = offeringTypes.find((t) => t.id === o.offering_type);
                      byType[o.offering_type] = { name: ot?.name || `Aina #${o.offering_type}`, rows: [], total: 0, church: 0, field: 0 };
                    }
                    byType[o.offering_type].rows.push(o);
                    byType[o.offering_type].total += parseFloat(o.amount || "0");
                    byType[o.offering_type].church += parseFloat(o.church_share || "0");
                    byType[o.offering_type].field += parseFloat(o.field_share || "0");
                  });
                  return Object.values(byType).map((grp) => (
                    <View key={grp.name} style={styles.typeBlock}>
                      <View style={styles.typeHeaderRow}>
                        <Icon name="tag" size={13} color={colors.surface} />
                        <Text style={styles.typeHeaderText}>{grp.name.toUpperCase()}</Text>
                      </View>
                      <View style={styles.tableHeader}>
                        {["Kipindi", "Jumla", "Kanisa", "Jimbo"].map((h) => (
                          <Text key={h} style={styles.th}>{h}</Text>
                        ))}
                      </View>
                      {grp.rows.map((o) => (
                        <View key={o.id} style={styles.tableRow}>
                          <Text style={styles.td}>{MONTHS[o.month]} {o.year}</Text>
                          <Text style={styles.td}>{formatMoney(parseFloat(o.amount))}</Text>
                          <Text style={styles.td}>{formatMoney(parseFloat(o.church_share || "0"))}</Text>
                          <Text style={styles.td}>{formatMoney(parseFloat(o.field_share || "0"))}</Text>
                        </View>
                      ))}
                      <View style={[styles.tableRow, styles.subTotalRow]}>
                        <Text style={[styles.td, styles.totalLabel]}>Jumla</Text>
                        <Text style={[styles.td, styles.totalVal]}>{formatMoney(grp.total)}</Text>
                        <Text style={[styles.td, styles.totalVal]}>{formatMoney(grp.church)}</Text>
                        <Text style={[styles.td, styles.totalVal]}>{formatMoney(grp.field)}</Text>
                      </View>
                    </View>
                  ));
                })()
              )}
              {offerings.length > 0 && (
                <View style={[styles.tableRow, styles.grandTotalRow]}>
                  <Text style={[styles.td, styles.grandTotalLabel]}>JUMLA KUU</Text>
                  <Text style={[styles.td, styles.grandTotalVal]}>TSh {formatMoney(offTotal)}</Text>
                  <Text style={[styles.td, styles.grandTotalVal]}>TSh {formatMoney(churchGrandTotal)}</Text>
                  <Text style={[styles.td, styles.grandTotalVal]}>TSh {formatMoney(fieldGrandTotal)}</Text>
                </View>
              )}
            </Card>

            {/* ── SEHEMU II: UINJILISTI ── */}
            <Card style={styles.tableCard}>
              <Text style={styles.sectionTitle}>�️ SEHEMU II: UINJILISTI</Text>
              <Text style={styles.sectionSub}>Rekodi za shughuli za kiroho na ufuatiliaji</Text>
              <View style={styles.tableHeader}>
                {["Kipindi", "Batizwa", "Ongolewa", "Tembelewa", "Saidika"].map((h) => (
                  <Text key={h} style={styles.th}>{h}</Text>
                ))}
              </View>
              {evangelism.length === 0 ? (
                <Text style={styles.emptyRow}>Hakuna rekodi za uinjilisti kwa kipindi hiki</Text>
              ) : (
                evangelism.map((e) => (
                  <View key={e.id} style={styles.tableRow}>
                    <Text style={styles.td}>{MONTHS[e.month]} {e.year}</Text>
                    <Text style={styles.td}>{e.baptized}</Text>
                    <Text style={styles.td}>{e.converted}</Text>
                    <Text style={styles.td}>{e.visited}</Text>
                    <Text style={styles.td}>{e.supported}</Text>
                  </View>
                ))
              )}
              {evangelism.length > 0 && (
                <View style={[styles.tableRow, styles.grandTotalRow]}>
                  <Text style={[styles.td, styles.grandTotalLabel]}>JUMLA KUU</Text>
                  <Text style={[styles.td, styles.grandTotalVal]}>{evTotals.baptized}</Text>
                  <Text style={[styles.td, styles.grandTotalVal]}>{evTotals.converted}</Text>
                  <Text style={[styles.td, styles.grandTotalVal]}>{evTotals.visited}</Text>
                  <Text style={[styles.td, styles.grandTotalVal]}>{evTotals.supported}</Text>
                </View>
              )}
            </Card>

            {/* ── Shiriki / Print ── */}
            <Card style={styles.actionCard}>
              <Text style={styles.sectionTitle}>📤 Shiriki / Chapa Ripoti</Text>
              <TouchableOpacity style={styles.titleRow} onPress={() => setTitleModal(true)}>
                <Icon name="pencil" size={16} color={colors.accent} />
                <Text style={styles.titleText}>{reportTitle || "Bonyeza kuweka kichwa cha habari..."}</Text>
              </TouchableOpacity>
              <View style={styles.actionRow}>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "#1e88e5" }]} onPress={handleShare}>
                  <Icon name="share-variant" size={20} color="#fff" />
                  <Text style={styles.actionBtnText}>Shiriki PDF</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "#43a047" }]} onPress={handlePrint}>
                  <Icon name="printer" size={20} color="#fff" />
                  <Text style={styles.actionBtnText}>Print</Text>
                </TouchableOpacity>
              </View>
            </Card>
          </>
        )}
      </ScrollView>

      <Modal visible={titleModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Kichwa cha Habari</Text>
            <TextInput
              style={styles.titleInput}
              value={reportTitle}
              onChangeText={setReportTitle}
              placeholder={`Ripoti ya ${getLabel()} - ${periodLabel}`}
              placeholderTextColor={colors.textMuted}
              multiline
            />
            <View style={styles.modalBtns}>
              <Button title="Ghairi" onPress={() => setTitleModal(false)} variant="outline" style={styles.halfBtn} />
              <Button title="Hifadhi" onPress={handleTitleSave} variant="primary" style={styles.halfBtn} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 12, paddingBottom: 40 },
  filterCard: { marginBottom: 12 },
  sectionTitle: { fontSize: typography.sizes.sm, fontWeight: typography.weights.bold, color: colors.primary, marginBottom: 10 },
  typeRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  typeBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: colors.border, alignItems: "center" },
  typeBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  typeBtnText: { fontSize: typography.sizes.sm, color: colors.textMuted, fontWeight: typography.weights.medium },
  typeBtnTextActive: { color: colors.surface },
  genBtn: { marginTop: 8 },
  summaryCard: { marginBottom: 12 },
  summaryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  summaryBox: { flex: 1, minWidth: "30%", backgroundColor: colors.background, borderRadius: 8, padding: 8, alignItems: "center" },
  summaryVal: { fontSize: typography.sizes.sm, fontWeight: typography.weights.bold, marginTop: 3, textAlign: "center" },
  summaryLbl: { fontSize: 8, color: colors.textMuted, textAlign: "center", marginTop: 2 },
  tableCard: { marginBottom: 12 },
  tableHeader: { flexDirection: "row", backgroundColor: colors.primary, borderRadius: 6, paddingVertical: 6, paddingHorizontal: 4, marginBottom: 2 },
  th: { flex: 1, color: colors.surface, fontSize: 9, fontWeight: typography.weights.bold, textAlign: "center" },
  tableRow: { flexDirection: "row", paddingVertical: 5, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: colors.border },
  td: { flex: 1, fontSize: 10, color: colors.text, textAlign: "center" },
  totalRow: { backgroundColor: colors.accent + "20", borderRadius: 4 },
  totalLabel: { fontWeight: typography.weights.bold, color: colors.primary },
  totalVal: { fontWeight: typography.weights.bold, color: colors.accent },
  subHeading: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.primary, marginBottom: 6, marginTop: 4, letterSpacing: 0.3 },
  sectionSub: { fontSize: 10, color: colors.textMuted, marginBottom: 8, fontStyle: "italic" },
  typeBlock: { marginBottom: 8 },
  typeHeaderRow: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#283593", borderRadius: 4, paddingHorizontal: 10, paddingVertical: 5, marginBottom: 2 },
  typeHeaderText: { color: colors.surface, fontSize: 10, fontWeight: typography.weights.bold, letterSpacing: 0.3 },
  subTotalRow: { backgroundColor: "#e8eaf6" },
  grandTotalRow: { backgroundColor: colors.primary, borderRadius: 4, marginTop: 4 },
  grandTotalLabel: { fontWeight: typography.weights.bold, color: colors.surface, fontSize: 10 },
  grandTotalVal: { fontWeight: typography.weights.bold, color: colors.accent, fontSize: 10 },
  emptyRow: { textAlign: "center", color: colors.textMuted, fontSize: typography.sizes.sm, padding: 12 },
  actionCard: { marginBottom: 12 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.background, padding: 10, borderRadius: 8, marginBottom: 12 },
  titleText: { flex: 1, fontSize: typography.sizes.sm, color: colors.text, fontStyle: "italic" },
  actionRow: { flexDirection: "row", gap: 10 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 12, borderRadius: 10 },
  actionBtnText: { color: "#fff", fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 24 },
  modalContent: { backgroundColor: colors.surface, borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: typography.sizes.md, fontWeight: typography.weights.bold, color: colors.primary, marginBottom: 12 },
  titleInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 12, fontSize: typography.sizes.sm, color: colors.text, minHeight: 60, textAlignVertical: "top" },
  modalBtns: { flexDirection: "row", gap: 10, marginTop: 16 },
  halfBtn: { flex: 1 },
});
