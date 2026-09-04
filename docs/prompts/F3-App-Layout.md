# F3 – App Layout

Status: Ready

Version: 1.0

Backend Dependency:
✅ Backend authentication completed

Frontend Dependency:
✅ F0 – Frontend Foundation
✅ F1 – Design System
✅ F2 – Authentication

---

# Goal

Build the authenticated application shell for Memovix.

The layout should become the foundation that every authenticated page will use.

The implementation must focus on structure, navigation, responsiveness and user experience—not feature pages.

---

# Scope

## Layout

- Authenticated app shell
- Responsive sidebar
- Responsive header
- Main content area
- Mobile navigation
- Collapsible sidebar
- Theme toggle
- User menu

## Navigation

Prepare navigation for future modules.

Navigation should include placeholders for:

- Dashboard
- Projects
- Timeline
- Memories
- Files
- AI Search
- Notifications
- Settings

Navigation should be data-driven instead of hardcoded.

---

## Authentication Integration

Integrate the layout with the authentication system.

Unauthenticated users should never access the authenticated layout.

Authenticated users should automatically enter the app shell.

---

## Responsive Behaviour

Desktop

- Persistent sidebar

Tablet

- Collapsible sidebar

Mobile

- Drawer navigation

---

## User Experience

Include:

- Page title
- Breadcrumb support
- User avatar
- User name
- Theme switch
- Logout action

---

# Out of Scope

Do NOT build:

- Dashboard widgets
- Project pages
- Timeline page
- Memory page
- File management
- AI Search
- Notifications page
- Settings page

Only create the application shell.

---

# Definition of Done

- [ ] Responsive layout
- [ ] Sidebar
- [ ] Header
- [ ] Mobile drawer
- [ ] Navigation configuration
- [ ] User menu
- [ ] Theme toggle
- [ ] Logout integrated
- [ ] Route protection integrated
- [ ] Uses existing design system
- [ ] Uses authentication state
- [ ] Local verification passed
- [ ] Git committed
- [ ] Git pushed

---

# Claude Prompt

Copy everything below into Claude.

```

Phase F2 has been completed and verified locally.

Current status

✅ F0 – Frontend Foundation

✅ F1 – Design System

✅ F2 – Authentication Foundation

Now begin Phase F3 – Application Layout.

Before making any changes:

1. Read all project documentation.
2. Review the current frontend architecture.
3. Review the authentication implementation.
4. Reuse existing components.
5. Do not modify unrelated files.

Objective

Build the authenticated application shell for Memovix.

The application shell should become the common layout used by every authenticated page.

Scope

Layout

- Sidebar
- Header
- Main content area
- Mobile navigation
- Responsive behaviour
- Theme toggle
- User menu

Navigation

Create a centralized navigation configuration.

Navigation should prepare for:

- Dashboard
- Projects
- Timeline
- Memories
- Files
- AI Search
- Notifications
- Settings

Do not implement those pages.

Authentication

Integrate the existing authentication system.

Unauthenticated users should never access the authenticated layout.

Authenticated users should automatically use the application shell.

Sidebar

Requirements

- Responsive
- Collapsible
- Icons
- Active navigation state
- Future-friendly structure

Header

Requirements

- Breadcrumb support
- Page title
- User menu
- Theme switch
- Logout

Architecture

Keep navigation configuration separate from UI.

Separate:

- layout components
- navigation config
- hooks
- utilities

Do not place navigation arrays inside components.

Constraints

Do NOT create:

- Dashboard widgets
- Project pages
- Timeline
- Memories
- Files
- AI Search
- Notifications
- Settings

Only build the reusable application shell.

Before implementation

If any architectural decision affects future phases, stop and explain the recommendation before implementing.

Verification

Before finishing:

1. Explain every new file.
2. Explain why it exists.
3. Explain the layout architecture.
4. Run lint.
5. Run typecheck.
6. Run build.
7. Wait for my local verification before continuing.

```