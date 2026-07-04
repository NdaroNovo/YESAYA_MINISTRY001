import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Card, Header, EmptyState } from "../../components/common";
import { dashboardApi } from "../../api/services";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { formatMoney } from "../../utils/helpers";
import type { DashboardStats } from "../../types";

export default function ReportsScreen() {
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

  const reportItems = stats ? [
    { label: "Jumla ya Mitaa", value: stats.total_mitaa, icon: "map-marker-multiple" },
    { label: "Jumla ya Makanisa", value: stats.total_churches, icon: "church" },
    { label: "Jumla ya Wanachama", value: stats.total_members, icon: "account-group" },
    { label: "Waliobatizwa", value: stats.total_baptized, icon: "water" },
    { label: "Waliokombolewa", value: stats.total_converted, icon: "heart" },
    { label: "Waliotembelewa", value: stats.total_visited, icon: "walk" },
    { label: "Waliosaidika", value: stats.total_supported, icon: "hand-heart" },
    { label: "Jumla ya Matoleo", value: `TSh ${formatMoney(stats.total_offerings)}`, icon: "cash" },
    { label: "Mchango wa Kanisa", value: `TSh ${formatMoney(stats.church_share)}`, icon: "bank" },
    { label: "Mchango wa Jimbo", value: `TSh ${formatMoney(stats.field_share)}`, icon: "home-group" },
  ] : [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Header title="Ripoti" subtitle="Muhtasari wa taarifa za mfumo" />

        {loading ? (
          <Text style={styles.loading}>Inapakia...</Text>
        ) : stats ? (
          <View>
            {reportItems.map((item) => (
              <Card key={item.label} style={styles.reportCard}>
                <View style={styles.reportRow}>
                  <View style={styles.iconCircle}>
                    <Icon name={item.icon} size={22} color={colors.accent} />
                  </View>
                  <View style={styles.reportInfo}>
                    <Text style={styles.reportValue}>{item.value}</Text>
                    <Text style={styles.reportLabel}>{item.label}</Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        ) : (
          <EmptyState message="Hakuna taarifa za ripoti." />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 16, paddingBottom: 32 },
  loading: { textAlign: "center", color: colors.textMuted, marginTop: 20 },
  reportCard: { marginBottom: 10 },
  reportRow: { flexDirection: "row", alignItems: "center" },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent + "20",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  reportInfo: { flex: 1 },
  reportValue: { fontSize: typography.sizes.md, fontWeight: typography.weights.bold, color: colors.primary },
  reportLabel: { fontSize: typography.sizes.sm, color: colors.textMuted, marginTop: 2 },
});
