# Architecture Decisions

## Decision 001

Date:
2026-07-26

Topic:
State Management

Decision:
TanStack Query manages all server state.

Zustand manages only UI state and authentication.

Reason:
Avoid duplicate sources of truth.

---

## Decision 002

Topic:
Animations

Decision:
Motion is the only animation library used in the dashboard.

Reason:
Consistency and performance.

## Decision 003

Topic:
Theme Management

Decision:
Use next-themes with dark mode as the default.

Reason:
Memovix is designed as a dark-first SaaS application.

---

## Decision 004

Date:
2026-07-27

Topic:
CommentsSection integration point

Decision:
CommentsSection (`features/comments/components/comments-section.tsx`,
built in F11) is a self-contained, reusable module — `<CommentsSection
subjectType="MEMORY" | "FILE" subjectId={id} />` — that is not wired into
any page yet. The next planned phase, "Memory & File Detail" (see
`docs/frontend-roadmap.md`), is responsible for building the Memory
Detail and File Detail views and mounting CommentsSection into each.

Reason:
F8 (Memories) and F9 (Files) were explicitly scoped as browse-only, with
no detail/click-through view, so F11 had nowhere to mount comments
without expanding scope beyond "only implement the Comments feature."
Documenting the integration point here and in the roadmap keeps it from
becoming an orphaned component.