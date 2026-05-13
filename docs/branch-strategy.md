# Branch strategy

## Long-lived branches

| Branch | Role |
| --- | --- |
| **`main`** | Production-ready code deployed to Vercel production. Protected; merges only from `staging` or hotfix branches after review. |
| **`staging`** | Pre-production validation for testers and temple staff UAT. Mirrors production configuration with non-production data. |
| **`dev`** | Daily integration branch for developers. Default target for feature pull requests. |

## Feature branches

Create topic branches from **`dev`** using a consistent prefix:

- `feature/admin-auth` — authentication and session hardening.
- `feature/devotee-search` — search UX and RPC tuning.
- `feature/devotee-profile` — profile layout and related data fetching.
- `feature/pdf-print` — PDF mapping and stamping.
- `feature/database-schema` — migrations, policies, and performance indexes.
- `feature/devotee-crud` — create, update, and delete the main devotee record.
- `feature/form-template-selection` — template picker and registry for server-generated PDF forms.

## Workflow

1. Branch from `dev` → implement → open PR into `dev` (GitHub Actions **CI - Dev** runs).
2. Promote `dev` → `staging` when a release candidate is ready; run UAT on staging.
3. Promote `staging` → `main` for production; **CI - Main** guards the production branch.

Hotfixes can branch from `main`, merge back into `staging` and `dev` to keep history linear.

For the devotee management and print-template work:

1. Create `feature/devotee-crud` from `dev`.
2. Implement CRUD and merge it into `dev`.
3. Create or rebase `feature/form-template-selection` on top of the CRUD work.
4. Merge template selection into `dev`.
5. Open the production PR from `dev` into `main`; Vercel deploys `main`.
