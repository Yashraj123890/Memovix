# F8 – Memories

Status: Ready

Version: 1.0

Dependencies

✅ F0 – Frontend Foundation
✅ F1 – Design System
✅ F2 – Authentication
✅ F3 – Application Layout
✅ F4 – Dashboard
✅ F5 – Projects
✅ F6 – Project Workspace
✅ F7 – Timeline

Backend

✅ Memory API Completed

---

# Goal

Build the Memories module for the Project Workspace.

A Memory represents an important piece of project knowledge such as decisions, requirements, notes, documentation, meeting outcomes, or technical information.

This module will become the primary knowledge source for future AI Search.

---

# Scope

Build:

- Memories page
- Memory list
- Memory card
- Category badge
- Search
- Category filter
- Empty state
- Loading skeleton
- Error state

Integrate with the existing backend Memory API.

---

# User Experience

The Memories page should feel like browsing a structured knowledge base rather than a generic CRUD table.

Prioritize:

- readability
- discoverability
- information density
- fast scanning

---

# Data

Use the existing Memory backend endpoints.

Use TanStack Query.

No mock data.

---

# Architecture

Separate:

- Page
- Memories container
- Memory list
- Memory card
- Toolbar
- Query hook
- API service
- Types
- Query keys
- Utilities
- Config

Do not fetch data inside UI components.

---

# Future Ready

Design so future phases can add:

- Create Memory
- Edit Memory
- Delete Memory
- Attach Files
- Comments
- AI Summary
- Semantic Search
- Tags
- Pinning

without redesigning the module.

---

# Out of Scope

Do NOT implement:

- Create Memory
- Edit Memory
- Delete Memory
- Rich text editor
- AI Summary
- Semantic Search
- Tags
- Pinning
- Pagination

Only browsing and searching.

---

# Definition of Done

- Memories page
- Backend integration
- Search
- Category filter
- Memory cards
- Loading state
- Empty state
- Error state
- Responsive layout
- Lint
- Typecheck
- Build
- Local verification
- Git commit
- Git push

---

# Claude Prompt

Use the conversation prompt.