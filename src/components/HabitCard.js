import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, TouchableOpacity, Alert } from "react-native";
import AnimatedCheckbox from "./AnimatedCheckbox";
import { Colors, Typography, Spacing, Radius } from "../theme";

export default function HabitCard({ habit, completed, skipped, streak, onTap, onEdit, onDelete }) {
  const slideIn = useRef(new Animated.Value(30)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideIn, { toValue: 0, friction: 8, tension: 80, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 280, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleLongPress = () => {
    Alert.alert(habit.name, "What would you like to do?", [
      { text: "Edit", onPress: () => onEdit(habit) },
      {
        text: "Delete", style: "destructive", onPress: () =>
          Alert.alert("Delete Habit", `Delete "${habit.name}"? All history will be lost.`, [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: () => onDelete(habit.id) },
          ])
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const cardBg = skipped ? "rgba(255,179,71,0.06)" : completed ? Colors.bgElevated : Colors.bgCard;
  const borderLeft = skipped ? "#FFB347" : habit.color || Colors.accent;

  return (
    <Animated.View style={{ transform: [{ translateY: slideIn }], opacity }}>
      <TouchableOpacity activeOpacity={0.85} onPress={() => onTap(habit)} onLongPress={handleLongPress} delayLongPress={400}>
        <View style={[styles.card, { backgroundColor: cardBg, borderLeftColor: borderLeft }]}>
          <View style={styles.left}>
            <View style={[styles.iconBg, { backgroundColor: `${habit.color}22` }]}>
              <Text style={styles.emoji}>{habit.emoji || "✨"}</Text>
            </View>
            <View style={styles.info}>
              <Text style={[styles.name, (completed || skipped) && { color: Colors.textSecondary }]} numberOfLines={1}>
                {habit.name}
              </Text>
              {skipped ? (
                <Text style={styles.skippedText}>⏭ Skipped today</Text>
              ) : (
                <View style={styles.streakRow}>
                  <Text style={styles.fire}>🔥</Text>
                  <Text style={styles.streakText}>{streak} {streak === 1 ? "day" : "days"}</Text>
                </View>
              )}
            </View>
          </View>
          <AnimatedCheckbox
            checked={completed} skipped={skipped}
            color={habit.color || Colors.accent} size={26}
            onToggle={() => onTap(habit)}
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: Spacing.md, paddingLeft: Spacing.md, paddingRight: Spacing.sm,
    marginBottom: Spacing.sm, borderRadius: Radius.lg,
    borderLeftWidth: 3, borderWidth: 1, borderColor: Colors.border,
  },
  left: { flexDirection: "row", alignItems: "center", flex: 1 },
  iconBg: { width: 46, height: 46, borderRadius: Radius.md, alignItems: "center", justifyContent: "center", marginRight: Spacing.md },
  emoji: { fontSize: 24 },
  info: { flex: 1 },
  name: { fontSize: Typography.size.md, fontFamily: "DMSans_600SemiBold", color: Colors.text, marginBottom: 3 },
  streakRow: { flexDirection: "row", alignItems: "center" },
  fire: { fontSize: 12, marginRight: 3 },
  streakText: { fontSize: Typography.size.xs, color: Colors.textSecondary, fontFamily: "DMSans_500Medium" },
  skippedText: { fontSize: Typography.size.xs, color: "#FFB347", fontFamily: "DMSans_500Medium" },
});
