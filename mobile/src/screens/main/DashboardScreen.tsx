import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Card, Header, EmptyState } from "../../components/common";
import { dashboardApi } from "../../api/services";
import { useAuthStore } from "../../store/authStore";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { formatMoney } from "../../utils/helpers";
import type { DashboardStats } from "../../types";

const statIcons: Record<string, string> = {
  "Makanisa": "church",
  "Mitaa": "map-marker-multiple",
  "Wanachama": "account-group",
  "Waliobatizwa": "water",
  "Waliokombolewa": "heart",
  "Waliotembelewa": "walk",
  "Waliosaidika": "hand-heart",
  "Matoleo": "cash",
  "Sehemu ya Kanisa": "bank",
  "Inayoelekea Jimboni": "arrow-up-circle",
};

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const { data } = await dashboardApi.stats();
      setStats(data);
    } catch {
      setStats(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const statItems = stats ? [
    { label: "Mitaa", value: stats.total_mitaa },
    { label: "Makanisa", value: stats.total_churches },
    { label: "Wanachama", value: stats.total_members },
    { label: "Waliobatizwa", value: stats.total_baptized },
    { label: "Waliokombolewa", value: stats.total_converted },
    { label: "Waliotembelewa", value: stats.total_visited },
    { label: "Waliosaidika", value: stats.total_supported },
    { label: "Matoleo (TSh)", value: formatMoney(stats.total_offerings) },
    { label: "Sehemu ya Kanisa (TSh)", value: formatMoney(stats.church_share) },
    { label: "Inayoelekea Jimboni (TSh)", value: formatMoney(stats.field_share) },
  ] : [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Header
          title={`Habari, ${user?.full_name || user?.username || ""}`}
          subtitle="Muhtasari wa mfumo wa YESAYA MINISTRY"
        />

        {loading ? (
          <Text style={styles.loading}>Inapakia...</Text>
        ) : stats ? (
          <View style={styles.grid}>
            {statItems.map((item) => (
              <Card key={item.label} style={styles.statCard}>
                <View style={styles.statRow}>
                  <View>
                    <Text style={styles.statValue}>{item.value}</Text>
                    <Text style={styles.statLabel}>{item.label}</Text>
                  </View>
                  <View style={styles.iconCircle}>
                    <Icon name={statIcons[item.label] || "chart-box"} size={22} color={colors.accent} />
                  </View>
                </View>
              </Card>
            ))}
          </View>
        ) : (
          <EmptyState message="Haiwezi kupakia taarifa. Hakikisha unakwenda kwenye server." />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 16, paddingBottom: 32 },
  loading: { textAlign: "center", color: colors.textMuted, marginTop: 20 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  statCard: { width: "31%", marginBottom: 12 },
  statRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  statValue: { fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, color: colors.primary },
  statLabel: { fontSize: typography.sizes.sm, color: colors.textMuted, marginTop: 2 },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent + "20",
    alignItems: "center",
    justifyContent: "center",
  },
});
