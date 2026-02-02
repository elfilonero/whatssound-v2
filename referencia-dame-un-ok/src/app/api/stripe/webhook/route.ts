import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getSupabaseAdmin() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  // TODO: Verify Stripe signature
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret || !sig) {
    return NextResponse.json({ error: "Missing webhook secret or signature" }, { status: 400 });
  }

  // Placeholder: In production, use stripe.webhooks.constructEvent(body, sig, webhookSecret)
  let event: { type: string; data: { object: Record<string, unknown> } };
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const userId = session.metadata && (session.metadata as Record<string, string>).user_id;
      if (userId) {
        await supabase.from("dok_subscriptions").upsert({
          user_id: userId,
          plan: "premium",
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          status: "active",
          current_period_start: new Date().toISOString(),
        }, { onConflict: "user_id" });
      }
      break;
    }

    case "invoice.paid": {
      const invoice = event.data.object;
      const subId = invoice.subscription as string;
      if (subId) {
        await supabase
          .from("dok_subscriptions")
          .update({ status: "active", current_period_start: new Date().toISOString() })
          .eq("stripe_subscription_id", subId);

        // Log payment event
        const { data: sub } = await supabase
          .from("dok_subscriptions")
          .select("id")
          .eq("stripe_subscription_id", subId)
          .single();
        if (sub) {
          await supabase.from("dok_payment_events").insert({
            subscription_id: sub.id,
            event_type: "invoice.paid",
            stripe_event_id: (invoice as Record<string, unknown>).id as string,
            amount: (invoice as Record<string, unknown>).amount_paid as number,
          });
        }
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object;
      const subId = invoice.subscription as string;
      if (subId) {
        await supabase
          .from("dok_subscriptions")
          .update({ status: "past_due" })
          .eq("stripe_subscription_id", subId);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      const subId = subscription.id as string;
      if (subId) {
        await supabase
          .from("dok_subscriptions")
          .update({ status: "canceled", plan: "free" })
          .eq("stripe_subscription_id", subId);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
