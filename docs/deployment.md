# Deployment (Vercel)

## Prerequisites

- Supabase project with migrations applied (`supabase/migrations/0001_initial_schema.sql`).
- Vercel project linked to this Git repository (`main` for production; optional preview branches for `staging` / `dev`).

## Environment variables

Set the following in Vercel → Project → Settings → Environment Variables (Production and Preview as appropriate):

| Variable | Scope |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server only** — never expose to the client; used only in server-only modules for privileged tasks. |
| `NEXT_PUBLIC_APP_URL` | Public canonical URL, e.g. `https://records.example.com` |

GitHub Actions should define the same three Supabase variables as **repository secrets** so `next build` can run in CI.

## Build

Vercel runs `npm run build` (see `package.json`). No edge-specific configuration is required for the first release; PDF generation uses Node.js `fs` to read the template from `public/templates/`.

## Post-deploy checklist

- Confirm Supabase Auth redirect URLs include your Vercel domain.
- Disable or tightly control public sign-up; invite admin accounts manually.
- Upload the real `MauGiaPha-So-05.BHDTU.pdf` to `public/templates/` (or serve from Supabase Storage in a future iteration) and complete `src/lib/pdf/pdfFieldMap.ts`.

## Next.js 16 note

Production builds may warn that the `middleware` file convention is evolving toward `proxy`. Edge auth in `src/middleware.ts` remains supported; follow the official Next.js upgrade notes when migrating.
