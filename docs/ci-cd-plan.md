# Memovix CI/CD Plan

## 1. Objective

Build a safe, understandable delivery pipeline for the Memovix monorepo:

- `client/`: Next.js 16 frontend deployed to Vercel.
- `server/`: Express/TypeScript API deployed to Render.
- `server/prisma/`: PostgreSQL/pgvector schema managed with committed Prisma migrations.
- `abrar-dev`: integration and staging branch.
- `main`: protected production branch and the only branch connected to production.

The primary rule is: **a pull request may not merge into `main` unless the same commit has passed CI and has been reviewed in a preview/staging environment.**

## 2. Current State and Gaps

At the time this plan was written:

- There are no workflows under `.github/workflows/`.
- The frontend has `lint`, `typecheck`, `format:check`, and `build` scripts.
- The backend has a TypeScript `build`, but no general `lint`, `typecheck`, or automated test command.
- The two backend test scripts exercise external AI/embedding services and are not suitable as mandatory pull-request checks.
- Prisma migrations are committed, but production migration execution is not defined in deployment configuration.
- There is no `render.yaml`, `vercel.json`, release workflow, smoke test, or documented rollback procedure.

Do not enable fully automatic production deployment until the Phase 1 quality gate below is green on `main`.

## 3. Target Delivery Flow

```text
feature/*
   │ pull request
   ▼
abrar-dev ── CI checks ── Vercel preview + Render staging ── QA
   │ approved pull request
   ▼
main ── required CI checks ── production migration ── Render/Vercel deploy
   │
   └── post-deploy health checks and rollback if unhealthy
```

Normal work:

1. Create `feature/<short-name>` from `abrar-dev`.
2. Open a pull request into `abrar-dev`.
3. CI validates only affected applications; Vercel supplies a frontend preview.
4. Merge after checks and review. `abrar-dev` updates the persistent staging environment.
5. Open a release pull request from `abrar-dev` into `main`.
6. Require all checks, staging verification, and one approval before merge.
7. A merge to `main` deploys production. Never push directly to `main`.

Hotfixes:

1. Create `hotfix/<short-name>` from `main`.
2. Run the same pull-request checks and preview.
3. Merge into `main`, deploy, then merge/cherry-pick the fix back into `abrar-dev`.

## 4. GitHub Branch Protection

Protect `main` with:

- Require a pull request before merging.
- Require at least one approval (two when more maintainers are available).
- Dismiss stale approvals when new commits are pushed.
- Require conversation resolution.
- Require branches to be up to date before merging.
- Require the status checks listed in Section 5.
- Block force pushes and branch deletion.
- Do not allow administrators to bypass the rules during routine releases.
- Prefer squash merges for a readable production history.

Protect `abrar-dev` with required CI checks and conversation resolution. Direct pushes may remain allowed initially for a solo developer, but pull requests are preferred.

Add GitHub environments:

- `staging`: restricted to `abrar-dev`; staging-only secrets.
- `production`: restricted to protected `main`; production-only secrets and manual approval when the GitHub plan supports it.

## 5. Phase 1 — Pull-Request CI (Implement First)

Create `.github/workflows/ci.yml` with triggers for pull requests into `abrar-dev` and `main`, plus pushes to both branches.

Use Node.js 22, `npm ci`, dependency caching, read-only permissions, job timeouts, and cancellation of superseded runs.

### Frontend job (`client-ci`)

Working directory: `client`

```bash
npm ci
npm run format:check
npm run lint
npm run typecheck
npm run build
```

Provide only harmless build-time variables in CI, such as a non-production `NEXT_PUBLIC_API_URL`. Never expose production secrets to pull-request jobs.

### Backend job (`server-ci`)

Working directory: `server`

```bash
npm ci
npx prisma validate
npx prisma generate
npm run build
```

Before making this job required, add these missing package scripts and tools:

- `typecheck`: `tsc --noEmit`
- `lint`: ESLint with TypeScript support
- `format:check`: Prettier
- `test`: a deterministic unit/integration test runner

