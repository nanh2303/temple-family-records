import type { SupabaseClient } from "@supabase/supabase-js";

import {
  DEVOTEE_TRAINING_RECORD_DEFINITIONS,
  DEVOTEE_TRAINING_RECORD_KEYS,
  getTrainingRecordDefinition,
} from "@/lib/devotees/profile-sections";
import type {
  DevoteeCoreInput,
  DevoteeNoteFormRecordInput,
  DevoteeProfileCreateInput,
  DevoteeProfileUpdateInput,
  DevoteeRoleFormRecordInput,
  DevoteeTrainingFormRecordInput,
} from "@/lib/validations/devotee";

const AFTERLIFE_FORM_KEYS = ["death_date", "grave_location", "afterlife_note"] as const;
const RELATED_RECORD_FORM_KEYS = ["training_records", "roles", "notes"] as const;

export type DevoteeAfterlifeWriteInput = {
  death_date: string | null;
  grave_location: string | null;
  note: string | null;
};

export type DevoteeTrainingWriteInput = {
  record_key: string;
  category: string;
  title: string;
  completed_date: string | null;
  decision_no: string | null;
};

export type DevoteeRelatedWriteInput = {
  afterlife: DevoteeAfterlifeWriteInput | null;
  trainingRecords: DevoteeTrainingWriteInput[];
  roles: DevoteeRoleFormRecordInput[];
  notes: DevoteeNoteFormRecordInput[];
};

function hasTrainingContent(training: Pick<DevoteeTrainingWriteInput, "completed_date" | "decision_no">) {
  return Boolean(training.completed_date || training.decision_no);
}

function buildTrainingRecords(records: DevoteeTrainingFormRecordInput[] | undefined) {
  const byKey = new Map<string, DevoteeTrainingWriteInput>();

  for (const record of records ?? []) {
    const definition = getTrainingRecordDefinition(record.key);
    if (!definition) continue;

    const trainingRecord = {
      record_key: definition.key,
      category: definition.category,
      title: definition.label,
      completed_date: record.completed_date ?? null,
      decision_no: record.decision_no ?? null,
    };

    if (hasTrainingContent(trainingRecord)) {
      byKey.set(definition.key, trainingRecord);
    }
  }

  return DEVOTEE_TRAINING_RECORD_DEFINITIONS.flatMap((definition) => {
    const record = byKey.get(definition.key);
    return record ? [record] : [];
  });
}

function buildRoles(records: DevoteeRoleFormRecordInput[] | undefined) {
  return (records ?? []).filter((record) => record.role_title.trim().length > 0);
}

function buildNotes(records: DevoteeNoteFormRecordInput[] | undefined) {
  return (records ?? []).filter((record) => record.content.trim().length > 0);
}

export function splitDevoteeProfilePayload(input: DevoteeProfileCreateInput): {
  devotee: DevoteeCoreInput;
  related: DevoteeRelatedWriteInput;
} {
  const {
    death_date = null,
    grave_location = null,
    afterlife_note = null,
    training_records,
    roles,
    notes,
    ...devotee
  } = input;

  const afterlifePayload = {
    death_date: death_date ?? null,
    grave_location: grave_location ?? null,
    note: afterlife_note ?? null,
  };

  return {
    devotee,
    related: {
      afterlife: hasAfterlifeContent(afterlifePayload) ? afterlifePayload : null,
      trainingRecords: buildTrainingRecords(training_records),
      roles: buildRoles(roles),
      notes: buildNotes(notes),
    },
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
  for (const key of RELATED_RECORD_FORM_KEYS) {
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

export function extractRelatedRecordsFromPatch(input: DevoteeProfileUpdateInput) {
  return {
    trainingRecords:
      "training_records" in input ? buildTrainingRecords(input.training_records) : undefined,
    roles: "roles" in input ? buildRoles(input.roles) : undefined,
    notes: "notes" in input ? buildNotes(input.notes) : undefined,
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

export async function replaceDevoteeTrainingRecords(
  supabase: SupabaseClient,
  devoteeId: string,
  records: DevoteeTrainingWriteInput[],
) {
  const { error: deleteError } = await supabase
    .from("devotee_training_records")
    .delete()
    .eq("devotee_id", devoteeId)
    .in("record_key", [...DEVOTEE_TRAINING_RECORD_KEYS]);

  if (deleteError) throw new Error(deleteError.message);

  if (records.length === 0) return;

  const { error } = await supabase.from("devotee_training_records").insert(
    records.map((record) => ({
      devotee_id: devoteeId,
      record_key: record.record_key,
      category: record.category,
      title: record.title,
      completed_date: record.completed_date,
      decision_no: record.decision_no,
    })),
  );

  if (error) throw new Error(error.message);
}

export async function replaceDevoteeRoles(
  supabase: SupabaseClient,
  devoteeId: string,
  roles: DevoteeRoleFormRecordInput[],
) {
  const { error: deleteError } = await supabase.from("devotee_roles").delete().eq("devotee_id", devoteeId);
  if (deleteError) throw new Error(deleteError.message);

  if (roles.length === 0) return;

  const { error } = await supabase.from("devotee_roles").insert(
    roles.map((role) => ({
      devotee_id: devoteeId,
      role_title: role.role_title,
      organization: role.organization ?? null,
      start_date: role.start_date ?? null,
      end_date: role.end_date ?? null,
      note: role.note ?? null,
    })),
  );

  if (error) throw new Error(error.message);
}

export async function replaceDevoteeNotes(
  supabase: SupabaseClient,
  devoteeId: string,
  notes: DevoteeNoteFormRecordInput[],
) {
  const { error: deleteError } = await supabase.from("devotee_notes").delete().eq("devotee_id", devoteeId);
  if (deleteError) throw new Error(deleteError.message);

  if (notes.length === 0) return;

  const { error } = await supabase.from("devotee_notes").insert(
    notes.map((note) => ({
      devotee_id: devoteeId,
      note_type: note.note_type,
      content: note.content,
    })),
  );

  if (error) throw new Error(error.message);
}

export async function saveDevoteeProfileRelatedRecords(
  supabase: SupabaseClient,
  devoteeId: string,
  related: Partial<DevoteeRelatedWriteInput>,
) {
  if ("afterlife" in related) {
    await upsertDevoteeAfterlife(supabase, devoteeId, related.afterlife ?? null);
  }

  if (related.trainingRecords !== undefined) {
    await replaceDevoteeTrainingRecords(supabase, devoteeId, related.trainingRecords);
  }

  if (related.roles !== undefined) {
    await replaceDevoteeRoles(supabase, devoteeId, related.roles);
  }

  if (related.notes !== undefined) {
    await replaceDevoteeNotes(supabase, devoteeId, related.notes);
  }
}
