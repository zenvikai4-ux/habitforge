import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { getAllHabits, getCompletionsForMonth, getCompletionsForHabit, calculateStreak } from "../database";
import { Colors, Typography, Spacing, Radius } from "../theme";

const DAY_HEADERS = ["S","M","T","W","T","F","S"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function Calendar({ habitId, color, year, month }) {
  const raw = getCompletionsForMonth(habitId, year, month + 1);
  const done = new Set(raw.filter(r => !r.skipped).map(r => parseInt(r.completed_date.split("-")[2], 10)));
  const skipped = new Set(raw.filter(r => r.skipped).map(r => parseInt(r.completed_date.split("-")[2], 10)));

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const todayDate = isCurrentMonth ? today.getDate() : null;

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <View style={styles.calGrid}>
      {DAY_HEADERS.map((d, i) => (
        <View key={i} style={styles.calCell}><Text style={styles.calHeader}>{d}</Text></View>
      ))}
      {cells.map((day, idx) => (
        <View key={idx} style={styles.calCell}>
          {day && (
            <View style={[
              styles.calDay,
              done.has(day) && { backgroundColor: color },
              skipped.has(day) && { backgroundColor: "#FFB34750" },
              day === todayDate && !done.has(day) && !skipped.has(day) && { borderWidth: 1.5, borderColor: color },
            ]}>
              <Text style={[
                styles.calDayText,
                (done.has(day) || skipped.has(day)) && { color: "#fff", fontFamily: "Sora_700Bold" },
                day === todayDate && !done.has(day) && !skipped.has(day) && { color },
              ]}>{day}</Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

export default function ProgressScreen() {
  const [habits, setHabits] = useState([]);
  const [selected, setSelected] = useState(null);
  const [stats, setStats] = useState({});
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());

  const loadData = useCallback(() => {
    const h = getAllHabits();
    setHabits(h);
    if (h.length > 0 && !selected) setSelected(h[0]);
    const m = {};
    for (const habit of h) {
      const dates = getCompletionsForHabit(habit.id);
      const { current, longest } = calculateStreak(dates);
      m[habit.id] = { current, longest, total: dates.length };
    }
    setStats(m);
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    const now = new Date();
    if (year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth())) return;
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };
  const nextDisabled = () => {
    const now = new Date();
    return year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth());
  };

  if (habits.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.empty}>
          <Text style={{ fontSize: 64 }}>📊</Text>
          <Text style={styles.emptyTitle}>No habits yet</Text>
          <Text style={styles.emptySub}>Add habits to track your progress</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Progress</Text>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: selected?.color || Colors.accent }]} /><Text style={styles.legendText}>Completed</Text></View>
          <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: "#FFB347" }]} /><Text style={styles.legendText}>Skipped</Text></View>
        </View>

        {/* Habit chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {habits.map(h => (
            <TouchableOpacity key={h.id}
              style={[styles.chip, selected?.id === h.id && { backgroundColor: h.color, borderColor: h.color }]}
              onPress={() => setSelected(h)}>
              <Text style={styles.chipEmoji}>{h.emoji}</Text>
              <Text style={[styles.chipText, selected?.id === h.id && { color: "#fff" }]}>{h.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {selected && (
          <>
            <View style={styles.calCard}>
              <View style={styles.monthNav}>
                <TouchableOpacity style={styles.monthBtn} onPress={prevMonth}><Text style={styles.monthBtnText}>‹</Text></TouchableOpacity>
                <Text style={styles.monthTitle}>{MONTHS[month]} {year}</Text>
                <TouchableOpacity style={[styles.monthBtn, nextDisabled() && { opacity: 0.3 }]} onPress={nextMonth} disabled={nextDisabled()}>
                  <Text style={styles.monthBtnText}>›</Text>
                </TouchableOpacity>
              </View>
              <Calendar habitId={selected.id} color={selected.color} year={year} month={month} />
            </View>

            {stats[selected.id] && (
              <View style={styles.statsRow}>
                {[
                  { e:"🔥", v:stats[selected.id].current, l:"Current" },
                  { e:"🏆", v:stats[selected.id].longest, l:"Best" },
                  { e:"✅", v:stats[selected.id].total, l:"Total" },
                ].map(s => (
                  <View key={s.l} style={styles.statBox}>
                    <Text style={styles.statEmoji}>{s.e}</Text>
                    <Text style={[styles.statVal, { color: selected.color }]}>{s.v}</Text>
                    <Text style={styles.statLbl}>{s.l}</Text>
                  </View>
                ))}
              </View>
            )}

            <Text style={styles.sectionLabel}>ALL HABITS</Text>
            {habits.map(h => {
              const s = stats[h.id] || { current:0, longest:0, total:0 };
              return (
                <TouchableOpacity key={h.id}
                  style={[styles.habitRow, selected?.id === h.id && { borderColor: h.color }]}
                  onPress={() => setSelected(h)}>
                  <View style={[styles.habitIcon, { backgroundColor: `${h.color}22` }]}><Text style={{ fontSize: 20 }}>{h.emoji}</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.habitName}>{h.name}</Text>
                    <Text style={styles.habitSub}>{s.total} completions</Text>
                  </View>
                  <Text style={styles.fire}>🔥</Text>
                  <Text style={[styles.streakNum, { color: h.color }]}>{s.current}</Text>
                </TouchableOpacity>
              );
            })}
          </>
        )}
        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: 100 },
  title: { fontSize: Typography.size.xxxl, fontFamily: "Sora_800ExtraBold", color: Colors.text, marginTop: Spacing.lg, marginBottom: Spacing.sm, letterSpacing: -1 },
  legend: { flexDirection: "row", gap: Spacing.lg, marginBottom: Spacing.md },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: Typography.size.xs, color: Colors.textMuted },
  chips: { paddingBottom: Spacing.lg, gap: Spacing.sm },
  chip: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.bgCard, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs + 2, marginRight: Spacing.sm, borderWidth: 1, borderColor: Colors.border, gap: 4 },
  chipEmoji: { fontSize: 15 },
  chipText: { fontSize: Typography.size.sm, color: Colors.textSecondary, fontFamily: "DMSans_500Medium" },
  calCard: { backgroundColor: Colors.bgCard, borderRadius: Radius.xl, padding: Spacing.lg, marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  monthNav: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: Spacing.md },
  monthBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center", backgroundColor: Colors.bgElevated, borderRadius: Radius.md },
  monthBtnText: { fontSize: Typography.size.xl, color: Colors.text, fontFamily: "Sora_700Bold" },
  monthTitle: { fontSize: Typography.size.lg, fontFamily: "Sora_700Bold", color: Colors.text },
  calGrid: { flexDirection: "row", flexWrap: "wrap" },
  calCell: { width: "14.28%", alignItems: "center", marginBottom: 4 },
  calHeader: { fontSize: Typography.size.xs, color: Colors.textMuted, fontFamily: "DMSans_600SemiBold", marginBottom: 4 },
  calDay: { width: 32, height: 32, borderRadius: Radius.sm, alignItems: "center", justifyContent: "center" },
  calDayText: { fontSize: Typography.size.xs, color: Colors.textSecondary, fontFamily: "DMSans_500Medium" },
  statsRow: { flexDirection: "row", marginBottom: Spacing.xl, gap: Spacing.sm },
  statBox: { flex: 1, backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.md, alignItems: "center", borderWidth: 1, borderColor: Colors.border },
  statEmoji: { fontSize: 20, marginBottom: 4 },
  statVal: { fontSize: Typography.size.xxl, fontFamily: "Sora_800ExtraBold" },
  statLbl: { fontSize: Typography.size.xs, color: Colors.textMuted, marginTop: 2 },
  sectionLabel: { fontSize: Typography.size.xs, color: Colors.textMuted, fontFamily: "DMSans_600SemiBold", letterSpacing: 1.2, marginBottom: Spacing.md, textTransform: "uppercase" },
  habitRow: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  habitIcon: { width: 40, height: 40, borderRadius: Radius.md, alignItems: "center", justifyContent: "center", marginRight: Spacing.md },
  habitName: { fontSize: Typography.size.md, fontFamily: "DMSans_600SemiBold", color: Colors.text },
  habitSub: { fontSize: Typography.size.xs, color: Colors.textSecondary, marginTop: 2 },
  fire: { fontSize: 14, marginRight: 2 },
  streakNum: { fontSize: Typography.size.lg, fontFamily: "Sora_700Bold" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: Spacing.xl },
  emptyTitle: { fontSize: Typography.size.xl, fontFamily: "Sora_700Bold", color: Colors.text, marginBottom: Spacing.sm, marginTop: Spacing.lg },
  emptySub: { fontSize: Typography.size.md, color: Colors.textSecondary },
});
