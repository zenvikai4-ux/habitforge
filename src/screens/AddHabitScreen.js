import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, StyleSheet, ScrollView,
  TouchableOpacity, Alert, Platform, KeyboardAvoidingView, Modal
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useHabits } from "../hooks/useHabits";
import { Colors, Typography, Spacing, Radius, HABIT_TEMPLATES } from "../theme";
import { hapticLight, hapticMedium } from "../utils/haptics";
import { showRewardedAd } from "../utils/admob";

const EMOJIS = ["💪","🏃","📚","💧","🧘","🥗","😴","✍️","🎯","🎸","🌿","🧹","💊","🚴","🏋️","🧠","❤️","🎨","🌅","☕","🍎","🦷","🚶","📝","🎵","🌟","🔥","⚡","🏆","✨","🎮","🌍","🏊","⚽","🍳","🌙","☀️","🎤","🧪","🎭"];
const COLORS = ["#7C5CFC","#10D9A0","#F472B6","#F59E0B","#38BDF8","#A78BFA","#FB7185","#34D399","#E879F9","#22D3EE"];

export default function AddHabitScreen({ navigation, route }) {
  const existingHabit = route.params?.habit || null;
  const startWithTemplates = route.params?.showTemplates || false;
  const { addHabit, addHabitForced, editHabit, getRemindersForHabit, canAddFree, freeLimit, habits } = useHabits();

  const [name, setName] = useState(existingHabit?.name || "");
  const [emoji, setEmoji] = useState(existingHabit?.emoji || "✨");
  const [color, setColor] = useState(existingHabit?.color || Colors.habitColors[0]);
  const [reminders, setReminders] = useState([]); // array of "HH:MM" strings
  const [pickerHour, setPickerHour] = useState(8);
  const [pickerMin, setPickerMin] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showTemplates, setShowTemplates] = useState(startWithTemplates && !existingHabit);

  const isEditing = !!existingHabit;

  useEffect(() => {
    if (isEditing) {
      const existing = getRemindersForHabit(existingHabit.id);
      setReminders(existing.map(r => r.time));
    }
  }, []);

  const applyTemplate = (t) => {
    hapticLight();
    setName(t.name); setEmoji(t.emoji); setColor(t.color);
    setShowTemplates(false);
  };

  const addReminderTime = () => {
    const formatted = `${String(pickerHour).padStart(2,"0")}:${String(pickerMin).padStart(2,"0")}`;
    if (reminders.includes(formatted)) {
      Alert.alert("Already added", "This reminder time already exists.");
      return;
    }
    hapticLight();
    setReminders(prev => [...prev, formatted].sort());
  };

  const removeReminderTime = (time) => {
    hapticLight();
    setReminders(prev => prev.filter(t => t !== time));
  };

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert("Oops!", "Please give your habit a name."); return; }
    hapticMedium();

    if (!isEditing && !canAddFree) {
      // Over free limit — show ad first
      Alert.alert(
        "Watch an Ad",
        `You have ${habits.length} habits (${freeLimit} free). Watch a short ad to unlock this habit.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Watch Ad 📺",
            onPress: () => {
              showRewardedAd(
                async () => {
                  // Ad completed — save habit
                  setLoading(true);
                  try {
                    const habitData = { name: name.trim(), emoji, color };
                    await addHabitForced(habitData, reminders);
                    navigation.goBack();
                  } catch { Alert.alert("Error", "Something went wrong."); }
                  finally { setLoading(false); }
                },
                () => Alert.alert("Ad not available", "Try again in a moment.")
              );
            }
          }
        ]
      );
      return;
    }

    setLoading(true);
    try {
      const habitData = { name: name.trim(), emoji, color };
      if (isEditing) await editHabit(existingHabit.id, habitData, reminders);
      else await addHabit(habitData, reminders);
      navigation.goBack();
    } catch (err) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top","bottom"]}>
      {/* Templates Modal */}
      <Modal visible={showTemplates} animationType="slide" transparent>
        <View style={styles.tmplOverlay}>
          <View style={styles.tmplSheet}>
            <View style={styles.tmplHeader}>
              <Text style={styles.tmplTitle}>Habit Templates</Text>
              <TouchableOpacity onPress={() => setShowTemplates(false)}>
                <Text style={styles.tmplClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {HABIT_TEMPLATES.map(cat => (
                <View key={cat.category} style={styles.tmplCat}>
                  <Text style={styles.tmplCatName}>{cat.category}</Text>
                  {cat.habits.map(t => (
                    <TouchableOpacity key={t.name} style={styles.tmplItem} onPress={() => applyTemplate(t)}>
                      <View style={[styles.tmplEmoji, { backgroundColor: `${t.color}22` }]}>
                        <Text style={{ fontSize: 20 }}>{t.emoji}</Text>
                      </View>
                      <Text style={styles.tmplItemName}>{t.name}</Text>
                      <View style={[styles.tmplDot, { backgroundColor: t.color }]} />
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isEditing ? "Edit Habit" : "New Habit"}</Text>
          <TouchableOpacity style={[styles.saveBtn, loading && { opacity: 0.5 }]} onPress={handleSave} disabled={loading}>
            <Text style={styles.saveBtnText}>{loading ? "..." : "Save"}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Preview */}
          <View style={[styles.preview, { borderColor: color }]}>
            <View style={[styles.previewEmojiWrap, { backgroundColor: `${color}22` }]}>
              <Text style={styles.previewEmoji}>{emoji}</Text>
            </View>
            <Text style={styles.previewName} numberOfLines={1}>{name || "Your habit name"}</Text>
            <Text style={styles.previewStreak}>🔥 0 days</Text>
          </View>

          {!isEditing && (
            <TouchableOpacity style={styles.templatesBtn} onPress={() => setShowTemplates(true)}>
              <Text style={styles.templatesBtnText}>📋 Browse Templates</Text>
            </TouchableOpacity>
          )}

          {/* Name */}
          <View style={styles.section}>
            <Text style={styles.label}>HABIT NAME</Text>
            <TextInput
              style={styles.input} value={name} onChangeText={setName}
              placeholder="e.g. Drink Water, Morning Run..." placeholderTextColor={Colors.textMuted}
              maxLength={40} autoFocus={!isEditing && !startWithTemplates}
            />
          </View>

          {/* Emoji */}
          <View style={styles.section}>
            <Text style={styles.label}>ICON</Text>
            <View style={styles.emojiGrid}>
              {EMOJIS.map(e => (
                <TouchableOpacity key={e} style={[styles.emojiOpt, emoji === e && { backgroundColor: Colors.accentSoft, borderColor: color }]} onPress={() => { setEmoji(e); hapticLight(); }}>
                  <Text style={{ fontSize: 22 }}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Color */}
          <View style={styles.section}>
            <Text style={styles.label}>COLOR</Text>
            <View style={styles.colorRow}>
              {COLORS.map(c => (
                <TouchableOpacity key={c} style={[styles.colorOpt, { backgroundColor: c }, color === c && styles.colorSelected]} onPress={() => { setColor(c); hapticLight(); }}>
                  {color === c && <Text style={{ color: "#fff", fontSize: 12 }}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Multiple Reminders */}
          <View style={styles.section}>
            <Text style={styles.label}>REMINDERS</Text>
            <Text style={styles.reminderHint}>Add as many daily reminders as you need</Text>

            {/* Existing reminders */}
            {reminders.map((time) => (
              <View key={time} style={styles.reminderChip}>
                <Text style={styles.reminderChipIcon}>🔔</Text>
                <Text style={styles.reminderChipTime}>{time}</Text>
                <TouchableOpacity onPress={() => removeReminderTime(time)} style={styles.reminderChipDelete}>
                  <Text style={styles.reminderChipDeleteText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}

            {/* Time Picker */}
            <View style={styles.timePickerCard}>
              <Text style={styles.timePickerLabel}>Select Time</Text>
              <View style={styles.timePickerRow}>
                {/* Hour picker */}
                <View style={styles.spinnerWrap}>
                  <TouchableOpacity onPress={() => setPickerHour(h => (h + 1) % 24)} style={styles.spinnerBtn}>
                    <Text style={styles.spinnerArrow}>▲</Text>
                  </TouchableOpacity>
                  <Text style={styles.spinnerVal}>{String(pickerHour).padStart(2,"0")}</Text>
                  <TouchableOpacity onPress={() => setPickerHour(h => (h - 1 + 24) % 24)} style={styles.spinnerBtn}>
                    <Text style={styles.spinnerArrow}>▼</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.timeSep}>:</Text>
                {/* Minute picker */}
                <View style={styles.spinnerWrap}>
                  <TouchableOpacity onPress={() => setPickerMin(m => (m + 1) % 60)} style={styles.spinnerBtn}>
                    <Text style={styles.spinnerArrow}>▲</Text>
                  </TouchableOpacity>
                  <Text style={styles.spinnerVal}>{String(pickerMin).padStart(2,"0")}</Text>
                  <TouchableOpacity onPress={() => setPickerMin(m => (m - 1 + 60) % 60)} style={styles.spinnerBtn}>
                    <Text style={styles.spinnerArrow}>▼</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity style={[styles.addReminderBtn, { backgroundColor: color }]} onPress={addReminderTime}>
                <Text style={styles.addReminderBtnText}>+ Add Reminder</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  back: { color: Colors.accent, fontSize: Typography.size.md, fontFamily: "DMSans_500Medium" },
  headerTitle: { fontSize: Typography.size.lg, fontFamily: "Sora_700Bold", color: Colors.text },
  saveBtn: { backgroundColor: Colors.accent, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.xs + 2, borderRadius: Radius.full },
  saveBtnText: { color: "#fff", fontFamily: "Sora_700Bold", fontSize: Typography.size.sm },
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl },
  preview: { backgroundColor: Colors.bgCard, borderRadius: Radius.xl, padding: Spacing.xl, alignItems: "center", marginBottom: Spacing.md, borderWidth: 1.5 },
  previewEmojiWrap: { width: 64, height: 64, borderRadius: Radius.lg, alignItems: "center", justifyContent: "center", marginBottom: Spacing.md },
  previewEmoji: { fontSize: 36 },
  previewName: { fontSize: Typography.size.xl, fontFamily: "Sora_700Bold", color: Colors.text, marginBottom: Spacing.xs },
  previewStreak: { fontSize: Typography.size.sm, color: Colors.textSecondary },
  templatesBtn: { backgroundColor: Colors.bgCard, borderRadius: Radius.md, padding: Spacing.md, alignItems: "center", marginBottom: Spacing.xl, borderWidth: 1, borderColor: Colors.border },
  templatesBtnText: { color: Colors.accent, fontFamily: "DMSans_600SemiBold", fontSize: Typography.size.sm },
  section: { marginBottom: Spacing.xl },
  label: { fontSize: Typography.size.xs, color: Colors.textMuted, fontFamily: "DMSans_600SemiBold", letterSpacing: 1.2, marginBottom: Spacing.sm },
  input: { backgroundColor: Colors.bgInput, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, fontSize: Typography.size.md, color: Colors.text, fontFamily: "DMSans_400Regular" },
  emojiGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  emojiOpt: { width: 48, height: 48, borderRadius: Radius.md, alignItems: "center", justifyContent: "center", backgroundColor: Colors.bgCard, borderWidth: 1.5, borderColor: "transparent" },
  colorRow: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.md },
  colorOpt: { width: 40, height: 40, borderRadius: Radius.full, alignItems: "center", justifyContent: "center" },
  colorSelected: { borderWidth: 3, borderColor: Colors.text, transform: [{ scale: 1.15 }] },
  // Reminders
  reminderHint: { fontSize: Typography.size.xs, color: Colors.textMuted, fontFamily: "DMSans_400Regular", marginBottom: Spacing.md },
  reminderChip: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.bgCard, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border, gap: Spacing.sm },
  reminderChipIcon: { fontSize: 16 },
  reminderChipTime: { flex: 1, fontSize: Typography.size.lg, fontFamily: "Sora_700Bold", color: Colors.text, letterSpacing: 1 },
  reminderChipDelete: { padding: Spacing.xs },
  reminderChipDeleteText: { color: Colors.danger, fontSize: Typography.size.md, fontFamily: "DMSans_600SemiBold" },
  addReminderRow: { flexDirection: "row", gap: Spacing.md, alignItems: "center", marginBottom: Spacing.sm },
  timeInput: { flex: 1, backgroundColor: Colors.bgInput, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, fontSize: Typography.size.xl, color: Colors.text, fontFamily: "Sora_700Bold", textAlign: "center", letterSpacing: 2 },
  addReminderBtn: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderRadius: Radius.md },
  addReminderBtnText: { color: "#fff", fontFamily: "DMSans_600SemiBold", fontSize: Typography.size.md },
  // Time picker
  timePickerCard: { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, padding: Spacing.lg, alignItems: 'center', gap: Spacing.lg },
  timePickerLabel: { fontSize: Typography.size.xs, color: Colors.textMuted, fontFamily: 'DMSans_600SemiBold', letterSpacing: 1.2, textTransform: 'uppercase', alignSelf: 'flex-start' },
  timePickerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  spinnerWrap: { alignItems: 'center', gap: Spacing.xs },
  spinnerBtn: { backgroundColor: Colors.bgElevated, borderRadius: Radius.md, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  spinnerArrow: { color: Colors.accent, fontSize: Typography.size.md, fontFamily: 'DMSans_600SemiBold' },
  spinnerVal: { fontSize: 48, fontFamily: 'Sora_800ExtraBold', color: Colors.text, letterSpacing: 2, minWidth: 80, textAlign: 'center' },
  timeSep: { fontSize: 48, fontFamily: 'Sora_800ExtraBold', color: Colors.textMuted, marginBottom: Spacing.sm },
  // Templates modal
  tmplOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
  tmplSheet: { backgroundColor: Colors.bgCard, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, maxHeight: "85%", padding: Spacing.xl },
  tmplHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing.lg },
  tmplTitle: { fontSize: Typography.size.xl, fontFamily: "Sora_700Bold", color: Colors.text },
  tmplClose: { fontSize: Typography.size.lg, color: Colors.textMuted, padding: Spacing.xs },
  tmplCat: { marginBottom: Spacing.lg },
  tmplCatName: { fontSize: Typography.size.xs, color: Colors.textMuted, fontFamily: "DMSans_600SemiBold", letterSpacing: 1, textTransform: "uppercase", marginBottom: Spacing.sm },
  tmplItem: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.bgElevated, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm, gap: Spacing.md },
  tmplEmoji: { width: 40, height: 40, borderRadius: Radius.md, alignItems: "center", justifyContent: "center" },
  tmplItemName: { flex: 1, fontSize: Typography.size.md, fontFamily: "DMSans_500Medium", color: Colors.text },
  tmplDot: { width: 10, height: 10, borderRadius: 5 },
});
