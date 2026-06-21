import * as SQLite from "expo-sqlite";

let db = null;

export const getDatabase = () => {
  if (!db) db = SQLite.openDatabaseSync("habitforge_v3.db");
  return db;
};

export const initializeDatabase = () => {
  const d = getDatabase();
  d.runSync(`CREATE TABLE IF NOT EXISTS habits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    emoji TEXT DEFAULT '✨',
    color TEXT DEFAULT '#7C5CFC',
    sort_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    is_archived INTEGER DEFAULT 0
  )`);
  d.runSync(`CREATE TABLE IF NOT EXISTS reminders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    habit_id INTEGER NOT NULL,
    time TEXT NOT NULL,
    notification_id TEXT,
    FOREIGN KEY(habit_id) REFERENCES habits(id) ON DELETE CASCADE
  )`);
  d.runSync(`CREATE TABLE IF NOT EXISTS completions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    habit_id INTEGER NOT NULL,
    completed_date TEXT NOT NULL,
    note TEXT,
    skipped INTEGER DEFAULT 0,
    UNIQUE(habit_id, completed_date)
  )`);
  d.runSync(`CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )`);
  d.runSync(`CREATE TABLE IF NOT EXISTS badges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    habit_id INTEGER NOT NULL,
    milestone INTEGER NOT NULL,
    earned_at TEXT DEFAULT (datetime('now')),
    UNIQUE(habit_id, milestone)
  )`);
  d.runSync(`INSERT OR IGNORE INTO settings (key,value) VALUES ('onboarding_done','false')`);
  d.runSync(`INSERT OR IGNORE INTO settings (key,value) VALUES ('streak_freezes','0')`);
  d.runSync(`INSERT OR IGNORE INTO settings (key,value) VALUES ('quote_index','0')`);
  d.runSync(`INSERT OR IGNORE INTO settings (key,value) VALUES ('last_quote_date','')`);
};

// ─── Habits ───────────────────────────────────────────────
export const getAllHabits = () =>
  getDatabase().getAllSync("SELECT * FROM habits WHERE is_archived=0 ORDER BY sort_order ASC, created_at ASC");

export const createHabit = (habit) => {
  const row = getDatabase().getFirstSync("SELECT COUNT(*) as c FROM habits WHERE is_archived=0");
  const count = row ? row.c : 0;
  const result = getDatabase().runSync(
    "INSERT INTO habits (name,emoji,color,sort_order) VALUES (?,?,?,?)",
    [habit.name, habit.emoji || "✨", habit.color || "#7C5CFC", count]
  );
  return result.lastInsertRowId;
};

export const updateHabit = (id, habit) =>
  getDatabase().runSync(
    "UPDATE habits SET name=?,emoji=?,color=? WHERE id=?",
    [habit.name, habit.emoji, habit.color, id]
  );

export const updateHabitOrder = (habits) => {
  habits.forEach((h, i) => getDatabase().runSync("UPDATE habits SET sort_order=? WHERE id=?", [i, h.id]));
};

export const deleteHabit = (id) => {
  getDatabase().runSync("DELETE FROM habits WHERE id=?", [id]);
  getDatabase().runSync("DELETE FROM completions WHERE habit_id=?", [id]);
  getDatabase().runSync("DELETE FROM badges WHERE habit_id=?", [id]);
  getDatabase().runSync("DELETE FROM reminders WHERE habit_id=?", [id]);
};

// ─── Reminders ────────────────────────────────────────────
export const getRemindersForHabit = (habitId) =>
  getDatabase().getAllSync("SELECT * FROM reminders WHERE habit_id=? ORDER BY time ASC", [habitId]);

export const addReminder = (habitId, time, notificationId = null) => {
  const result = getDatabase().runSync(
    "INSERT INTO reminders (habit_id,time,notification_id) VALUES (?,?,?)",
    [habitId, time, notificationId]
  );
  return result.lastInsertRowId;
};

export const updateReminderNotificationId = (reminderId, notificationId) =>
  getDatabase().runSync("UPDATE reminders SET notification_id=? WHERE id=?", [notificationId, reminderId]);

export const deleteReminder = (reminderId) =>
  getDatabase().runSync("DELETE FROM reminders WHERE id=?", [reminderId]);

export const deleteAllRemindersForHabit = (habitId) =>
  getDatabase().runSync("DELETE FROM reminders WHERE habit_id=?", [habitId]);

// ─── Completions ──────────────────────────────────────────
export const getTodayCompletions = () => {
  const today = new Date().toISOString().split("T")[0];
  return getDatabase()
    .getAllSync("SELECT habit_id FROM completions WHERE completed_date=? AND skipped=0", [today])
    .map(r => r.habit_id);
};

export const getTodaySkips = () => {
  const today = new Date().toISOString().split("T")[0];
  return getDatabase()
    .getAllSync("SELECT habit_id FROM completions WHERE completed_date=? AND skipped=1", [today])
    .map(r => r.habit_id);
};

