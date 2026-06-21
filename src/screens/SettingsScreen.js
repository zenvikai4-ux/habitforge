import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getSetting, setSetting, getAllHabits } from "../database";
import { cancelAllNotifications, requestNotificationPermissions, scheduleMorningBriefing } from "../utils/notifications";
import { Colors, Typography, Spacing, Radius } from "../theme";
import { hapticSuccess, hapticMedium } from "../utils/haptics";
import { showRewardedAd } from "../utils/admob";

export default function SettingsScreen({ navigation }) {
  const [habitCount, setHabitCount] = useState(0);
  const [notifGranted, setNotifGranted] = useState(false);
  const [freezes, setFreezes] = useState(0);
  const [userName, setUserName] = useState("");
  const [userAvatar, setUserAvatar] = useState("🔥");
  const [editModal, setEditModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAvatar, setEditAvatar] = useState("🔥");

  const AVATARS = ["😊","🦁","🐯","🦊","🐺","🦅","🔥","⚡","🌟","💎","🚀","🏆","🎯","🧠","💪","🌙","☀️","🌈","🎸","🎨"];

  useEffect(() => {
    setHabitCount(getAllHabits().length);
    setFreezes(parseInt(getSetting("streak_freezes") || "0"));
    const name = getSetting("user_name") || "Champion";
    const avatar = getSetting("user_avatar") || "🔥";
    setUserName(name); setUserAvatar(avatar);
    setEditName(name); setEditAvatar(avatar);
    checkNotif();
  }, []);

  const saveProfile = () => {
    const name = editName.trim() || "Champion";
    setSetting("user_name", name);
    setSetting("user_avatar", editAvatar);
    setUserName(name); setUserAvatar(editAvatar);
    setEditModal(false);
  };

  const checkNotif = async () => {
    const ok = await requestNotificationPermissions();
    setNotifGranted(ok);
  };

  // Watch ad → earn a streak freeze
  const earnFreeze = () => {
    hapticMedium();
    showRewardedAd(
      () => {
        // Rewarded
        hapticSuccess();
        const n = freezes + 1;
        setSetting("streak_freezes", n);
        setFreezes(n);
        Alert.alert("🧊 Freeze Earned!", `You now have ${n} streak freeze${n !== 1 ? "s" : ""}. They protect your streak if you miss a day.`);
      },
      () => {
        Alert.alert("Ad not available", "Try again in a moment.");
      }
    );
  };

  const setupSmartNotifs = async () => {
    if (!notifGranted) { Alert.alert("Please enable notifications first."); return; }
    await scheduleMorningBriefing(habitCount);
    Alert.alert("✅ Done!", "Morning briefing at 8am is now active.");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Settings</Text>

        {/* Profile Card */}
        <TouchableOpacity style={styles.profileCard} onPress={() => setEditModal(true)} activeOpacity={0.8}>
          <Text style={styles.profileAvatar}>{userAvatar}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{userName}</Text>
            <Text style={styles.profileSub}>Tap to edit profile</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        {/* Edit Profile Modal */}
        <Modal visible={editModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TextInput
                style={styles.modalInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Your name"
                placeholderTextColor={Colors.textMuted}
                maxLength={20}
              />
              <Text style={styles.avatarLabel}>AVATAR</Text>
              <View style={styles.avatarGrid}>
                {AVATARS.map(a => (
                  <TouchableOpacity key={a}
                    style={[styles.avatarOpt, editAvatar === a && { backgroundColor: Colors.accentSoft, borderColor: Colors.accent }]}
                    onPress={() => setEditAvatar(a)}>
                    <Text style={{ fontSize: 26 }}>{a}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.modalBtns}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditModal(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={saveProfile}>
                  <Text style={styles.saveBtnText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Streak Freezes — ad gated */}
        <Text style={styles.sectionLabel}>STREAK PROTECTION</Text>
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>🧊 Streak Freezes</Text>
              <Text style={styles.rowSub}>Protect your streak when you miss a day</Text>
            </View>
            <View style={styles.freezeCircle}>
              <Text style={styles.freezeNum}>{freezes}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.adBtn} onPress={earnFreeze}>
            <Text style={styles.adBtnText}>📺 Watch Ad to Earn Freeze</Text>
          </TouchableOpacity>
        </View>

        {/* Notifications */}
        <Text style={styles.sectionLabel}>NOTIFICATIONS</Text>
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Permission Status</Text>
              <Text style={styles.rowSub}>{notifGranted ? "✅ Notifications allowed" : "❌ Notifications blocked"}</Text>
            </View>
            {!notifGranted && (
              <TouchableOpacity style={styles.smallBtn} onPress={checkNotif}>
                <Text style={styles.smallBtnText}>Enable</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.cardRow} onPress={setupSmartNotifs}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>🔔 Morning Briefing</Text>
              <Text style={styles.rowSub}>Daily summary at 8am</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.cardRow} onPress={() => Alert.alert("Clear Notifications", "Cancel all scheduled reminders?", [
            { text: "Cancel", style: "cancel" },
            { text: "Clear All", style: "destructive", onPress: async () => { await cancelAllNotifications(); Alert.alert("Done", "All notifications cleared."); } },
          ])}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Clear All Reminders</Text>
              <Text style={styles.rowSub}>Cancel all scheduled notifications</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Explore */}
        <Text style={styles.sectionLabel}>EXPLORE</Text>
        <View style={styles.card}>
          {[
            { icon: "🏆", label: "My Badges", screen: "Badges" },
            { icon: "📋", label: "Weekly Review", screen: "WeeklyReview" },
          ].map((item, i) => (
            <View key={item.screen}>
              {i > 0 && <View style={styles.divider} />}
              <TouchableOpacity style={styles.cardRow} onPress={() => navigation.navigate(item.screen)}>
                <Text style={{ fontSize: 20, marginRight: Spacing.md }}>{item.icon}</Text>
                <Text style={[styles.rowTitle, { flex: 1 }]}>{item.label}</Text>
                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* About */}
        <Text style={styles.sectionLabel}>ABOUT</Text>
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>HabitForge v1.0</Text>
              <Text style={styles.rowSub}>100% offline · No account needed · Free forever</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.cardRow} onPress={() => { setSetting("onboarding_done", "false"); Alert.alert("Done", "Restart the app to see the intro again."); }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Replay Intro</Text>
              <Text style={styles.rowSub}>Show onboarding on next launch</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Tips */}
        <Text style={styles.sectionLabel}>TIPS</Text>
        <View style={styles.tipsCard}>
          {[
            { e: "👆", t: "Tap a habit to complete it with an optional note" },
            { e: "⏭",  t: "Use Skip Day to protect streaks during travel or illness" },
            { e: "✏️", t: "Long-press any habit on Home to edit or delete it" },
            { e: "📋", t: "Browse Templates when adding habits for quick setup" },
            { e: "🔔", t: "Add multiple reminder times per habit — great for water, meds, etc." },
            { e: "🧊", t: "Watch an ad to earn a streak freeze for days you miss" },
          ].map(tip => (
            <View key={tip.t} style={styles.tipRow}>
              <Text style={styles.tipEmoji}>{tip.e}</Text>
              <Text style={styles.tipText}>{tip.t}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: 100 },
  title: { fontSize: Typography.size.xxxl, fontFamily: "Sora_800ExtraBold", color: Colors.text, marginTop: Spacing.lg, marginBottom: Spacing.xl, letterSpacing: -1 },
  sectionLabel: { fontSize: Typography.size.xs, color: Colors.textMuted, fontFamily: "DMSans_600SemiBold", letterSpacing: 1.2, marginBottom: Spacing.sm, textTransform: "uppercase" },
  card: { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, marginBottom: Spacing.xl, borderWidth: 1, borderColor: Colors.border, overflow: "hidden" },
  cardRow: { flexDirection: "row", alignItems: "center", padding: Spacing.lg },
  rowTitle: { fontSize: Typography.size.md, fontFamily: "DMSans_500Medium", color: Colors.text },
  rowSub: { fontSize: Typography.size.sm, color: Colors.textSecondary, marginTop: 2 },
  arrow: { fontSize: Typography.size.xl, color: Colors.textMuted },
  divider: { height: 1, backgroundColor: Colors.border, marginHorizontal: Spacing.lg },
  smallBtn: { backgroundColor: Colors.accentSoft, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.accent },
  smallBtnText: { color: Colors.accent, fontSize: Typography.size.xs, fontFamily: "DMSans_600SemiBold" },
  freezeCircle: { backgroundColor: "rgba(100,200,255,0.15)", borderRadius: Radius.full, width: 36, height: 36, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(100,200,255,0.3)" },
  freezeNum: { fontSize: Typography.size.lg, fontFamily: "Sora_800ExtraBold", color: "#64C8FF" },
  adBtn: { margin: Spacing.lg, marginTop: 0, backgroundColor: Colors.accentSoft, borderRadius: Radius.full, padding: Spacing.md, alignItems: "center", borderWidth: 1, borderColor: Colors.accent },
  adBtnText: { color: Colors.accent, fontFamily: "DMSans_600SemiBold", fontSize: Typography.size.sm },
  profileCard: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.bgCard, borderRadius: Radius.xl, padding: Spacing.lg, marginBottom: Spacing.xl, borderWidth: 1, borderColor: Colors.accent, gap: Spacing.md },
  profileAvatar: { fontSize: 44 },
  profileName: { fontSize: Typography.size.xl, fontFamily: "Sora_700Bold", color: Colors.text },
  profileSub: { fontSize: Typography.size.sm, color: Colors.textSecondary, fontFamily: "DMSans_400Regular", marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
  modalSheet: { backgroundColor: Colors.bgCard, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, padding: Spacing.xl, paddingBottom: 40 },
  modalTitle: { fontSize: Typography.size.xl, fontFamily: "Sora_800ExtraBold", color: Colors.text, marginBottom: Spacing.lg },
  modalInput: { backgroundColor: Colors.bgInput, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.accent, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, fontSize: Typography.size.xl, color: Colors.text, fontFamily: "Sora_700Bold", marginBottom: Spacing.lg },
  avatarLabel: { fontSize: Typography.size.xs, color: Colors.textMuted, fontFamily: "DMSans_600SemiBold", letterSpacing: 1.2, marginBottom: Spacing.sm },
  avatarGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm, marginBottom: Spacing.xl },
  avatarOpt: { width: 48, height: 48, borderRadius: Radius.md, alignItems: "center", justifyContent: "center", backgroundColor: Colors.bgElevated, borderWidth: 1.5, borderColor: "transparent" },
  modalBtns: { flexDirection: "row", gap: Spacing.md },
  cancelBtn: { flex: 1, backgroundColor: Colors.bgElevated, borderRadius: Radius.full, padding: Spacing.md, alignItems: "center", borderWidth: 1, borderColor: Colors.border },
  cancelBtnText: { color: Colors.textSecondary, fontFamily: "DMSans_600SemiBold" },
  saveBtn: { flex: 1, backgroundColor: Colors.accent, borderRadius: Radius.full, padding: Spacing.md, alignItems: "center" },
  saveBtnText: { color: "#fff", fontFamily: "DMSans_600SemiBold" },
  tipsCard: { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  tipRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: Spacing.sm },
  tipEmoji: { fontSize: 16, marginRight: Spacing.sm, marginTop: 1 },
  tipText: { flex: 1, fontSize: Typography.size.sm, color: Colors.textSecondary, lineHeight: 20 },
});
