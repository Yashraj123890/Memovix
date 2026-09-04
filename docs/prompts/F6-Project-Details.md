# F6 – Project Details

Status: Ready

Version: 1.0

Dependencies

✅ F0 – Frontend Foundation

✅ F1 – Design System

✅ F2 – Authentication

✅ F3 – Application Layout

✅ F4 – Dashboard

✅ F5 – Projects Module

Backend

✅ Project CRUD

---

# Goal

Build the Project Details page.

This page becomes the central workspace for a single project.

Future phases will plug into this page instead of creating separate disconnected pages.

---

# Scope

Build:

- Project header
- Project overview
- Project metadata
- Status badge
- Created date
- Updated date
- Client information (if available)
- Empty placeholders for future modules

---

# Navigation

Clicking a project from the Projects page should navigate to the Project Details page.

---

# Layout

Design the page as a workspace.

Use sections that later become:

- Overview
- Timeline
- Memories
- Files
- Team
- AI Search

These sections should initially contain elegant placeholder states.

---

# Data

Use the existing backend Project API.

Do not use mock project data.

---

# User Experience

The Project Details page should feel like entering a dedicated workspace.

Prioritize:

- clarity
- navigation
- scalability
- readability

---

# Architecture

Separate:

- Page
- Components
- Hooks
- Services
- Types

Do not fetch data inside UI components.

---

# Future Ready

Design this page so future phases can simply replace placeholder sections with real implementations.

No layout redesign should be necessary later.

---

# Out of Scope

Do NOT implement:

- Timeline
- Memories
- Files
- Team
- AI Search
- Comments
- Editing

Only build the workspace shell.

---

# Definition of Done

- Project Details page
- Backend integration
- Responsive layout
- Loading state
- Error state
- Empty placeholders
- Navigation from Projects
- Lint
- Typecheck
- Build
- Local verification
- Git commit
- Git push

---

# Claude Prompt

Use the conversation prompt.