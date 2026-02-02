import type { AlertLevel } from "../types";
import { supabase } from "./supabase";

export type NotificationChannel = "push" | "sms" | "email" | "ivr";

/**
 * Get current auth session token for API calls
 */
async function getAuthToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

/**
 * Send push notification via our API route (with auth token)
 */
async function sendPushNotification(userId: string, title: string, body: string, alarm = false): Promise<void> {
  try {
    const token = await getAuthToken();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    await fetch("/api/push/send", {
      method: "POST",
      headers,
      body: JSON.stringify({
        user_id: userId,
        title,
        body,
        url: "/familiar",
        alarm, // Android: high priority, alarm sound, vibration
      }),
    });
  } catch {
    // Push send failed silently
  }
}

async function getUserName(userId: string): Promise<string> {
  const { data } = await supabase
    .from("dok_users")
    .select("name")
    .eq("id", userId)
    .single();
  return data?.name || "Tu familiar";
}

/**
 * Send notification to familiar via configured channels.
 */
export async function notifyFamiliar(
  userId: string,
  nivel: AlertLevel,
): Promise<void> {
  const channels = getChannelsForLevel(nivel);
  const name = await getUserName(userId);

  const messages: Record<string, { title: string; body: string }> = {
    alerta1h: { title: "⚠️ Dame un Ok", body: `${name} no ha dado su Ok en 1 hora` },
    alerta3h: { title: "🔴 Dame un Ok", body: `${name} lleva 3 horas sin dar su Ok` },
    emergencia6h: { title: "🚨 EMERGENCIA", body: `${name} lleva 6 horas sin responder` },
  };

  const msg = messages[nivel];
  if (!msg) return;

  // Alarm mode for 3h+ alerts (Android: sound even in silent mode)
  const isAlarm = nivel === "alerta3h" || nivel === "emergencia6h";

  for (const channel of channels) {
    if (channel === "push") {
      await sendPushNotification(userId, msg.title, msg.body, isAlarm);
    } else {
      await sendNotification(userId, channel, msg.body);
    }
  }
}

/** Notify familiar that user checked in */
export async function notifyCheckIn(userId: string): Promise<void> {
  const name = await getUserName(userId);
  await sendPushNotification(userId, "✅ Dame un Ok", `${name} ha dado su Ok`);
}

function getChannelsForLevel(nivel: AlertLevel): NotificationChannel[] {
  switch (nivel) {
    case "alerta1h": return ["push"];
    case "alerta3h": return ["push", "sms"];
    case "emergencia6h": return ["push", "sms", "email", "ivr"];
    default: return [];
  }
}

async function sendNotification(
  familiarId: string,
  channel: NotificationChannel,
  mensaje: string
): Promise<void> {
  // Future: SMS (Twilio), email (SendGrid), IVR (Twilio Voice)
  void channel; void familiarId; void mensaje;
}
