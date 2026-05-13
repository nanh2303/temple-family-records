import { z } from "zod";

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
});

export const devoteeCreateSchema = devoteeCoreSchema.strict();

export const devoteeUpdateSchema = devoteeCoreSchema
  .partial()
  .strict()
  .refine((value) => Object.keys(value).length > 0, "At least one field is required.");

export const searchQuerySchema = z.object({
  q: z.string().max(500).optional().default(""),
});

export type DevoteeCreateInput = z.infer<typeof devoteeCreateSchema>;
export type DevoteeUpdateInput = z.infer<typeof devoteeUpdateSchema>;
