import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Modal,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Card, Input, Button, Header, EmptyState } from "../../components/common";
import { evangelismApi, offeringApi, churchApi, offeringTypeApi } from "../../api/services";
import { useAuthStore } from "../../store/authStore";
import { useLocation } from "../../hooks/useLocation";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { MONTHS, formatMoney } from "../../utils/helpers";
import type { EvangelismRecord, Offering, Church, OfferingType } from "../../types";

type TabType = "evangelism" | "offerings";

export default function RecordsScreen() {
  const [tab, setTab] = useState<TabType>("evangelism");
  const [evangelism, setEvangelism] = useState<EvangelismRecord[]>([]);
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [churches, setChurches] = useState<Church[]>([]);
  const [offeringTypes, setOfferingTypes] = useState<OfferingType[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [evForm, setEvForm] = useState({ church: "", month: "", year: "", baptized: "", converted: "", visited: "", supported: "", comments: "" });
  const [offForm, setOffForm] = useState({ church: "", offering_type: "", amount: "", month: "", year: "", notes: "" });
  const { user } = useAuthStore();
  const { capture } = useLocation();
  const canWrite = user?.role !== "viewer";

  const load = async () => {
    setLoading(true);
    try {
      const [evRes, offRes, cRes, otRes] = await Promise.all([
        evangelismApi.get(),
        offeringApi.get(),
        churchApi.get(),
        offeringTypeApi.get(),
      ]);
      setEvangelism(evRes.data.results || evRes.data);
      setOfferings(offRes.data.results || offRes.data);
      setChurches(cRes.data.results || cRes.data);
      setOfferingTypes(otRes.data.results || otRes.data);
    } catch {
      Alert.alert("Kosa", "Imeshindwa kupakia taarifa.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    const churchId = churches[0]?.id.toString() || "";
    const now = new Date();
    setEvForm({ church: churchId, month: (now.getMonth() + 1).toString(), year: now.getFullYear().toString(), baptized: "", converted: "", visited: "", supported: "", comments: "" });
    setOffForm({ church: churchId, offering_type: offeringTypes[0]?.id.toString() || "", amount: "", month: (now.getMonth() + 1).toString(), year: now.getFullYear().toString(), notes: "" });
    setModalVisible(true);
  };

  const saveEvangelism = async () => {
    const loc = await capture();
    const payload = {
      church: parseInt(evForm.church, 10),
      month: parseInt(evForm.month, 10),
      year: parseInt(evForm.year, 10),
      baptized: parseInt(evForm.baptized || "0", 10),
      converted: parseInt(evForm.converted || "0", 10),
      visited: parseInt(evForm.visited || "0", 10),
      supported: parseInt(evForm.supported || "0", 10),
      comments: evForm.comments,
      ...(loc ? { latitude: loc.latitude, longitude: loc.longitude, location_accuracy: loc.accuracy } : {}),
    };
    try {
      await evangelismApi.create(payload);
      setModalVisible(false);
      load();
    } catch {
      Alert.alert("Kosa", "Imeshindwa kuhifadhi taarifa za uinjilisti.");
    }
  };

  const saveOffering = async () => {
    const loc = await capture();
    const payload = {
      church: parseInt(offForm.church, 10),
      offering_type: parseInt(offForm.offering_type, 10),
      amount: offForm.amount,
      month: parseInt(offForm.month, 10),
      year: parseInt(offForm.year, 10),
      notes: offForm.notes,
      ...(loc ? { latitude: loc.latitude, longitude: loc.longitude, location_accuracy: loc.accuracy } : {}),
    };
    try {
      await offeringApi.create(payload);
      setModalVisible(false);
      load();
    } catch {
      Alert.alert("Kosa", "Imeshindwa kuhifadhi taarifa za matoleo.");
    }
  };

  const renderEv = ({ item }: { item: EvangelismRecord }) => (
    <Card style={styles.itemCard}>
      <Text style={styles.itemTitle}>{MONTHS[item.month]} {item.year}</Text>
      <Text style={styles.itemMeta}>Waliobatizwa: {item.baptized} | Waliokombolewa: {item.converted}</Text>
      <Text style={styles.itemMeta}>Waliotembelewa: {item.visited} | Waliosaidika: {item.supported}</Text>
    </Card>
  );

  const renderOff = ({ item }: { item: Offering }) => (
    <Card style={styles.itemCard}>
      <Text style={styles.itemTitle}>{MONTHS[item.month]} {item.year}</Text>
      <Text style={styles.itemMeta}>Kiasi: TSh {formatMoney(item.amount)}</Text>
      <Text style={styles.itemMeta}>Kanisa: TSh {formatMoney(item.church_share)} | Jimbo: TSh {formatMoney(item.field_share)}</Text>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.screen}>
        <Header title="Taarifa" subtitle="Uinjilisti na Matoleo" />

        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, tab === "evangelism" && styles.tabActive]}
            onPress={() => setTab("evangelism")}
          >
            <Text style={[styles.tabText, tab === "evangelism" && styles.tabTextActive]}>Uinjilisti</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === "offerings" && styles.tabActive]}
            onPress={() => setTab("offerings")}
          >
            <Text style={[styles.tabText, tab === "offerings" && styles.tabTextActive]}>Matoleo</Text>
          </TouchableOpacity>
        </View>

        {canWrite && (
          <Button title="Ongeza Taarifa" onPress={openAdd} variant="secondary" style={styles.addBtn} />
        )}

        {tab === "evangelism" ? (
          <FlatList
            data={evangelism}
            keyExtractor={(item) => `ev-${item.id}`}
            renderItem={renderEv}
            refreshing={loading}
            onRefresh={load}
            ListEmptyComponent={<EmptyState message="Hakuna taarifa za uinjilisti." />}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        ) : (
          <FlatList
            data={offerings}
            keyExtractor={(item) => `off-${item.id}`}
            renderItem={renderOff}
            refreshing={loading}
            onRefresh={load}
            ListEmptyComponent={<EmptyState message="Hakuna taarifa za matoleo." />}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        )}
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ongeza {tab === "evangelism" ? "Uinjilisti" : "Matoleo"}</Text>
            {tab === "evangelism" ? (
              <>
                <Input label="Kanisa ID" value={evForm.church} onChangeText={(t) => setEvForm({ ...evForm, church: t })} keyboardType="numeric" />
                <Input label="Mwezi (1-12)" value={evForm.month} onChangeText={(t) => setEvForm({ ...evForm, month: t })} keyboardType="numeric" />
                <Input label="Mwaka" value={evForm.year} onChangeText={(t) => setEvForm({ ...evForm, year: t })} keyboardType="numeric" />
                <Input label="Waliobatizwa" value={evForm.baptized} onChangeText={(t) => setEvForm({ ...evForm, baptized: t })} keyboardType="numeric" />
                <Input label="Waliokombolewa" value={evForm.converted} onChangeText={(t) => setEvForm({ ...evForm, converted: t })} keyboardType="numeric" />
                <Input label="Waliotembelewa" value={evForm.visited} onChangeText={(t) => setEvForm({ ...evForm, visited: t })} keyboardType="numeric" />
                <Input label="Waliosaidika" value={evForm.supported} onChangeText={(t) => setEvForm({ ...evForm, supported: t })} keyboardType="numeric" />
                <Input label="Maoni" value={evForm.comments} onChangeText={(t) => setEvForm({ ...evForm, comments: t })} />
              </>
            ) : (
              <>
                <Input label="Kanisa ID" value={offForm.church} onChangeText={(t) => setOffForm({ ...offForm, church: t })} keyboardType="numeric" />
                <Input label="Aina ya Toleo ID" value={offForm.offering_type} onChangeText={(t) => setOffForm({ ...offForm, offering_type: t })} keyboardType="numeric" />
                <Input label="Kiasi" value={offForm.amount} onChangeText={(t) => setOffForm({ ...offForm, amount: t })} keyboardType="numeric" />
                <Input label="Mwezi (1-12)" value={offForm.month} onChangeText={(t) => setOffForm({ ...offForm, month: t })} keyboardType="numeric" />
                <Input label="Mwaka" value={offForm.year} onChangeText={(t) => setOffForm({ ...offForm, year: t })} keyboardType="numeric" />
                <Input label="Maoni" value={offForm.notes} onChangeText={(t) => setOffForm({ ...offForm, notes: t })} />
              </>
            )}
            <View style={styles.modalActions}>
              <Button title="Ghairi" onPress={() => setModalVisible(false)} variant="outline" style={styles.modalBtn} />
              <Button title="Hifadhi" onPress={tab === "evangelism" ? saveEvangelism : saveOffering} variant="primary" style={styles.modalBtn} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  screen: { flex: 1, padding: 16 },
  tabBar: { flexDirection: "row", marginBottom: 16, backgroundColor: colors.surface, borderRadius: 10, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 8 },
  tabActive: { backgroundColor: colors.primary },
  tabText: { color: colors.textMuted, fontWeight: typography.weights.medium },
  tabTextActive: { color: colors.surface },
  addBtn: { marginBottom: 16 },
  itemCard: { marginBottom: 10 },
  itemTitle: { fontSize: typography.sizes.md, fontWeight: typography.weights.semibold, color: colors.primary },
  itemMeta: { fontSize: typography.sizes.sm, color: colors.textMuted, marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: "center", padding: 20 },
  modalContent: { backgroundColor: colors.surface, borderRadius: 16, padding: 20, maxHeight: "90%" },
  modalTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.primary, marginBottom: 16 },
  modalActions: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  modalBtn: { flex: 1, marginHorizontal: 4 },
});
