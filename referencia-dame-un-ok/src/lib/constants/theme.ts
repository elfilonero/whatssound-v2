/** Design tokens — single source of truth for all visual constants */

export const COLORS = {
  primary: "#22c55e",
  primaryDark: "#16a34a",
  primaryLight: "#6ee7b7",
  danger: "#ef4444",
  dangerDark: "#dc2626",
  dangerDeep: "#991b1b",
  warning: "#eab308",
  warningDark: "#ca8a04",
  text: "#2d3436",
  textLight: "#555",
  textMuted: "#888",
  textPlaceholder: "#999",
  textDormido: "#e0e0e0",
  textDormidoFeeling: "#8899aa",
  white: "#ffffff",
  card: "rgba(255,255,255,0.7)",
  tabBar: "rgba(255,255,255,0.9)",
  blob1: "rgba(190,225,205,0.5)",
  blob2: "rgba(190,225,205,0.35)",
  blob3: "rgba(190,225,205,0.4)",
  streakBg: "rgba(220,240,225,0.85)",
} as const;

export const GRADIENTS = {
  mint: "linear-gradient(180deg, #c0dece 0%, #cfe8d8 25%, #d8eddf 50%, #cfe8d8 100%)",
  night: "linear-gradient(180deg, #1a1a2e 0%, #16213e 25%, #0f3460 50%, #1a1a2e 100%)",
  sick: "linear-gradient(180deg, #d5d5d5 0%, #e0e0e0 25%, #d8d8d8 50%, #cccccc 100%)",
  alarm: "linear-gradient(180deg, #b8d8c8 0%, #c8e2d0 50%, #bdd8ca 100%)",
} as const;

export const BUTTONS = {
  alimentar: { bg: "linear-gradient(135deg, #f5b842, #e89a2e)", shadow: "0 4px 14px rgba(240,160,48,0.35)" },
  mimar: { bg: "linear-gradient(135deg, #f08898, #e06878)", shadow: "0 4px 14px rgba(224,104,120,0.35)" },
  jugar: { bg: "linear-gradient(135deg, #5a9ee0, #4080c8)", shadow: "0 4px 14px rgba(64,128,200,0.35)" },
  completed: { bg: "linear-gradient(135deg, #34d399, #10b981)", shadow: "0 0 16px rgba(52,211,153,0.5)", border: "2px solid #6ee7b7" },
} as const;

/** Pet display constants (tuned pixel-perfect) */
export const PET_DISPLAY = {
  nameSize: 40,
  nameWeight: 800,
  nameMarginBottom: 20,
  circleSize: 200,
  circleBorder: 5,
  catWidth: "105%",
  catBottom: "-32%",
  feelingSize: 38,
  feelingWeight: 700,
  feelingMarginTop: 48,
} as const;

export const BORDER_RADIUS = {
  card: 16,
  button: 18,
  badge: 25,
  pill: 25,
  circle: "50%",
} as const;
