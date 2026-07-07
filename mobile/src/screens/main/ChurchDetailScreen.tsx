import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Modal,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Card, Input, Button, EmptyState, FAB, SelectPicker } from "../../components/common";
import { evangelismApi, offeringApi, offeringTypeApi, churchApi } from "../../api/services";
import { useAuthStore } from "../../store/authStore";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { formatMoney, MONTHS } from "../../utils/helpers";
import type { EvangelismRecord, Offering, OfferingType, Church } from "../../types";
import type { MitaaStackParamList } from "../../navigation/MitaaStack";

type Props = NativeStackScreenProps<MitaaStackParamList, "ChurchDetail">;
type TabType = "info" | "evangelism" | "offerings";

const CURRENT_YEAR = new Date().getFullYear().toString();
const CURRENT_MONTH = (new Date().getMonth() + 1).toString();

const MONTH_OPTIONS = [
  { label: "Januari", value: "1" },
  { label: "Februari", value: "2" },
  { label: "Machi", value: "3" },
  { label: "Aprili", value: "4" },
  { label: "Mei", value: "5" },
  { label: "Juni", value: "6" },
  { label: "Julai", value: "7" },
  { label: "Agosti", value: "8" },
  { label: "Septemba", value: "9" },
  { label: "Oktoba", value: "10" },
  { label: "Novemba", value: "11" },
  { label: "Desemba", value: "12" },
];

const YEAR_OPTIONS = Array.from({ length: 10 }, (_, i) => {
  const y = (new Date().getFullYear() - i).toString();
  return { label: y, value: y };
});

