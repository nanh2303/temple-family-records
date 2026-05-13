import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { DevoteeProfileBundle } from "@/types/devotee";

import { devoteeUuidSchema } from "@/lib/validations/devotee";

export async function fetchDevoteeProfile(devoteeId: string): Promise<DevoteeProfileBundle | null> {
  const parsed = devoteeUuidSchema.safeParse(devoteeId);
  if (!parsed.success) return null;

  const supabase = await createServerSupabaseClient();

  const { data: devotee, error: devoteeError } = await supabase
    .from("devotees")
    .select("*")
    .eq("id", parsed.data)
    .maybeSingle();

  if (devoteeError || !devotee) return null;

  const [trainingRes, rolesRes, notesRes, afterlifeRes] = await Promise.all([
    supabase.from("devotee_training_records").select("*").eq("devotee_id", parsed.data).order("completed_date"),
    supabase.from("devotee_roles").select("*").eq("devotee_id", parsed.data).order("start_date"),
    supabase.from("devotee_notes").select("*").eq("devotee_id", parsed.data).order("created_at"),
    supabase.from("devotee_afterlife_info").select("*").eq("devotee_id", parsed.data).maybeSingle(),
  ]);

  return {
    devotee,
    training: trainingRes.data ?? [],
    roles: rolesRes.data ?? [],
    notes: notesRes.data ?? [],
    afterlife: afterlifeRes.data ?? null,
  };
}
