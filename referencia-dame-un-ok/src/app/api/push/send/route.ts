import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

    const { user_id, title, body, url, alarm } = await req.json();
    if (!user_id || !title || !body) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Get all subscriptions for this user
    const { data: subs } = await supabase
      .from("dok_push_subscriptions")
      .select("*")
      .eq("user_id", user_id);

    if (!subs || subs.length === 0) {
      return NextResponse.json({ sent: 0, message: "No subscriptions" });
    }

    const payload = JSON.stringify({
      title,
      body,
      url: url || "/",
      alarm: alarm === true, // Flag for SW to use alarm mode
      urgency: alarm ? "high" : "normal",
    });

    let sent = 0;
    const failed: string[] = [];

    for (const sub of subs) {
      try {
        const wp = getWebPush();
        await wp.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          payload,
          {
            // Android: high urgency = wake device, bypass doze mode
            urgency: alarm ? "high" as const : "normal" as const,
            // TTL: alarm notifications expire after 5 minutes
            TTL: alarm ? 300 : 3600,
            headers: {
              // FCM high priority
              Urgency: alarm ? "very-high" : "normal",
            },
          }
        );
        sent++;
      } catch {
        failed.push(sub.endpoint);
        await supabase.from("dok_push_subscriptions").delete().eq("endpoint", sub.endpoint);
      }
    }

    return NextResponse.json({ sent, failed: failed.length });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
