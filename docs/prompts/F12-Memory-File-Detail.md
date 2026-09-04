# F12 – Memory & File Detail

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

Backend

✅ Memory API Completed

✅ File API Completed

✅ Comments API Completed

---

# Goal

Build dedicated detail pages for Memories and Files.

These pages become the central location for viewing project knowledge, metadata, files, activity, and collaboration.

They also become the integration point for the reusable CommentsSection introduced in F11.

---

# Scope

Build

- Memory Detail page
- File Detail page
- Metadata section
- File preview (when applicable)
- Comments integration
- Loading state
- Empty state
- Error state

Integrate with the existing backend.

No mock data.

---

# User Experience

The experience should resemble modern knowledge management tools.

Reference

- Notion
- Linear
- GitHub
- Vercel

Prioritize

- readability
- hierarchy
- discoverability
- clean spacing

---

# Routing

Implement

/projects/[projectId]/memories/[memoryId]

/projects/[projectId]/files/[fileId]

Update existing Memory and File lists so each item navigates naturally to its detail page.

---

# Comments

Integrate the reusable component from F11.

Memory

<CommentsSection
    subjectType="MEMORY"
    subjectId={memory.id}
/>

File

<CommentsSection
    subjectType="FILE"
    subjectId={file.id}
/>

Do not duplicate comment logic.

---

# Memory Detail

Display

- title
- content
- author
- category
- created date
- updated date
- related file (if available)

---

# File Detail

Display

- filename
- uploader
- upload date
- file size
- file type
- preview when supported
- download action

If preview is unsupported, show an appropriate placeholder.

---

# Architecture

Separate

Page

Container

Metadata Card

Preview Component

CommentsSection (reuse)

API Service

Types

Query Hooks

Query Keys

Utilities

Never fetch directly inside UI components.

---

# Motion

Use Motion (motion.dev).

Suggested interactions

• Page transition

• Metadata fade

• Card entrance

• Preview animation

• Comments reveal

• Hover elevation

Animations should be subtle and premium.

---

# Motion Primitives

Reuse existing Motion primitives.

If additional reusable primitives improve consistency, create them instead of inline animation props.

---

# React Bits

Use React Bits selectively.

Good candidates

• Empty state

• Loading skeleton

• Preview placeholder

• Micro interactions

Do not add decorative animations.

---

# Design Philosophy

Match

• Linear

• Notion

• GitHub

• Vercel Dashboard

• Clerk

Enterprise SaaS.

Minimal.

Professional.

Consistent.

---

# Future Ready

Design these pages so future features plug in naturally.

Examples

- AI Summary
- AI Search jump targets
- Related Memories
- Related Files
- Audit History
- Notifications
- Version History

No redesign should be required later.

---

# Definition of Done

✓ Memory Detail page

✓ File Detail page

✓ Comments integration

✓ Routing

✓ Backend integration

✓ React Query

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