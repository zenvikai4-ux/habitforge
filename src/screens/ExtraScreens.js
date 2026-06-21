import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useHabitStats } from "../hooks/useHabits";
import { getAllBadges } from "../database";
import { Colors, Spacing, Radius, Typography, MILESTONE_BADGES } from "../theme";

// ─── Weekly Review ────────────────────────────────────────
export function WeeklyReviewScreen({ navigation }) {
  const { stats, loading } = useHabitStats();

  if (loading || !stats) {
    return (
      <SafeAreaView style={s.container} edges={["top"]}>
        <View style={s.centered}><Text style={s.loadText}>Loading...</Text></View>
      </SafeAreaView>
    );
  }

  const maxBar = Math.max(...stats.weeklyData.map(d => d.count), 1);
  const mostConsistent = stats.habitsWithStats.length > 0
    ? stats.habitsWithStats.reduce((a, b) => a.totalCompletions >= b.totalCompletions ? a : b)
    : null;
  const hotStreak = stats.habitsWithStats.length > 0
    ? stats.habitsWithStats.reduce((a, b) => a.currentStreak >= b.currentStreak ? a : b)
    : null;

  return (
    <SafeAreaView style={s.container} edges={["top"]}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.back}>← Back</Text></TouchableOpacity>
          <Text style={s.title}>Weekly Review</Text>
          <View style={{ width: 60 }} />
        </View>

        <View style={s.chartCard}>
          <Text style={s.chartTitle}>This Week</Text>
          <View style={s.bars}>
            {stats.weeklyData.map((d, i) => {
              const pct = d.count / maxBar;
              const isToday = i === stats.weeklyData.length - 1;
              return (
                <View key={i} style={s.barCol}>
                  <Text style={s.barCount}>{d.count > 0 ? d.count : ""}</Text>
                  <View style={s.barBg}>
                    <View style={[s.barFill, {
                      height: `${Math.max(pct * 100, 4)}%`,
                      backgroundColor: isToday ? Colors.accent : d.count > 0 ? Colors.success : Colors.border,
                    }]} />
                  </View>
                  <Text style={[s.barDay, isToday && { color: Colors.accent, fontFamily: "Sora_700Bold" }]}>{d.day}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={s.statsRow}>
          <View style={s.miniStat}>
            <Text style={s.miniStatEmoji}>📅</Text>
            <Text style={[s.miniStatVal, { color: Colors.accent }]}>{stats.completionRate}%</Text>
            <Text style={s.miniStatLbl}>Completion</Text>
          </View>
          <View style={s.miniStat}>
            <Text style={s.miniStatEmoji}>✅</Text>
            <Text style={[s.miniStatVal, { color: Colors.success }]}>{stats.weeklyData.reduce((t, d) => t + d.count, 0)}</Text>
            <Text style={s.miniStatLbl}>Done</Text>
          </View>
        </View>

        {mostConsistent && mostConsistent.totalCompletions > 0 && (
          <View style={[s.highlight, { borderLeftColor: mostConsistent.color }]}>
            <Text style={s.highlightLabel}>⭐ Most Consistent</Text>
            <View style={s.highlightRow}>
              <Text style={{ fontSize: 32 }}>{mostConsistent.emoji}</Text>
              <View>
                <Text style={s.highlightName}>{mostConsistent.name}</Text>
                <Text style={s.highlightSub}>{mostConsistent.totalCompletions} total completions</Text>
              </View>
            </View>
          </View>
        )}

        {hotStreak && hotStreak.currentStreak > 0 && (
          <View style={[s.highlight, { borderLeftColor: "#FFB347" }]}>
            <Text style={s.highlightLabel}>🔥 Hottest Streak</Text>
            <View style={s.highlightRow}>
              <Text style={{ fontSize: 32 }}>{hotStreak.emoji}</Text>
              <View>
                <Text style={s.highlightName}>{hotStreak.name}</Text>
                <Text style={s.highlightSub}>{hotStreak.currentStreak} days in a row!</Text>
              </View>
            </View>
          </View>
        )}

        <View style={s.motivCard}>
          <Text style={{ fontSize: 36 }}>{stats.completionRate >= 80 ? "🚀" : stats.completionRate >= 50 ? "💪" : "🌱"}</Text>
          <Text style={s.motivText}>
            {stats.completionRate >= 80
              ? "You're crushing it! Keep this momentum going into next week."
              : stats.completionRate >= 50
              ? "Solid week! Push for 80%+ next week and watch yourself transform."
              : "Every great journey starts with showing up. Next week, aim higher!"}
          </Text>
        </View>
        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Badges ───────────────────────────────────────────────
export function BadgesScreen({ navigation }) {
  const earned = getAllBadges();

  return (
    <SafeAreaView style={s.container} edges={["top"]}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.back}>← Back</Text></TouchableOpacity>
          <Text style={s.title}>Badges</Text>
          <View style={{ width: 60 }} />
        </View>
        <Text style={s.badgeSub}>{earned.length} badge{earned.length !== 1 ? "s" : ""} earned</Text>

        <View style={s.badgeGrid}>
          {MILESTONE_BADGES.map(badge => {
            const got = earned.find(e => e.milestone === badge.days);
            return (
              <View key={badge.days} style={[s.badgeCard, !got && { opacity: 0.5 }]}>
                <View style={[s.badgeCircle, { backgroundColor: `${badge.color}20`, borderColor: got ? badge.color : Colors.border }]}>
                  <Text style={{ fontSize: 30 }}>{badge.emoji}</Text>
                  {!got && <View style={s.lockWrap}><Text style={{ fontSize: 12 }}>🔒</Text></View>}
                </View>
                <Text style={[s.badgeLabel, !got && { color: Colors.textMuted }]}>{badge.label}</Text>
                <Text style={s.badgeDays}>{badge.days} days</Text>
                {got && <Text style={s.badgeHabit} numberOfLines={1}>{got.emoji} {got.name}</Text>}
              </View>
            );
          })}
        </View>

        {earned.length > 0 && (
          <>
            <Text style={s.sectionLabel}>RECENTLY EARNED</Text>
            {earned.slice(0, 8).map((b, i) => {
              const badge = MILESTONE_BADGES.find(mb => mb.days === b.milestone);
              return (
                <View key={i} style={s.recentRow}>
                  <View style={[s.recentCircle, { backgroundColor: `${badge?.color}22` }]}>
                    <Text style={{ fontSize: 22 }}>{badge?.emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.recentBadge}>{badge?.label}</Text>
                    <Text style={s.recentHabit}>{b.emoji} {b.name} · {b.milestone} day streak</Text>
                  </View>
                  <Text style={s.recentDate}>{b.earned_at?.split("T")[0]}</Text>
                </View>
              );
            })}
          </>
        )}
        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: 100 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadText: { color: Colors.textSecondary },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: Spacing.lg, marginBottom: Spacing.xl },
  back: { color: Colors.accent, fontSize: Typography.size.md, fontFamily: "DMSans_500Medium" },
  title: { fontSize: Typography.size.xl, fontFamily: "Sora_800ExtraBold", color: Colors.text },
  sectionLabel: { fontSize: Typography.size.xs, color: Colors.textMuted, fontFamily: "DMSans_600SemiBold", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: Spacing.md },
  // Weekly review
  chartCard: { backgroundColor: Colors.bgCard, borderRadius: Radius.xl, padding: Spacing.lg, marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  chartTitle: { fontSize: Typography.size.sm, color: Colors.textMuted, fontFamily: "DMSans_600SemiBold", letterSpacing: 1, textTransform: "uppercase", marginBottom: Spacing.md },
  bars: { flexDirection: "row", alignItems: "flex-end", height: 160, gap: 6 },
  barCol: { flex: 1, alignItems: "center", gap: 4 },
  barCount: { fontSize: 9, color: Colors.textMuted, fontFamily: "DMSans_600SemiBold" },
  barBg: { flex: 1, width: "100%", backgroundColor: Colors.bgElevated, borderRadius: 6, justifyContent: "flex-end", overflow: "hidden" },
  barFill: { width: "100%", borderRadius: 6 },
  barDay: { fontSize: 10, color: Colors.textSecondary, fontFamily: "DMSans_500Medium" },
  statsRow: { flexDirection: "row", gap: Spacing.sm, marginBottom: Spacing.lg },
  miniStat: { flex: 1, backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.lg, alignItems: "center", borderWidth: 1, borderColor: Colors.border },
  miniStatEmoji: { fontSize: 24, marginBottom: 4 },
  miniStatVal: { fontSize: Typography.size.xxxl, fontFamily: "Sora_800ExtraBold", letterSpacing: -1 },
  miniStatLbl: { fontSize: Typography.size.xs, color: Colors.textMuted, marginTop: 2 },
  highlight: { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.lg, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border, borderLeftWidth: 3 },
  highlightLabel: { fontSize: Typography.size.xs, color: Colors.textMuted, fontFamily: "DMSans_600SemiBold", letterSpacing: 1, textTransform: "uppercase", marginBottom: Spacing.sm },
  highlightRow: { flexDirection: "row", alignItems: "center", gap: Spacing.md },
  highlightName: { fontSize: Typography.size.md, fontFamily: "Sora_700Bold", color: Colors.text },
  highlightSub: { fontSize: Typography.size.sm, color: Colors.textSecondary, marginTop: 2 },
  motivCard: { backgroundColor: Colors.accentSoft, borderRadius: Radius.lg, padding: Spacing.lg, flexDirection: "row", alignItems: "center", gap: Spacing.md, borderWidth: 1, borderColor: Colors.accent },
  motivText: { flex: 1, fontSize: Typography.size.sm, color: Colors.textSecondary, lineHeight: 20 },
  // Badges
  badgeSub: { fontSize: Typography.size.sm, color: Colors.textSecondary, marginBottom: Spacing.xl },
  badgeGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm, marginBottom: Spacing.xl },
  badgeCard: { width: "30%", alignItems: "center", backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  badgeCircle: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, alignItems: "center", justifyContent: "center", marginBottom: Spacing.sm },
  lockWrap: { position: "absolute", bottom: -4, right: -4 },
  badgeLabel: { fontSize: Typography.size.xs, fontFamily: "Sora_700Bold", color: Colors.text, textAlign: "center" },
  badgeDays: { fontSize: 10, color: Colors.textMuted, marginTop: 2 },
  badgeHabit: { fontSize: 9, color: Colors.textSecondary, marginTop: 2, textAlign: "center" },
  recentRow: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border, gap: Spacing.md },
  recentCircle: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  recentBadge: { fontSize: Typography.size.md, fontFamily: "DMSans_600SemiBold", color: Colors.text },
  recentHabit: { fontSize: Typography.size.xs, color: Colors.textSecondary, marginTop: 2 },
  recentDate: { fontSize: 10, color: Colors.textMuted },
});