export const toggleCompletion = (habitId, date, note = null) => {
  const existing = getDatabase().getFirstSync(
    "SELECT id, skipped FROM completions WHERE habit_id=? AND completed_date=?", [habitId, date]
  );
  if (existing && !existing.skipped) {
    getDatabase().runSync("DELETE FROM completions WHERE habit_id=? AND completed_date=?", [habitId, date]);
    return { completed: false };
  } else if (existing && existing.skipped) {
    getDatabase().runSync("UPDATE completions SET skipped=0,note=? WHERE habit_id=? AND completed_date=?", [note, habitId, date]);
    return { completed: true };
  } else {
    getDatabase().runSync("INSERT INTO completions (habit_id,completed_date,note,skipped) VALUES (?,?,?,0)", [habitId, date, note]);
    return { completed: true };
  }
};

export const skipDay = (habitId, date) => {
  const existing = getDatabase().getFirstSync(
    "SELECT id FROM completions WHERE habit_id=? AND completed_date=?", [habitId, date]
  );
  if (existing) {
    getDatabase().runSync("UPDATE completions SET skipped=1 WHERE habit_id=? AND completed_date=?", [habitId, date]);
  } else {
    getDatabase().runSync("INSERT INTO completions (habit_id,completed_date,skipped) VALUES (?,?,1)", [habitId, date]);
  }
};

export const getCompletionsForHabit = (habitId) =>
  getDatabase()
    .getAllSync("SELECT completed_date FROM completions WHERE habit_id=? AND skipped=0 ORDER BY completed_date DESC", [habitId])
    .map(r => r.completed_date);

export const getCompletionsForMonth = (habitId, year, month) => {
  const prefix = `${year}-${String(month).padStart(2, "0")}`;
  return getDatabase().getAllSync(
    "SELECT completed_date, skipped FROM completions WHERE habit_id=? AND completed_date LIKE ?",
    [habitId, `${prefix}%`]
  );
};

export const getAllCompletions = () =>
  getDatabase().getAllSync("SELECT * FROM completions WHERE skipped=0 ORDER BY completed_date DESC");

// ─── Badges ───────────────────────────────────────────────
export const getEarnedBadges = (habitId) =>
  getDatabase().getAllSync("SELECT milestone FROM badges WHERE habit_id=?", [habitId]).map(r => r.milestone);

export const awardBadge = (habitId, milestone) => {
  try {
    getDatabase().runSync("INSERT OR IGNORE INTO badges (habit_id,milestone) VALUES (?,?)", [habitId, milestone]);
    return true;
  } catch { return false; }
};

export const getAllBadges = () =>
  getDatabase().getAllSync(
    "SELECT b.*, h.name, h.emoji, h.color FROM badges b JOIN habits h ON b.habit_id=h.id ORDER BY b.earned_at DESC"
  );

// ─── Streak ───────────────────────────────────────────────
export const calculateStreak = (dates) => {
  if (!dates || dates.length === 0) return { current: 0, longest: 0 };
  const sorted = [...dates].sort((a, b) => new Date(b) - new Date(a));
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  let current = 0;
  if (sorted[0] === today || sorted[0] === yesterday) {
    let prev = null;
    for (const date of sorted) {
      if (!prev) { current = 1; prev = date; }
      else {
        const diff = (new Date(prev) - new Date(date)) / 86400000;
        if (diff === 1) { current++; prev = date; } else break;
      }
    }
  }

  let longest = 0, streak = 1, prev = null;
  const asc = [...sorted].sort((a, b) => new Date(a) - new Date(b));
  for (const date of asc) {
    if (!prev) { streak = 1; prev = date; }
    else {
      const diff = (new Date(date) - new Date(prev)) / 86400000;
      if (diff === 1) { streak++; if (streak > longest) longest = streak; }
      else streak = 1;
      prev = date;
    }
  }
  return { current, longest: Math.max(longest, streak) };
};

// ─── Settings ─────────────────────────────────────────────
export const getSetting = (key) => {
  const row = getDatabase().getFirstSync("SELECT value FROM settings WHERE key=?", [key]);
  return row ? row.value : null;
};

export const setSetting = (key, value) =>
  getDatabase().runSync("INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)", [key, String(value)]);

// ─── Export ───────────────────────────────────────────────
export const exportToCSV = () => {
  const habits = getAllHabits();
  const completions = getDatabase().getAllSync("SELECT * FROM completions ORDER BY completed_date DESC");
  let csv = "Habit,Date,Status,Note\n";
  for (const c of completions) {
    const h = habits.find(h => h.id === c.habit_id);
    if (!h) continue;
    const note = (c.note || "").replace(/"/g, '""');
    csv += `"${h.name}","${c.completed_date}","${c.skipped ? "skipped" : "done"}","${note}"\n`;
  }
  return csv;
};
