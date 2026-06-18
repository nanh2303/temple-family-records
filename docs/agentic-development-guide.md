# Agentic Development Guide

Last verified: 2026-06-18

This guide is a compact system map for future coding agents working on Temple family records. It complements the existing docs in `docs/` and should be updated whenever routes, database shape, feature scope, or agent-critical conventions change.

## Product Purpose

Temple family records is an internal admin application for a Buddhist temple. Authenticated temple staff use it to maintain devotee and family registry records, search Vietnamese names with or without accents, edit profile sections that match official Gia Pha forms, import CSV records, manage profile photos, and generate filled PDF forms.

The app currently treats every authenticated Supabase user as an administrator. Before adding non-admin users, add explicit role claims and tighten Supabase RLS policies.

## Stack

- Next.js 16.2.6 App Router with TypeScript and React 19.
- Tailwind CSS v4 with small shadcn-style primitives in `src/components/ui`.
- Supabase Auth, Postgres, Storage, and RLS through `@supabase/ssr` and `@supabase/supabase-js`.
- `zod` validation shared by UI payloads and API routes.
- `pdf-lib` plus `@pdf-lib/fontkit` for server-side PDF stamping.
- Local Noto Sans font at `public/fonts/NotoSans-Regular.ttf` for offline builds and Vietnamese glyph coverage.

## Next.js 16 Notes

- Read the relevant guide in `node_modules/next/dist/docs/` before changing Next-specific APIs.
- Next 16 uses `proxy.ts` instead of the old `middleware.ts` convention.
- This repo keeps the request guard at `src/proxy.ts`.
- Dynamic route handler params are typed as promises, for example `type RouteContext = { params: Promise<{ id: string }> }`.
- Avoid `next/font/google` unless networked builds are guaranteed. The current app uses `next/font/local` so `npm run build` works offline.

## Top-Level Structure

- `src/app` - App Router routes, layouts, API route handlers, global CSS, favicon.
- `src/app/(auth)` - public authentication route group.
- `src/app/(admin)` - protected admin route group.
- `src/app/api` - JSON/PDF API routes.
- `src/components` - React UI, layout, auth, and devotee feature components.
- `src/lib` - Supabase clients, validation, data access, CSV import, PDF filling, search helpers.
- `src/types` - app-level TypeScript data contracts.
- `public/templates` - static official PDF templates.
- `public/fonts` - local fonts used by layout and PDF generation.
- `public/samples` - sample import/profile-picture assets.
- `supabase/migrations` - ordered SQL schema and policy migrations.
- `docs` - architecture, deployment, database, search, CSV, and agent handoff docs.

## Route Map

Pages:

- `/` - landing page. Redirects authenticated users to `/dashboard`.
- `/login` - Supabase email/password sign-in UI.
- `/dashboard` - protected admin overview and search launcher.
- `/devotees` - protected devotee search/list page.
- `/devotees/new` - protected create form.
- `/devotees/[id]` - protected profile page.
- `/devotees/[id]/edit` - protected edit form.
- `/devotees/import` - protected CSV import UI.

APIs:

- `POST /api/devotees` - create a devotee and related profile records.
- `GET /api/devotees/[id]` - fetch a full profile bundle.
- `PATCH /api/devotees/[id]` - update core and related profile records.
- `DELETE /api/devotees/[id]` - delete a devotee.
- `GET /api/devotees/search?q=...` - call the `search_devotees` RPC.
- `POST /api/devotees/import` - preview or commit CSV import.
- `POST /api/devotees/[id]/upload-picture` - upload profile picture to Supabase Storage.
- `DELETE /api/devotees/[id]/upload-picture` - remove profile picture.
- `GET /api/pdf/devotees/[id]?template=mau-gia-pha-05` - generate a filled PDF.

## Authentication And Request Guarding

`src/proxy.ts` protects `/dashboard`, `/devotees`, `/api/devotees`, and `/api/pdf`.

Behavior:

- Unauthenticated page requests redirect to `/login?next=...`.
- Unauthenticated protected API requests return `401`.
- If Supabase public env vars are missing, protected APIs return `503` and protected pages redirect to `/login?error=config`.

API routes also call `supabase.auth.getUser()` themselves. Keep this defense-in-depth check when adding new protected endpoints.

Supabase client helpers:

- `src/lib/supabase/client.ts` - browser client using anon key.
- `src/lib/supabase/server.ts` - server client using cookie-backed sessions.
- `src/lib/supabase/proxy.ts` - proxy/session-refresh client.
- `src/lib/supabase/admin.ts` - service role client; never import from client components.

## Data Model

Primary table:

- `devotees` - core registry row, normalized search mirrors, profile picture URL, audit timestamps.

Related tables:

- `devotee_training_records` - fixed and free-form training/camp/ordination rows. Fixed Gia Pha rows use `record_key`.
- `devotee_roles` - organizational roles and optional date range.
- `devotee_notes` - achievements, comments, and other notes.
- `devotee_afterlife_info` - one-to-one afterlife/death/grave details.

Important schema behavior:

