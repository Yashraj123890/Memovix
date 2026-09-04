# F9 – Files

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
✅ F8 – Memories

Backend

✅ File Upload API Completed

---

# Goal

Build the Files module for the Project Workspace.

The Files page should allow users to browse project files and understand what assets belong to a project.

This phase focuses on file discovery and metadata presentation.

---

# Scope

Build:

- Files page
- File list
- File card / row
- File type icons
- Search
- File type filter
- Empty state
- Loading skeleton
- Error state

Integrate with the existing backend File API.

---

# User Experience

The Files page should feel like a professional document repository.

Prioritize:

- scanability
- metadata clarity
- quick identification
- responsive layout

---

# Data

Use the existing backend File endpoints.

Use TanStack Query.

No mock data.

---

# Architecture

Separate:

- Page
- Files container
- Toolbar
- File list
- File item
- Query hook
- API service
- Query keys
- Types
- Config
- Utilities

Do not fetch data inside UI components.

---

# Future Ready

Design so future phases can add:

- Upload
- Delete
- Replace
- Version history
- File preview
- Download
- Drag & Drop
- Bulk selection

without redesigning the module.

---

# Out of Scope

Do NOT implement:

- Upload UI
- Delete UI
- Preview
- Download
- Drag & Drop
- Version history
- Bulk actions

Only browsing and searching.

---

# Definition of Done

- Files page
- Backend integration
- Search
- File type filter
- File list
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