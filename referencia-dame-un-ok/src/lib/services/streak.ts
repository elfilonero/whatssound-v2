import { supabase } from "./supabase";

/**
 * Calculate consecutive check-in streak for a user.
 * Returns the streak count and updates it in the database.
 */
export async function calculateStreak(userId: string): Promise<number> {
  const { data } = await supabase
    .from("dok_check_ins")
    .select("created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (!data || data.length === 0) {
    await supabase.from("dok_users").update({ streak: 0 }).eq("id", userId);
    return 0;
  }

  const dates = [...new Set(data.map(r => {
    const d = new Date(r.created_at);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }))].sort().reverse();

  let count = 0;
  const today = new Date();
  let expected = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  for (const dateStr of dates) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const checkDate = new Date(y, m - 1, d);
    const diff = Math.round((expected.getTime() - checkDate.getTime()) / 86400000);
    if (diff === 0) {
      count++;
      expected = new Date(expected.getTime() - 86400000);
    } else if (diff === 1 && count === 0) {
      count++;
      expected = new Date(checkDate.getTime() - 86400000);
    } else {
      break;
    }
  }

  await supabase.from("dok_users").update({ streak: count }).eq("id", userId);
  return count;
}
