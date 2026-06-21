import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useHabitStats } from "../hooks/useHabits";
import { exportToCSV } from "../database";
import { Colors, Spacing, Radius, Typography } from "../theme";
import { hapticLight } from "../utils/haptics";

export default function StatsScreen({ navigation }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const { stats, loading } = useHabitStats(refreshKey);

  useFocusEffect(useCallback(() => { setRefreshKey(k => k + 1); }, []));

  const handleExport = async () => {
    hapticLight();
    try {
      const csv = exportToCSV();
      const path = FileSystem.cacheDirectory + "habitforge_export.csv";
      await FileSystem.writeAsStringAsync(path, csv, { encoding: FileSystem.EncodingType.UTF8 });
      const available = await Sharing.isAvailableAsync();
      if (available) {
        await Sharing.shareAsync(path, { mimeType: "text/csv", dialogTitle: "Export Habit Data" });
      } else {
        Alert.alert("Export", "Sharing is not available on this device.");
      }
    } catch (err) {
      console.warn("Export error:", err);
      Alert.alert("Export Failed", "Please try again.");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.centered}><Text style={styles.loadText}>Loading stats...</Text></View>
      </SafeAreaView>
    );
  }

  if (!stats || stats.totalHabits === 0) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.centered}>
          <Text style={{ fontSize: 64 }}>📈</Text>
          <Text style={styles.emptyTitle}>No data yet</Text>
          <Text style={styles.emptySub}>Start building habits to see your stats here</Text>
        </View>
      </SafeAreaView>
    );
  }

  const completionColor = stats.completionRate >= 80 ? Colors.success : stats.completionRate >= 50 ? Colors.warning : Colors.danger;
  const maxBar = Math.max(...stats.weeklyData.map(d => d.count), 1);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Stats</Text>
          <TouchableOpacity style={styles.exportBtn} onPress={handleExport}>
            <Text style={styles.exportText}>↑ Export CSV</Text>
          </TouchableOpacity>
        </View>

        {/* Hero stats */}
        <View style={styles.row}>
          <View style={styles.statCard}><Text style={styles.statEmoji}>🎯</Text><Text style={[styles.statVal, { color: Colors.accent }]}>{stats.totalHabits}</Text><Text style={styles.statLbl}>Active Habits</Text></View>
          <View style={styles.statCard}><Text style={styles.statEmoji}>📅</Text><Text style={[styles.statVal, { color: completionColor }]}>{stats.completionRate}%</Text><Text style={styles.statLbl}>This Week</Text></View>
        </View>
        <View style={styles.row}>
          <View style={styles.statCard}><Text style={styles.statEmoji}>🔥</Text><Text style={[styles.statVal, { color: Colors.warning }]}>{stats.bestStreak}</Text><Text style={styles.statLbl}>Best Streak</Text></View>
          <View style={styles.statCard}><Text style={styles.statEmoji}>✅</Text><Text style={[styles.statVal, { color: Colors.success }]}>{stats.totalCompletions}</Text><Text style={styles.statLbl}>Total Done</Text></View>
        </View>

        {/* Bar chart */}
        <Text style={styles.sectionLabel}>LAST 7 DAYS</Text>
        <View style={styles.chartCard}>
          <View style={styles.bars}>
            {stats.weeklyData.map((d, i) => {
              const pct = d.count / maxBar;
              const isToday = i === stats.weeklyData.length - 1;
              return (
                <View key={i} style={styles.barCol}>
                  <Text style={styles.barCount}>{d.count > 0 ? d.count : ""}</Text>
                  <View style={styles.barBg}>
                    <View style={[styles.barFill, {
                      height: `${Math.max(pct * 100, 3)}%`,
                      backgroundColor: isToday ? Colors.accent : d.count > 0 ? Colors.success : Colors.border,
                    }]} />
                  </View>
                  <Text style={[styles.barDay, isToday && { color: Colors.accent, fontFamily: "Sora_700Bold" }]}>{d.day}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Quick actions */}
        <View style={styles.row}>
          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate("WeeklyReview")}>
            <Text style={styles.actionEmoji}>📋</Text>
            <Text style={styles.actionLabel}>Weekly Review</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate("Badges")}>
            <Text style={styles.actionEmoji}>🏆</Text>
            <Text style={styles.actionLabel}>My Badges</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Today */}
        <View style={styles.todayCard}>
          <Text style={styles.todayLabel}>TODAY</Text>
          <Text style={styles.todayVal}>{stats.todayCount} / {stats.totalHabits} completed</Text>
          <View style={styles.todayTrack}>
            <View style={[styles.todayFill, {
              width: `${stats.totalHabits > 0 ? (stats.todayCount / stats.totalHabits) * 100 : 0}%`,
              backgroundColor: stats.todayCount === stats.totalHabits ? Colors.success : Colors.accent,
            }]} />
          </View>
        </View>

        {/* Per-habit breakdown */}
        <Text style={styles.sectionLabel}>HABIT BREAKDOWN</Text>
        {stats.habitsWithStats.map(h => {
          const pct = h.longestStreak > 0 ? Math.min(100, Math.round((h.currentStreak / h.longestStreak) * 100)) : 0;
          return (
            <View key={h.id} style={styles.habitCard}>
              <View style={styles.habitRow}>
                <View style={[styles.habitIcon, { backgroundColor: `${h.color}22` }]}><Text style={{ fontSize: 18 }}>{h.emoji}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.habitName}>{h.name}</Text>
                  <Text style={styles.habitSub}>{h.totalCompletions} total · Best: {h.longestStreak}d</Text>
                </View>
                <Text style={styles.fire}>🔥</Text>
                <Text style={[styles.streakNum, { color: h.color }]}>{h.currentStreak}</Text>
              </View>
              <View style={styles.miniTrack}>
                <View style={[styles.miniFill, { width: `${pct}%`, backgroundColor: h.color }]} />
              </View>
              <Text style={styles.miniLabel}>{h.currentStreak}/{h.longestStreak} day streak</Text>
            </View>
          );
        })}
        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: 100 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: Spacing.xl },
  loadText: { color: Colors.textSecondary },
  emptyTitle: { fontSize: Typography.size.xl, fontFamily: "Sora_700Bold", color: Colors.text, marginTop: Spacing.lg, marginBottom: Spacing.sm },
  emptySub: { fontSize: Typography.size.md, color: Colors.textSecondary, textAlign: "center" },
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: Spacing.lg, marginBottom: Spacing.xl },
  title: { fontSize: Typography.size.xxxl, fontFamily: "Sora_800ExtraBold", color: Colors.text, letterSpacing: -1 },
  exportBtn: { backgroundColor: Colors.bgCard, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderWidth: 1, borderColor: Colors.border },
  exportText: { color: Colors.textSecondary, fontSize: Typography.size.xs, fontFamily: "DMSans_600SemiBold" },
  row: { flexDirection: "row", gap: Spacing.sm, marginBottom: Spacing.sm },
  statCard: { flex: 1, backgroundColor: Colors.bgCard, borderRadius: Radius.xl, padding: Spacing.lg, alignItems: "center", borderWidth: 1, borderColor: Colors.border },
  statEmoji: { fontSize: 26, marginBottom: Spacing.sm },
  statVal: { fontSize: Typography.size.xxxl, fontFamily: "Sora_800ExtraBold", letterSpacing: -1 },
  statLbl: { fontSize: Typography.size.xs, color: Colors.textMuted, marginTop: 4, textAlign: "center" },
  sectionLabel: { fontSize: Typography.size.xs, color: Colors.textMuted, fontFamily: "DMSans_600SemiBold", letterSpacing: 1.2, marginBottom: Spacing.sm, marginTop: Spacing.md, textTransform: "uppercase" },
  chartCard: { backgroundColor: Colors.bgCard, borderRadius: Radius.xl, padding: Spacing.lg, marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  bars: { flexDirection: "row", alignItems: "flex-end", height: 140, gap: 6 },
  barCol: { flex: 1, alignItems: "center", gap: 4 },
  barCount: { fontSize: 9, color: Colors.textMuted, fontFamily: "DMSans_600SemiBold" },
  barBg: { flex: 1, width: "100%", backgroundColor: Colors.bgElevated, borderRadius: 6, justifyContent: "flex-end", overflow: "hidden" },
  barFill: { width: "100%", borderRadius: 6 },
  barDay: { fontSize: 10, color: Colors.textSecondary, fontFamily: "DMSans_500Medium" },
  actionCard: { flex: 1, backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.md, flexDirection: "row", alignItems: "center", gap: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  actionEmoji: { fontSize: 20 },
  actionLabel: { flex: 1, fontSize: Typography.size.sm, fontFamily: "DMSans_600SemiBold", color: Colors.text },
  actionArrow: { fontSize: Typography.size.xl, color: Colors.textMuted },
  todayCard: { backgroundColor: Colors.bgCard, borderRadius: Radius.xl, padding: Spacing.lg, marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  todayLabel: { fontSize: Typography.size.xs, color: Colors.textMuted, fontFamily: "DMSans_600SemiBold", letterSpacing: 1.2, marginBottom: 4, textTransform: "uppercase" },
  todayVal: { fontSize: Typography.size.lg, fontFamily: "Sora_700Bold", color: Colors.text, marginBottom: Spacing.md },
  todayTrack: { height: 8, backgroundColor: Colors.bgElevated, borderRadius: Radius.full, overflow: "hidden" },
  todayFill: { height: "100%", borderRadius: Radius.full },
  habitCard: { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  habitRow: { flexDirection: "row", alignItems: "center", marginBottom: Spacing.sm },
  habitIcon: { width: 38, height: 38, borderRadius: Radius.md, alignItems: "center", justifyContent: "center", marginRight: Spacing.md },
  habitName: { fontSize: Typography.size.md, fontFamily: "DMSans_600SemiBold", color: Colors.text },
  habitSub: { fontSize: Typography.size.xs, color: Colors.textSecondary, marginTop: 1 },
  fire: { fontSize: 14, marginRight: 2 },
  streakNum: { fontSize: Typography.size.xl, fontFamily: "Sora_800ExtraBold" },
  miniTrack: { height: 4, backgroundColor: Colors.bgElevated, borderRadius: Radius.full, overflow: "hidden", marginBottom: 4 },
  miniFill: { height: "100%", borderRadius: Radius.full },
  miniLabel: { fontSize: Typography.size.xs, color: Colors.textMuted },
});
