/* eslint-disable @typescript-eslint/no-unused-vars */
import { supabase } from "./supabase";
import type { AlertLevel } from "../types";
import { ALERT_ESCALATION } from "../constants";

/** Calculate alert level based on minutes since last check-in */
export function calculateAlertLevel(minutesSinceCheckIn: number): AlertLevel {
  if (minutesSinceCheckIn >= ALERT_ESCALATION.emergency) return "emergencia6h";
  if (minutesSinceCheckIn >= ALERT_ESCALATION.alert) return "alerta3h";
  if (minutesSinceCheckIn >= ALERT_ESCALATION.warning) return "alerta1h";
  if (minutesSinceCheckIn > 0) return "esperando";
  return "ok";
}

/** Create an alert in the database */
export async function createAlert(userId: string, nivel: AlertLevel, mensaje: string): Promise<void> {
  await supabase.from("dok_alertas").insert({
    user_id: userId,
    nivel,
    mensaje,
  });
}

/** Resolve all pending alerts for a user */
export async function resolveAlerts(userId: string): Promise<void> {
  await supabase
    .from("dok_alertas")
    .update({ resolved: true })
    .eq("user_id", userId)
    .eq("resolved", false);
}

/** Get alert history for a user */
export async function getAlertHistory(userId: string) {
  const { data } = await supabase
    .from("dok_alertas")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  return data || [];
}