Do not run `test:ai` or `test:embedding` on every pull request. They call external providers, are slower and potentially billable. Run them manually or in a scheduled/non-blocking workflow with dedicated test credentials.

### Migration safety job (`migration-check`)

Run when `server/prisma/**` changes:

```bash
npm ci
npx prisma validate
npx prisma generate
```

Then start an ephemeral PostgreSQL service with the required `vector` extension and apply the complete migration history to an empty database:

```bash
npx prisma migrate deploy
```

This catches invalid or out-of-order migrations without touching staging or production.

### Security job (`security`)

- Run `npm audit --audit-level=high` separately in `client/` and `server/`.
- Enable Dependabot weekly for both npm lockfiles and GitHub Actions.
- Enable GitHub secret scanning and push protection where available.
- Pin third-party GitHub Actions to immutable commit SHAs during implementation.

Initially report dependency findings without blocking releases if the existing dependency set contains unresolved advisories. Establish a short remediation window, then make high/critical findings blocking.

## 6. Phase 2 — Automated Tests

CI compilation alone is not enough for a client portal. Add tests in this order:

1. Backend unit tests for auth token handling, authorization, tenant boundaries, validation, and scope decisions.
2. Backend integration tests for login/refresh/logout, project access, file metadata, and health endpoints against an ephemeral PostgreSQL database.
3. Frontend component tests for login validation, route guards, theme behavior, and error states.
4. Playwright smoke tests covering login, dashboard load, project navigation, and logout.
5. One tenant-isolation regression suite that proves tenant A cannot read or modify tenant B data.

Tests that send email, upload to S3, or call OpenAI/Ollama should use fakes in required CI. Keep a small real-provider suite scheduled or manually dispatched.

Required status checks on `main` after this phase:

- `client-ci`
- `server-ci`
- `migration-check` when applicable
- `unit-and-integration-tests`
- `e2e-smoke`
- `security`

## 7. Phase 3 — Staging

### Frontend staging

- Connect Vercel to the repository with Root Directory `client`.
- Set Production Branch to `main`.
- Let feature branches create Vercel Preview Deployments.
- Assign a stable staging domain to `abrar-dev` if the plan supports branch domains/custom environments.
- Configure Preview/Staging `NEXT_PUBLIC_API_URL` to the Render staging API.

### Backend staging

- Create a separate Render web service connected to `abrar-dev` with Root Directory `server`.
- Give it a separate Neon/PostgreSQL database, S3 bucket/prefix, secrets, email sandbox, and API keys with low spending limits.
- Never point preview or staging services at the production database or production S3 namespace.
- Set a health check path that verifies the process and database connection.

Recommended staging backend commands:

```text
Build: npm ci && npx prisma generate && npm run build
Pre-deploy: npx prisma migrate deploy
Start: npm start
```

If pgvector initialization remains outside Prisma migrations, convert it into reviewed, idempotent migrations before fully automating production. Do not hide schema setup in the server start command.

## 8. Phase 4 — Production Deployment

### Vercel frontend

- Production Branch: `main`.
- Root Directory: `client`.
- Production environment variables must reference the production API/custom domain.
- Vercel creates previews for non-production branches and promotes only `main` to the production domain.

### Render backend

- Branch: `main`.
- Root Directory: `server`.
- Auto-Deploy: **After CI Checks Pass**, not immediate On Commit.
- Use the same build/pre-deploy/start commands listed for staging.
- Keep `DATABASE_URL` (migration owner) and `APP_DATABASE_URL` (least-privilege runtime role) separate.
- Store JWT, database, S3, email, and AI credentials only in Render's secret manager.

Deployment ordering for changes that include compatible migrations:

1. CI and staging tests pass.
2. Apply production migrations once with `prisma migrate deploy`.
3. Deploy the backend.
4. Verify backend health.
5. Promote/deploy the frontend.
6. Run production smoke checks.

Use expand-and-contract migrations for breaking schema changes:

1. Add backward-compatible schema structures.
2. Deploy compatible application code.
3. Backfill data in a controlled job.
4. Switch reads/writes to the new structure.
5. Remove obsolete structures in a later release.