- Child tables cascade on devotee delete.
- Normalized columns and `search_text` are maintained by database triggers.
- RLS currently grants authenticated users admin-style CRUD access.
- Migrations must be applied in order from `supabase/migrations`.

## Devotee Profile Writes

Validation lives in `src/lib/validations/devotee.ts`.

Payload flow:

1. Client form builds a full profile payload in `src/components/devotees/DevoteeForm.tsx`.
2. API routes validate with `devoteeProfileCreateSchema` or `devoteeProfileUpdateSchema`.
3. `src/lib/data/devotee-afterlife.ts` splits core devotee fields from related records.
4. Related records are saved by replacing fixed training rows, roles, and notes, and upserting/deleting afterlife info.

Important details:

- Empty strings normalize to `null` before database writes.
- Dates must be valid `YYYY-MM-DD`.
- Update payloads are strict and must contain at least one field.
- Training records are ordered by definitions in `src/lib/devotees/profile-sections.ts`.

## Search

Search is database-authoritative:

- UI helpers normalize text only for user experience.
- `GET /api/devotees/search` validates query length and calls Supabase RPC `search_devotees`.
- Database uses `unaccent`, `pg_trgm`, GIN indexes, and weighted ranking.
- Results are limited to 20 rows by the RPC.

Do not replace this with in-memory search unless the database design changes.

## CSV Import

UI entry point: `/devotees/import`.

API entry point: `POST /api/devotees/import` with multipart form data:

- `action=preview` returns mapped headers, errors, warnings, summary, and first 200 preview rows.
- `action=commit` reparses and inserts only importable rows.

Importer details in `src/lib/import/devotee-csv.ts`:

- Max file size: 2 MB.
- Max data rows: 10,000.
- Supported delimiters: comma, semicolon, tab.
- Header aliases support Vietnamese with accents, Vietnamese without accents, English labels, and snake_case.
- Supported date formats: `YYYY-MM-DD`, `DD/MM/YYYY`, `DD-MM-YYYY`.
- Blocking duplicate checks include registry numbers and existing identity matches.
- Non-blocking warnings include missing registry numbers and possible duplicate identities inside the file.

## Profile Pictures

Profile photos are stored in Supabase Storage bucket `devotee-profiles`.

Upload route behavior:

- Allowed MIME types: JPEG, PNG, WebP.
- Max file size: 5 MB.
- Old picture is removed before uploading a new one.
- Public URL is saved in `devotees.profile_picture_url`.

Required database/storage setup is documented in `PROFILE_PICTURE_SETUP.md` and migrations `0005` through `0007`.

## PDF Generation

Current template:

- ID: `mau-gia-pha-05`
- File: `public/templates/5.-MauGiaPha-So-05.BHDTU-PDF.pdf`
- Registry: `src/lib/pdf/formTemplates.ts`
- Field coordinates: `src/lib/pdf/pdfFieldMap.ts`
- Fill logic: `src/lib/pdf/fillMauGiaPha.ts`

The PDF route fetches the full profile bundle and returns `application/pdf`.

To add another PDF form:

1. Add the static PDF under `public/templates`.
2. Add a coordinate map and fill function under `src/lib/pdf`.
3. Register it in `src/lib/pdf/formTemplates.ts`.
4. Extend the switch in `src/app/api/pdf/devotees/[id]/route.ts`.

## UI Components

Core devotee components:

- `DevoteeForm` - create/edit form including profile picture controls and related sections.
- `DevoteeProfileCard` - profile display aligned with official record sections.
- `DevoteeSearchBox`, `DevoteeSearchResults`, `DevoteesSearchPageClient` - search experience.
- `DevoteeCsvImportPageClient` - CSV preview/commit UI.
- `PrintFormSelectorButton` - template picker before opening PDF.
- `DeleteDevoteeButton` - confirmation and delete flow.

Shared primitives:

- `Button`, `Card`, `Input`, `Label`, `Textarea` under `src/components/ui`.

## Environment Variables

Required:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`

Never expose `SUPABASE_SERVICE_ROLE_KEY` to client components.

## Verification Commands

Use `npm.cmd` in PowerShell if `npm` is blocked by execution policy.

- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run build`
- `npm.cmd run ci`

Last verification on 2026-06-18:

- `npm.cmd run lint` passed.
- `npm.cmd run typecheck` passed.
- `npm.cmd run build` passed.
- Local smoke with a temporary dev server job:
  - `/` returned `200`.
  - `/login` returned `200`.
  - `/api/devotees/search?q=test` returned `401` without a session.

## Agent Development Rules

- Check `AGENTS.md` before changing code.
- Check local Next docs before changing Next conventions, routing, route handlers, fonts, or proxy behavior.
- Preserve Vietnamese UTF-8 text. If terminal output looks garbled, do not assume the source file is corrupt.
- Prefer existing helpers and schemas over ad hoc request parsing.
- Keep auth checks in both `src/proxy.ts` and protected API handlers.
- Keep Supabase service role code server-only.
- Run lint, typecheck, and build after behavior changes.
- When editing feature docs, update this guide if the change affects routes, data model, auth, imports, PDF templates, or setup.
