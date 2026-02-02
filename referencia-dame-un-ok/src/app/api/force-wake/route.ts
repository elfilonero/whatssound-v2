import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  const { userId, durationMinutes = 30 } = await req.json();
  if (!userId) {
    return NextResponse.json({ error: "missing userId" }, { status: 400 });
  }

  const supabaseAdmin = getAdmin();
  const until = new Date(Date.now() + durationMinutes * 60 * 1000).toISOString();

  const { error } = await supabaseAdmin
    .from("dok_users")
    .update({ force_wake_until: until })
    .eq("id", userId);

  // Delete ALL of today's check-ins so the user starts fresh
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  await supabaseAdmin
    .from("dok_check_ins")
    .delete()
    .eq("user_id", userId)
    .gte("created_at", today.toISOString());

  // Log the force-wake as an action (after deleting old ones)
  await supabaseAdmin.from("dok_check_ins").insert({
    user_id: userId,
    actions: ["force_wake"],
    device_type: "admin",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Also try to send push notification if available
  const { data: subs } = await supabaseAdmin
    .from("dok_push_subscriptions")
    .select("subscription")
    .eq("user_id", userId);

  let pushSent = false;
  if (subs && subs.length > 0) {
    try {
      const webpush = await import("web-push");
      webpush.default.setVapidDetails(
        `mailto:${process.env.VAPID_EMAIL}`,
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
        process.env.VAPID_PRIVATE_KEY!
      );
      for (const sub of subs) {
        await webpush.default.sendNotification(
          JSON.parse(sub.subscription),
          JSON.stringify({ title: "🐱 ¡Fufy tiene hambre!", body: "Entra a darle de comer", url: "/" })
        ).catch(() => {});
      }
      pushSent = true;
    } catch { /* no push */ }
  }

  return NextResponse.json({ ok: true, until, pushSent });
}
