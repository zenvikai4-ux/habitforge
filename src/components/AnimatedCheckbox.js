import React, { useEffect, useRef } from "react";
import { Animated, TouchableOpacity, StyleSheet, View } from "react-native";

export default function AnimatedCheckbox({ checked, skipped, color = "#7C5CFC", size = 28, onToggle }) {
  const scale = useRef(new Animated.Value(1)).current;
  const checkScale = useRef(new Animated.Value(checked ? 1 : 0)).current;
  const checkOpacity = useRef(new Animated.Value(checked ? 1 : 0)).current;
  const bgOpacity = useRef(new Animated.Value((checked || skipped) ? 1 : 0)).current;

  useEffect(() => {
    if (checked || skipped) {
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.2, duration: 100, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }),
      ]).start();
      Animated.parallel([
        Animated.timing(bgOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.spring(checkScale, { toValue: 1, friction: 5, tension: 200, useNativeDriver: true }),
        Animated.timing(checkOpacity, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(bgOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(checkScale, { toValue: 0, duration: 120, useNativeDriver: true }),
        Animated.timing(checkOpacity, { toValue: 0, duration: 100, useNativeDriver: true }),
      ]).start();
    }
  }, [checked, skipped]);

  const displayColor = skipped ? "#FFB347" : color;

  return (
    <TouchableOpacity onPress={onToggle} activeOpacity={0.8}
      style={{ width: size + 20, height: size + 20, alignItems: "center", justifyContent: "center" }}>
      <Animated.View style={[styles.box, {
        width: size, height: size,
        borderRadius: size * 0.3,
        borderColor: displayColor,
        transform: [{ scale }],
      }]}>
        <Animated.View style={[StyleSheet.absoluteFill, {
          borderRadius: size * 0.3,
          backgroundColor: displayColor,
          opacity: bgOpacity,
        }]} />
        <Animated.View style={{ opacity: checkOpacity, transform: [{ scale: checkScale }], zIndex: 1 }}>
          {skipped ? (
            <View style={[styles.skipLine, { backgroundColor: "#fff" }]} />
          ) : (
            <View style={styles.checkmark}>
              <View style={[styles.checkShort, { backgroundColor: "#fff" }]} />
              <View style={[styles.checkLong, { backgroundColor: "#fff" }]} />
            </View>
          )}
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  box: { borderWidth: 2, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  checkmark: { width: 14, height: 14, alignItems: "center", justifyContent: "center" },
  checkShort: { position: "absolute", width: 3, height: 6, borderRadius: 2, left: 2, bottom: 2, transform: [{ rotate: "45deg" }] },
  checkLong: { position: "absolute", width: 3, height: 10, borderRadius: 2, right: 1, bottom: 0, transform: [{ rotate: "-45deg" }] },
  skipLine: { width: 10, height: 3, borderRadius: 2 },
});
