import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, StatusBar, LogBox } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts, Sora_700Bold, Sora_800ExtraBold } from "@expo-google-fonts/sora";
import { DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold } from "@expo-google-fonts/dm-sans";
import { initializeDatabase, getSetting } from "./src/database";
import { requestNotificationPermissions } from "./src/utils/notifications";
import AppNavigator from "./src/navigation/AppNavigator";
import OnboardingScreen from "./src/screens/OnboardingScreen";
import { Colors } from "./src/theme";

LogBox.ignoreLogs([
  "Non-serializable values were found in the navigation state",
  "expo-notifications: Android Push",
  "Sending `onAnimatedValueUpdate`",
]);

export default function App() {
  const [ready, setReady] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [error, setError] = useState(null);

  const [fontsLoaded] = useFonts({
    Sora_700Bold,
    Sora_800ExtraBold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
  });

  useEffect(() => {
    const init = async () => {
      try {
        initializeDatabase();
        await requestNotificationPermissions();
        const done = getSetting("onboarding_done");
        setShowOnboarding(done !== "true");
        setReady(true);
      } catch (err) {
        console.error("Init error:", err);
        setError(err.message);
      }
    };
    init();
  }, []);

  if (error) {
    return (
      <View style={styles.error}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
        <Text style={styles.errorEmoji}>⚠️</Text>
        <Text style={styles.errorText}>Failed to start: {error}</Text>
      </View>
    );
  }

  if (!ready || !fontsLoaded) {
    return (
      <View style={styles.splash}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
        <Text style={styles.splashEmoji}>🔥</Text>
        <Text style={styles.splashTitle}>HabitForge</Text>
        <Text style={styles.splashSub}>Build. Track. Grow.</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
      {showOnboarding
        ? <OnboardingScreen onDone={() => setShowOnboarding(false)} />
        : <AppNavigator />
      }
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, backgroundColor: Colors.bg, alignItems: "center", justifyContent: "center" },
  splashEmoji: { fontSize: 72, marginBottom: 16 },
  splashTitle: { fontSize: 36, fontWeight: "800", color: Colors.text, letterSpacing: -1 },
  splashSub: { fontSize: 14, color: Colors.textSecondary, marginTop: 8, letterSpacing: 2, textTransform: "uppercase" },
  error: { flex: 1, backgroundColor: Colors.bg, alignItems: "center", justifyContent: "center", padding: 32 },
  errorEmoji: { fontSize: 48, marginBottom: 16 },
  errorText: { color: Colors.danger, fontSize: 14, textAlign: "center" },
});
