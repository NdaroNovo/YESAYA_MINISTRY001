import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Card, Input, Button } from "../../components/common";
import { useAuthStore } from "../../store/authStore";
import { authApi } from "../../api/services";
import { api, currentServerUrl, isDefaultServer, normalizeServerUrl, saveServerUrl } from "../../api/client";
import { useLocation } from "../../hooks/useLocation";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { ENV } from "../../utils/env";
import { getRoleLabel } from "../../utils/helpers";

// Akaunti zinazotengenezwa na `python manage.py seed_demo` (backend/demo.sqlite3)
const DEMO_PASSWORD = "Demo@2026";
const DEMO_ACCOUNTS = [
  { username: "demo_admin", role: "super_admin" },
  { username: "demo_jimbo", role: "jimbo_admin" },
  { username: "demo_mtaa", role: "mtaa_leader" },
  { username: "demo_kanisa", role: "church_leader" },
  { username: "demo_viewer", role: "viewer" },
];

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slowMsg, setSlowMsg] = useState<string | null>(null);
  const [server, setServer] = useState(currentServerUrl());
  const [serverModal, setServerModal] = useState(false);
  const [serverInput, setServerInput] = useState("");
  const [serverStatus, setServerStatus] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const { setAuth } = useAuthStore();
  const { capture } = useLocation();

  useEffect(() => {
    setServer(currentServerUrl());
  }, []);

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Tafadhali jaza jina la mtumiaji na nenosiri.");
      return;
    }
    setLoading(true);
    setError(null);
    setSlowMsg(null);
    const slowTimer = setTimeout(() => {
      setSlowMsg("Server inaamka, tafadhali subiri kidogo...");
    }, 5000);
    try {
      await capture(); // location inatumwa kwenye headers za login (hiari)
      const { data } = await authApi.login({ username: username.trim(), password });
      await setAuth(data.user, data.access, data.refresh);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        setError("Jina la mtumiaji au nenosiri si sahihi.");
      } else if (!err?.response) {
        setError(`Imeshindwa kufikia server:\n${currentServerUrl()}\nHakikisha una intaneti au badilisha server hapa chini.`);
      } else {
        setError(err.response?.data?.detail || "Imeshindwa kuingia. Jaribu tena.");
      }
    } finally {
      clearTimeout(slowTimer);
      setSlowMsg(null);
      setLoading(false);
    }
  };

  const openServerModal = () => {
    setServerInput(isDefaultServer() ? "" : currentServerUrl());
    setServerStatus(null);
    setServerModal(true);
  };

  const testServer = async () => {
    const url = normalizeServerUrl(serverInput);
    setTesting(true);
    setServerStatus(null);
    try {
      const { data } = await api.get("/health/", { baseURL: url, timeout: 15000 });
      setServerStatus(`✅ Server inafanya kazi (${data?.service || "OK"})`);
    } catch {
      setServerStatus("❌ Haipatikani. Hakikisha simu na kompyuta ziko kwenye WiFi moja na server imewashwa.");
    } finally {
      setTesting(false);
    }
  };

  const applyServer = async (input: string) => {
    const url = await saveServerUrl(input);
    setServer(url);
    setServerModal(false);
    setError(null);
  };

  const fillDemo = (demoUser: string) => {
    setUsername(demoUser);
    setPassword(DEMO_PASSWORD);
    setError(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.logoSection}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>YM</Text>
            </View>
            <Text style={styles.title}>YESAYA_MINISTRY</Text>
            <Text style={styles.subtitle}>Mfumo wa usimamizi wa Jimbo, Mitaa na Makanisa</Text>
          </View>

          <Card style={styles.formCard}>
            <Text style={styles.formTitle}>Ingia katika mfumo</Text>
            <Text style={styles.formSubtitle}>Weka taarifa zako za kuingia</Text>

            <Input
              label="Jina la mtumiaji"
              placeholder="Weka jina la mtumiaji"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Input
              label="Nenosiri"
              placeholder="Weka nenosiri"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {error && <Text style={styles.error}>{error}</Text>}
            {slowMsg && !error && <Text style={styles.slowMsg}>{slowMsg}</Text>}

            <Button title="Ingia" onPress={handleLogin} loading={loading} variant="primary" />

            <TouchableOpacity style={styles.serverRow} onPress={openServerModal}>
              <Icon name="server-network" size={16} color={colors.textMuted} />
              <Text style={styles.serverText} numberOfLines={1}>
                {isDefaultServer() && server === ENV.API_URL ? "Server: Rasmi (Render)" : `Server: ${server}`}
              </Text>
              <Icon name="pencil" size={14} color={colors.textMuted} />
            </TouchableOpacity>
          </Card>

          {!isDefaultServer() && (
            <Card style={styles.demoCard}>
              <Text style={styles.demoTitle}>Akaunti za Demo</Text>
              <Text style={styles.demoHint}>Gusa akaunti ili kujaza (nenosiri: {DEMO_PASSWORD})</Text>
              {DEMO_ACCOUNTS.map((a) => (
                <TouchableOpacity key={a.username} style={styles.demoRow} onPress={() => fillDemo(a.username)}>
                  <Text style={styles.demoUser}>{a.username}</Text>
                  <Text style={styles.demoRole}>{getRoleLabel(a.role)}</Text>
                </TouchableOpacity>
              ))}
            </Card>
          )}

          <Text style={styles.footer}>© {new Date().getFullYear()} YESAYA MINISTRY</Text>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={serverModal} animationType="slide" transparent onRequestClose={() => setServerModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.formTitle}>Anwani ya Server</Text>
            <Text style={styles.formSubtitle}>
              Kwa demo, weka IP ya kompyuta inayoendesha server, mf. 192.168.1.10:8010
            </Text>
            <Input
              label="Server"
              placeholder="192.168.1.10:8010"
              value={serverInput}
              onChangeText={setServerInput}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
            {serverInput ? <Text style={styles.serverPreview}>{normalizeServerUrl(serverInput)}</Text> : null}
            {serverStatus && <Text style={styles.serverStatus}>{serverStatus}</Text>}
            <Button title="Jaribu Muunganiko" onPress={testServer} loading={testing} variant="outline" style={styles.modalBtn} />
            <Button title="Hifadhi" onPress={() => applyServer(serverInput)} variant="primary" style={styles.modalBtn} />
            <Button title="Rudi Server Rasmi" onPress={() => applyServer("")} variant="outline" style={styles.modalBtn} />
            <Button title="Funga" onPress={() => setServerModal(false)} variant="danger" style={styles.modalBtn} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  logoText: {
    color: colors.primary,
    fontSize: typography.sizes["2xl"],
    fontWeight: typography.weights.bold,
  },
  title: {
    color: colors.surface,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  subtitle: {
    color: colors.accentLight,
    fontSize: typography.sizes.sm,
    textAlign: "center",
    marginTop: 6,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
  },
  formTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    marginBottom: 20,
  },
  error: {
    color: colors.error,
    fontSize: typography.sizes.sm,
    marginBottom: 12,
    textAlign: "center",
  },
  footer: {
    color: colors.accentLight,
    fontSize: typography.sizes.xs,
    textAlign: "center",
    marginTop: 24,
  },
  slowMsg: {
    color: colors.accent,
    fontSize: typography.sizes.sm,
    marginBottom: 12,
    textAlign: "center",
  },
  serverRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    gap: 6,
  },
  serverText: {
    color: colors.textMuted,
    fontSize: typography.sizes.xs,
    flexShrink: 1,
  },
  demoCard: {
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
  },
  demoTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  demoHint: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginBottom: 8,
  },
  demoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  demoUser: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  demoRole: {
    fontSize: typography.sizes.sm,
    color: colors.accent,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
  },
  serverPreview: {
    fontSize: typography.sizes.xs,
    color: colors.info,
    marginBottom: 8,
  },
  serverStatus: {
    fontSize: typography.sizes.sm,
    color: colors.text,
    marginBottom: 12,
  },
  modalBtn: {
    marginTop: 8,
  },
});
