# Memovix Frontend Roadmap

## Vision

Build a premium AI SaaS frontend for Memovix that feels modern, polished, scalable, and production-ready.

The frontend should provide an exceptional user experience while integrating seamlessly with the existing backend.

---

# Design Goals

- Premium SaaS UI
- Clean architecture
- Responsive
- Accessible
- Fast
- Scalable
- Maintainable
- Consistent Design Language
- Smooth but subtle animations

---

# Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Motion
- Lucide React
- TanStack Query
- Axios
- Zustand
- React Hook Form
- Zod
- Sonner
- Recharts

---

# Development Rules

- Build one phase at a time.
- Never skip testing.
- Never break previous phases.
- Every component must be reusable.
- Every feature must be production-ready.
- Avoid duplicated code.
- Backend is read-only.
- Frontend lives only inside `/client`.

---

# Frontend Phases

## F0 — Project Setup

Deliverables

- Next.js setup
- Tailwind
- shadcn/ui
- Folder Structure
- Theme Provider
- ESLint
- Prettier
- Path Aliases

Completion Criteria

- Project runs successfully
- No TypeScript errors
- Clean architecture established

---

## F1 — Design System

Deliverables

- Typography
- Colors
- Buttons
- Cards
- Inputs
- Dialogs
- Tables
- Empty States
- Skeletons
- Badges
- Icons

Completion Criteria

- Complete reusable component library

---

## F2 — Authentication

Deliverables

- Login
- Register
- Forgot Password
- Reset Password
- Protected Routes
- JWT Integration

Completion Criteria

- Authentication fully functional

---

## F3 — App Layout

Deliverables

- Sidebar
- Top Navigation
- Search
- User Menu
- Breadcrumbs
- Responsive Layout

Completion Criteria

- Shared layout used by all authenticated pages

---

## F4 — Dashboard

Deliverables

- Statistics
- Recent Projects
- Recent Activity
- Notifications
- AI Quick Actions

Completion Criteria

- Dashboard fully integrated with backend

---

## F5 — Project Workspace

Deliverables

- Project List
- Project Details
- Project Settings
- Members

Completion Criteria

- Complete project management interface

---

## F6 — Client Portal

Deliverables

- Client Dashboard
- Shared Memories
- Files
- Timeline

Completion Criteria

- Client experience complete

---

## F7 — Memory Workspace

Deliverables

- Memory Editor
- Memory List
- Memory Details
- Categories
- Comments

Completion Criteria

- Full memory management

---

## F8 — File Management

Deliverables

- Upload
- Preview
- Download
- Delete
- Search

Completion Criteria

- Complete file management

---

## F9 — AI Search

Deliverables

- Semantic Search
- Search Results
- AI Answer Panel
- Citations
- Filters

Completion Criteria

- AI search fully integrated

---

## F10 — Timeline

Deliverables

- Timeline Feed
- Filters
- Pagination

Completion Criteria

- Complete activity timeline

---

## F11 — Notifications

Deliverables

- Notification Center
- Read/Unread
- Real-time Updates

Completion Criteria

- Notification system complete

---

## F12 — Audit Logs

Deliverables

- Audit Table
- Filters
- Search

Completion Criteria

- Full audit history

---

## Next Phase — Memory & File Detail (follows F11 – Comments)

> Note: this roadmap's phase numbers predate the phase sequence actually
> executed in development (see `docs/prompts/F0-Setup.md` through
> `docs/prompts/f11-comments` for the real history: F0 Foundation, F1
> Design System, F2 Auth, F3 App Layout, F4 Dashboard, F5 Projects, F6
> Project Workspace, F7 Timeline, F8 Memories, F9 Files, F10 Team, F11
> Comments). This entry documents the next phase in that real sequence,
> not this file's stale numbering.

Deliverables

- Memory Detail view (`/projects/[id]/memories/[memoryId]`)
- File Detail view (`/projects/[id]/files/[fileId]`)
- Click-through navigation into both from the existing Memories (F8) and
  Files (F9) browse lists
- Integrate `features/comments/components/comments-section.tsx` (built in
  F11, currently unmounted) into both detail views:
  `<CommentsSection subjectType="MEMORY" subjectId={memory.id} />` and
  `<CommentsSection subjectType="FILE" subjectId={file.id} />`

Completion Criteria

- CommentsSection is mounted and functional from a real page — no longer
  an orphaned component
- Memory/File browsing gains a way to open a single item

---

## F13 — Final Polish

Deliverables

- Performance Optimization
- Accessibility Review
- Responsive Review
- UI Polish
- Animation Polish
- Final Testing

Completion Criteria

- Production Ready