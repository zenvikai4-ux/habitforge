import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const requestNotificationPermissions = async () => {
  try {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("habit-reminders", {
        name: "Habit Reminders",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
      });
    }
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === "granted") return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  } catch { return false; }
};

// Schedule a single notification for a specific time string "HH:MM"
export const scheduleReminderNotification = async (habit, timeStr) => {
  try {
    const [hours, minutes] = timeStr.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes)) return null;
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: `${habit.emoji || "✨"} Time for ${habit.name}!`,
        body: "Don't break your streak today! 🔥",
        data: { habitId: habit.id },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: hours,
        minute: minutes,
      },
    });
  } catch (err) {
    console.warn("Notification schedule failed:", err);
    return null;
  }
};

export const cancelNotificationById = async (notificationId) => {
  if (!notificationId) return;
  try { await Notifications.cancelScheduledNotificationAsync(notificationId); } catch {}
};

export const scheduleMorningBriefing = async (habitCount) => {
  try {
    await Notifications.scheduleNotificationAsync({
      identifier: "morning-brief",
      content: {
        title: "🌅 Good morning, champion!",
        body: `You have ${habitCount} habit${habitCount !== 1 ? "s" : ""} to complete today. Keep that streak alive! 🔥`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 8,
        minute: 0,
      },
    });
  } catch (err) { console.warn("Morning brief failed:", err); }
};

export const cancelAllNotifications = async () => {
  try { await Notifications.cancelAllScheduledNotificationsAsync(); } catch {}
};