Never use `prisma migrate dev`, `prisma db push`, or destructive reset commands against production.

## 9. Post-Deploy Verification

Run automated smoke checks after staging and production deployments:

- Frontend root/login page returns HTTP 200.
- Backend `/api/health` (or the repository's actual health endpoint) returns healthy.
- Database connectivity reports healthy without returning secret details.
- Login page loads its critical assets, including the background video.
- A synthetic test account can sign in, load the dashboard, and sign out.
- CORS and refresh-cookie behavior work between the production frontend and API domains.

Do not log passwords, tokens, cookies, database URLs, file contents, or AI prompts containing client data.

## 10. Rollback and Recovery

Application rollback:

- Vercel: promote the last known-good deployment.
- Render: roll back to the last known-good deploy or redeploy its commit.
- After rollback, disable automatic production deployment temporarily if the bad commit remains at the tip of `main`.
- Revert the faulty commit through a pull request; do not rewrite `main` history.

Database rollback:

- Prefer forward-fix migrations; Prisma does not automatically reverse arbitrary production migrations.
- Take/verify database backups before risky migrations.
- Document manual recovery SQL with every destructive migration.
- Do not roll application code back to a version incompatible with the already-migrated schema.

## 11. Secrets and Environment Matrix

Maintain separate values for local, preview/staging, and production:

| Setting group | Local | Preview/Staging | Production |
|---|---|---|---|
| Frontend API URL | Local API | Staging API | Production API |
| PostgreSQL | Local/dev DB | Staging DB | Production DB |
| S3 | Dev bucket/prefix | Staging bucket/prefix | Production bucket/prefix |
| Email | Sandbox/capture | Sandbox | Production provider |
| AI | Developer key/local Ollama | Limited test key | Production key |
| JWT secrets | Local-only | Unique staging secrets | Unique production secrets |

Never reuse production secrets in preview deployments or pull-request workflows. Rotate any secret that is accidentally printed or committed.

## 12. Implementation Order

### Milestone A — Safe baseline

- Add `.github/workflows/ci.yml`.
- Add missing backend quality scripts/configuration.
- Make frontend and backend build checks green.
- Enable Dependabot.
- Protect `main` and require the baseline checks.

### Milestone B — Test foundation

- Introduce deterministic backend and frontend test runners.
- Add auth, authorization, tenant-isolation, and theme tests.
- Add Playwright smoke tests.
- Make these checks required on `main`.

### Milestone C — Staging

- Configure Vercel previews and a Render service for `abrar-dev`.
- Provision isolated staging data/services.
- Add migration validation and post-deploy smoke checks.

### Milestone D — Production automation

- Connect only `main` to production.
- Set Render to deploy after CI checks pass.
- Automate `prisma migrate deploy` in a single controlled pre-deploy step.
- Add production health verification and rollback documentation.

### Milestone E — Operational maturity

- Add uptime/error monitoring and alerts.
- Add dependency and container/image scanning if Docker is introduced.
- Add scheduled provider-level tests and backup-restore drills.
- Track deployment frequency, change failure rate, rollback time, and CI duration.

## 13. Definition of Done

The pipeline is complete when:

- Direct production pushes are blocked.
- Every production commit passed required checks on the exact merged SHA.
- Every pull request has an inspectable frontend preview and test results.
- Staging and production use isolated credentials and data.
- Production migrations are automated, serialized, and use only committed migrations.
- Failed builds never replace the live application.
- Health checks run after deployment.
- The team can restore the prior application version without rewriting Git history.
- A rollback and database-recovery procedure has been tested, not merely documented.

## References

- [GitHub deployment environments and protection rules](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments)
- [Render deploy and auto-deploy behavior](https://render.com/docs/deploys)
- [Render monorepo support](https://render.com/docs/monorepo-support)
- [Vercel Git deployments and preview branches](https://vercel.com/docs/git)
- [Vercel monorepo configuration](https://vercel.com/docs/monorepos)
- [Prisma production migration command](https://docs.prisma.io/docs/cli/migrate/deploy)
