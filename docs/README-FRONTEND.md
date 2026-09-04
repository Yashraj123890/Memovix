# README-FRONTEND.md

# Memovix Frontend Development Guide

## Project Overview

Memovix is an AI-Powered Client Portal with Project Memory.

The backend is already implemented.

This project now focuses on building a premium SaaS frontend that integrates with the existing backend.

The frontend must be production-ready, scalable, responsive, accessible, and maintainable.

---

# Current Status

Backend
✅ Completed

Frontend
🚧 In Development

Always verify the current frontend phase before implementing new features.

The frontend roadmap is located at:

docs/frontend-roadmap.md

---

# Frontend Tech Stack

Framework

- Next.js (App Router)
- TypeScript

Styling

- Tailwind CSS
- shadcn/ui

Animations

- Motion
- React Bits (selective usage)
- Motion Primitives (micro interactions only)

State Management

- TanStack Query
- Zustand

Forms

- React Hook Form
- Zod

Networking

- Axios

Icons

- Lucide React

Notifications

- Sonner

Charts

- Recharts

---

# Documentation

Always follow these documents before writing code.

docs/

- frontend-roadmap.md
- design-system.md
- coding-standards.md
- animation-rules.md
- component-guidelines.md
- product-principles.md
- api-notes.md

If any generated code conflicts with these documents, update the implementation to comply with the documentation.

---

# Repository Structure

Repository

/server
/client
/docs

The backend exists only to provide APIs.

All frontend work must happen inside:

client/

Never create frontend files inside the server directory.

---

# Backend Rules

The backend is considered complete.

Claude may inspect backend code to understand:

- API endpoints
- Request/response models
- Authentication flow
- Database entities
- Validation rules
- Role permissions

The backend is READ ONLY.

Never modify backend code unless explicitly instructed.

Never invent API endpoints if an existing endpoint already exists.

Always reuse the existing backend.

---

# Frontend Architecture

Follow Feature-Based Architecture.

client/

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

services/

stores/

types/

utils/

lib/

---

# Development Workflow

Before writing code:

1. Read the relevant documentation.
2. Inspect existing code.
3. Reuse existing components.
4. Create a short implementation plan.
5. Implement.
6. Verify against the checklist.
7. Explain important decisions.

Never immediately generate hundreds of lines of code without understanding the existing architecture.

---

# Design Philosophy

The UI should feel similar in quality to:

- Linear
- Cursor
- Vercel
- Notion

The product should communicate:

- Confidence
- Intelligence
- Simplicity
- Precision

Avoid clutter.

Avoid unnecessary decorations.

---

# Animation Rules

Follow:

docs/animation-rules.md

Animations should improve usability.

Never animate only for decoration.

Keep interactions fast and subtle.

---

# Component Rules

Before creating a component:

Check if one already exists.

Reuse components whenever possible.

Never create duplicate UI components.

Shared UI belongs inside:

components/

Business components belong inside:

features/

---

# API Rules

Never call APIs directly from React components.

Always use:

services/

Use:

Axios

TanStack Query

Proper query keys

Proper cache invalidation

Never duplicate API calls.

---

# State Management

Use Zustand only for:

- Authentication
- Theme
- Sidebar
- Global UI State

Use TanStack Query for:

- API data
- Caching
- Mutations
- Server state

Never store API responses inside Zustand.

---

# Forms

Every form must use:

React Hook Form

Zod

Every form must include:

- Validation
- Error state
- Loading state
- Disabled state

---

# Error Handling

Every page must include:

Loading State

Empty State

Error State

Retry Action

Never expose backend stack traces.

Always display friendly messages.

---

# Responsive Design

Desktop First

Tablet

Mobile

Every page must function correctly across all supported screen sizes.

---

# Accessibility

Support:

Keyboard navigation

Focus states

Screen readers

ARIA labels

Semantic HTML

Reduced motion preferences

Accessibility is mandatory.

---

# Security Rules

## Environment Files

Treat all environment files as confidential.

Never display, print, copy, or expose values from:

- .env
- .env.local
- .env.development
- .env.production

If implementation requires an environment variable, reference it only by name.

Example:

process.env.NEXT_PUBLIC_API_URL

Never reveal or print its value.

---

## Secrets

Never expose:

- API Keys
- JWT Secrets
- Database URLs
- OpenAI API Keys
- AWS Credentials
- S3 Secrets
- OAuth Secrets
- Access Tokens
- Session Secrets

Never include secrets in generated code, documentation, logs, examples, or commit messages.

---

## Logging

Never log:

- Passwords
- Tokens
- Cookies
- API Keys
- Sensitive user information

Use safe logging only during development.

---

# Files to Ignore

Do not inspect, modify, or expose:

- .env*
- node_modules/
- .next/
- dist/
- build/
- coverage/
- .git/

Read these only if explicitly instructed.

---

# Coding Standards

Follow:

docs/coding-standards.md

Use:

- TypeScript
- Strict typing
- Clean architecture
- Named exports
- Feature-based organization

Avoid:

- any
- duplicated logic
- inline API calls
- deeply nested components

---

# Performance

Prefer:

Server Components

Code splitting

Lazy loading

Image optimization

Skeleton loaders

Avoid unnecessary re-renders.

---

# AI Development Rules

Before generating code:

- Read existing implementation.
- Reuse existing components.
- Follow the documentation.
- Maintain visual consistency.
- Preserve architecture.
- Explain significant architectural decisions.

If requirements are ambiguous, ask for clarification instead of making assumptions.

---

# Git Rules

One feature per commit.

Small commits.

Meaningful commit messages.

Never commit broken code.

Never modify unrelated files.

---

# Definition of Done

A task is complete only when:

✅ TypeScript passes

✅ ESLint passes

✅ No console errors

✅ Responsive

✅ Accessible

✅ Loading state implemented

✅ Error state implemented

✅ Empty state implemented

✅ API integrated

✅ Reusable components

✅ Design system followed

✅ Animation rules followed

✅ No duplicate code

✅ Production-ready

---

# Mission

Every implementation should move Memovix closer to becoming a premium AI SaaS product.

Prioritize:

1. User experience
2. Maintainability
3. Performance
4. Scalability
5. Consistency

When unsure, choose the solution that best aligns with the project's documentation and architecture.

# External UI Resources

When implementing frontend features, the following resources may be used where appropriate.

## shadcn/ui

Primary component library.

## Motion

Primary animation library.

## React Bits

Use selectively for premium UI sections such as:

- Landing page
- Authentication
- Empty states
- AI feature highlights

Avoid excessive use inside the application dashboard.

## Motion Primitives

Use for advanced interactions such as:

- Command Palette
- Search Overlay
- Dock
- Context Menus
- Floating Panels

## UI/UX Pro Max

Use as a design reference to improve:

- Layout
- Visual hierarchy
- Spacing
- User experience

All generated UI must still follow:

- docs/design-system.md
- docs/component-guidelines.md
- docs/animation-rules.md

# Working Agreement

Before implementing any feature, Claude should follow this order:

1. Read README-FRONTEND.md.
2. Read the relevant files under docs/.
3. Inspect the existing codebase.
4. Review the backend APIs if needed.
5. Create a short implementation plan.
6. Wait for approval if major architectural changes are required.
7. Implement incrementally.
8. Verify against the Definition of Done.
9. Explain significant implementation decisions.

Never skip directly to code generation without understanding the project context.