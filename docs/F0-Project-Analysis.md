# Phase F0.1 — Project Analysis Report

Status: Analysis only. No files were modified.

---

## 1. Current Project Structure

`client/` is an unmodified `create-next-app` scaffold. Nothing beyond the default has been built yet.

```
client/
├── AGENTS.md            → points to CLAUDE.md, which just says "@AGENTS.md"
├── CLAUDE.md
├── README.md             → default create-next-app README
├── app/
│   ├── favicon.ico
│   ├── globals.css       → default Tailwind v4 theme tokens (light/dark via prefers-color-scheme)
│   ├── layout.tsx        → default RootLayout, Geist fonts, no providers
│   └── page.tsx          → default Next.js starter homepage
├── public/                → default svg placeholder assets (file, globe, next, vercel, window)
├── eslint.config.mjs      → eslint-config-next (core-web-vitals + typescript)
├── next.config.ts         → empty NextConfig
├── postcss.config.mjs     → @tailwindcss/postcss only
├── tsconfig.json          → strict mode, `@/*` → `./*` alias
├── package.json
└── package-lock.json
```

None of the feature-based folders required by `docs/README-FRONTEND.md` and `docs/coding-standards.md` exist yet: no `components/`, `features/`, `hooks/`, `services/`, `stores/`, `types/`, `utils/`, or `lib/`.

---

## 2. Existing Dependencies

**Runtime**

| Package | Version |
|---|---|
| next | 16.2.9 |
| react | 19.2.4 |
| react-dom | 19.2.4 |

**Dev**

| Package | Version |
|---|---|
| typescript | ^5 |
| tailwindcss | ^4 |
| @tailwindcss/postcss | ^4 |
| eslint | ^9 |
| eslint-config-next | 16.2.9 |
| @types/node | ^20 |
| @types/react | ^19 |
| @types/react-dom | ^19 |

That's the entire dependency tree — nothing else is installed. Notably `node_modules` has no trace of any UI, animation, forms, query, or state library.

**Important flag:** Next.js is pinned to `16.2.9`, a version ahead of anything in my training data. `client/AGENTS.md` explicitly warns: *"This is NOT the Next.js you know... Read the relevant guide in `node_modules/next/dist/docs/` before writing any code."* That local docs folder does exist (`app/`, `pages/`, `architecture/`, `community/` guides). Before F1+ touches routing, layouts, config, or data-fetching patterns, those local docs should be consulted rather than relying on prior Next.js knowledge, since App Router conventions may have changed.

---

## 3. Existing Configuration

- **TypeScript** (`tsconfig.json`): `strict: true`, target ES2017, `moduleResolution: bundler`, single path alias `@/*` → `./*` (project root, not `./src/*`, since there is no `src/` directory).
- **ESLint** (`eslint.config.mjs`): flat config, extends `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`. No custom rules, no Prettier integration.
- **Tailwind**: v4, configured purely through `@tailwindcss/postcss` in `postcss.config.mjs` — there is no `tailwind.config.ts`, consistent with Tailwind v4's CSS-first config approach. Theme tokens (`--background`, `--foreground`, font variables) are defined inline in `app/globals.css` via `@theme inline`, with dark mode currently driven only by `prefers-color-scheme` (media-query based, not a class/attribute toggle).
- **Next config** (`next.config.ts`): default empty object — no image domains, no redirects, no env passthrough, no experimental flags configured.
- **package.json scripts**: standard `dev`, `build`, `start`, `lint`. No `typecheck`, `format`, or `test` script.
- **No Prettier config** anywhere (`.prettierrc` absent), despite the roadmap listing Prettier as an F0 deliverable.
- **No `.env` / `.env.example` / `.env.local`** present in `client/` — `NEXT_PUBLIC_API_URL` (referenced in `docs/api-notes.md`) is not yet defined anywhere in the frontend.
- **`.gitignore`**: standard Next.js defaults (node_modules, .next, env files, build artifacts).

---

## 4. Missing Dependencies

Everything the roadmap and README-FRONTEND.md specify beyond the base Next.js scaffold is missing:

- **shadcn/ui** — not initialized (no `components.json`, no `components/ui`, no `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`, `@radix-ui/*` in package.json)
- **Motion** (`motion` package) — absent
- **TanStack Query** (`@tanstack/react-query`) — absent
- **Axios** — absent
- **React Hook Form** — absent
- **Zod** — absent
- **Zustand** — absent
- **Sonner** — absent
- **Recharts** — absent
- **Lucide React** — absent
- **Prettier** (+ `prettier-plugin-tailwindcss` recommended) — absent
- **next-themes** (or equivalent) — needed for a class-based dark mode toggle since current dark mode is media-query only, and design-system.md calls for dark-mode-first with future light mode support (implies a controllable theme, not just OS preference)

---

## 5. Existing Providers

None. `app/layout.tsx` renders `<html><body>{children}</body></html>` with no wrapping providers. There is no QueryClientProvider, no ThemeProvider, no Toaster, no auth/session provider of any kind.

---

## 6. Existing Utilities

None. There is no `lib/`, `utils/`, or `hooks/` directory. No `cn()` helper (needed by shadcn/ui), no Axios instance, no date/formatting helpers, no validation schemas.

---

## 7. Existing Aliases

Only one alias is configured, and it's broader than the target architecture:

```json
"paths": { "@/*": ["./*"] }
```

This resolves `@/*` to the `client/` root. Since there is no `src/` directory, this technically already supports `@/components`, `@/features`, `@/lib`, etc. once those folders are created — but it also means `@/app/...` and even `@/node_modules`-adjacent root files are technically importable, which is looser than typical convention. Worth deciding now whether to keep root-relative (`@/*` → `./*`) or introduce a `src/` layout with `@/*` → `./src/*` for a cleaner separation between app config and application code.

---

## 8. Existing shadcn/ui Setup

None whatsoever:

- No `components.json`
- No `components/ui/` directory
- No Radix UI primitives installed
- No `cn()` utility
- No CSS variables beyond the two default Tailwind starter tokens (`--background`, `--foreground`) — shadcn/ui's full theming system (border, ring, card, popover, muted, accent, destructive, radius, etc.) is not present

This will need full initialization: `components.json`, base CSS variables aligned to `docs/design-system.md`'s dark-first palette (near-black background, blue accent, green/amber/red/cyan semantic colors), and the `cn()` helper in `lib/utils.ts`.

---

## 9. Recommended Improvements

1. **Decide on `src/` vs root layout** before scaffolding folders, since it affects the `@/*` alias and every import going forward.
2. **Initialize shadcn/ui first**, since Motion, forms, and most UI components in later phases will build on top of its primitives and `cn()` utility.
3. **Replace media-query dark mode with a class-based theme strategy** (e.g. `next-themes`) so the app can support explicit dark-first with a future light-mode toggle, per `design-system.md`.
4. **Add Prettier + `prettier-plugin-tailwindcss`**, since the roadmap lists it as an F0 deliverable but it's entirely absent, and no formatting convention currently exists.
5. **Create the shared Axios instance and TanStack Query provider together**, since `api-notes.md` and `coding-standards.md` both mandate a single shared instance with auth header injection and centralized error handling — this should exist before any feature work starts.
6. **Add `NEXT_PUBLIC_API_URL` via `.env.local`** (referencing `docs/api-notes.md`'s `http://localhost:5000/api` dev base URL) — currently no env file exists in `client/` at all.
7. **Add `typecheck` script** (`tsc --noEmit`) to `package.json` so "no TypeScript errors" from the Definition of Done can be verified via a single command, not just implicitly through `next build`.
8. **Read `node_modules/next/dist/docs/01-app` before F1+ implementation**, since Next 16.2.9 is newer than my training data and `AGENTS.md` explicitly flags breaking changes vs. prior Next.js versions.
9. **Scaffold the full feature-based folder tree** (`components/{ui,shared}`, `features/{auth,dashboard,projects,memories,files,ai-search,timeline,notifications,audit}`, `hooks/`, `services/`, `stores/`, `types/`, `utils/`, `lib/`) even though most will be empty initially — this establishes the architecture the docs mandate rather than growing it ad hoc per phase.
10. **Clean out starter placeholder content** (`app/page.tsx` boilerplate, unused `public/*.svg` files, default metadata title/description) as part of setup rather than carrying it into F1.

---

## Things to Keep

- Next.js App Router + TypeScript strict mode — matches the mandated stack exactly, no changes needed there.
- Tailwind CSS v4 with the CSS-first `@theme inline` config approach — compatible with shadcn/ui v4-style setup and the design system's token-based approach.
- `eslint-config-next` flat config (core-web-vitals + typescript) as the ESLint foundation — sound base, just needs Prettier layered in.
- The `@/*` path alias mechanism — the pattern is right, only the target path (`./*` vs `./src/*`) needs a decision.
- Geist font setup in `layout.tsx` via `next/font/google` — matches `design-system.md`'s recommended typography (Geist, Inter fallback).

## Things to Improve

- Dark mode: move from `prefers-color-scheme` media query to a controllable, class-based theme system.
- `app/globals.css`: expand minimal 2-token theme into the full shadcn/ui CSS variable set aligned with the documented dark-first palette.
- `package.json`: add `typecheck` (and optionally `format`) scripts.
- Alias strategy: formalize root vs. `src/` decision before other folders are created.
- Root metadata in `layout.tsx` (`title`/`description`) still says "Create Next App" — needs real Memovix branding.

## Things to Remove

- `app/page.tsx` boilerplate content (Next.js starter hero, template/deploy links).
- Unused placeholder SVGs in `public/` (`file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`) once real branding/icons replace them.
- Default `README.md` (create-next-app boilerplate) — should eventually be replaced with project-specific setup instructions, though low priority.

---

## Notes on Backend (read-only, for context)

The backend (`/server`) is a complete Node.js/Express/TypeScript/Prisma (PostgreSQL) API with JWT auth and three roles (OWNER, MEMBER, CLIENT). Route groups on disk match `docs/api-notes.md` (auth, projects, members, client invitations, memories, files, timeline, comments, notifications, audit) plus a few not yet documented there: `rag`, `semanticSearch`, `projectClient`, and `health`. No backend files were modified or will be during F0.

---

**Waiting for approval before installing any packages or generating code.**
