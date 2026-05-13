# Temple family records

Internal **Next.js** admin application for a Buddhist temple to maintain **devotee and family registry** data: accent-tolerant search, rich profiles aligned with the official PDF form (Mẫu Gia Phả Số 05 — BHDTU), and server-side PDF generation.

## Tech stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v4** + shadcn-style UI primitives (`src/components/ui`)
- **Supabase** (Postgres, Auth, RLS)
- **pdf-lib** for PDF stamping / AcroForm fills
- **Vercel** (recommended hosting)
- **GitHub Actions** — CI on `dev` and `main`

## Local setup

```bash
npm ci
cp .env.example .env.local
# Fill Supabase URL, anon key, and service role key
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign in with an invited Supabase user, then use **Dashboard** or **Devotees** search.

### Supabase

1. Create a Supabase project.
2. Run `supabase/migrations/0001_initial_schema.sql` in the SQL editor (see `supabase/README.md`).
3. Optionally run `supabase/seed.sql` for sample devotees.
4. Invite an admin user (disable public sign-up in production).

### PDF template

Place the official file at:

`public/templates/MauGiaPha-So-05.BHDTU.pdf`

If the file is missing, the PDF route still returns a **placeholder PDF** explaining what to add. Map AcroForm field names in `src/lib/pdf/pdfFieldMap.ts` after inspecting the template.

## Environment variables

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key — **server only**, never commit |
| `NEXT_PUBLIC_APP_URL` | Canonical app URL (used for absolute links in emails or redirects later) |

## Branch strategy & CI

- **`main`** — production; workflow `.github/workflows/ci-main.yml` (lint, typecheck, production build).
- **`dev`** — integration; workflow `.github/workflows/ci-dev.yml` (lint, typecheck, build).
- **`staging`** — UAT (documented in `docs/branch-strategy.md`; add a workflow when needed).

Configure GitHub repository **Actions secrets**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` so CI builds succeed.

## Documentation

- `docs/architecture.md` — system overview
- `docs/database-schema.md` — tables and relationships
- `docs/search-design.md` — Vietnamese search, indexes, RPC ranking
- `docs/branch-strategy.md` — git workflow
- `docs/deployment.md` — Vercel and env checklist

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run ci` | Lint + typecheck + build |

## License

Private / internal — add your temple or org license as appropriate.
