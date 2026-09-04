# F13 – AI Search

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
✅ F7 – Timeline
✅ F8 – Memories
✅ F9 – Files
✅ F10 – Team
✅ F11 – Comments
✅ F12 – Memory & File Detail

Backend

✅ AI Search API Completed

---

# Goal

Build the AI Search experience for the Project Workspace.

This is the flagship feature of Memovix.

Users should be able to ask natural-language questions and instantly discover relevant project memories through semantic search.

The interface should feel comparable to Notion AI, GitHub Copilot Workspace, and Linear.

---

# Scope

Build

- AI Search page
- Search input
- Search results
- Result cards
- Relevance display
- Loading state
- Empty state
- Error state

Integrate with the existing backend.

No mock data.

---

# Search Behavior

Use the backend semantic search API.

Do not perform client-side searching.

Every search request should go through the backend.

Support

- natural language queries
- keyword queries

---

# Search Experience

Prioritize

- speed
- readability
- discoverability

Searching should feel immediate without being noisy.

Use a debounced search input (≈300 ms).

Do not search on every keystroke.

---

# Result Cards

Each result should display

- Memory title
- Matching snippet
- Category
- Relevance score (if returned)
- Created date

Clicking a result should navigate directly to

/projects/[projectId]/memories/[memoryId]

Reuse the existing Memory Detail page.

---

# Architecture

Separate

Page

Search container

Search input

Search results

Result card

API service

Query hook

Query keys

Types

Utilities

Never fetch directly inside UI components.

---

# Motion

Use Motion (motion.dev).

Recommended

• Page fade

• Search bar entrance

• Staggered result appearance

• Result hover

• Empty state transition

Keep animations subtle and premium.

---

# Motion Primitives

Reuse the existing Motion primitives.

Create additional reusable primitives only when they improve consistency.

Avoid inline animation logic.

---

# React Bits

Use React Bits selectively.

Good candidates

- Loading skeleton
- Empty search state
- Search placeholder
- Result micro interactions

Avoid decorative animations.

---

# Design Philosophy

Reference

- Linear
- Notion AI
- GitHub
- Vercel Dashboard
- Clerk

Enterprise SaaS.

Minimal.

Professional.

Readable.

---

# Future Ready

Design the page so future capabilities plug in naturally.

Examples

- AI generated summaries
- Suggested follow-up questions
- Recent searches
- Saved searches
- Search filters
- Search history

Do not implement these yet.

Only design for future extensibility.

---

# Out of Scope

Do NOT implement

- AI chat
- Streaming
- Filters
- Search history
- Saved searches
- Pagination
- Infinite scroll

Only semantic search.

---

# Definition of Done

✓ Backend integration

✓ Semantic search

✓ Debounced input

✓ React Query

✓ Result cards

✓ Navigation to Memory Detail

✓ Loading state

✓ Empty state

✓ Error state

✓ Motion

✓ Motion Primitives

✓ React Bits

✓ Responsive

✓ ESLint

✓ TypeScript

✓ Production build

✓ Local verification

✓ Git commit

✓ Git push

---

# Claude Prompt

Use the conversation prompt.