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
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Card, Input, Button, Header, EmptyState, FAB, SelectPicker } from "../../components/common";
import { mtaaApi, jimboApi } from "../../api/services";
import { useAuthStore } from "../../store/authStore";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import type { Mtaa, Jimbo } from "../../types";
import type { MitaaStackParamList } from "../../navigation/MitaaStack";

type Props = NativeStackScreenProps<MitaaStackParamList, "MitaaList">;

export default function MitaaScreen({ navigation }: Props) {
  const [mitaa, setMitaa] = useState<Mtaa[]>([]);
  const [jimbo, setJimbo] = useState<Jimbo[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Mtaa | null>(null);
  const [form, setForm] = useState({ name: "", leader_name: "", phone: "", location: "", jimbo: "" });
  const [jimboModalVisible, setJimboModalVisible] = useState(false);
  const [jimboForm, setJimboForm] = useState({ name: "", district: "", region: "", address: "", phone: "", email: "" });
  const [savingJimbo, setSavingJimbo] = useState(false);
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

  const openAddJimbo = () => {
    setJimboForm({ name: "", district: "", region: "", address: "", phone: "", email: "" });
    setJimboModalVisible(true);
  };

  const saveJimbo = async () => {
    if (!jimboForm.name) {
      Alert.alert("Tafadhali", "Jina la Jimbo linahitajika.");
      return;
    }
    setSavingJimbo(true);
    try {
      const res = await jimboApi.create(jimboForm);
      const newJimbo = res.data;
      const updated = [...jimbo, newJimbo];
      setJimbo(updated);
      setForm((f) => ({ ...f, jimbo: newJimbo.id.toString() }));
      setJimboModalVisible(false);
    } catch {
      Alert.alert("Kosa", "Imeshindwa kuhifadhi Jimbo.");
    } finally {
      setSavingJimbo(false);
    }
  };

  const getJimboName = (id: number) => jimbo.find((j) => j.id === id)?.name || `Jimbo ${id}`;

  const navigateToChurches = (item: Mtaa) => {
    const mtaaWithJimbo = { ...item, jimbo_name: getJimboName(item.jimbo) };
    navigation.navigate("MtaaChurches", { mtaa: mtaaWithJimbo });
  };

  const renderItem = ({ item }: { item: Mtaa }) => (
    <TouchableOpacity activeOpacity={0.8} onPress={() => navigateToChurches(item)}>
      <Card style={styles.itemCard}>
        <View style={styles.itemRow}>
          <View style={styles.iconWrap}>
            <Icon name="map-marker" size={26} color={colors.accent} />
          </View>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemMeta}>Jimbo: {getJimboName(item.jimbo)}</Text>
            {item.leader_name ? <Text style={styles.itemMeta}>Kiongozi: {item.leader_name}</Text> : null}
            {item.location ? <Text style={styles.itemMeta}>Mahali: {item.location}</Text> : null}
          </View>
          <View style={styles.rowEnd}>
            {canWrite && (
              <TouchableOpacity onPress={() => openEdit(item)} style={styles.actionBtn}>
                <Icon name="pencil" size={18} color={colors.primary} />
              </TouchableOpacity>
            )}
            {canWrite && (
              <TouchableOpacity onPress={() => remove(item.id)} style={styles.actionBtn}>
                <Icon name="delete" size={18} color={colors.error} />
              </TouchableOpacity>
            )}
            <Icon name="chevron-right" size={22} color={colors.textMuted} />
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Mitaa" subtitle="Orodha ya mitaa yaliyosajiliwa" />
      <View style={styles.flex}>
        <FlatList
          data={mitaa}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          refreshing={loading}
          onRefresh={load}
          ListEmptyComponent={<EmptyState message="Hakuna mitaa iliyosajiliwa bado." />}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        />
        <FAB onPress={openAdd} />
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

              <View style={styles.jimboHeader}>
                <Text style={styles.jimboLabel}>Chagua Jimbo *</Text>
                <TouchableOpacity style={styles.addJimboBtn} onPress={openAddJimbo}>
                  <Icon name="plus" size={14} color={colors.surface} />
                  <Text style={styles.addJimboBtnText}>Jimbo Mpya</Text>
                </TouchableOpacity>
              </View>
              <SelectPicker
                label=""
                options={jimbo.map((j) => ({ label: j.name, value: j.id.toString() }))}
                value={form.jimbo}
                onChange={(v) => setForm({ ...form, jimbo: v })}
                emptyText="Bonyeza 'Jimbo Mpya' kuongeza."
              />

              <View style={styles.modalActions}>
                <Button title="Ghairi" onPress={() => setModalVisible(false)} variant="outline" style={styles.modalBtn} />
                <Button title="Hifadhi" onPress={save} variant="primary" style={styles.modalBtn} />
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
      <Modal visible={jimboModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScroll} keyboardShouldPersistTaps="handled">
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Ongeza Jimbo Jipya</Text>

              <Input
                label="Jina la Jimbo *"
                value={jimboForm.name}
                onChangeText={(t) => setJimboForm({ ...jimboForm, name: t })}
                placeholder="Mfano: Jimbo la Kaskazini"
              />
              <Input
                label="Wilaya"
                value={jimboForm.district}
                onChangeText={(t) => setJimboForm({ ...jimboForm, district: t })}
                placeholder="Weka jina la wilaya"
              />
              <Input
                label="Mkoa"
                value={jimboForm.region}
                onChangeText={(t) => setJimboForm({ ...jimboForm, region: t })}
                placeholder="Weka jina la mkoa"
              />
              <Input
                label="Anwani"
                value={jimboForm.address}
                onChangeText={(t) => setJimboForm({ ...jimboForm, address: t })}
                placeholder="Weka anwani"
              />
              <Input
                label="Simu"
                value={jimboForm.phone}
                onChangeText={(t) => setJimboForm({ ...jimboForm, phone: t })}
                keyboardType="phone-pad"
                placeholder="Weka nambari ya simu"
              />
              <Input
                label="Barua pepe"
                value={jimboForm.email}
                onChangeText={(t) => setJimboForm({ ...jimboForm, email: t })}
                keyboardType="email-address"
                placeholder="Weka barua pepe"
              />

              <View style={styles.modalActions}>
                <Button title="Ghairi" onPress={() => setJimboModalVisible(false)} variant="outline" style={styles.modalBtn} />
                <Button title={savingJimbo ? "Inahifadhi..." : "Hifadhi"} onPress={saveJimbo} variant="primary" style={styles.modalBtn} />
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
  screen: { flex: 1, padding: 16 },
  addBtn: { marginBottom: 16 },
  itemCard: { marginBottom: 10 },
  iconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.accent + "20", alignItems: "center", justifyContent: "center", marginRight: 12 },
  itemRow: { flexDirection: "row", alignItems: "center" },
  rowEnd: { flexDirection: "row", alignItems: "center" },
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
  jimboHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4, marginTop: 8 },
  jimboLabel: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.text },
  addJimboBtn: { flexDirection: "row", alignItems: "center", backgroundColor: colors.accent, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14, gap: 4 },
  addJimboBtnText: { fontSize: typography.sizes.xs, color: colors.surface, fontWeight: typography.weights.semibold },
});
