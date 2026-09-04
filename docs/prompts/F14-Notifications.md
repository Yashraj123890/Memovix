# F14 – Notifications

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
✅ F13 – AI Search

Backend

✅ Notifications API Completed

---

# Goal

Build the Notifications experience for Memovix.

Notifications keep users informed about important project activity without requiring them to constantly check timelines or project pages.

The experience should feel comparable to GitHub, Linear, Notion and Slack.

---

# Scope

Build

- Notifications page
- Notification dropdown/popover
- Notification list
- Notification item
- Mark as read
- Mark all as read
- Unread badge
- Loading state
- Empty state
- Error state

Integrate with the existing backend.

No mock data.

---

# User Experience

Notifications should be lightweight and easy to scan.

Prioritize

- readability
- clear hierarchy
- subtle emphasis
- fast interaction

Unread notifications should be visually distinguishable.

---

# Architecture

Separate

Page

Notification container

Notification list

Notification item

Notification dropdown

Notification badge

API service

Query hooks

Mutation hooks

Query keys

Types

Utilities

Never fetch directly inside UI components.

---

# Notification Types

Support existing backend notification types automatically.

Examples

- Memory Created
- Memory Updated
- File Uploaded
- Comment Added
- Team Member Added
- Client Assigned
- AI Generated
- System Notification

Do not hardcode notification types.

Map backend types to icons and colors through a reusable utility.

---

# Navigation

Clicking a notification should navigate to the appropriate destination whenever enough information exists.

Examples

Memory notification

→ Memory Detail

File notification

→ File Detail

Comment notification

→ Memory Detail

Unknown destinations should safely fall back to the Notifications page.

---

# Motion

Use Motion (motion.dev).

Recommended

• Dropdown animation

• Notification fade

• Staggered list

• Mark-as-read transition

• Empty state transition

Animations should feel subtle and premium.

---

# Motion Primitives

Reuse the existing Motion primitives.

Only create additional reusable primitives if they improve consistency.

---

# React Bits

Use React Bits selectively.

Good candidates

• Empty state

• Loading skeleton

• Notification placeholder

• Micro interactions

Avoid decorative animations.

---

# UI

Each notification should display

- Icon
- Title
- Message
- Relative timestamp
- Read/Unread indicator

Unread notifications should have stronger visual emphasis.

---

# Design Philosophy

Reference

- GitHub
- Linear
- Notion
- Slack
- Vercel Dashboard

Enterprise SaaS.

Minimal.

Professional.

Accessible.

---

# Future Ready

Design for future support of

- Realtime notifications
- Push notifications
- Notification preferences
- Email notifications
- Filtering
- Grouping

Do not implement these features.

Only ensure the architecture supports them.

---

# Out of Scope

Do NOT implement

- WebSockets
- SSE
- Polling
- Push notifications
- Notification preferences
- Filtering
- Grouping

Only build the notification experience.

---

# Definition of Done

✓ Backend integration

✓ Notification page

✓ Notification dropdown

✓ Notification badge

✓ Mark as read

✓ Mark all as read

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