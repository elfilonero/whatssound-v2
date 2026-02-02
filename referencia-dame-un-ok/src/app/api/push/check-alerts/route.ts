import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ALERT_THRESHOLDS = { warning: 60, alert: 180, emergency: 360 };

function getAlertLevel(minutes: number): string | null {
  if (minutes >= ALERT_THRESHOLDS.emergency) return "emergencia6h";
  if (minutes >= ALERT_THRESHOLDS.alert) return "alerta3h";
  if (minutes >= ALERT_THRESHOLDS.warning) return "alerta1h";
  return null;
}

function getWebPush() {
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

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (token) {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user_id } = await req.json();
    if (!user_id) {
      return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
    }

    // Get user name
    const { data: user } = await supabase
      .from("dok_users")
      .select("name")
      .eq("id", user_id)
      .single();

    const userName = user?.name || "Tu familiar";

    // Get last check-in
    const { data: lastCheckIn } = await supabase
      .from("dok_check_ins")
      .select("created_at")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!lastCheckIn) {
      return NextResponse.json({ alert: null, message: "No check-ins found" });
    }

    const minutes = (Date.now() - new Date(lastCheckIn.created_at).getTime()) / 60000;
    const level = getAlertLevel(minutes);

    if (!level) {
      return NextResponse.json({ alert: null, message: "No active alert" });
    }

    // Build push message
    const messages: Record<string, { title: string; body: string }> = {
      alerta1h: { title: "⚠️ Dame un Ok", body: `${userName} no ha dado su Ok en 1 hora` },
      alerta3h: { title: "🔴 Dame un Ok", body: `${userName} lleva 3 horas sin dar su Ok` },
      emergencia6h: { title: "🚨 EMERGENCIA", body: `${userName} lleva 6 horas sin responder` },
    };

    const msg = messages[level];
    if (!msg) {
      return NextResponse.json({ alert: level, sent: 0 });
    }

    // Get all familiar subscriptions for this user
    // First get familiares, then their subscriptions
    const { data: familiares } = await supabase
      .from("dok_familiares")
      .select("auth_id")
      .eq("user_id", user_id);

    if (!familiares || familiares.length === 0) {
      return NextResponse.json({ alert: level, sent: 0, message: "No familiares" });
    }

    // Get push subscriptions for the user_id (familiares subscribe with user_id of the person they monitor)
    const { data: subs } = await supabase
      .from("dok_push_subscriptions")
      .select("*")
      .eq("user_id", user_id);

    if (!subs || subs.length === 0) {
      return NextResponse.json({ alert: level, sent: 0, message: "No push subscriptions" });
    }

    const payload = JSON.stringify({ title: msg.title, body: msg.body, url: "/familiar" });
    let sent = 0;

    for (const sub of subs) {
      try {
        const wp = getWebPush();
        await wp.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          payload
        );
        sent++;
      } catch {
        await supabase.from("dok_push_subscriptions").delete().eq("endpoint", sub.endpoint);
      }
    }

    return NextResponse.json({ alert: level, sent });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
