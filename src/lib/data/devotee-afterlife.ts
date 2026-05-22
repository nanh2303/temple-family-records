import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  DevoteeCoreInput,
  DevoteeProfileCreateInput,
  DevoteeProfileUpdateInput,
} from "@/lib/validations/devotee";

const AFTERLIFE_FORM_KEYS = ["death_date", "grave_location", "afterlife_note"] as const;

export type DevoteeAfterlifeWriteInput = {
  death_date: string | null;
  grave_location: string | null;
  note: string | null;
};

export function splitDevoteeProfilePayload(input: DevoteeProfileCreateInput): {
  devotee: DevoteeCoreInput;
  afterlife: DevoteeAfterlifeWriteInput | null;
} {
  const {
    death_date = null,
    grave_location = null,
    afterlife_note = null,
    ...devotee
  } = input;

  const afterlifePayload = {
    death_date: death_date ?? null,
    grave_location: grave_location ?? null,
    note: afterlife_note ?? null,
  };

  return {
    devotee,
    afterlife: hasAfterlifeContent(afterlifePayload) ? afterlifePayload : null,
  };
}

export function hasAfterlifeContent(afterlife: DevoteeAfterlifeWriteInput) {
  return Boolean(afterlife.death_date || afterlife.grave_location || afterlife.note);
}

export function extractDevoteeCorePatch(input: DevoteeProfileUpdateInput): Partial<DevoteeCoreInput> {
  const patch: Record<string, unknown> = { ...input };
  for (const key of AFTERLIFE_FORM_KEYS) {
    delete patch[key];
  }
  return patch as Partial<DevoteeCoreInput>;
}

/** Returns `undefined` when the client did not send any afterlife fields. */
export function extractAfterlifeFromPatch(
  input: DevoteeProfileUpdateInput,
): DevoteeAfterlifeWriteInput | undefined {
  const touched = AFTERLIFE_FORM_KEYS.some((key) => key in input);
  if (!touched) return undefined;

  return {
    death_date: input.death_date ?? null,
    grave_location: input.grave_location ?? null,
    note: input.afterlife_note ?? null,
  };
}

export async function upsertDevoteeAfterlife(
  supabase: SupabaseClient,
  devoteeId: string,
  afterlife: DevoteeAfterlifeWriteInput | null,
) {
  if (!afterlife || !hasAfterlifeContent(afterlife)) {
    const { error } = await supabase.from("devotee_afterlife_info").delete().eq("devotee_id", devoteeId);
    if (error) throw new Error(error.message);
    return;
  }

  const { error } = await supabase.from("devotee_afterlife_info").upsert({
    devotee_id: devoteeId,
    death_date: afterlife.death_date,
    grave_location: afterlife.grave_location,
    note: afterlife.note,
  });

  if (error) throw new Error(error.message);
}
