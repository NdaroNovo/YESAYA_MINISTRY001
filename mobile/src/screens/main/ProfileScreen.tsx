import React, { useState } from "react";
import { View, Text, StyleSheet, Modal, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Card, Input, Button, Header } from "../../components/common";
import { useAuthStore } from "../../store/authStore";
import { authApi } from "../../api/services";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { getRoleLabel } from "../../utils/helpers";

export default function ProfileScreen() {
  const { user, clearAuth } = useAuthStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleLogout = async () => {
    await clearAuth();
  };

  const changePassword = async () => {
    if (!currentPassword || !newPassword || newPassword.length < 8) {
      Alert.alert("Tafadhali", "Nenosiri jipya lazima liwe na herufi 8 au zaidi.");
      return;
    }
    try {
      await authApi.changePassword(currentPassword, newPassword);
      Alert.alert("Imefanikiwa", "Nenosiri limebadilishwa.");
      setModalVisible(false);
      setCurrentPassword("");
      setNewPassword("");
    } catch {
      Alert.alert("Kosa", "Imeshindwa kubadilisha nenosiri.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.screen}>
        <Header title="Wasifu" subtitle="Taarifa zako na mipangilio" />

        <Card style={styles.profileCard}>
          <View style={styles.avatar}>
            <Icon name="account-circle" size={64} color={colors.accent} />
          </View>
          <Text style={styles.name}>{user?.full_name || user?.username}</Text>
          <Text style={styles.role}>{getRoleLabel(user?.role || "")}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <Text style={styles.phone}>{user?.phone || "Hakuna simu"}</Text>
        </Card>

        <Button title="Badilisha Nenosiri" onPress={() => setModalVisible(true)} variant="outline" style={styles.btn} />
        <Button title="Toka" onPress={handleLogout} variant="danger" style={styles.btn} />
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Badilisha Nenosiri</Text>
            <Input
              label="Nenosiri la Sasa"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
            />
            <Input
              label="Nenosiri Jipya"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
            <View style={styles.modalActions}>
              <Button title="Ghairi" onPress={() => setModalVisible(false)} variant="outline" style={styles.modalBtn} />
              <Button title="Hifadhi" onPress={changePassword} variant="primary" style={styles.modalBtn} />
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
  profileCard: { alignItems: "center", marginBottom: 20 },
  avatar: { marginBottom: 12 },
  name: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.primary },
  role: { fontSize: typography.sizes.sm, color: colors.accent, fontWeight: typography.weights.semibold, marginTop: 4 },
  email: { fontSize: typography.sizes.sm, color: colors.textMuted, marginTop: 8 },
  phone: { fontSize: typography.sizes.sm, color: colors.textMuted, marginTop: 2 },
  btn: { marginBottom: 12 },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: "center", padding: 20 },
  modalContent: { backgroundColor: colors.surface, borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.primary, marginBottom: 16 },
  modalActions: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  modalBtn: { flex: 1, marginHorizontal: 4 },
});
