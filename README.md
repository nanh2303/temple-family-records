# Temple family records

Internal **Next.js** admin application for a Buddhist temple to maintain **devotee and family registry** data: accent-tolerant search, CRUD for devotee records, rich profiles aligned with official PDF forms, and server-side PDF generation.

## Tech stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v4** + shadcn-style UI primitives (`src/components/ui`)
- **Supabase** (Postgres, Auth, RLS)
- **pdf-lib** for coordinate-based PDF stamping on the static template
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
2. Run the SQL migrations in `supabase/migrations/` in order (see `supabase/README.md`).
3. Optionally run `supabase/seed.sql` for sample devotees.
4. Invite an admin user (disable public sign-up in production).

### Devotee management

Authenticated app users can manage the main devotee record plus Gia Phả detail sections: fixed training/camp/ordination rows, roles, achievements, comments, and afterlife information.

- `GET /devotees` - search devotees.
- `GET /devotees/new` - create a devotee.
- `GET /devotees/[id]` - view the existing profile UI.
- `GET /devotees/[id]/edit` - edit a devotee.
- `POST /api/devotees` - create a devotee.
- `GET /api/devotees/[id]` - fetch the profile bundle.
- `PATCH /api/devotees/[id]` - update a devotee.
- `DELETE /api/devotees/[id]` - delete a devotee.

### PDF template

Place the official file at:

`public/templates/5.-MauGiaPha-So-05.BHDTU-PDF.pdf`

If the file is missing, the PDF route still returns a **placeholder PDF** explaining what to add.

The template is a **flat PDF** (no AcroForm fields). Field positions live in `src/lib/pdf/pdfFieldMap.ts` and are aligned to each dotted blank line. Text is normalized to Unicode NFC and drawn with the full Noto Sans font (not subset) so Vietnamese diacritics render reliably. To recalibrate after a template change, run `npm run pdf:inspect-template` and update the coordinates in `pdfFieldMap.ts`.

The profile page uses `src/components/devotees/PrintFormSelectorButton.tsx` to open a template picker before generating a PDF. The current endpoint is:

- `GET /api/pdf/devotees/[id]?template=mau-gia-pha-05`

Omitting `template` still defaults to `mau-gia-pha-05` for backward compatibility.

To add a new PDF form later:

1. Add the template PDF under `public/templates/`.
2. Add any field map and fill/stamp function under `src/lib/pdf/`.
3. Add a new entry to the client-safe registry in `src/lib/pdf/formTemplates.ts`.
4. Extend the switch in `src/app/api/pdf/devotees/[id]/route.ts` to call the new fill function.

The profile UI should not need to change when new form templates are registered.

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
- **`feature/devotee-crud`** — CRUD for the main devotee record.
- **`feature/form-template-selection`** — PDF form template selection, based on the CRUD branch.

Merge feature branches into `dev`; later open the release PR from `dev` into `main` for Vercel production deployment.

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
