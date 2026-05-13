# Database schema

## Extensions

- **`extensions.unaccent`** — Removes diacritics for canonical “folded” text used in search and stored normalized columns.
- **`extensions.pg_trgm`** — Trigram similarity and GIN indexes for fuzzy matching.

## Table `public.devotees`

Primary registry row for a devotee or family member.

| Column | Purpose |
| --- | --- |
| `id` | UUID primary key. |
| `family_registry_no`, `bhd_registry_no` | Temple / BHD registry identifiers. |
| `full_name` | Required legal / common name. |
| `*_normalized` | Lowercased, accent-stripped mirrors maintained by a `BEFORE INSERT OR UPDATE` trigger (PostgreSQL does not allow the `STABLE` `unaccent` function inside `GENERATED STORED` columns, which require `IMMUTABLE` expressions only). |
| `birth_date`, `birth_place`, `dharma_name`, `address`, `hometown` | Profile fields. |
| `joined_unit_date`, `vow_date`, `refuge_date`, `preceptor` | Practice / ordination timeline. |
| `father_name`, `mother_name` | Parent names (included in `search_text`). |
| `search_text` | Concatenation of normalized searchable fragments for broad trigram queries. |
| `created_at`, `updated_at` | Audit timestamps (`updated_at` via trigger). |

## Related tables

1. **`public.devotee_training_records`** — Long-term study, camps, ordination levels, etc. Distinguish rows with `category` (e.g. `long_term`, `camp`, `ordination_level` — conventions are application-level until enums are added).
2. **`public.devotee_roles`** — Past organizational roles with optional date range.
3. **`public.devotee_notes`** — Free-form notes with `note_type` in `achievement`, `comment`, `other`.
4. **`public.devotee_afterlife_info`** — Optional 1:1 extension for death date, grave location, and notes.

All child tables reference `devotees(id)` with `ON DELETE CASCADE`.

## Row Level Security

Policies grant **SELECT** to the `authenticated` role on all five tables. Writes are not opened by default; add explicit policies when admin editing is implemented.

## Functions

- **`public.search_devotees(query_text text)`** — Returns up to 20 ranked rows for the UI/API (see `docs/search-design.md`).
