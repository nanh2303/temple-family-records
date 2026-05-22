import { z } from "zod";

import { DEVOTEE_TRAINING_RECORD_KEYS } from "@/lib/devotees/profile-sections";

export const devoteeUuidSchema = z.string().uuid();

function normalizeString(value: unknown) {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function isValidIsoDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;

  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  return date.toISOString().slice(0, 10) === value;
}

const optionalTextField = z.preprocess(
  normalizeString,
  z.string().max(500, "Must be 500 characters or fewer.").nullable().optional(),
);

const optionalLongTextField = z.preprocess(
  normalizeString,
  z.string().max(2000, "Must be 2000 characters or fewer.").nullable().optional(),
);

const optionalDateField = z.preprocess(
  normalizeString,
  z
    .string()
    .refine(isValidIsoDate, "Use YYYY-MM-DD.")
    .nullable()
    .optional(),
);

export const devoteeCoreSchema = z.object({
  family_registry_no: optionalTextField,
  bhd_registry_no: optionalTextField,
  full_name: z.string().trim().min(1, "Full name is required.").max(255, "Must be 255 characters or fewer."),
  birth_date: optionalDateField,
  birth_place: optionalTextField,
  dharma_name: optionalTextField,
  address: optionalTextField,
  hometown: optionalTextField,
  joined_unit_date: optionalDateField,
  vow_date: optionalDateField,
  refuge_date: optionalDateField,
  preceptor: optionalTextField,
  father_name: optionalTextField,
  mother_name: optionalTextField,
  profile_picture_url: z.string().url("Must be a valid URL.").nullable().optional(),
});

/** Section I — Hậu thế (stored in `devotee_afterlife_info`). */
export const devoteeAfterlifeFormSchema = z.object({
  death_date: optionalDateField,
  grave_location: optionalTextField,
  afterlife_note: optionalLongTextField,
});

export const devoteeTrainingFormRecordSchema = z
  .object({
    key: z.enum(DEVOTEE_TRAINING_RECORD_KEYS),
    completed_date: optionalDateField,
    decision_no: optionalTextField,
  })
  .strict()
  .refine(
    (value) => Boolean(value.completed_date || value.decision_no),
    "Training rows need a date or decision number.",
  );

export const devoteeRoleFormRecordSchema = z
  .object({
    role_title: z.string().trim().min(1, "Role title is required.").max(500, "Must be 500 characters or fewer."),
    organization: optionalTextField,
    start_date: optionalDateField,
    end_date: optionalDateField,
    note: optionalTextField,
  })
  .strict();

export const devoteeNoteFormRecordSchema = z
  .object({
    note_type: z.enum(["achievement", "comment", "other"]),
    content: z.string().trim().min(1, "Note content is required.").max(2000, "Must be 2000 characters or fewer."),
  })
  .strict();

export const devoteeRelatedRecordsFormSchema = z.object({
  training_records: z.array(devoteeTrainingFormRecordSchema).optional(),
  roles: z.array(devoteeRoleFormRecordSchema).optional(),
  notes: z.array(devoteeNoteFormRecordSchema).optional(),
});

export const devoteeProfileCreateSchema = devoteeCoreSchema
  .merge(devoteeAfterlifeFormSchema)
  .merge(devoteeRelatedRecordsFormSchema)
  .strict();

export const devoteeProfileUpdateSchema = devoteeProfileCreateSchema
  .partial()
  .strict()
  .refine((value) => Object.keys(value).length > 0, "At least one field is required.");

/** @deprecated Use devoteeProfileCreateSchema */
export const devoteeCreateSchema = devoteeProfileCreateSchema;

/** @deprecated Use devoteeProfileUpdateSchema */
export const devoteeUpdateSchema = devoteeProfileUpdateSchema;

export const searchQuerySchema = z.object({
  q: z.string().max(500).optional().default(""),
});

export type DevoteeCoreInput = z.infer<typeof devoteeCoreSchema>;
export type DevoteeAfterlifeFormInput = z.infer<typeof devoteeAfterlifeFormSchema>;
export type DevoteeTrainingFormRecordInput = z.infer<typeof devoteeTrainingFormRecordSchema>;
export type DevoteeRoleFormRecordInput = z.infer<typeof devoteeRoleFormRecordSchema>;
export type DevoteeNoteFormRecordInput = z.infer<typeof devoteeNoteFormRecordSchema>;
export type DevoteeProfileCreateInput = z.infer<typeof devoteeProfileCreateSchema>;
export type DevoteeProfileUpdateInput = z.infer<typeof devoteeProfileUpdateSchema>;

/** @deprecated Use DevoteeProfileCreateInput */
export type DevoteeCreateInput = DevoteeProfileCreateInput;
/** @deprecated Use DevoteeProfileUpdateInput */
export type DevoteeUpdateInput = DevoteeProfileUpdateInput;
