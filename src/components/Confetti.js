import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";

const { width, height } = Dimensions.get("window");
const COLORS = ["#6C63FF","#00E5A0","#FF6B9D","#FFB347","#4FC3F7","#FFD700","#FF7043","#AB47BC"];
const NUM = 50;

function Piece({ delay }) {
  const y = useRef(new Animated.Value(-20)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const x = useRef(Math.random() * width).current;
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const size = 6 + Math.random() * 8;
  const isCircle = Math.random() > 0.5;
  const duration = 1800 + Math.random() * 1400;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(y, { toValue: height * 0.7 + Math.random() * 200, duration, useNativeDriver: true }),
        Animated.timing(rotate, { toValue: Math.random() > 0.5 ? 3 : -3, duration, useNativeDriver: true }),
        Animated.sequence([
          Animated.delay(duration * 0.65),
          Animated.timing(opacity, { toValue: 0, duration: duration * 0.35, useNativeDriver: true }),
        ]),
      ]),
    ]).start();
  }, []);

  const spin = rotate.interpolate({ inputRange: [-3, 3], outputRange: ["-540deg", "540deg"] });

  return (
    <Animated.View style={{
      position: "absolute", top: 0, left: x,
      width: size, height: isCircle ? size : size * 0.5,
      borderRadius: isCircle ? size / 2 : 2,
      backgroundColor: color,
      transform: [{ translateY: y }, { rotate: spin }],
      opacity,
    }} />
  );
}

export default function Confetti({ visible }) {
  if (!visible) return null;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: NUM }).map((_, i) => <Piece key={i} delay={i * 50} />)}
    </View>
  );
}
