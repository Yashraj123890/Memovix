Phase F3 has been completed and verified locally.

Current Status

✅ F0 – Frontend Foundation
✅ F1 – Design System
✅ F2 – Authentication
✅ F3 – Application Layout

We are now starting F4 – Dashboard.

Before writing any code:

1. Read docs/prompts/F4-Dashboard.md.
2. Review the current frontend architecture.
3. Reuse the existing layout and design system.
4. Do not modify unrelated files.

IMPORTANT

The goal of F4 is NOT simply to display placeholder cards.

The goal is to establish the visual identity of Memovix.

Think like a senior SaaS product designer.

The dashboard should feel comparable in quality to products such as:

- Linear
- Vercel
- Notion
- GitHub
- Stripe Dashboard

Do NOT copy any product.

Instead, take inspiration from their:

- spacing
- typography
- hierarchy
- visual balance
- modern minimalism
- usability

Create an original design.

--------------------------------------------------

If you encounter any architectural decision that affects future phases, STOP and explain the options before implementing.

--------------------------------------------------

Objective

Build the Dashboard page.

This is the first screen users see after logging in.

It should immediately communicate:

- professionalism
- clarity
- premium quality
- productivity

The dashboard should look production-ready even though it uses mock data.

--------------------------------------------------

Dashboard Sections

Create reusable widgets for:

• Welcome Section
• Project Overview
• Recent Memories
• Recent Activity
• Notifications Summary
• AI Search Shortcut
• Storage Usage
• Quick Actions

Use realistic mock data.

--------------------------------------------------

Design Requirements

Prioritize excellent UI/UX.

Focus on:

- clean spacing
- strong visual hierarchy
- premium typography
- balanced whitespace
- subtle borders
- tasteful shadows
- modern icon usage
- responsive layout
- consistent sizing
- elegant empty states

Avoid making the dashboard look crowded.

Every widget should have a clear purpose.

--------------------------------------------------

Architecture

Separate:

- Dashboard page
- Widget components
- Mock data
- Types
- Constants

Do not place all widgets inside page.tsx.

Design every widget so it can later receive live API data without changing its component structure.

--------------------------------------------------

Future Ready

When backend APIs arrive in later phases, replacing mock data should require changing only the data source—not the UI components.

--------------------------------------------------

Out of Scope

Do NOT implement:

- Backend integration
- React Query
- CRUD operations
- Timeline
- Memories
- Files
- Notifications
- AI Search

Use mock data only.

--------------------------------------------------

Before finishing

Explain:

- Every new file
- Why it exists
- Dashboard architecture
- Widget architecture
- How the dashboard will evolve in later phases

Run:

- npm run lint
- npm run typecheck
- npm run build

Then wait for my local verification before continuing.