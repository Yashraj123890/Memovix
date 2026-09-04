# Memovix Component Guidelines

## Goal

Every component should feel like it belongs to the same product.

Components must be:

- Reusable
- Predictable
- Accessible
- Type-safe
- Maintainable
- Responsive

A user should never feel like two pages were built by different developers.

---

# Component Philosophy

Every component should have one responsibility.

Large components should be composed of smaller reusable components.

Avoid monolithic components.

Prefer composition over duplication.

---

# Component Categories

## UI Components

Generic reusable components.

Examples

Button

Input

Card

Badge

Dialog

Tooltip

Avatar

Skeleton

Spinner

Table

Pagination

Dropdown

Toast

Location

/components/ui

---

## Shared Components

Reusable business-independent components.

Examples

PageHeader

SearchBar

EmptyState

ErrorState

LoadingState

ConfirmDialog

DeleteDialog

SectionHeader

StatsCard

Location

/components/shared

---

## Feature Components

Business-specific components.

Examples

ProjectCard

MemoryCard

TimelineItem

NotificationCard

CommentBox

AIAnswerCard

ProjectSidebar

Location

/features

---

# Component Structure

Every component should contain only:

Presentation

Local UI State

Event handling

Business logic belongs elsewhere.

---

# Component Size

Small

Less than 100 lines

Preferred.

Medium

100–250 lines

Acceptable.

Large

Over 250 lines

Split into smaller components.

---

# Props

Props should be:

Explicit

Typed

Minimal

Avoid passing unnecessary props.

Prefer objects only when they improve readability.

---

# State

Local State

useState

Global State

Zustand

Server State

TanStack Query

Never mix responsibilities.

---

# Styling

Tailwind CSS only.

Avoid inline styles.

Avoid duplicated class names.

Extract repeated UI patterns into reusable components.

---

# Buttons

Every button should support:

Variant

Size

Loading

Disabled

Icon

Accessibility

Consistent spacing

Consistent height

---

# Forms

Every form should support:

Validation

Error Messages

Loading

Success

Disabled

Keyboard Navigation

Proper Labels

React Hook Form + Zod only.

---

# Cards

Cards should contain:

Title

Description (optional)

Actions (optional)

Body

Footer (optional)

Avoid deeply nested layouts.

---

# Tables

Support:

Sorting

Filtering

Pagination

Loading

Error

Empty State

Responsive layout

Sticky header where appropriate.

---

# Dialogs

Dialogs should:

Trap keyboard focus

Support ESC

Close gracefully

Clearly highlight the primary action

Avoid oversized content

---

# Empty States

Every empty state should include:

Icon or illustration

Title

Helpful description

Primary action

Never display blank pages.

---

# Error States

Every error state should include:

Friendly message

Retry action

Optional support action

Never expose backend errors.

---

# Loading States

Prefer:

Skeletons

Progress indicators

Button loading states

Avoid fullscreen spinners.

---

# Icons

Use Lucide React only.

Keep icon size consistent.

Do not mix icon libraries.

---

# Responsive Design

Every component should work on:

Desktop

Tablet

Mobile

No horizontal scrolling unless absolutely necessary.

---

# Accessibility

Keyboard support

Focus states

ARIA labels where required

Semantic HTML

Color contrast

Screen reader support

---

# File Naming

PascalCase

Examples

ProjectCard.tsx

NotificationItem.tsx

SearchInput.tsx

---

# Export Rules

Prefer named exports.

Avoid unnecessary default exports.

Maintain consistent import patterns.

---

# Reusability Checklist

Before creating a new component ask:

Can an existing component be reused?

Can this become a shared component?

Can this be composed from smaller components?

Only create a new component if necessary.

---

# Performance

Avoid unnecessary renders.

Memoize only when needed.

Lazy load heavy components.

Avoid expensive calculations inside render.

---

# Testing Checklist

Every component should support:

✔ Responsive

✔ Accessible

✔ Loading State

✔ Error State

✔ Empty State

✔ Keyboard Navigation

✔ Type Safety

✔ Reusable Design

✔ Dark Mode

✔ Production Ready

---

# AI Rules

Before generating a component, Claude should:

Search existing components.

Reuse before creating.

Maintain visual consistency.

Follow the design system.

Follow coding standards.

Never create duplicate UI components.