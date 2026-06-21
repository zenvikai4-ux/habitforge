import React, { useEffect, useRef } from "react";
import { Animated, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors, Radius, Spacing, Typography, MILESTONE_BADGES } from "../theme";

export default function MilestoneCelebration({ milestone, habitName, onClose }) {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const badge = MILESTONE_BADGES.find(b => b.days === milestone);
  if (!badge) return null;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 5, tension: 100, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Modal transparent animationType="fade" visible statusBarTranslucent>
      <View style={styles.overlay}>
        <Animated.View style={[styles.card, { transform: [{ scale }], opacity }]}>
          <View style={[styles.circle, { backgroundColor: `${badge.color}22`, borderColor: badge.color }]}>
            <Text style={styles.emoji}>{badge.emoji}</Text>
          </View>
          <Text style={styles.congrats}>New Badge Unlocked!</Text>
          <Text style={styles.label}>{badge.label}</Text>
          <Text style={styles.habit}>"{habitName}"</Text>
          <Text style={styles.streak}>🔥 <Text style={{ color: badge.color, fontFamily: "Sora_700Bold" }}>{milestone} day streak!</Text></Text>
          <Text style={styles.sub}>You're building something incredible.</Text>
          <TouchableOpacity style={[styles.btn, { backgroundColor: badge.color }]} onPress={onClose}>
            <Text style={styles.btnText}>Keep Going! 💪</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.85)", alignItems: "center", justifyContent: "center", padding: 32 },
  card: { backgroundColor: Colors.bgCard, borderRadius: Radius.xl, padding: Spacing.xxl, alignItems: "center", width: "100%", borderWidth: 1, borderColor: Colors.border },
  circle: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, alignItems: "center", justifyContent: "center", marginBottom: Spacing.lg },
  emoji: { fontSize: 52 },
  congrats: { fontSize: Typography.size.xs, color: Colors.textMuted, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: Spacing.xs },
  label: { fontSize: 30, fontFamily: "Sora_800ExtraBold", color: Colors.text, letterSpacing: -0.5, marginBottom: Spacing.xs },
  habit: { fontSize: Typography.size.md, color: Colors.textSecondary, marginBottom: Spacing.md, fontStyle: "italic" },
  streak: { fontSize: Typography.size.lg, color: Colors.text, marginBottom: Spacing.sm },
  sub: { fontSize: Typography.size.sm, color: Colors.textMuted, textAlign: "center", marginBottom: Spacing.xl },
  btn: { borderRadius: Radius.full, paddingHorizontal: Spacing.xxxl, paddingVertical: Spacing.md },
  btnText: { color: "#fff", fontFamily: "Sora_700Bold", fontSize: Typography.size.md },
});
