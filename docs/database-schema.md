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

1. **`public.devotee_training_records`** — Long-term study, camps, ordination levels, etc. Distinguish rows with `category` (e.g. `long_term`, `camp`, `ordination_level`). Fixed rows that map to the official PDF use `record_key`; older/free-form rows may leave it `NULL`.
2. **`public.devotee_roles`** — Past organizational roles with optional date range.
3. **`public.devotee_notes`** — Free-form notes with `note_type` in `achievement`, `comment`, `other`.
4. **`public.devotee_afterlife_info`** — Optional 1:1 extension for death date, grave location, and notes.

All child tables reference `devotees(id)` with `ON DELETE CASCADE`.

`0004_training_record_keys.sql` adds `devotee_training_records.record_key` plus a partial unique index on `(devotee_id, record_key)` for fixed Gia Phả fields.

## Row Level Security

`0001_initial_schema.sql` grants **SELECT** to the `authenticated` role on all five tables.

`0002_devotee_crud_policies.sql` opens **INSERT**, **UPDATE**, and **DELETE** to `authenticated` on:

- `public.devotees`
- `public.devotee_training_records`
- `public.devotee_roles`
- `public.devotee_notes`
- `public.devotee_afterlife_info`
`0002_devotee_crud_policies.sql` opens **INSERT**, **UPDATE**, and **DELETE** to `authenticated` for the admin-only CRUD workflow. `0003_devotee_crud_policy_grants.sql` is an idempotent repair migration that also grants table privileges and creates any missing CRUD policies.

The product is currently admin-only, so authenticated users may manage records. Tighten these policies with role claims before adding non-admin users.

The `devotees_normalize_fields` trigger still runs on inserts and updates, so search-normalized fields and `search_text` stay current after CRUD writes.

## Functions

- **`public.search_devotees(query_text text)`** — Returns up to 20 ranked rows for the UI/API (see `docs/search-design.md`).
