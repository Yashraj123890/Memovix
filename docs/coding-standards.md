# Memovix Frontend Coding Standards

## Goal

Write clean, scalable, maintainable, production-quality code.

The frontend should remain easy to understand even after thousands of lines of code.

---

# General Rules

- Prefer readability over clever code.
- Never duplicate business logic.
- Keep components small and focused.
- Follow Single Responsibility Principle.
- Use TypeScript strictly.
- Avoid unnecessary abstractions.
- Never use `any` unless absolutely unavoidable.

---

# Project Structure

/client

    app/

    components/

        ui/

        shared/

    features/

        auth/

        dashboard/

        projects/

        memories/

        files/

        ai-search/

        timeline/

        notifications/

        audit/

    hooks/

    lib/

    services/

    stores/

    types/

    utils/

---

# Naming Conventions

Components

PascalCase

Example

ProjectCard.tsx

Hooks

camelCase

Example

useProjects.ts

Utilities

camelCase

Example

formatDate.ts

Constants

UPPER_SNAKE_CASE

Example

MAX_FILE_SIZE

Types

PascalCase

Example

Project.ts

Interfaces

PascalCase

Example

ProjectResponse

---

# Components

Components should:

- receive props
- avoid unnecessary state
- be reusable
- contain only UI logic

Business logic belongs elsewhere.

---

# Business Logic

Never place business logic inside UI components.

Business logic belongs inside:

features/

services/

hooks/

---

# API Layer

Use Axios.

Never call fetch() directly.

All API calls belong inside:

services/api

Example

services/api/project.service.ts

Never call endpoints directly from components.

---

# TanStack Query

TanStack Query manages:

- fetching
- caching
- mutations
- loading
- retries
- invalidation

Never manually manage server state with useState.

---

# Zustand

Use Zustand only for:

Authentication

Theme

Sidebar

Current Workspace

Global UI State

Never store API responses inside Zustand.

---

# React Hooks

Custom hooks should contain:

Query logic

Mutation logic

Data transformations

Never duplicate hooks.

---

# Forms

Use:

React Hook Form

Zod

Every form must include:

Validation

Error Handling

Loading State

Disabled State

---

# Error Handling

Never swallow errors.

Display user-friendly messages.

Log unexpected errors.

Never expose backend stack traces.

---

# Loading

Prefer skeleton loaders.

Avoid blocking the UI.

Loading should preserve layout.

---

# Folder Responsibility

app/

Routing

components/

Reusable UI

features/

Feature implementation

services/

API layer

stores/

Global state

hooks/

Reusable logic

utils/

Pure helper functions

types/

TypeScript types

---

# Imports

Prefer aliases.

Example

@/components

instead of

../../../../components

---

# Styling

Use Tailwind CSS.

Avoid inline styles.

Avoid duplicated utility classes.

Extract repeated patterns into reusable components.

---

# Performance

Lazy load heavy pages.

Memoize only when necessary.

Avoid unnecessary re-renders.

Optimize images.

Avoid unnecessary client components.

Prefer Server Components when possible.

---

# Accessibility

Every interactive element must:

Be keyboard accessible.

Have focus states.

Support screen readers.

Use semantic HTML.

---

# Comments

Avoid obvious comments.

Instead write self-explanatory code.

Comment only when explaining:

Complex algorithms

Business rules

Important architectural decisions

---

# Git

One feature per commit.

Small commits.

Meaningful commit messages.

Never commit broken code.

---

# Quality Checklist

Before completing any phase:

✔ No TypeScript errors

✔ No ESLint errors

✔ Responsive

✔ Accessible

✔ Loading State

✔ Error State

✔ Empty State

✔ Dark Mode

✔ Reusable Components

✔ Clean Architecture

✔ Production Ready

---

# AI Development Rules

Claude should:

Read existing code before generating new code.

Reuse existing components whenever possible.

Avoid duplicate implementations.

Follow this document before writing any code.

If uncertain, ask instead of making assumptions.