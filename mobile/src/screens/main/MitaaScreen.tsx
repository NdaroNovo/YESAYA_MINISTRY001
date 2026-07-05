import React, { useEffect, useState } from "react";
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
import { Card, Input, Button, Header, EmptyState, FAB, SelectPicker } from "../../components/common";
import { mtaaApi, jimboApi } from "../../api/services";
import { useAuthStore } from "../../store/authStore";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import type { Mtaa, Jimbo } from "../../types";

export default function MitaaScreen() {
  const [mitaa, setMitaa] = useState<Mtaa[]>([]);
  const [jimbo, setJimbo] = useState<Jimbo[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Mtaa | null>(null);
  const [form, setForm] = useState({ name: "", leader_name: "", phone: "", location: "", jimbo: "" });
  const { user } = useAuthStore();
  const canWrite = user?.role !== "viewer";

  const load = async () => {
    setLoading(true);
    try {
      const [mRes, jRes] = await Promise.all([mtaaApi.get(), jimboApi.get()]);
      setMitaa(mRes.data);
      setJimbo(jRes.data);
    } catch {
      Alert.alert("Kosa", "Imeshindwa kupakia mitaa.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", leader_name: "", phone: "", location: "", jimbo: jimbo[0]?.id.toString() || "" });
    setModalVisible(true);
  };

  const openEdit = (mtaa: Mtaa) => {
    setEditing(mtaa);
    setForm({
      name: mtaa.name,
      leader_name: mtaa.leader_name,
      phone: mtaa.phone,
      location: mtaa.location,
      jimbo: mtaa.jimbo.toString(),
    });
    setModalVisible(true);
  };

  const save = async () => {
    if (!form.name || !form.jimbo) {
      Alert.alert("Tafadhali", "Jina la Mtaa na Jimbo zinahitajika.");
      return;
    }
    const payload = { ...form, jimbo: parseInt(form.jimbo, 10) };
    try {
      if (editing) {
        await mtaaApi.update(editing.id, payload);
      } else {
        await mtaaApi.create(payload);
      }
      setModalVisible(false);
      load();
    } catch {
      Alert.alert("Kosa", "Imeshindwa kuhifadhi mtaa.");
    }
  };

  const remove = (id: number) => {
    Alert.alert("Thibitisha", "Una uhakika unataka kufuta mtaa huu?", [
      { text: "Ghairi", style: "cancel" },
      {
        text: "Futa",
        style: "destructive",
        onPress: async () => {
          try {
            await mtaaApi.delete(id);
            load();
          } catch {
            Alert.alert("Kosa", "Imeshindwa kufuta mtaa.");
          }
        },
      },
    ]);
  };

  const getJimboName = (id: number) => jimbo.find((j) => j.id === id)?.name || `Jimbo ${id}`;

  const renderItem = ({ item }: { item: Mtaa }) => (
    <Card style={styles.itemCard}>
      <View style={styles.itemRow}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemMeta}>Jimbo: {getJimboName(item.jimbo)}</Text>
          {item.leader_name ? <Text style={styles.itemMeta}>Kiongozi: {item.leader_name}</Text> : null}
          {item.phone ? <Text style={styles.itemMeta}>Simu: {item.phone}</Text> : null}
          {item.location ? <Text style={styles.itemMeta}>Mahali: {item.location}</Text> : null}
          <View style={[styles.statusBadge, { backgroundColor: item.is_active ? colors.success + "20" : colors.error + "20" }]}>
            <Text style={[styles.statusText, { color: item.is_active ? colors.success : colors.error }]}>
              {item.is_active ? "Inafanya kazi" : "Imezimwa"}
            </Text>
          </View>
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
        <Header title="Mitaa" subtitle="Orodha ya mitaa yaliyosajiliwa" />
        <FlatList
          data={mitaa}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          refreshing={loading}
          onRefresh={load}
          ListEmptyComponent={<EmptyState message="Hakuna mitaa iliyosajiliwa bado." />}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      {canWrite && <FAB onPress={openAdd} />}
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScroll} keyboardShouldPersistTaps="handled">
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{editing ? "Hariri Mtaa" : "Ongeza Mtaa"}</Text>

              <Input
                label="Jina la Mtaa *"
                value={form.name}
                onChangeText={(t) => setForm({ ...form, name: t })}
                placeholder="Weka jina la mtaa"
              />
              <Input
                label="Jina la Kiongozi"
                value={form.leader_name}
                onChangeText={(t) => setForm({ ...form, leader_name: t })}
                placeholder="Weka jina la kiongozi"
              />
              <Input
                label="Simu"
                value={form.phone}
                onChangeText={(t) => setForm({ ...form, phone: t })}
                keyboardType="phone-pad"
                placeholder="Weka nambari ya simu"
              />
              <Input
                label="Mahali"
                value={form.location}
                onChangeText={(t) => setForm({ ...form, location: t })}
                placeholder="Weka mahali / anwani"
              />

              <SelectPicker
                label="Chagua Jimbo *"
                options={jimbo.map((j) => ({ label: j.name, value: j.id.toString() }))}
                value={form.jimbo}
                onChange={(v) => setForm({ ...form, jimbo: v })}
                emptyText="Hakuna Jimbo. Unda Jimbo kwanza kwenye web app."
              />

              <View style={styles.modalActions}>
                <Button title="Ghairi" onPress={() => setModalVisible(false)} variant="outline" style={styles.modalBtn} />
                <Button title="Hifadhi" onPress={save} variant="primary" style={styles.modalBtn} />
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
  screen: { flex: 1, padding: 16 },
  addBtn: { marginBottom: 16 },
  itemCard: { marginBottom: 10 },
  itemRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  itemInfo: { flex: 1 },
  itemName: { fontSize: typography.sizes.md, fontWeight: typography.weights.semibold, color: colors.primary },
  itemMeta: { fontSize: typography.sizes.sm, color: colors.textMuted, marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, alignSelf: "flex-start", marginTop: 6 },
  statusText: { fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold },
  actions: { flexDirection: "row" },
  actionBtn: { padding: 8, marginLeft: 4 },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay },
  modalScroll: { flexGrow: 1, justifyContent: "center", padding: 20 },
  modalContent: { backgroundColor: colors.surface, borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.primary, marginBottom: 16 },
  modalActions: { flexDirection: "row", justifyContent: "space-between", marginTop: 16 },
  modalBtn: { flex: 1, marginHorizontal: 4 },
});