export default function ChurchDetailScreen({ route, navigation }: Props) {
  const { church: initialChurch, mtaa } = route.params;
  const [church, setChurch] = useState<Church>(initialChurch);
  const [tab, setTab] = useState<TabType>("info");
  const [evangelism, setEvangelism] = useState<EvangelismRecord[]>([]);
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [offeringTypes, setOfferingTypes] = useState<OfferingType[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMember, setEditingMember] = useState(false);
  const [memberCount, setMemberCount] = useState(church.member_count?.toString() || "0");
  const { user } = useAuthStore();
  const canWrite = user?.role !== "viewer";

  const [evForm, setEvForm] = useState({
    month: CURRENT_MONTH, year: CURRENT_YEAR,
    baptized: "", converted: "", visited: "", supported: "", comments: "",
  });
  const [offForm, setOffForm] = useState({
    offering_type: "", amount: "", month: CURRENT_MONTH, year: CURRENT_YEAR, notes: "",
  });
  const [editingEv, setEditingEv] = useState<EvangelismRecord | null>(null);
  const [editingOff, setEditingOff] = useState<Offering | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [evRes, offRes, otRes] = await Promise.all([
        evangelismApi.get(church.id),
        offeringApi.get(church.id),
        offeringTypeApi.get(),
      ]);
      setEvangelism(evRes.data);
      setOfferings(offRes.data);
      setOfferingTypes(otRes.data);
    } catch {
      Alert.alert("Kosa", "Imeshindwa kupakia taarifa.");
    } finally {
      setLoading(false);
    }
  }, [church.id]);

  useEffect(() => {
    navigation.setOptions({ title: church.name });
    loadData();
  }, [church.id, church.name, loadData, navigation]);

  const saveMemberCount = async () => {
    try {
      const res = await churchApi.update(church.id, { member_count: parseInt(memberCount || "0", 10) });
      setChurch(res.data);
      setEditingMember(false);
      Alert.alert("Imehifadhiwa", "Idadi ya wanachama imesasishwa.");
    } catch {
      Alert.alert("Kosa", "Imeshindwa kuhifadhi.");
    }
  };

  const openAddEv = () => {
    setEditingEv(null);
    setEvForm({ month: CURRENT_MONTH, year: CURRENT_YEAR, baptized: "", converted: "", visited: "", supported: "", comments: "" });
    setModalVisible(true);
  };

  const openEditEv = (ev: EvangelismRecord) => {
    setEditingEv(ev);
    setEvForm({
      month: ev.month.toString(), year: ev.year.toString(),
      baptized: ev.baptized.toString(), converted: ev.converted.toString(),
      visited: ev.visited.toString(), supported: ev.supported.toString(),
      comments: ev.comments || "",
    });
    setModalVisible(true);
  };

  const openAddOff = () => {
    setEditingOff(null);
    setOffForm({ offering_type: offeringTypes[0]?.id.toString() || "", amount: "", month: CURRENT_MONTH, year: CURRENT_YEAR, notes: "" });
    setModalVisible(true);
  };

  const openEditOff = (off: Offering) => {
    setEditingOff(off);
    setOffForm({
      offering_type: off.offering_type.toString(), amount: off.amount,
      month: off.month.toString(), year: off.year.toString(), notes: off.notes || "",
    });
    setModalVisible(true);
  };

  const saveEvangelism = async () => {
    if (!evForm.month || !evForm.year) {
      Alert.alert("Tafadhali", "Mwezi na mwaka zinahitajika.");
      return;
    }
    const payload = {
      church: church.id,
      month: parseInt(evForm.month, 10),
      year: parseInt(evForm.year, 10),
      baptized: parseInt(evForm.baptized || "0", 10),
      converted: parseInt(evForm.converted || "0", 10),
      visited: parseInt(evForm.visited || "0", 10),
      supported: parseInt(evForm.supported || "0", 10),
      comments: evForm.comments,
    };
    try {
      if (editingEv) {
        await evangelismApi.update(editingEv.id, payload);
      } else {
        await evangelismApi.create(payload);
      }
      setModalVisible(false);
      loadData();
      Alert.alert("✅ Imefanikiwa", "Taarifa ya uinjilisti imehifadhiwa.");
    } catch (err: any) {
      const msg = err?.response?.data
        ? JSON.stringify(err.response.data)
        : "Imeshindwa kuhifadhi taarifa ya uinjilisti.";
      Alert.alert("Kosa", msg);
    }
  };

  const saveOffering = async () => {
    if (!offForm.offering_type || !offForm.amount) {
      Alert.alert("Tafadhali", "Aina ya toleo na kiasi vinahitajika.");
      return;
    }
    const payload = {
      church: church.id,
      offering_type: parseInt(offForm.offering_type, 10),
      amount: offForm.amount,
      month: parseInt(offForm.month, 10),
      year: parseInt(offForm.year, 10),
      notes: offForm.notes,
    };
    try {
      if (editingOff) {
        await offeringApi.update(editingOff.id, payload);
      } else {
        await offeringApi.create(payload);
      }
      setModalVisible(false);
      loadData();
      Alert.alert("✅ Imefanikiwa", "Toleo limehifadhiwa.");
    } catch (err: any) {
      const msg = err?.response?.data
        ? JSON.stringify(err.response.data)
        : "Imeshindwa kuhifadhi toleo.";
      Alert.alert("Kosa", msg);
    }
  };

  const deleteEv = (id: number) => {
    Alert.alert("Futa", "Una uhakika?", [
      { text: "Ghairi", style: "cancel" },
      { text: "Futa", style: "destructive", onPress: async () => { await evangelismApi.delete(id); loadData(); } },
    ]);
  };

  const deleteOff = (id: number) => {
    Alert.alert("Futa", "Una uhakika?", [
      { text: "Ghairi", style: "cancel" },
      { text: "Futa", style: "destructive", onPress: async () => { await offeringApi.delete(id); loadData(); } },
    ]);
  };

  const getTypeName = (id: number) => offeringTypes.find((t) => t.id === id)?.name || `#${id}`;

  const renderInfo = () => (
    <ScrollView contentContainerStyle={styles.infoScroll}>
      <Card style={styles.infoCard}>
        <View style={styles.infoHeaderRow}>
          <Icon name="church" size={40} color={colors.accent} />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={styles.churchName}>{church.name}</Text>
            <Text style={styles.infoMeta}>Mtaa: {mtaa.name}</Text>
            <Text style={styles.infoMeta}>Jimbo: {mtaa.jimbo_name || `#${mtaa.jimbo}`}</Text>
          </View>
        </View>
      </Card>

      <Card style={styles.infoCard}>
        <Text style={styles.sectionTitle}>
          <Icon name="account-group" size={16} color={colors.primary} /> Taarifa za Kanisa
        </Text>
        {church.pastor_name ? (
          <Text style={styles.infoRow}><Text style={styles.infoLabel}>Mchungaji: </Text>{church.pastor_name}</Text>
        ) : null}
        {church.phone ? (
          <Text style={styles.infoRow}><Text style={styles.infoLabel}>Simu: </Text>{church.phone}</Text>
        ) : null}
        {church.address ? (
          <Text style={styles.infoRow}><Text style={styles.infoLabel}>Anwani: </Text>{church.address}</Text>
        ) : null}

        <View style={styles.memberRow}>
          <View>
            <Text style={styles.memberCount}>{church.member_count || 0}</Text>
            <Text style={styles.memberLabel}>Wanachama</Text>
          </View>
          {canWrite && !editingMember && (
            <TouchableOpacity
              style={styles.editMemberBtn}
              onPress={() => { setMemberCount(church.member_count?.toString() || "0"); setEditingMember(true); }}
            >
              <Icon name="pencil" size={16} color={colors.surface} />
              <Text style={styles.editMemberText}>Sasisha</Text>
            </TouchableOpacity>
          )}
        </View>

        {editingMember && (
          <View style={styles.memberEdit}>
            <Input
              label="Idadi mpya ya Wanachama"
              value={memberCount}
              onChangeText={setMemberCount}
              keyboardType="numeric"
            />
            <View style={styles.memberEditBtns}>
              <Button title="Ghairi" onPress={() => setEditingMember(false)} variant="outline" style={styles.halfBtn} />
              <Button title="Hifadhi" onPress={saveMemberCount} variant="primary" style={styles.halfBtn} />
            </View>
          </View>
        )}
      </Card>
    </ScrollView>
  );

  const renderEvItem = ({ item }: { item: EvangelismRecord }) => (
    <Card style={styles.itemCard}>
      <View style={styles.itemRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.itemTitle}>
            {MONTHS[item.month - 1] || `Mwezi ${item.month}`} {item.year}
          </Text>
          <Text style={styles.itemMeta}>Waliobatizwa: <Text style={styles.highlight}>{item.baptized}</Text></Text>
          <Text style={styles.itemMeta}>Walioongolewa: <Text style={styles.highlight}>{item.converted}</Text></Text>
          <Text style={styles.itemMeta}>Waliotembelewa: {item.visited}</Text>
          <Text style={styles.itemMeta}>Waliosaidika: {item.supported}</Text>
          {item.comments ? <Text style={styles.itemMeta}>Maoni: {item.comments}</Text> : null}
        </View>
        {canWrite && (
          <View style={styles.itemActions}>
            <TouchableOpacity onPress={() => openEditEv(item)} style={styles.actionBtn}>
              <Icon name="pencil" size={18} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteEv(item.id)} style={styles.actionBtn}>
              <Icon name="delete" size={18} color={colors.error} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Card>
  );

  const renderOffItem = ({ item }: { item: Offering }) => (
    <Card style={styles.itemCard}>
      <View style={styles.itemRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.itemTitle}>{getTypeName(item.offering_type)}</Text>
          <Text style={styles.itemMeta}>
            {MONTHS[item.month - 1] || `Mwezi ${item.month}`} {item.year}
          </Text>
          <Text style={styles.itemMeta}>Kiasi: <Text style={styles.highlight}>{formatMoney(parseFloat(item.amount))}</Text></Text>
          {item.church_share ? <Text style={styles.itemMeta}>Sehemu ya Kanisa: {formatMoney(parseFloat(item.church_share))}</Text> : null}
          {item.notes ? <Text style={styles.itemMeta}>Maoni: {item.notes}</Text> : null}
        </View>
        {canWrite && (
          <View style={styles.itemActions}>
            <TouchableOpacity onPress={() => openEditOff(item)} style={styles.actionBtn}>
              <Icon name="pencil" size={18} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteOff(item.id)} style={styles.actionBtn}>
              <Icon name="delete" size={18} color={colors.error} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Card>
  );

  const isEvModal = tab === "evangelism";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.tabBar}>
        {(["info", "evangelism", "offerings"] as TabType[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Icon
              name={t === "info" ? "information" : t === "evangelism" ? "account-heart" : "cash"}
              size={16}
              color={tab === t ? colors.surface : colors.textMuted}
            />
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === "info" ? "Taarifa" : t === "evangelism" ? "Uinjilisti" : "Matoleo"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === "info" ? (
        renderInfo()
      ) : tab === "evangelism" ? (
        <View style={styles.flex}>
          <FlatList
            data={evangelism}
            keyExtractor={(item) => `ev-${item.id}`}
            renderItem={renderEvItem}
            refreshing={loading}
            onRefresh={loadData}
            ListEmptyComponent={<EmptyState message="Hakuna taarifa za uinjilisti. Bonyeza + kuongeza." />}
            contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          />
          <FAB onPress={openAddEv} />
        </View>
      ) : (
        <View style={styles.flex}>
          <FlatList
            data={offerings}
            keyExtractor={(item) => `off-${item.id}`}
            renderItem={renderOffItem}
            refreshing={loading}
            onRefresh={loadData}
            ListEmptyComponent={<EmptyState message="Hakuna matoleo. Bonyeza + kuongeza." />}
            contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          />
          <FAB onPress={openAddOff} />
        </View>
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScroll} keyboardShouldPersistTaps="handled">
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {isEvModal
                  ? (editingEv ? "Hariri Uinjilisti" : "Ongeza Uinjilisti")
                  : (editingOff ? "Hariri Toleo" : "Ongeza Toleo")}
              </Text>
              <Text style={styles.modalSub}>{church.name}</Text>

              {isEvModal ? (
                <>
                  <SelectPicker label="Mwezi *" options={MONTH_OPTIONS} value={evForm.month} onChange={(v) => setEvForm({ ...evForm, month: v })} />
                  <SelectPicker label="Mwaka *" options={YEAR_OPTIONS} value={evForm.year} onChange={(v) => setEvForm({ ...evForm, year: v })} />
                  <Input label="Waliobatizwa" value={evForm.baptized} onChangeText={(t) => setEvForm({ ...evForm, baptized: t })} keyboardType="numeric" placeholder="0" />
                  <Input label="Walioongolewa" value={evForm.converted} onChangeText={(t) => setEvForm({ ...evForm, converted: t })} keyboardType="numeric" placeholder="0" />
                  <Input label="Waliotembelewa" value={evForm.visited} onChangeText={(t) => setEvForm({ ...evForm, visited: t })} keyboardType="numeric" placeholder="0" />
                  <Input label="Waliosaidika" value={evForm.supported} onChangeText={(t) => setEvForm({ ...evForm, supported: t })} keyboardType="numeric" placeholder="0" />
                  <Input label="Maoni" value={evForm.comments} onChangeText={(t) => setEvForm({ ...evForm, comments: t })} placeholder="Maelezo zaidi..." />
                </>
              ) : (
                <>
                  <SelectPicker
                    label="Aina ya Toleo *"
                    options={offeringTypes.map((ot) => ({ label: ot.name, value: ot.id.toString() }))}
                    value={offForm.offering_type}
                    onChange={(v) => setOffForm({ ...offForm, offering_type: v })}
                    emptyText="Hakuna aina za matoleo zilizosajiliwa."
                  />
                  <Input label="Kiasi (TSh) *" value={offForm.amount} onChangeText={(t) => setOffForm({ ...offForm, amount: t })} keyboardType="numeric" placeholder="0" />
                  <SelectPicker label="Mwezi" options={MONTH_OPTIONS} value={offForm.month} onChange={(v) => setOffForm({ ...offForm, month: v })} />
                  <SelectPicker label="Mwaka" options={YEAR_OPTIONS} value={offForm.year} onChange={(v) => setOffForm({ ...offForm, year: v })} />
                  <Input label="Maoni" value={offForm.notes} onChangeText={(t) => setOffForm({ ...offForm, notes: t })} placeholder="Maelezo zaidi..." />
                </>
              )}

              <View style={styles.modalActions}>
                <Button title="Ghairi" onPress={() => setModalVisible(false)} variant="outline" style={styles.modalBtn} />
                <Button
                  title="Hifadhi"
                  onPress={isEvModal ? saveEvangelism : saveOffering}
                  variant="primary"
                  style={styles.modalBtn}
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  tabBar: {
    flexDirection: "row",
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingBottom: 8,
    paddingTop: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 8,
    borderRadius: 8,
  },
  tabActive: { backgroundColor: colors.accent + "30" },
  tabText: { fontSize: typography.sizes.xs, color: colors.textMuted, fontWeight: typography.weights.medium },
  tabTextActive: { color: colors.surface, fontWeight: typography.weights.bold },
  infoScroll: { padding: 16, paddingBottom: 40 },
  infoCard: { marginBottom: 16 },
  infoHeaderRow: { flexDirection: "row", alignItems: "center" },
  churchName: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.primary },
  infoMeta: { fontSize: typography.sizes.sm, color: colors.textMuted, marginTop: 2 },
  sectionTitle: { fontSize: typography.sizes.md, fontWeight: typography.weights.semibold, color: colors.primary, marginBottom: 12 },
  infoRow: { fontSize: typography.sizes.sm, color: colors.text, marginBottom: 6 },
  infoLabel: { fontWeight: typography.weights.semibold, color: colors.primary },
  memberRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.border },
  memberCount: { fontSize: 36, fontWeight: typography.weights.bold, color: colors.accent },
  memberLabel: { fontSize: typography.sizes.sm, color: colors.textMuted },
  editMemberBtn: { flexDirection: "row", alignItems: "center", backgroundColor: colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, gap: 6 },
  editMemberText: { color: colors.surface, fontSize: typography.sizes.sm, fontWeight: typography.weights.medium },
  memberEdit: { marginTop: 12 },
  memberEditBtns: { flexDirection: "row", gap: 8, marginTop: 4 },
  halfBtn: { flex: 1 },
  itemCard: { marginBottom: 10 },
  itemRow: { flexDirection: "row", alignItems: "flex-start" },
  itemTitle: { fontSize: typography.sizes.md, fontWeight: typography.weights.semibold, color: colors.primary, marginBottom: 4 },
  itemMeta: { fontSize: typography.sizes.sm, color: colors.textMuted, marginTop: 2 },
  highlight: { color: colors.accent, fontWeight: typography.weights.bold },
  itemActions: { flexDirection: "column" },
  actionBtn: { padding: 6 },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay },
  modalScroll: { flexGrow: 1, justifyContent: "center", padding: 20 },
  modalContent: { backgroundColor: colors.surface, borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.primary, marginBottom: 4 },
  modalSub: { fontSize: typography.sizes.sm, color: colors.textMuted, marginBottom: 16 },
  modalActions: { flexDirection: "row", justifyContent: "space-between", marginTop: 16 },
  modalBtn: { flex: 1, marginHorizontal: 4 },
});
