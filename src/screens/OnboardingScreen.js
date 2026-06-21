import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { setSetting } from "../database";
import { Colors, Spacing, Radius, Typography } from "../theme";

const { width } = Dimensions.get("window");

const AVATARS = ["😊","🦁","🐯","🦊","🐺","🦅","🔥","⚡","🌟","💎","🚀","🏆","🎯","🧠","💪","🌙","☀️","🌈","🎸","🎨"];

const SLIDES = [
  { emoji: "🔥", title: "Build streaks\nthat matter",     subtitle: "Track your daily habits and watch your consistency grow into something extraordinary.", accent: "#7C5CFC" },
  { emoji: "📅", title: "Never miss\ntwice",              subtitle: "A beautiful calendar shows your progress. Set reminders so you never forget.",          accent: "#10D9A0" },
  { emoji: "🏆", title: "Earn badges,\nstay motivated",   subtitle: "Unlock milestone badges at 7, 30, and 100 day streaks. Every single day counts.",       accent: "#F59E0B" },
];

export default function OnboardingScreen({ onDone }) {
  const [current, setCurrent] = useState(0);
  const [showProfile, setShowProfile] = useState(false);
  const [userName, setUserName] = useState("");
  const [userAvatar, setUserAvatar] = useState("🔥");
  const scrollRef = useRef(null);
  const slide = SLIDES[current];

  const goNext = () => {
    if (current < SLIDES.length - 1) {
      const next = current + 1;
      setCurrent(next);
      scrollRef.current?.scrollTo({ x: next * width, animated: true });
    } else {
      setShowProfile(true);
    }
  };

  const skip = () => setShowProfile(true);

  const finish = () => {
    setSetting("onboarding_done", "true");
    setSetting("user_name", userName.trim() || "Champion");
    setSetting("user_avatar", userAvatar);
    onDone();
  };

  if (showProfile) {
    return (
      <SafeAreaView style={styles.container} edges={["top","bottom"]}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.profileScroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.profileTitle}>What should{"\n"}we call you? 👋</Text>
            <Text style={styles.profileSub}>We'll use this to personalize your experience</Text>

            <TextInput
              style={styles.nameInput}
              value={userName}
              onChangeText={setUserName}
              placeholder="Enter your name..."
              placeholderTextColor={Colors.textMuted}
              maxLength={20}
              autoFocus
            />

            <Text style={styles.avatarLabel}>PICK YOUR AVATAR</Text>
            <View style={styles.avatarGrid}>
              {AVATARS.map(a => (
                <TouchableOpacity
                  key={a}
                  style={[styles.avatarOpt, userAvatar === a && { backgroundColor: Colors.accentSoft, borderColor: Colors.accent }]}
                  onPress={() => setUserAvatar(a)}
                >
                  <Text style={{ fontSize: 28 }}>{a}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Preview */}
            <View style={styles.previewCard}>
              <Text style={styles.previewAvatar}>{userAvatar}</Text>
              <Text style={styles.previewName}>{userName.trim() || "Champion"}</Text>
              <Text style={styles.previewSub}>Ready to forge habits 🔥</Text>
            </View>

            <TouchableOpacity style={styles.finishBtn} onPress={finish}>
              <Text style={styles.finishBtnText}>Let's Go! 🚀</Text>
            </TouchableOpacity>
            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top","bottom"]}>
      {current < SLIDES.length - 1 && (
        <TouchableOpacity style={styles.skipBtn} onPress={skip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}
      <ScrollView
        ref={scrollRef}
        horizontal pagingEnabled scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        style={{ flex: 1 }}
      >
        {SLIDES.map((s, i) => (
          <View key={i} style={[styles.slide, { width }]}>
            <View style={[styles.circle, { backgroundColor: `${s.accent}18`, borderColor: `${s.accent}35` }]}>
              <Text style={styles.slideEmoji}>{s.emoji}</Text>
            </View>
            <Text style={styles.slideTitle}>{s.title}</Text>
            <Text style={styles.slideSub}>{s.subtitle}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, {
            backgroundColor: i === current ? slide.accent : Colors.border,
            width: i === current ? 24 : 8,
          }]} />
        ))}
      </View>

      <TouchableOpacity style={[styles.btn, { backgroundColor: slide.accent }]} onPress={goNext}>
        <Text style={styles.btnText}>{current === SLIDES.length - 1 ? "Next →" : "Next →"}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: Colors.bg },
  skipBtn:       { position: "absolute", top: 52, right: Spacing.lg, zIndex: 10, padding: Spacing.sm },
  skipText:      { color: Colors.textMuted, fontSize: Typography.size.sm, fontFamily: "DMSans_400Regular" },
  slide:         { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: Spacing.xxxl },
  circle:        { width: 140, height: 140, borderRadius: 70, borderWidth: 2, alignItems: "center", justifyContent: "center", marginBottom: Spacing.xxxl },
  slideEmoji:    { fontSize: 72 },
  slideTitle:    { fontSize: 34, fontFamily: "Sora_800ExtraBold", color: Colors.text, textAlign: "center", letterSpacing: -0.5, marginBottom: Spacing.lg, lineHeight: 42 },
  slideSub:      { fontSize: Typography.size.md, fontFamily: "DMSans_400Regular", color: Colors.textSecondary, textAlign: "center", lineHeight: 24 },
  dots:          { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6, marginBottom: Spacing.xl },
  dot:           { height: 8, borderRadius: 4 },
  btn:           { marginHorizontal: Spacing.xl, marginBottom: Spacing.xl, borderRadius: Radius.full, padding: Spacing.lg, alignItems: "center" },
  btnText:       { color: "#fff", fontFamily: "DMSans_600SemiBold", fontSize: Typography.size.lg },
  // Profile screen
  profileScroll: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xxxl },
  profileTitle:  { fontSize: 36, fontFamily: "Sora_800ExtraBold", color: Colors.text, letterSpacing: -1, marginBottom: Spacing.md, lineHeight: 44 },
  profileSub:    { fontSize: Typography.size.md, color: Colors.textSecondary, fontFamily: "DMSans_400Regular", marginBottom: Spacing.xxxl },
  nameInput:     { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, borderWidth: 1.5, borderColor: Colors.accent, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg, fontSize: Typography.size.xxl, color: Colors.text, fontFamily: "Sora_700Bold", marginBottom: Spacing.xxxl, letterSpacing: 0.5 },
  avatarLabel:   { fontSize: Typography.size.xs, color: Colors.textMuted, fontFamily: "DMSans_600SemiBold", letterSpacing: 1.2, marginBottom: Spacing.md },
  avatarGrid:    { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm, marginBottom: Spacing.xxxl },
  avatarOpt:     { width: 52, height: 52, borderRadius: Radius.md, alignItems: "center", justifyContent: "center", backgroundColor: Colors.bgCard, borderWidth: 1.5, borderColor: "transparent" },
  previewCard:   { backgroundColor: Colors.bgCard, borderRadius: Radius.xl, padding: Spacing.xl, alignItems: "center", borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.xxxl },
  previewAvatar: { fontSize: 56, marginBottom: Spacing.md },
  previewName:   { fontSize: Typography.size.xxl, fontFamily: "Sora_800ExtraBold", color: Colors.text, marginBottom: Spacing.xs },
  previewSub:    { fontSize: Typography.size.sm, color: Colors.textSecondary, fontFamily: "DMSans_400Regular" },
  finishBtn:     { backgroundColor: Colors.accent, borderRadius: Radius.full, padding: Spacing.lg, alignItems: "center" },
  finishBtnText: { color: "#fff", fontFamily: "Sora_700Bold", fontSize: Typography.size.lg },
});
