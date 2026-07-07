import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  TouchableOpacity, Modal, Alert, TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Card, SelectPicker, Button } from "../../components/common";
import { jimboApi, mtaaApi, churchApi, evangelismApi, offeringApi } from "../../api/services";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { formatMoney, MONTHS } from "../../utils/helpers";
import type { Jimbo, Mtaa, Church, EvangelismRecord, Offering } from "../../types";

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
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [titleModal, setTitleModal] = useState(false);
  const [reportTitle, setReportTitle] = useState("");
  const [generated, setGenerated] = useState(false);

  const notify = (msg: string) => Alert.alert("✅ Imekamilika", msg);

  useEffect(() => {
    (async () => {
      const [jr, mr, cr] = await Promise.all([jimboApi.get(), mtaaApi.get(), churchApi.get()]);
      setJimboList(jr.data);
      setMtaaList(mr.data);
      setChurchList(cr.data);
      if (jr.data.length) setSelectedJimbo(jr.data[0].id.toString());
      if (mr.data.length) setSelectedMtaa(mr.data[0].id.toString());
      if (cr.data.length) setSelectedChurch(cr.data[0].id.toString());
    })();
  }, []);

  const filteredMtaa = selectedJimbo
    ? mtaaList.filter((m) => m.jimbo.toString() === selectedJimbo)
    : mtaaList;

  const filteredChurches = selectedMtaa
    ? churchList.filter((c) => c.mtaa.toString() === selectedMtaa)
    : churchList;

  const generateReport = useCallback(async () => {
    setLoading(true);
    try {
      let evData: EvangelismRecord[] = [];
      let offData: Offering[] = [];

      if (reportType === "kanisa" && selectedChurch) {
        const [er, or] = await Promise.all([
          evangelismApi.get(parseInt(selectedChurch, 10)),
          offeringApi.get(parseInt(selectedChurch, 10)),
        ]);
        evData = er.data;
        offData = or.data;
      } else if (reportType === "mtaa" && selectedMtaa) {
        const churches = churchList.filter((c) => c.mtaa.toString() === selectedMtaa);
        const results = await Promise.all(churches.map((c) => Promise.all([
          evangelismApi.get(c.id), offeringApi.get(c.id),
        ])));
        results.forEach(([er, or]) => { evData.push(...er.data); offData.push(...or.data); });
      } else if (reportType === "jimbo" && selectedJimbo) {
        const mtaas = mtaaList.filter((m) => m.jimbo.toString() === selectedJimbo);
        const churches = churchList.filter((c) => mtaas.some((m) => m.id === c.mtaa));
        const results = await Promise.all(churches.map((c) => Promise.all([
          evangelismApi.get(c.id), offeringApi.get(c.id),
        ])));
        results.forEach(([er, or]) => { evData.push(...er.data); offData.push(...or.data); });
      }

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
      notify("Ripoti imetengenezwa! Unaweza kushare au kuprint.");
    } catch {
      Alert.alert("Kosa", "Imeshindwa kupakia taarifa.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [reportType, selectedChurch, selectedMtaa, selectedJimbo, month, year, mtaaList, churchList]);

  const evTotals = {
    baptized: evangelism.reduce((s, e) => s + e.baptized, 0),
    converted: evangelism.reduce((s, e) => s + e.converted, 0),
    visited: evangelism.reduce((s, e) => s + e.visited, 0),
    supported: evangelism.reduce((s, e) => s + e.supported, 0),
  };
  const offTotal = offerings.reduce((s, o) => s + parseFloat(o.amount || "0"), 0);

  const getLabel = () => {
    if (reportType === "kanisa") return churchList.find((c) => c.id.toString() === selectedChurch)?.name || "";
    if (reportType === "mtaa") return mtaaList.find((m) => m.id.toString() === selectedMtaa)?.name || "";
    return jimboList.find((j) => j.id.toString() === selectedJimbo)?.name || "";
  };

  const periodLabel = month ? `${MONTHS[parseInt(month, 10)]} ${year}` : `Mwaka ${year}`;

  const buildHTML = () => {
    const title = reportTitle || `Ripoti ya ${getLabel()} - ${periodLabel}`;
    const now = new Date().toLocaleDateString("sw-TZ");

    const evRows = evangelism.length
      ? evangelism.map((e) => `
        <tr>
          <td>${MONTHS[e.month] || e.month}</td><td>${e.year}</td>
          <td>${e.baptized}</td><td>${e.converted}</td>
          <td>${e.visited}</td><td>${e.supported}</td>
          <td>${e.comments || "-"}</td>
        </tr>`).join("")
      : `<tr><td colspan="7" style="text-align:center;color:#999">Hakuna taarifa</td></tr>`;

    const offRows = offerings.length
      ? offerings.map((o) => `
        <tr>
          <td>${MONTHS[o.month] || o.month}</td><td>${o.year}</td>
          <td>TSh ${formatMoney(parseFloat(o.amount))}</td>
          <td>TSh ${formatMoney(parseFloat(o.church_share || "0"))}</td>
          <td>${o.notes || "-"}</td>
        </tr>`).join("")
      : `<tr><td colspan="5" style="text-align:center;color:#999">Hakuna matoleo</td></tr>`;

    return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<style>
  body{font-family:Arial,sans-serif;margin:20px;color:#1a237e;font-size:12px}
  h1{text-align:center;font-size:18px;color:#1a237e;border-bottom:2px solid #f59e0b;padding-bottom:8px}
  h2{font-size:14px;color:#1a237e;margin-top:20px;background:#e8eaf6;padding:6px 10px;border-radius:4px}
  .meta{text-align:center;color:#555;font-size:11px;margin-bottom:16px}
  table{width:100%;border-collapse:collapse;margin-top:8px}
  th{background:#1a237e;color:#fff;padding:6px 8px;text-align:left;font-size:11px}
  td{padding:5px 8px;border-bottom:1px solid #e0e0e0;font-size:11px}
  tr:nth-child(even){background:#f5f5f5}
  .totals{background:#fff3e0;font-weight:bold}
  .totals td{color:#e65100}
  .summary{display:flex;gap:12px;margin:12px 0;flex-wrap:wrap}
  .box{background:#e8eaf6;border-radius:6px;padding:10px 16px;flex:1;min-width:100px;text-align:center}
  .box-val{font-size:20px;font-weight:bold;color:#f59e0b}
  .box-lbl{font-size:10px;color:#555;margin-top:2px}
</style></head><body>
<h1>${title}</h1>
<div class="meta">Aina: ${reportType.toUpperCase()} | ${getLabel()} | Kipindi: ${periodLabel} | Tarehe: ${now}</div>

<div class="summary">
  <div class="box"><div class="box-val">${evTotals.baptized}</div><div class="box-lbl">Waliobatizwa</div></div>
  <div class="box"><div class="box-val">${evTotals.converted}</div><div class="box-lbl">Walioongolewa</div></div>
  <div class="box"><div class="box-val">${evTotals.visited}</div><div class="box-lbl">Waliotembelewa</div></div>
  <div class="box"><div class="box-val">${evTotals.supported}</div><div class="box-lbl">Waliosaidika</div></div>
  <div class="box"><div class="box-val">TSh ${formatMoney(offTotal)}</div><div class="box-lbl">Jumla Matoleo</div></div>
</div>

<h2>Taarifa za Uinjilisti</h2>
<table><thead><tr><th>Mwezi</th><th>Mwaka</th><th>Waliobatizwa</th><th>Walioongolewa</th><th>Waliotembelewa</th><th>Waliosaidika</th><th>Maoni</th></tr></thead>
<tbody>${evRows}
<tr class="totals"><td colspan="2">JUMLA</td><td>${evTotals.baptized}</td><td>${evTotals.converted}</td><td>${evTotals.visited}</td><td>${evTotals.supported}</td><td>-</td></tr>
</tbody></table>

<h2>Taarifa za Matoleo</h2>
<table><thead><tr><th>Mwezi</th><th>Mwaka</th><th>Kiasi</th><th>Sehemu ya Kanisa</th><th>Maoni</th></tr></thead>
<tbody>${offRows}
<tr class="totals"><td colspan="2">JUMLA</td><td>TSh ${formatMoney(offTotal)}</td><td>-</td><td>-</td></tr>
</tbody></table>
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

  const handleTitleSave = () => {
    setTitleModal(false);
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
            <Card style={styles.summaryCard}>
              <Text style={styles.sectionTitle}>📊 Muhtasari — {getLabel()} ({periodLabel})</Text>
              <View style={styles.summaryGrid}>
                {[
                  { label: "Waliobatizwa", value: evTotals.baptized, icon: "water", color: "#1e88e5" },
                  { label: "Walioongolewa", value: evTotals.converted, icon: "heart", color: "#e53935" },
                  { label: "Waliotembelewa", value: evTotals.visited, icon: "walk", color: "#43a047" },
                  { label: "Waliosaidika", value: evTotals.supported, icon: "hand-heart", color: "#fb8c00" },
                  { label: "Jumla Matoleo", value: `TSh ${formatMoney(offTotal)}`, icon: "cash", color: "#8e24aa" },
                ].map((item) => (
                  <View key={item.label} style={styles.summaryBox}>
                    <Icon name={item.icon} size={20} color={item.color} />
                    <Text style={[styles.summaryVal, { color: item.color }]}>{item.value}</Text>
                    <Text style={styles.summaryLbl}>{item.label}</Text>
                  </View>
                ))}
              </View>
            </Card>

            <Card style={styles.tableCard}>
              <Text style={styles.sectionTitle}>📋 Uinjilisti</Text>
              <View style={styles.tableHeader}>
                {["Mwezi", "Mwaka", "Batizwa", "Ongolewa", "Tembelewa", "Saidika"].map((h) => (
                  <Text key={h} style={styles.th}>{h}</Text>
                ))}
              </View>
              {evangelism.length === 0 ? (
                <Text style={styles.emptyRow}>Hakuna taarifa</Text>
              ) : (
                evangelism.map((e) => (
                  <View key={e.id} style={styles.tableRow}>
                    <Text style={styles.td}>{MONTHS[e.month] || e.month}</Text>
                    <Text style={styles.td}>{e.year}</Text>
                    <Text style={styles.td}>{e.baptized}</Text>
                    <Text style={styles.td}>{e.converted}</Text>
                    <Text style={styles.td}>{e.visited}</Text>
                    <Text style={styles.td}>{e.supported}</Text>
                  </View>
                ))
              )}
              {evangelism.length > 0 && (
                <View style={[styles.tableRow, styles.totalRow]}>
                  <Text style={[styles.td, styles.totalLabel]}>JUMLA</Text>
                  <Text style={styles.td}></Text>
                  <Text style={[styles.td, styles.totalVal]}>{evTotals.baptized}</Text>
                  <Text style={[styles.td, styles.totalVal]}>{evTotals.converted}</Text>
                  <Text style={[styles.td, styles.totalVal]}>{evTotals.visited}</Text>
                  <Text style={[styles.td, styles.totalVal]}>{evTotals.supported}</Text>
                </View>
              )}
            </Card>

            <Card style={styles.tableCard}>
              <Text style={styles.sectionTitle}>💰 Matoleo</Text>
              <View style={styles.tableHeader}>
                {["Mwezi", "Mwaka", "Kiasi", "Kanisa"].map((h) => (
                  <Text key={h} style={styles.th}>{h}</Text>
                ))}
              </View>
              {offerings.length === 0 ? (
                <Text style={styles.emptyRow}>Hakuna matoleo</Text>
              ) : (
                offerings.map((o) => (
                  <View key={o.id} style={styles.tableRow}>
                    <Text style={styles.td}>{MONTHS[o.month] || o.month}</Text>
                    <Text style={styles.td}>{o.year}</Text>
                    <Text style={styles.td}>{formatMoney(parseFloat(o.amount))}</Text>
                    <Text style={styles.td}>{formatMoney(parseFloat(o.church_share || "0"))}</Text>
                  </View>
                ))
              )}
              {offerings.length > 0 && (
                <View style={[styles.tableRow, styles.totalRow]}>
                  <Text style={[styles.td, styles.totalLabel]}>JUMLA</Text>
                  <Text style={styles.td}></Text>
                  <Text style={[styles.td, styles.totalVal]}>TSh {formatMoney(offTotal)}</Text>
                  <Text style={styles.td}></Text>
                </View>
              )}
            </Card>

            <Card style={styles.actionCard}>
              <Text style={styles.sectionTitle}>📤 Shiriki / Chapa Ripoti</Text>
              <TouchableOpacity style={styles.titleRow} onPress={() => setTitleModal(true)}>
                <Icon name="pencil" size={16} color={colors.accent} />
                <Text style={styles.titleText}>{reportTitle || "Bonyeza kuweka kichwa cha habari..."}</Text>
              </TouchableOpacity>
              <View style={styles.actionRow}>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "#1e88e5" }]} onPress={handleShare}>
                  <Icon name="share-variant" size={20} color="#fff" />
                  <Text style={styles.actionBtnText}>Shiriki (PDF)</Text>
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
  summaryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  summaryBox: { flex: 1, minWidth: "28%", backgroundColor: colors.background, borderRadius: 8, padding: 10, alignItems: "center" },
  summaryVal: { fontSize: typography.sizes.md, fontWeight: typography.weights.bold, marginTop: 4 },
  summaryLbl: { fontSize: 9, color: colors.textMuted, textAlign: "center", marginTop: 2 },
  tableCard: { marginBottom: 12 },
  tableHeader: { flexDirection: "row", backgroundColor: colors.primary, borderRadius: 6, paddingVertical: 6, paddingHorizontal: 4, marginBottom: 2 },
  th: { flex: 1, color: colors.surface, fontSize: 9, fontWeight: typography.weights.bold, textAlign: "center" },
  tableRow: { flexDirection: "row", paddingVertical: 5, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: colors.border },
  td: { flex: 1, fontSize: 10, color: colors.text, textAlign: "center" },
  totalRow: { backgroundColor: colors.accent + "20", borderRadius: 4 },
  totalLabel: { fontWeight: typography.weights.bold, color: colors.primary },
  totalVal: { fontWeight: typography.weights.bold, color: colors.accent },
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
