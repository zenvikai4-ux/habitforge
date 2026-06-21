import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import HabitCard from "../components/HabitCard";
import Confetti from "../components/Confetti";
import MilestoneCelebration from "../components/MilestoneCelebration";
import NoteModal from "../components/NoteModal";
import { useHabits } from "../hooks/useHabits";
import { getCompletionsForHabit, calculateStreak, getSetting, setSetting } from "../database";
import { hapticSuccess, hapticMedium } from "../utils/haptics";
import { Colors, Spacing, Radius, Typography, DAILY_QUOTES } from "../theme";

const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function HomeScreen({ navigation }) {
  const {
    habits, completedToday, skippedToday, loading, refresh,
    toggleHabit, skipHabit, removeHabit, canAddMore,
    isPremium, freeLimit, newMilestone, clearMilestone,
  } = useHabits();

  const [streaks, setStreaks] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [noteModal, setNoteModal] = useState(null);
  const [allDonePrev, setAllDonePrev] = useState(false);
  const [userName, setUserName] = useState("");
  const [userAvatar, setUserAvatar] = useState("🔥");

  const now = new Date();
  const greetingWord = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";
  const greeting = `${greetingWord}, ${userName || "Champion"}`;

  // Daily quote rotation
  const quoteIdx = parseInt(getSetting("quote_index") || "0");
  const quote = DAILY_QUOTES[quoteIdx % DAILY_QUOTES.length];

  const loadStreaks = useCallback(() => {
    const m = {};
    for (const h of habits) {
      const dates = getCompletionsForHabit(h.id);
      const { current } = calculateStreak(dates);
      m[h.id] = current;
    }
    setStreaks(m);
  }, [habits]);

  useFocusEffect(useCallback(() => {
    refresh();
    // Load user info
    setUserName(getSetting("user_name") || "Champion");
    setUserAvatar(getSetting("user_avatar") || "🔥");
    // Rotate quote daily
    const today = now.toISOString().split("T")[0];
    const lastDate = getSetting("last_quote_date");
    if (lastDate !== today) {
      setSetting("quote_index", (quoteIdx + 1) % DAILY_QUOTES.length);
      setSetting("last_quote_date", today);
    }
  }, []));

  React.useEffect(() => { if (habits.length > 0) loadStreaks(); }, [habits]);

  // Confetti trigger
  React.useEffect(() => {
    const allDone = habits.length > 0 &&
      habits.every(h => completedToday.includes(h.id) || skippedToday.includes(h.id));
    if (allDone && !allDonePrev) {
      setShowConfetti(true);
      hapticSuccess();
      setTimeout(() => setShowConfetti(false), 4000);
    }
    setAllDonePrev(allDone);
  }, [completedToday, skippedToday, habits]);

  const handleHabitTap = (habit) => {
    if (completedToday.includes(habit.id)) {
      toggleHabit(habit);
      loadStreaks();
    } else {
      setNoteModal(habit);
    }
  };

  const handleNoteSave = (note) => {
    if (!noteModal) return;
    toggleHabit(noteModal, note);
    hapticMedium();
    setNoteModal(null);
    loadStreaks();
  };

  const handleSkip = () => {
    if (!noteModal) return;
    skipHabit(noteModal.id);
    setNoteModal(null);
  };

  const onRefresh = () => {
    setRefreshing(true);
    refresh();
    loadStreaks();
    setRefreshing(false);
  };

  const completedCount = completedToday.length;
  const totalCount = habits.length;
  const allDone = totalCount > 0 && habits.every(h => completedToday.includes(h.id) || skippedToday.includes(h.id));
  const progressPct = totalCount > 0 ? Math.round(((completedCount + skippedToday.length) / totalCount) * 100) : 0;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Confetti visible={showConfetti} />

      {newMilestone && (
        <MilestoneCelebration
          milestone={newMilestone.milestone}
          habitName={newMilestone.habitName}
          onClose={clearMilestone}
        />
      )}

      {noteModal && (
        <NoteModal
          visible
          habitName={noteModal.name}
          onSave={handleNoteSave}
          onSkip={handleSkip}
          onClose={() => setNoteModal(null)}
        />
      )}

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <View style={styles.greetingRow}>
              <Text style={styles.greetingAvatar}>{userAvatar}</Text>
              <Text style={styles.greeting}>{greeting}!</Text>
            </View>
            <Text style={styles.date}>{DAYS[now.getDay()]}, {MONTHS[now.getMonth()]} {now.getDate()}</Text>
          </View>
          <TouchableOpacity style={styles.addBtn}
            onPress={() => {
              if (!canAddMore) { navigation.navigate("AddHabit", { habit: null }); return; }
              navigation.navigate("AddHabit", { habit: null });
            }}>
            <Text style={styles.addBtnText}>＋</Text>
          </TouchableOpacity>
        </View>

        {/* Quote */}
        <View style={styles.quoteCard}>
          <Text style={styles.quoteText}>"{quote.text}"</Text>
          <Text style={styles.quoteAuthor}>— {quote.author}</Text>
        </View>

        {/* Progress */}
        {habits.length > 0 && (
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Today's Progress</Text>
              <Text style={styles.progressCount}>{completedCount}/{totalCount}</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressPct}%`, backgroundColor: allDone ? Colors.success : Colors.accent }]} />
            </View>
            {allDone && <Text style={styles.allDone}>🎉 All done! You're unstoppable!</Text>}
          </View>
        )}

        {/* Premium banner */}

        {/* Habit list */}
        {habits.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🌱</Text>
            <Text style={styles.emptyTitle}>No habits yet</Text>
            <Text style={styles.emptySub}>Tap ＋ to add your first habit</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate("AddHabit", { habit: null })}>
              <Text style={styles.emptyBtnText}>Add First Habit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.templateBtn} onPress={() => navigation.navigate("AddHabit", { habit: null, showTemplates: true })}>
              <Text style={styles.templateBtnText}>Browse Templates →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionLabel}>TODAY'S HABITS</Text>
              <TouchableOpacity onPress={() => navigation.navigate("AddHabit", { habit: null, showTemplates: true })}>
                <Text style={styles.templateLink}>Templates</Text>
              </TouchableOpacity>
            </View>
            {habits.map(habit => (
              <HabitCard
                key={habit.id} habit={habit}
                completed={completedToday.includes(habit.id)}
                skipped={skippedToday.includes(habit.id)}
                streak={streaks[habit.id] || 0}
                onTap={handleHabitTap}
                onEdit={h => navigation.navigate("AddHabit", { habit: h })}
                onDelete={removeHabit}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: 100 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: Spacing.lg, marginBottom: Spacing.md },
  greetingRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, flexWrap: "wrap" },
  greetingAvatar: { fontSize: 28 },
  greeting: { fontSize: Typography.size.xxl, fontFamily: "Sora_800ExtraBold", color: Colors.text, letterSpacing: -0.5, flexShrink: 1 },
  date: { fontSize: Typography.size.sm, color: Colors.textSecondary, marginTop: 2 },
  addBtn: { width: 44, height: 44, borderRadius: Radius.full, backgroundColor: Colors.accent, alignItems: "center", justifyContent: "center", elevation: 8 },
  addBtnText: { fontSize: Typography.size.xl, color: "#fff", fontFamily: "Sora_700Bold", lineHeight: 28 },
  quoteCard: { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border, borderLeftWidth: 3, borderLeftColor: Colors.accent },
  quoteText: { fontSize: Typography.size.sm, color: Colors.textSecondary, fontStyle: "italic", lineHeight: 20, marginBottom: 4 },
  quoteAuthor: { fontSize: Typography.size.xs, color: Colors.textMuted, fontFamily: "DMSans_600SemiBold" },
  progressCard: { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.lg, marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing.sm },
  progressTitle: { fontSize: Typography.size.sm, color: Colors.textSecondary, fontFamily: "DMSans_500Medium", textTransform: "uppercase", letterSpacing: 0.8 },
  progressCount: { fontSize: Typography.size.lg, fontFamily: "Sora_700Bold", color: Colors.text },
  progressTrack: { height: 6, backgroundColor: Colors.bgElevated, borderRadius: Radius.full, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: Radius.full },
  allDone: { fontSize: Typography.size.sm, color: Colors.success, marginTop: Spacing.sm, fontFamily: "DMSans_500Medium" },
  premiumBanner: { backgroundColor: Colors.accentSoft, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.accent, alignItems: "center" },
  premiumBannerText: { fontSize: Typography.size.sm, color: Colors.accent, fontFamily: "DMSans_600SemiBold" },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing.sm },
  sectionLabel: { fontSize: Typography.size.xs, color: Colors.textMuted, fontFamily: "DMSans_600SemiBold", letterSpacing: 1.2 },
  templateLink: { fontSize: Typography.size.xs, color: Colors.accent, fontFamily: "DMSans_600SemiBold" },
  empty: { alignItems: "center", paddingVertical: Spacing.xxxl * 2 },
  emptyEmoji: { fontSize: 64, marginBottom: Spacing.lg },
  emptyTitle: { fontSize: Typography.size.xl, fontFamily: "Sora_700Bold", color: Colors.text, marginBottom: Spacing.sm },
  emptySub: { fontSize: Typography.size.md, color: Colors.textSecondary, textAlign: "center", lineHeight: 22, marginBottom: Spacing.xl },
  emptyBtn: { backgroundColor: Colors.accent, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: Radius.full, marginBottom: Spacing.md },
  emptyBtnText: { color: "#fff", fontFamily: "DMSans_600SemiBold", fontSize: Typography.size.md },
  templateBtn: { padding: Spacing.sm },
  templateBtnText: { color: Colors.accent, fontSize: Typography.size.sm, fontFamily: "DMSans_600SemiBold" },
});
