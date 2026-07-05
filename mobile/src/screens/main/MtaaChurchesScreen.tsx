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
import { Card, Input, Button, EmptyState, FAB } from "../../components/common";
import { churchApi } from "../../api/services";
import { useAuthStore } from "../../store/authStore";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import type { Church, Mtaa } from "../../types";
import type { MitaaStackParamList } from "../../navigation/MitaaStack";

type Props = NativeStackScreenProps<MitaaStackParamList, "MtaaChurches">;

export default function MtaaChurchesScreen({ route, navigation }: Props) {
  const { mtaa } = route.params;
  const [churches, setChurches] = useState<Church[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Church | null>(null);
  const [form, setForm] = useState({
    name: "",
    pastor_name: "",
    phone: "",
    address: "",
    member_count: "",
  });
  const { user } = useAuthStore();
  const canWrite = user?.role !== "viewer";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await churchApi.get(mtaa.id);
      setChurches(res.data);
    } catch {
      Alert.alert("Kosa", "Imeshindwa kupakia makanisa.");
    } finally {
      setLoading(false);
    }
  }, [mtaa.id]);

  useEffect(() => {
    load();
    navigation.setOptions({ title: `Makanisa — ${mtaa.name}` });
  }, [load, mtaa.name, navigation]);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", pastor_name: "", phone: "", address: "", member_count: "" });
    setModalVisible(true);
  };

  const openEdit = (church: Church) => {
    setEditing(church);
    setForm({
      name: church.name,
      pastor_name: church.pastor_name || "",
      phone: church.phone || "",
      address: church.address || "",
      member_count: church.member_count?.toString() || "",
    });
    setModalVisible(true);
  };

  const save = async () => {
    if (!form.name) {
      Alert.alert("Tafadhali", "Jina la kanisa linahitajika.");
      return;
    }
    const payload: Partial<Church> = {
      name: form.name,
      pastor_name: form.pastor_name,
      phone: form.phone,
      address: form.address,
      member_count: parseInt(form.member_count || "0", 10),
      mtaa: mtaa.id,
    };
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
    Alert.alert("Thibitisha", "Una uhakika unataka kufuta kanisa hili?", [
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
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => navigation.navigate("ChurchDetail", { church: item, mtaa })}
    >
      <Card style={styles.itemCard}>
        <View style={styles.itemRow}>
          <View style={styles.iconWrap}>
            <Icon name="church" size={28} color={colors.accent} />
          </View>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            {item.pastor_name ? (
              <Text style={styles.itemMeta}>
                <Icon name="account" size={13} color={colors.textMuted} /> {item.pastor_name}
              </Text>
            ) : null}
            {item.member_count ? (
              <Text style={styles.itemMeta}>
                <Icon name="account-group" size={13} color={colors.textMuted} /> {item.member_count} wanachama
              </Text>
            ) : null}
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
      <View style={styles.flex}>
        <FlatList
          data={churches}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          refreshing={loading}
          onRefresh={load}
          ListHeaderComponent={
            <Text style={styles.subtitle}>
              Jimbo: {mtaa.jimbo_name || `#${mtaa.jimbo}`}  •  Mtaa: {mtaa.name}
            </Text>
          }
          ListEmptyComponent={
            <EmptyState message="Hakuna makanisa katika mtaa huu. Bonyeza + kuongeza." />
          }
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        />
        <FAB onPress={openAdd} />
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScroll} keyboardShouldPersistTaps="handled">
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {editing ? "Hariri Kanisa" : "Ongeza Kanisa"}
              </Text>
              <Text style={styles.modalSub}>Mtaa: {mtaa.name}</Text>
              <Input
                label="Jina la Kanisa *"
                value={form.name}
                onChangeText={(t) => setForm({ ...form, name: t })}
                placeholder="Weka jina la kanisa"
              />
              <Input
                label="Mchungaji"
                value={form.pastor_name}
                onChangeText={(t) => setForm({ ...form, pastor_name: t })}
                placeholder="Weka jina la mchungaji"
              />
              <Input
                label="Simu"
                value={form.phone}
                onChangeText={(t) => setForm({ ...form, phone: t })}
                keyboardType="phone-pad"
                placeholder="Nambari ya simu"
              />
              <Input
                label="Anwani"
                value={form.address}
                onChangeText={(t) => setForm({ ...form, address: t })}
                placeholder="Mahali pa kanisa"
              />
              <Input
                label="Idadi ya Wanachama"
                value={form.member_count}
                onChangeText={(t) => setForm({ ...form, member_count: t })}
                keyboardType="numeric"
                placeholder="0"
              />
              <View style={styles.modalActions}>
                <Button
                  title="Ghairi"
                  onPress={() => setModalVisible(false)}
                  variant="outline"
                  style={styles.modalBtn}
                />
                <Button
                  title="Hifadhi"
                  onPress={save}
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
  screen: { flex: 1, paddingHorizontal: 16 },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    marginVertical: 12,
    fontStyle: "italic",
  },
  itemCard: { marginBottom: 10 },
  itemRow: { flexDirection: "row", alignItems: "center" },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent + "20",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  itemInfo: { flex: 1 },
  itemName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  itemMeta: { fontSize: typography.sizes.sm, color: colors.textMuted, marginTop: 2 },
  rowEnd: { flexDirection: "row", alignItems: "center" },
  actionBtn: { padding: 6 },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay },
  modalScroll: { flexGrow: 1, justifyContent: "center", padding: 20 },
  modalContent: { backgroundColor: colors.surface, borderRadius: 16, padding: 20 },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: 4,
  },
  modalSub: { fontSize: typography.sizes.sm, color: colors.textMuted, marginBottom: 16 },
  modalActions: { flexDirection: "row", justifyContent: "space-between", marginTop: 16 },
  modalBtn: { flex: 1, marginHorizontal: 4 },
});
