# F7 – Timeline

Status: Ready

Version: 1.0

Dependencies

✅ F0 – Frontend Foundation
✅ F1 – Design System
✅ F2 – Authentication
✅ F3 – Application Layout
✅ F4 – Dashboard
✅ F5 – Projects Module
✅ F6 – Project Workspace

Backend

✅ Timeline API Completed

---

# Goal

Build the Timeline module for the Project Workspace.

The Timeline should provide a chronological view of all project activity and become the project's activity feed.

---

# Scope

Build:

- Timeline page
- Timeline list
- Timeline item
- Activity icons
- Relative timestamps
- Empty state
- Loading skeleton
- Error state

Integrate with the existing backend Timeline API.

---

# User Experience

The Timeline should feel like a professional activity feed.

Prioritize:

- readability
- chronology
- visual hierarchy
- scanability

---

# Data

Use the existing Timeline backend endpoints.

Use TanStack Query.

No mock data.

---

# Architecture

Separate:

- Page
- Timeline container
- Timeline list
- Timeline item
- Query hook
- API service
- Types
- Query keys

Do not fetch data inside UI components.

---

# Future Ready

Design so future events automatically appear without redesigning the Timeline.

Support future event types such as:

- Memory Created
- Memory Updated
- File Uploaded
- File Deleted
- Comment Added
- Team Member Added
- Client Assigned
- AI Summary Generated

---

# Out of Scope

Do NOT implement:

- Infinite scroll
- Pagination
- Live updates
- Grouping by date
- Filtering
- Search

Only display the activity feed.

---

# Definition of Done

- Timeline page
- Backend integration
- React Query
- Timeline list
- Timeline items
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