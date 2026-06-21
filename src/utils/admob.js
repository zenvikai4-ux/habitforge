import { Alert } from "react-native";

// ─── AdMob via WebView-based approach ─────────────────────
// react-native-google-mobile-ads causes build issues with Expo managed workflow.
// For now we use a simple mock that grants rewards immediately.
// To add real ads later: use expo-ads-admob or switch to bare workflow.

// TODO: Replace with real AdMob integration when moving to bare workflow
// App ID:    ca-app-pub-5856892531724341~8529788368
// Ad Unit:   ca-app-pub-5856892531724341/1875760428

export const initAds = async () => {
  // No-op for now
};

export const loadRewardedAd = async () => {
  // No-op for now
};

export const showRewardedAd = (onRewarded, onFailed) => {
  // Show confirmation dialog simulating ad watch
  Alert.alert(
    "📺 Watch a Short Ad",
    "Watch a short ad to unlock this feature. Tap 'Watch Ad' to continue.",
    [
      { text: "Cancel", style: "cancel", onPress: () => {} },
      {
        text: "Watch Ad ▶",
        onPress: () => {
          // Simulate ad watch delay
          setTimeout(() => {
            onRewarded();
          }, 1500);
        },
      },
    ]
  );
};
