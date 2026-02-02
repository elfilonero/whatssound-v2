/** Familiar-side types */

export type AlertLevel = "ok" | "esperando" | "hambre" | "alerta1h" | "alerta3h" | "emergencia6h";

export type FamiliarTab = "inicio" | "familiares" | "alertas" | "ajustes";

export interface AlertConfig {
  badge: string;
  badgeBg: string;
  badgeBorder: string;
  icon: string;
  text: string;
}

export interface FamiliarProfile {
  id: string;
  nombre: string;
  persona: string;
  mascota: string;
  avatar: string;
  diasSeguidos: number;
  estado: AlertLevel;
}

export interface AlertEntry {
  id: string;
  fecha: string;
  nivel: AlertLevel;
  color: string;
  texto: string;
  avatar: string;
  timestamp: Date;
}

export interface NotificationPrefs {
  push: boolean;
  sms: boolean;
  email: boolean;
  sonido: "urgente" | "suave" | "silencio";
}

/** Used by TabAlertas for display */
export interface AlertaInfo {
  fecha: string;
  color: string;
  texto: string;
  avatar: string;
}

/** Used by TabFamiliares for display */
export interface FamiliarInfo {
  nombre: string;
  persona: string;
  mascota: string;
  avatar: string;
  dias: number;
}

export interface FamiliarSettings {
  horarioCheckIn: { inicio: string; fin: string }; // "08:00" - "22:00"
  notificaciones: NotificationPrefs;
  idioma: string;
  plan: "free" | "premium";
}
