import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

    const { user_id, minutes } = await req.json();
    if (!user_id || !minutes) {
      return NextResponse.json({ error: "Missing user_id or minutes" }, { status: 400 });
    }

    const dndUntil = new Date(Date.now() + minutes * 60000).toISOString();

    const { error } = await supabase
      .from("dok_users")
      .update({ dnd_until: dndUntil })
      .eq("id", user_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, dnd_until: dndUntil });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
