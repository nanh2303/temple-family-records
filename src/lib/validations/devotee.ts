import { z } from "zod";

export const devoteeUuidSchema = z.string().uuid();

export const devoteeCoreSchema = z.object({
  family_registry_no: z.string().nullable().optional(),
  bhd_registry_no: z.string().nullable().optional(),
  full_name: z.string().min(1),
  birth_date: z.string().nullable().optional(),
  birth_place: z.string().nullable().optional(),
  dharma_name: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  hometown: z.string().nullable().optional(),
  joined_unit_date: z.string().nullable().optional(),
  vow_date: z.string().nullable().optional(),
  refuge_date: z.string().nullable().optional(),
  preceptor: z.string().nullable().optional(),
  father_name: z.string().nullable().optional(),
  mother_name: z.string().nullable().optional(),
});

export const searchQuerySchema = z.object({
  q: z.string().max(500).optional().default(""),
});
