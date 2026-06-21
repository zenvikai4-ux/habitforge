import { useState, useEffect, useCallback } from "react";
import {
  getAllHabits, getTodayCompletions, getTodaySkips,
  toggleCompletion, skipDay, createHabit, updateHabit,
  deleteHabit, updateHabitOrder, getAllCompletions,
  getCompletionsForHabit, calculateStreak,
  getSetting, awardBadge, getEarnedBadges,
  getRemindersForHabit, addReminder, deleteAllRemindersForHabit,
  updateReminderNotificationId, deleteReminder,
} from "../database";
import {
  scheduleReminderNotification,
  cancelNotificationById,
} from "../utils/notifications";
import { MILESTONE_BADGES } from "../theme";

const FREE_HABIT_LIMIT = 5;

export const useHabits = () => {
  const [habits, setHabits] = useState([]);
  const [completedToday, setCompletedToday] = useState([]);
  const [skippedToday, setSkippedToday] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMilestone, setNewMilestone] = useState(null);

  const loadData = useCallback(() => {
    try {
      setHabits(getAllHabits());
      setCompletedToday(getTodayCompletions());
      setSkippedToday(getTodaySkips());
    } catch (err) {
      console.error("Load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const checkMilestones = useCallback((habit) => {
    try {
      const dates = getCompletionsForHabit(habit.id);
      const { current } = calculateStreak(dates);
      const earned = getEarnedBadges(habit.id);
      for (const badge of MILESTONE_BADGES) {
        if (current >= badge.days && !earned.includes(badge.days)) {
          awardBadge(habit.id, badge.days);
          setNewMilestone({ milestone: badge.days, habitName: habit.name });
          return;
        }
      }
    } catch {}
  }, []);

  // Schedule all reminders for a habit from an array of time strings ["09:00","14:00"]
  const scheduleReminders = useCallback(async (habitId, habitData, reminderTimes) => {
    // Cancel + delete old reminders
    const existing = getRemindersForHabit(habitId);
    for (const r of existing) {
      await cancelNotificationById(r.notification_id);
    }
    deleteAllRemindersForHabit(habitId);
    // Add new reminders
    for (const time of reminderTimes) {
      const rowId = addReminder(habitId, time, null);
      const notifId = await scheduleReminderNotification({ ...habitData, id: habitId }, time);
      if (notifId) updateReminderNotificationId(rowId, notifId);
    }
  }, []);

  const addHabit = useCallback(async (habitData, reminderTimes = []) => {
    // Over free limit — caller must show ad first, then call addHabitForced
    if (habits.length >= FREE_HABIT_LIMIT) return { error: "limit_reached" };
    const habitId = createHabit(habitData);
    await scheduleReminders(habitId, habitData, reminderTimes);
    loadData();
    return { success: true };
  }, [habits, loadData, scheduleReminders]);

  // Called after ad is successfully watched
  const addHabitForced = useCallback(async (habitData, reminderTimes = []) => {
    const habitId = createHabit(habitData);
    await scheduleReminders(habitId, habitData, reminderTimes);
    loadData();
    return { success: true };
  }, [loadData, scheduleReminders]);

  const editHabit = useCallback(async (id, habitData, reminderTimes = []) => {
    updateHabit(id, habitData);
    await scheduleReminders(id, habitData, reminderTimes);
    loadData();
  }, [loadData, scheduleReminders]);

  const removeHabit = useCallback(async (id) => {
    const reminders = getRemindersForHabit(id);
    for (const r of reminders) await cancelNotificationById(r.notification_id);
    deleteHabit(id);
    loadData();
  }, [loadData]);

  const toggleHabit = useCallback((habit, note = null) => {
    const today = new Date().toISOString().split("T")[0];
    const result = toggleCompletion(habit.id, today, note);
    if (result.completed) {
      setCompletedToday(prev => [...prev.filter(id => id !== habit.id), habit.id]);
      setSkippedToday(prev => prev.filter(id => id !== habit.id));
      checkMilestones(habit);
    } else {
      setCompletedToday(prev => prev.filter(id => id !== habit.id));
    }
    return result;
  }, [checkMilestones]);

  const skipHabit = useCallback((habitId) => {
    const today = new Date().toISOString().split("T")[0];
    skipDay(habitId, today);
    setSkippedToday(prev => [...prev.filter(id => id !== habitId), habitId]);
    setCompletedToday(prev => prev.filter(id => id !== habitId));
  }, []);

  const freezeStreak = useCallback((habitId) => {
    // Ad-gated: caller shows ad first, then calls this
    const today = new Date().toISOString().split("T")[0];
    skipDay(habitId, today); // skip counts as freeze (doesn't break streak calc)
    setSkippedToday(prev => [...prev.filter(id => id !== habitId), habitId]);
  }, []);

  const reorderHabits = useCallback((newOrder) => {
    setHabits(newOrder);
    updateHabitOrder(newOrder);
  }, []);

  return {
    habits, completedToday, skippedToday, loading,
    refresh: loadData, addHabit, addHabitForced, editHabit, removeHabit,
    toggleHabit, skipHabit, freezeStreak, reorderHabits,
    freeLimit: FREE_HABIT_LIMIT,
    canAddFree: habits.length < FREE_HABIT_LIMIT,
    newMilestone, clearMilestone: () => setNewMilestone(null),
    getRemindersForHabit,
  };
};

export const useHabitStats = (refreshKey = 0) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const habits = getAllHabits();
      const allCompletions = getAllCompletions();
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const thisWeek = allCompletions.filter(c => new Date(c.completed_date) >= weekStart);
      const totalPossible = habits.length * (now.getDay() + 1);
      const completionRate = totalPossible > 0 ? Math.round((thisWeek.length / totalPossible) * 100) : 0;

      let bestStreak = 0;
      const habitsWithStats = habits.map(h => {
        const dates = allCompletions.filter(c => c.habit_id === h.id).map(c => c.completed_date);
        const { current, longest } = calculateStreak(dates);
        if (longest > bestStreak) bestStreak = longest;
        return { ...h, currentStreak: current, longestStreak: longest, totalCompletions: dates.length };
      });

      const today = now.toISOString().split("T")[0];
      const todayCount = allCompletions.filter(c => c.completed_date === today).length;

      const weeklyData = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now);
        d.setDate(now.getDate() - (6 - i));
        const dateStr = d.toISOString().split("T")[0];
        const count = allCompletions.filter(c => c.completed_date === dateStr).length;
        return { day: ["S","M","T","W","T","F","S"][d.getDay()], count, date: dateStr };
      });

      setStats({ totalHabits: habits.length, completionRate, bestStreak, totalCompletions: allCompletions.length, todayCount, habitsWithStats, weeklyData });
    } catch (err) {
      console.error("Stats error:", err);
    } finally {
      setLoading(false);
    }
  }, [refreshKey]);

  return { stats, loading };
};
