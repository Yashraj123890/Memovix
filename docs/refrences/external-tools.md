# External Frontend Resources

This document explains how external UI resources should be used throughout the Memovix frontend.

---

# shadcn/ui

Role

Primary component library.

Use for:

- Buttons
- Cards
- Inputs
- Dialogs
- Dropdowns
- Tables
- Tabs
- Toasts
- Popovers
- Navigation

Rules

- Prefer shadcn/ui before building custom components.
- Customize using Tailwind CSS.
- Keep styling consistent with docs/design-system.md.

---

# Motion

Role

Primary animation library.

Use for:

- Page transitions
- Dialog animations
- Hover effects
- Loading transitions
- Sidebar animations
- Search interactions
- AI streaming effects

Rules

- Follow docs/animation-rules.md.
- Keep animations subtle.
- Prefer transform and opacity animations.

---

# React Bits

Role

Premium UI enhancement library.

Use for:

- Landing page
- Authentication pages
- Marketing sections
- Premium empty states
- AI feature highlights

Avoid

- Dashboard tables
- CRUD pages
- Data-heavy screens

---

# Motion Primitives

Role

Advanced interaction components.

Recommended for:

- Command Palette
- Spotlight Search
- Floating Toolbar
- Context Menu
- Dock
- Search Overlay

Avoid

- Basic forms
- Tables
- Standard buttons

---

# UI/UX Pro Max

Role

Design-thinking reference.

Use to improve:

- Visual hierarchy
- Spacing
- Layout
- Typography
- User flow
- Information architecture

It should never override the project's own design system.

Always follow:

- design-system.md
- component-guidelines.md
- product-principles.md