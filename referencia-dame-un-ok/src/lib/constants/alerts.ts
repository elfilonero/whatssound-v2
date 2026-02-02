import type { AlertLevel, AlertConfig } from "../types";
import { COLORS } from "./theme";

/** Test mode — alert times in seconds instead of hours */
export const TEST_MODE = false;

/** Premium features flag */
export const PREMIUM_FEATURES = false;

/** Alert configuration by level */
export const ALERT_CONFIG: Record<AlertLevel, AlertConfig> = {
  ok: { badge: "Esta bien", badgeBg: COLORS.primary, badgeBorder: COLORS.primaryDark, icon: "✅", text: "" },
  esperando: { badge: "Esperando", badgeBg: COLORS.warning, badgeBorder: COLORS.warningDark, icon: "⏳", text: "" },
  hambre: { badge: "Fufy tiene hambre", badgeBg: "#f97316", badgeBorder: "#ea580c", icon: "🍽️", text: "Has pedido que alimenten a Fufy. Esperando respuesta..." },
  alerta1h: { badge: "Sin respuesta (1h)", badgeBg: COLORS.warning, badgeBorder: COLORS.warningDark, icon: "⚠️", text: "Fufy tiene hambre. Mama no ha respondido en 1 hora." },
  alerta3h: { badge: "Alerta! Sin respuesta (3h)", badgeBg: COLORS.danger, badgeBorder: COLORS.dangerDark, icon: "🚨", text: "Fufy esta triste. Mama no responde desde hace 3 horas. Se ha notificado a los contactos de emergencia." },
  emergencia6h: { badge: "EMERGENCIA - Sin respuesta (6h+)", badgeBg: COLORS.dangerDeep, badgeBorder: "#7f1d1d", icon: "🚨", text: "ATENCION: Mama no responde desde hace mas de 6 horas. Segunda ronda de alertas enviada. Fufy esta enfermo." },
};

/** Avatar shown on familiar dashboard by alert level */
export const ALERT_AVATARS: Record<AlertLevel, string> = {
  ok: "/avatars/misi-contento.png",
  esperando: "/avatars/misi-esperando.png",
  hambre: "/avatars/misi-esperando.png",
  alerta1h: "/avatars/misi-esperando.png",
  alerta3h: "/avatars/misi-triste.png",
  emergencia6h: "/avatars/misi-enfermo.png",
};

/** Streak shown by alert level */
export const ALERT_STREAKS: Record<AlertLevel, number> = {
  ok: 7, esperando: 7, hambre: 7, alerta1h: 7, alerta3h: 0, emergencia6h: 0,
};

/** Alert escalation timeline (minutes) */
export const ALERT_ESCALATION = TEST_MODE ? {
  warning: 2 / 60,      // 2 seconds (in minutes)
  alert: 3 / 60,        // 3 seconds
  emergency: 4 / 60,    // 4 seconds
} : {
  warning: 60,       // 1h → yellow alert
  alert: 180,        // 3h → red alert, notify emergency contacts
  emergency: 360,    // 6h → emergency, second round of alerts
} as const;
