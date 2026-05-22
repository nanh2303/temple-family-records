# Architecture

## Overview

**Temple family records** is an internal Next.js admin application. Authenticated staff search a Supabase Postgres database for devotees, create and edit the main devotee record, open structured profiles aligned with temple paper forms, and generate filled PDFs after selecting a registered form template.

## Layers

- **Presentation (App Router + React)** — Route groups `(auth)` for sign-in and `(admin)` for protected pages. UI uses Tailwind CSS and lightweight shadcn-style primitives under `src/components/ui`.
- **Transport** — `GET /api/devotees/search` exposes debounced search to the browser while enforcing the same auth rules as the server-rendered pages. `POST /api/devotees`, `PATCH /api/devotees/[id]`, and `DELETE /api/devotees/[id]` manage the main record. `GET /api/pdf/devotees/[id]?template=...` returns `application/pdf`.
- **Data** — Supabase JS with `@supabase/ssr` for cookie-backed sessions. Row Level Security allows `authenticated` users to read and manage records in this admin-only app; privileged server code can use the service role from `src/lib/supabase/admin.ts` (reserved for batch jobs and elevated operations, never imported into client code).
- **Search** — All fuzzy matching and accent folding run in Postgres (`unaccent`, `pg_trgm`, `search_devotees` RPC) so the API stays thin and fast.

## Security model

- **Middleware** (`src/middleware.ts`) guards `/dashboard`, `/devotees`, and protected API prefixes. Unauthenticated users are redirected to `/login` (HTML) or receive `401` / `503` (APIs).
- **No service role in the browser** — only the anon key is used in client components; the service role is imported only from `server-only` modules.
- **Admin-only posture** — Configure Supabase so only invited accounts exist; the app treats every authenticated user as an admin. Add `app_metadata` role claims and policy checks before introducing non-admin users.

## PDF pipeline

`src/lib/pdf/formTemplates.ts` is the client-safe registry of available print forms. The profile page imports that registry in `PrintFormSelectorButton`, shows a modal, and opens the PDF API only after an admin selects a template.

`src/lib/pdf/pdfFieldMap.ts` stores stamping anchors (page, x, y, maxWidth) measured from each dotted blank line on the static template. `src/lib/pdf/fillMauGiaPha.ts` loads `public/templates/5.-MauGiaPha-So-05.BHDTU-PDF.pdf` with `pdf-lib` and draws Vietnamese text with Noto Sans at those anchors. Run `npm run pdf:inspect-template` to re-extract label positions when the PDF changes. Adding a future form means adding its template file, mapping/fill code, a registry entry, and one API route switch case; the profile UI stays unchanged.

## CRUD flow

Create and edit pages use `src/components/devotees/DevoteeForm.tsx`, which validates the supported fields with zod before calling JSON API routes. Empty optional text and date inputs normalize to `null` before database writes, and unknown fields are rejected by strict schemas. Delete uses `DeleteDevoteeButton` with confirmation and redirects back to `/devotees`.
