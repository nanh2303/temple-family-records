# Supabase (local & hosted)

This folder holds SQL migrations and seed data for the `temple-family-records` project.

## Files

- `migrations/0001_initial_schema.sql` - extensions (`unaccent`, `pg_trgm`), core tables, indexes, `search_devotees` RPC, and RLS policies for `authenticated` read access.
- `migrations/0002_devotee_crud_policies.sql` - RLS write policies for the admin-only CRUD workflow.
- `migrations/0003_devotee_crud_policy_grants.sql` - Idempotent CRUD policy/grant repair for existing databases.
- `seed.sql` - optional sample devotees for development and demos.

## Apply migrations

### Hosted Supabase

1. Create a project at [https://supabase.com](https://supabase.com).
2. In the SQL editor, paste and run the SQL files under `migrations/` in order, then optionally run `seed.sql`.
3. Copy **Project URL**, **anon key**, and **service role** key into `.env.local` (see root `.env.example`).

### Supabase CLI (optional)

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

If you use `supabase db reset` locally, configure `supabase/config.toml` first; then migrations and `seed.sql` can be wired via the CLI seed config.

## Auth notes

Disable public sign-up in the Supabase dashboard (Authentication → Providers) and invite only temple administrators. This application assumes **any signed-in user is an admin** and may create, edit, delete, and print records; tighten further with `app_metadata` roles if you add public sign-up later.
