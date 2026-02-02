/**
 * Cron Job: Server-side alert monitoring
 * 
 * Runs every 5 minutes via Vercel Cron (or manual trigger).
 * Checks all active users against their schedules and creates
 * alerts + sends push notifications when needed.
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

// --- Supabase client (service-level, no auth needed) ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// --- VAPID setup ---
function initWebPush(): typeof webpush {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (publicKey && privateKey) {
    webpush.setVapidDetails(
      process.env.VAPID_EMAIL || "mailto:vertexdeveloperchina@gmail.com",
      publicKey,
      privateKey
    );
  }
  return webpush;
}

// --- Types ---
interface UserRow {
  id: string;
  name: string;
  timezone: string | null;
  last_check_in: string | null;
  dnd_until: string | null;
  pet_name: string | null;
}

interface ScheduleRow {
  user_id: string;
  type: string; // "despertar" | "comida" | "cena" | "dormir"
  time: string; // "HH:MM"
}

interface InvitationRow {
  user_id: string;
  alert_times: number[] | null; // [60, 180, 360] in minutes
}

interface PushSubscriptionRow {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  user_id: string;
}

interface AlertSummary {
  userId: string;
  userName: string;
  level: string;
  type: "familiar_alert" | "user_reminder";
}

// --- Default alert thresholds (minutes since wakeup without check-in) ---
const DEFAULT_ALERT_TIMES = [60, 180, 360];

// --- Alert level from minutes ---
function getAlertLevel(minutes: number, thresholds: number[]): string | null {
  const [warning, alert, emergency] = thresholds;
  if (minutes >= emergency) return "emergencia6h";
  if (minutes >= alert) return "alerta3h";
  if (minutes >= warning) return "alerta1h";
  return null;
}

// --- Get current time in a timezone ---
function getNowInTimezone(tz: string): Date {
  const now = new Date();
  const formatted = now.toLocaleString("en-US", { timeZone: tz });
  return new Date(formatted);
}

// --- Parse "HH:MM" to { hours, minutes } ---
function parseTime(timeStr: string): { hours: number; minutes: number } {
  const [h, m] = timeStr.split(":").map(Number);
  return { hours: h, minutes: m };
}

// --- Check if current time is within a window of a schedule time (±15 min) ---
function isWithinWindow(nowLocal: Date, scheduleTime: string, windowMinutes = 15): boolean {
  const { hours, minutes } = parseTime(scheduleTime);
  const scheduleMinutes = hours * 60 + minutes;
  const currentMinutes = nowLocal.getHours() * 60 + nowLocal.getMinutes();
  const diff = Math.abs(currentMinutes - scheduleMinutes);
  return diff <= windowMinutes;
}

// --- Send push to a specific user's subscriptions ---
async function sendPushToUser(
  userId: string,
  title: string,
  body: string,
  alarm: boolean,
  url: string
): Promise<number> {
  const { data: subs } = await supabase
    .from("dok_push_subscriptions")
    .select("endpoint, keys")
    .eq("user_id", userId);

  if (!subs || subs.length === 0) return 0;

  const wp = initWebPush();
  const payload = JSON.stringify({
    title,
    body,
    url,
    alarm,
    urgency: alarm ? "high" : "normal",
  });

  let sent = 0;
  for (const sub of subs as PushSubscriptionRow[]) {
    try {
      await wp.sendNotification(
        { endpoint: sub.endpoint, keys: sub.keys as { p256dh: string; auth: string } },
        payload,
        {
          urgency: alarm ? "high" as const : "normal" as const,
          TTL: alarm ? 300 : 3600,
        }
      );
      sent++;
    } catch {
      // Remove invalid subscription
      await supabase.from("dok_push_subscriptions").delete().eq("endpoint", sub.endpoint);
    }
  }
  return sent;
}

// --- Send push to all familiares of a user ---
async function sendPushToFamiliares(
  userId: string,
  title: string,
  body: string,
  alarm: boolean
): Promise<number> {
  // Familiares subscribe with the user_id of the person they monitor
  // Their subscriptions are stored under their own auth_id though
  // But looking at the existing code, push subscriptions use user_id directly
  // The familiar dashboard subscribes with the monitored user's ID
  return sendPushToUser(userId, title, body, alarm, "/familiar");
}

// --- Check if user has a check-in today (in their timezone) ---
async function hasCheckInToday(userId: string, tz: string): Promise<boolean> {
  const nowLocal = getNowInTimezone(tz);

  // Create a date string in the user's timezone for query
  const year = nowLocal.getFullYear();
  const month = String(nowLocal.getMonth() + 1).padStart(2, "0");
  const day = String(nowLocal.getDate()).padStart(2, "0");
  const localMidnight = `${year}-${month}-${day}T00:00:00`;

  // Query check-ins including alarm_dismiss actions
  const { data } = await supabase
    .from("dok_check_ins")
    .select("id")
    .eq("user_id", userId)
    .gte("created_at", new Date(localMidnight).toISOString())
    .limit(1);

  return (data && data.length > 0) || false;
}

// --- Check if user has a recent check-in (within N minutes) ---
async function hasRecentCheckIn(userId: string, withinMinutes: number): Promise<boolean> {
  const cutoff = new Date(Date.now() - withinMinutes * 60 * 1000).toISOString();
  const { data } = await supabase
    .from("dok_check_ins")
    .select("id")
    .eq("user_id", userId)
    .gte("created_at", cutoff)
    .limit(1);

  return (data && data.length > 0) || false;
}

// --- Check if an unresolved alert of this level already exists ---
async function hasUnresolvedAlert(userId: string, nivel: string): Promise<boolean> {
  const { data } = await supabase
    .from("dok_alertas")
    .select("id")
    .eq("user_id", userId)
    .eq("nivel", nivel)
    .eq("resolved", false)
    .limit(1);

  return (data && data.length > 0) || false;
}

// --- Main handler ---
export async function GET(request: NextRequest) {
  // Verify cron secret or allow local calls
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const alerts: AlertSummary[] = [];

  try {
    // 1. Get all active users
    const { data: users, error: usersError } = await supabase
      .from("dok_users")
      .select("id, name, timezone, last_check_in, dnd_until, pet_name")
      .eq("onboarded", true);

    if (usersError || !users) {
      return NextResponse.json({ error: "Failed to fetch users", detail: usersError?.message }, { status: 500 });
    }

    // 2. Get all schedules
    const { data: allSchedules } = await supabase
      .from("dok_schedules")
      .select("user_id, type, time");

    const schedulesByUser = new Map<string, ScheduleRow[]>();
    if (allSchedules) {
      for (const s of allSchedules as ScheduleRow[]) {
        const existing = schedulesByUser.get(s.user_id) || [];
        existing.push(s);
        schedulesByUser.set(s.user_id, existing);
      }
    }

    // 3. Get alert_times from invitations (per user)
    const { data: invitations } = await supabase
      .from("dok_invitations")
      .select("user_id, alert_times")
      .eq("used", true);

    const alertTimesByUser = new Map<string, number[]>();
    if (invitations) {
      for (const inv of invitations as InvitationRow[]) {
        if (inv.alert_times && Array.isArray(inv.alert_times) && inv.alert_times.length === 3) {
          alertTimesByUser.set(inv.user_id, inv.alert_times);
        }
      }
    }

    // 4. Process each user
    for (const user of users as UserRow[]) {
      const tz = user.timezone || "Europe/Madrid";
      const nowLocal = getNowInTimezone(tz);
      const schedules = schedulesByUser.get(user.id) || [];

      // Skip if user is in DND mode
      if (user.dnd_until && new Date(user.dnd_until) > new Date()) {
        continue;
      }

      // Find wakeup time
      const wakeupSchedule = schedules.find(s => s.type === "despertar");
      const wakeupTime = wakeupSchedule?.time || "08:00";
      const { hours: wakeH, minutes: wakeM } = parseTime(wakeupTime);

      // Find sleep time
      const sleepSchedule = schedules.find(s => s.type === "dormir");
      const sleepTime = sleepSchedule?.time || "22:00";
      const { hours: sleepH, minutes: sleepM } = parseTime(sleepTime);

      const currentMinutes = nowLocal.getHours() * 60 + nowLocal.getMinutes();
      const wakeupMinutes = wakeH * 60 + wakeM;
      const sleepMinutes = sleepH * 60 + sleepM;

      // Check if it's meal time (within ±5min window for push)
      const mealSchedules = schedules.filter(s => s.type === "comida" || s.type === "cena" || s.type === "hambre");
      const isNearMealTime = mealSchedules.some(s => {
        const { hours: mH, minutes: mM } = parseTime(s.time);
        const mealMinutes = mH * 60 + mM;
        return Math.abs(currentMinutes - mealMinutes) <= 5;
      });

      // Skip if outside waking hours (unless it's meal time)
      if (currentMinutes < wakeupMinutes || currentMinutes > sleepMinutes) {
        if (!isNearMealTime) {
          continue;
        }
        // It's meal time during sleep hours — send meal reminder but skip alert escalation
        const hasRecent = await hasRecentCheckIn(user.id, 30);
        if (!hasRecent) {
          const petName = user.pet_name || "Fufy";
          for (const meal of mealSchedules) {
            if (isWithinWindow(nowLocal, meal.time, 5)) {
              await sendPushToUser(
                user.id,
                `🍽️ ${petName} tiene hambre`,
                `¿Le das de comer?`,
                false,
                "/"
              );
              alerts.push({ userId: user.id, userName: user.name, level: "meal_reminder", type: "user_reminder" });
            }
          }
        }
        continue;
      }

      // --- Task 3: Morning/meal push reminders TO the user ---
      const hasRecent = await hasRecentCheckIn(user.id, 30);
      if (!hasRecent) {
        const petName = user.pet_name || "Fufy";

        // Wakeup reminder
        if (isWithinWindow(nowLocal, wakeupTime, 5)) {
          await sendPushToUser(
            user.id,
            `🐱 ¡${petName} se ha despertado!`,
            `Pasa a verle`,
            true,
            "/"
          );
          alerts.push({ userId: user.id, userName: user.name, level: "reminder", type: "user_reminder" });
        }

        // Meal reminders
        const mealSchedules = schedules.filter(s => s.type === "comida" || s.type === "cena" || s.type === "hambre");
        for (const meal of mealSchedules) {
          if (isWithinWindow(nowLocal, meal.time, 5)) {
            await sendPushToUser(
              user.id,
              `🍽️ ${petName} tiene hambre`,
              `¿Le das de comer?`,
              false,
              "/"
            );
            alerts.push({ userId: user.id, userName: user.name, level: "meal_reminder", type: "user_reminder" });
          }
        }
      }

      // --- Alert monitoring for familiares ---
      // Calculate minutes since wakeup — always count from despertar time, not last meal
      // Use local time math (currentMinutes vs wakeupMinutes) to avoid timezone conversion bugs
      const minutesSinceWakeup = currentMinutes - wakeupMinutes;
      let minutesWithoutOk: number;

      if (minutesSinceWakeup < 0) {
        // Before wakeup — no alerts
        continue;
      }

      if (user.last_check_in) {
        // Convert last_check_in to local time in user's timezone
        const lastCheckInDate = new Date(user.last_check_in);
        const lastCheckInFormatted = lastCheckInDate.toLocaleString("en-US", { timeZone: tz });
        const lastCheckInLocalDate = new Date(lastCheckInFormatted);
        const lastCheckInMinutes = lastCheckInLocalDate.getHours() * 60 + lastCheckInLocalDate.getMinutes();

        // Check if last check-in was today and after wakeup
        const isToday = lastCheckInLocalDate.toDateString() === nowLocal.toDateString();

        if (isToday && lastCheckInMinutes >= wakeupMinutes) {
          // Check-in happened today after wakeup — count from that check-in
          minutesWithoutOk = currentMinutes - lastCheckInMinutes;
        } else {
          // Last check-in was before today's wakeup — count from wakeup
          minutesWithoutOk = minutesSinceWakeup;
        }
      } else {
        // Never checked in — count from today's wakeup
        minutesWithoutOk = minutesSinceWakeup;
      }

      if (minutesWithoutOk < 0) continue; // Before wakeup time

      // Check today's check-ins including alarm_dismiss
      const hasTodayCheckIn = await hasCheckInToday(user.id, tz);
      if (hasTodayCheckIn) continue; // User already checked in today

      // Get alert thresholds
      const thresholds = alertTimesByUser.get(user.id) || DEFAULT_ALERT_TIMES;
      const level = getAlertLevel(minutesWithoutOk, thresholds);

      if (!level) continue; // Not yet at alert threshold

      // Deduplicate: check if unresolved alert of same level exists
      const alreadyExists = await hasUnresolvedAlert(user.id, level);
      if (alreadyExists) continue;

      // Create alert in database
      const alertMessages: Record<string, string> = {
        alerta1h: `${user.name} no ha dado su Ok en 1 hora`,
        alerta3h: `${user.name} lleva 3 horas sin dar su Ok`,
        emergencia6h: `${user.name} lleva 6+ horas sin responder`,
      };

      await supabase.from("dok_alertas").insert({
        user_id: user.id,
        nivel: level,
        mensaje: alertMessages[level] || "Sin respuesta",
      });

      // Send push to the USER (Fufy-centric messages)
      const petName = user.pet_name || "Fufy";
      const userPushMessages: Record<string, { title: string; body: string }> = {
        alerta1h: { title: `😿 ${petName} está triste`, body: `Lleva esperándote un rato...` },
        alerta3h: { title: `🤒 ${petName} no se encuentra bien`, body: `Necesita que le cuides` },
        emergencia6h: { title: `🚨 ¡${petName} te necesita!`, body: `¡${petName} te necesita urgentemente!` },
      };
      const userMsg = userPushMessages[level];
      if (userMsg) {
        await sendPushToUser(user.id, userMsg.title, userMsg.body, true, "/");
      }

      // Send push to familiares
      const pushMessages: Record<string, { title: string; body: string }> = {
        alerta1h: { title: "⚠️ Dame un Ok", body: `${user.name} no ha dado su Ok en 1 hora` },
        alerta3h: { title: "🔴 Dame un Ok", body: `${user.name} lleva 3 horas sin dar su Ok` },
        emergencia6h: { title: "🚨 EMERGENCIA", body: `${user.name} lleva 6 horas sin responder` },
      };

      const msg = pushMessages[level];
      if (msg) {
        const isAlarm = level === "alerta3h" || level === "emergencia6h";
        await sendPushToFamiliares(user.id, msg.title, msg.body, isAlarm);
      }

      alerts.push({ userId: user.id, userName: user.name, level, type: "familiar_alert" });
    }

    return NextResponse.json({
      ok: true,
      processed: users.length,
      alerts,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: "Cron job failed", detail: message }, { status: 500 });
  }
}
