// ─── HabitForge Design System — EduSpark Theme ────────────────────────────
// Base: dark purple/cream palette matching the Zenvik AI product family
// Accent: #7C5CFC (Zenvik Purple) — swap this per app for product family theming

export const Colors = {
  // Backgrounds
  bg:          "#0B0B14",
  bgCard:      "#13131F",
  bgElevated:  "#1C1C2E",
  bgInput:     "#16162A",

  // Borders
  border:      "#2A2A45",
  borderSoft:  "#1E1E35",

  // Text
  text:        "#F0EEF8",       // cream-white
  textSecondary: "#8B84B0",
  textMuted:   "#55527A",

  // Brand accent (Zenvik Purple)
  accent:      "#7C5CFC",
  accentLight: "#A78BFA",
  accentSoft:  "rgba(124,92,252,0.12)",
  accentGlow:  "rgba(124,92,252,0.25)",

  // Semantic
  success:     "#10D9A0",
  successSoft: "rgba(16,217,160,0.12)",
  warning:     "#F59E0B",
  warningSoft: "rgba(245,158,11,0.12)",
  danger:      "#F87171",
  dangerSoft:  "rgba(248,113,113,0.12)",

  // Habit palette (richer, more distinct)
  habitColors: [
    "#7C5CFC", // purple
    "#10D9A0", // teal
    "#F472B6", // pink
    "#F59E0B", // amber
    "#38BDF8", // sky
    "#A78BFA", // lavender
    "#FB7185", // rose
    "#34D399", // emerald
    "#E879F9", // fuchsia
    "#22D3EE", // cyan
  ],
};

export const Typography = {
  // Font families — loaded via useFonts in App.js
  fonts: {
    heading: "Sora_700Bold",
    headingBold: "Sora_800ExtraBold",
    body: "DMSans_400Regular",
    bodyMedium: "DMSans_500Medium",
    bodySemiBold: "DMSans_600SemiBold",
  },
  size: { xs: 11, sm: 13, md: 15, lg: 17, xl: 20, xxl: 24, xxxl: 32 },
  weight: { regular: "400", medium: "500", semibold: "600", bold: "700", heavy: "800" },
};

export const Spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 };
export const Radius  = { sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, full: 999 };

export const Shadows = {
  card: {
    shadowColor: "#7C5CFC",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  accent: {
    shadowColor: "#7C5CFC",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
};

export const MILESTONE_BADGES = [
  { days: 3,   emoji: "🌱", label: "Seedling",    color: "#34D399" },
  { days: 7,   emoji: "🔥", label: "On Fire",     color: "#FB7185" },
  { days: 14,  emoji: "⚡", label: "Electrified", color: "#F59E0B" },
  { days: 21,  emoji: "💎", label: "Diamond",     color: "#38BDF8" },
  { days: 30,  emoji: "🏆", label: "Champion",    color: "#F59E0B" },
  { days: 60,  emoji: "🚀", label: "Rocket",      color: "#A78BFA" },
  { days: 100, emoji: "👑", label: "Legend",      color: "#F472B6" },
];

export const DAILY_QUOTES = [
  { text: "Small daily improvements lead to stunning results.", author: "Robin Sharma" },
  { text: "We are what we repeatedly do. Excellence is a habit.", author: "Aristotle" },
  { text: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun" },
  { text: "Success is the sum of small efforts repeated day in and day out.", author: "R. Collier" },
  { text: "Habits are the compound interest of self-improvement.", author: "James Clear" },
  { text: "You do not rise to the level of your goals. You fall to the level of your systems.", author: "James Clear" },
  { text: "The secret of your future is hidden in your daily routine.", author: "Mike Murdock" },
  { text: "First forget inspiration. Habit is more dependable.", author: "Octavia Butler" },
  { text: "Good habits formed at youth make all the difference.", author: "Aristotle" },
  { text: "Take control of your consistent actions.", author: "Tony Robbins" },
];

export const HABIT_TEMPLATES = [
  {
    category: "🌅 Morning Routine",
    habits: [
      { name: "Wake up early",   emoji: "⏰", color: "#F59E0B" },
      { name: "Drink water",     emoji: "💧", color: "#38BDF8" },
      { name: "Morning stretch", emoji: "🧘", color: "#34D399" },
      { name: "Journal",         emoji: "✍️", color: "#A78BFA" },
    ],
  },
  {
    category: "💪 Fitness",
    habits: [
      { name: "Workout",    emoji: "💪", color: "#FB7185" },
      { name: "Run / Walk", emoji: "🏃", color: "#F472B6" },
      { name: "10k steps",  emoji: "👟", color: "#10D9A0" },
      { name: "No junk food", emoji: "🥗", color: "#34D399" },
    ],
  },
  {
    category: "📚 Learning",
    habits: [
      { name: "Read 30 min",       emoji: "📚", color: "#7C5CFC" },
      { name: "Practice language", emoji: "🌐", color: "#38BDF8" },
      { name: "Online course",     emoji: "💻", color: "#F59E0B" },
    ],
  },
  {
    category: "🧠 Mental Health",
    habits: [
      { name: "Meditate",      emoji: "🧘", color: "#7C5CFC" },
      { name: "Gratitude list", emoji: "🙏", color: "#F59E0B" },
      { name: "Sleep 8 hours", emoji: "😴", color: "#A78BFA" },
    ],
  },
];
