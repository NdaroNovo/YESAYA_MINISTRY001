import React, { useState } from "react";
import { View, Text, StyleSheet, Image, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, Input, Button } from "../../components/common";
import { useAuthStore } from "../../store/authStore";
import { authApi } from "../../api/services";
import { useLocation } from "../../hooks/useLocation";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slowMsg, setSlowMsg] = useState<string | null>(null);
  const { setAuth } = useAuthStore();
  const { capture } = useLocation();

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
      await capture();
      const { data } = await authApi.login({ username, password });
      clearTimeout(slowTimer);
      await setAuth(data.user, data.access);
    } catch (err: any) {
      clearTimeout(slowTimer);
      const msg = err.response?.data?.detail || err.message || "Imeshindwa kuingia. Jaribu tena.";
      setError(msg);
    } finally {
      clearTimeout(slowTimer);
      setSlowMsg(null);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.logoSection}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>MY</Text>
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
          </Card>

          <Text style={styles.footer}>© {new Date().getFullYear()} YESAYA MINISTRY</Text>
        </ScrollView>
      </KeyboardAvoidingView>
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
});
