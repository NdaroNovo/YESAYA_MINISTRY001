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
import { churchApi, mtaaApi } from "../../api/services";
import { useAuthStore } from "../../store/authStore";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import type { Church, Mtaa } from "../../types";

export default function ChurchesScreen() {
  const [churches, setChurches] = useState<Church[]>([]);
  const [mitaa, setMitaa] = useState<Mtaa[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Church | null>(null);
  const [form, setForm] = useState({ name: "", pastor_name: "", phone: "", address: "", member_count: "", mtaa: "" });
  const { user } = useAuthStore();
  const canWrite = user?.role !== "viewer";

  const load = async () => {
    setLoading(true);
    try {
      const [cRes, mRes] = await Promise.all([churchApi.get(), mtaaApi.get()]);
      setChurches(cRes.data.results || cRes.data);
      setMitaa(mRes.data.results || mRes.data);
    } catch {
      Alert.alert("Kosa", "Imeshindwa kupakia makanisa.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", pastor_name: "", phone: "", address: "", member_count: "", mtaa: mitaa[0]?.id.toString() || "" });
    setModalVisible(true);
  };

  const openEdit = (church: Church) => {
    setEditing(church);
    setForm({
      name: church.name,
      pastor_name: church.pastor_name,
      phone: church.phone,
      address: church.address,
      member_count: church.member_count.toString(),
      mtaa: church.mtaa.toString(),
    });
    setModalVisible(true);
  };

  const save = async () => {
    if (!form.name || !form.mtaa) {
      Alert.alert("Tafadhali", "Jina la kanisa na mtaa zinahitajika.");
      return;
    }
    const payload = { ...form, member_count: parseInt(form.member_count || "0", 10), mtaa: parseInt(form.mtaa, 10) };
    try {
      if (editing) {
        await churchApi.update(editing.id, payload);
      } else {
        await churchApi.create(payload);
      }
      setModalVisible(false);
      load();
    } catch {
      Alert.alert("Kosa", "Imeshindwa kuhifadhi kanisa.");
    }
  };

  const remove = (id: number) => {
    Alert.alert("Thibitisha", "Una uhakika unataka kufuta kanisa hiki?", [
      { text: "Ghairi", style: "cancel" },
      {
        text: "Futa",
        style: "destructive",
        onPress: async () => {
          try {
            await churchApi.delete(id);
            load();
          } catch {
            Alert.alert("Kosa", "Imeshindwa kufuta kanisa.");
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Church }) => (
    <Card style={styles.itemCard}>
      <View style={styles.itemRow}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemMeta}>Mchungaji: {item.pastor_name || "Haijajazwa"}</Text>
          <Text style={styles.itemMeta}>Wanachama: {item.member_count}</Text>
        </View>
        {canWrite && (
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => openEdit(item)} style={styles.actionBtn}>
              <Icon name="pencil" size={20} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => remove(item.id)} style={styles.actionBtn}>
              <Icon name="delete" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.screen}>
        <Header title="Makanisa" subtitle="Orodha ya makanisa yaliyosajiliwa" />
        {canWrite && (
          <Button title="Ongeza Kanisa" onPress={openAdd} variant="secondary" style={styles.addBtn} />
        )}
        <FlatList
          data={churches}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          refreshing={loading}
          onRefresh={load}
          ListEmptyComponent={<EmptyState message="Hakuna makanisa yaliyosajiliwa bado." />}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editing ? "Hariri Kanisa" : "Ongeza Kanisa"}</Text>
            <Input label="Jina la Kanisa" value={form.name} onChangeText={(t) => setForm({ ...form, name: t })} />
            <Input label="Mchungaji" value={form.pastor_name} onChangeText={(t) => setForm({ ...form, pastor_name: t })} />
            <Input label="Simu" value={form.phone} onChangeText={(t) => setForm({ ...form, phone: t })} keyboardType="phone-pad" />
            <Input label="Anuani" value={form.address} onChangeText={(t) => setForm({ ...form, address: t })} />
            <Input label="Idadi ya Wanachama" value={form.member_count} onChangeText={(t) => setForm({ ...form, member_count: t })} keyboardType="numeric" />
            <Input label="Mtaa ID" value={form.mtaa} onChangeText={(t) => setForm({ ...form, mtaa: t })} keyboardType="numeric" />
            <View style={styles.modalActions}>
              <Button title="Ghairi" onPress={() => setModalVisible(false)} variant="outline" style={styles.modalBtn} />
              <Button title="Hifadhi" onPress={save} variant="primary" style={styles.modalBtn} />
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
  addBtn: { marginBottom: 16 },
  itemCard: { marginBottom: 10 },
  itemRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  itemInfo: { flex: 1 },
  itemName: { fontSize: typography.sizes.md, fontWeight: typography.weights.semibold, color: colors.primary },
  itemMeta: { fontSize: typography.sizes.sm, color: colors.textMuted, marginTop: 2 },
  actions: { flexDirection: "row" },
  actionBtn: { padding: 8, marginLeft: 8 },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: "center", padding: 20 },
  modalContent: { backgroundColor: colors.surface, borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.primary, marginBottom: 16 },
  modalActions: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  modalBtn: { flex: 1, marginHorizontal: 4 },
});
