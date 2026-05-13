# Architecture

## Overview

**Temple family records** is an internal Next.js admin application. Authenticated staff search a Supabase Postgres database for devotees, open structured profiles aligned with the temple’s paper form (Mẫu Gia Phả Số 05), and generate PDFs from a fixed template.

## Layers

- **Presentation (App Router + React)** — Route groups `(auth)` for sign-in and `(admin)` for protected pages. UI uses Tailwind CSS and lightweight shadcn-style primitives under `src/components/ui`.
- **Transport** — `GET /api/devotees/search` exposes debounced search to the browser while enforcing the same auth rules as the server-rendered pages. `GET /api/pdf/devotees/[id]` returns `application/pdf`.
- **Data** — Supabase JS with `@supabase/ssr` for cookie-backed sessions. Row Level Security allows `authenticated` users to read core tables; privileged server code can use the service role from `src/lib/supabase/admin.ts` (not used in the first iteration of PDF/profile loading, but reserved for batch jobs and elevated operations).
- **Search** — All fuzzy matching and accent folding run in Postgres (`unaccent`, `pg_trgm`, `search_devotees` RPC) so the API stays thin and fast.

## Security model

- **Middleware** (`src/middleware.ts`) guards `/dashboard`, `/devotees`, and protected API prefixes. Unauthenticated users are redirected to `/login` (HTML) or receive `401` / `503` (APIs).
- **No service role in the browser** — only the anon key is used in client components; the service role is imported only from `server-only` modules.
- **Admin-only posture** — Configure Supabase so only invited accounts exist; the app does not implement multi-tenant org separation.

## PDF pipeline

`src/lib/pdf/pdfFieldMap.ts` documents AcroForm field names (TODOs until the real template is mapped). `src/lib/pdf/fillMauGiaPha.ts` loads `public/templates/MauGiaPha-So-05.BHDTU.pdf` with `pdf-lib`, attempts field fills, and can fall back to coordinate stamping as coordinates are calibrated.
