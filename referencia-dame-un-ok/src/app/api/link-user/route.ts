import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  const { familiarId, userId, invitationCode } = await req.json();
  if (!familiarId || !userId) {
    return NextResponse.json({ error: "missing params" }, { status: 400 });
  }

  const supabaseAdmin = getAdmin();
  // Link the user to the admin familiar
  const { error: linkError } = await supabaseAdmin
    .from("dok_familiares")
    .update({ linked_user_id: userId })
    .eq("id", familiarId);

  if (linkError) {
    return NextResponse.json({ error: linkError.message }, { status: 500 });
  }

  // Mark invitation as used
  if (invitationCode) {
    await supabaseAdmin
      .from("dok_invitations")
      .update({ used: true })
      .eq("code", invitationCode);
  }

  return NextResponse.json({ ok: true });
}
