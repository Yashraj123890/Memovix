# Memovix API Notes

## Purpose

This document summarizes the backend APIs used by the frontend.

The backend implementation is the source of truth.

If this document differs from the backend, always follow the backend.

---

# Backend

Technology

- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL (Neon)

Base URL (Development)

http://localhost:5000/api

Base URL (Production)

Configured through environment variables.

Never hardcode URLs.

---

# Authentication

Authentication uses JWT.

Login returns:

- Access Token
- User Information

Store the token securely.

Attach the token to every protected request.

Authorization Header

Authorization: Bearer <JWT_TOKEN>

Never store authentication state inside local component state.

Authentication belongs in Zustand.

---

# User Roles

OWNER

Full access.

Can:

- Manage workspace
- Manage projects
- Invite members
- Invite clients
- Access audit logs

---

MEMBER

Can:

- Access assigned projects
- Create memories
- Upload files
- Add comments

Cannot manage the organization.

---

CLIENT

Can:

- View assigned projects
- Access shared memories
- View shared files
- Participate in collaboration where permitted

Clients never receive owner privileges.

---

# Common Response Format

Success

{
    "success": true,
    "data": { ... }
}

Error

{
    "success": false,
    "message": "Something went wrong."
}

Frontend should always display user-friendly messages.

---

# Request Headers

Content-Type

application/json

Authorization

Bearer Token

Multipart Upload

multipart/form-data

---

# Endpoint Groups

## Authentication

Examples

POST /auth/register

POST /auth/login

GET /auth/me

---

## Projects

Examples

GET /projects

POST /projects

GET /projects/:id

PUT /projects/:id

DELETE /projects/:id

---

## Member Invitations

Examples

POST /members/invite

GET /members

DELETE /members/:id

---

## Client Invitations

Examples

POST /clients/invite

POST /client/register

GET /clients

---

## Memories

Examples

GET /memories/project/:projectId

POST /memories

PUT /memories/:id

DELETE /memories/:id

---

## Files

Examples

POST /files/upload

GET /files/project/:projectId

DELETE /files/:id

---

## Timeline

Examples

GET /projects/:projectId/timeline

---

## Comments

Examples

POST /comments

GET /comments/memory/:memoryId

DELETE /comments/:id

---

## AI Search

Examples

POST /ai/search

Future AI endpoints should follow the same response structure.

---

## Notifications

Examples

GET /notifications

PUT /notifications/:id/read

---

## Audit Logs

Examples

GET /audit

GET /audit/project/:projectId

---

# File Upload

Uploads use:

multipart/form-data

Frontend should:

- Validate file size.
- Validate file type.
- Display upload progress.
- Handle upload errors gracefully.

---

# Error Handling

Frontend should handle:

400

Validation errors

401

Authentication required

403

Permission denied

404

Resource not found

409

Conflict

500

Server error

Display friendly messages.

Never expose backend stack traces.

---

# Query Management

Use TanStack Query.

Every endpoint should have:

Query Hook

Mutation Hook (if applicable)

Query Key

Proper cache invalidation

Never call Axios directly inside React components.

---

# Axios Instance

Create a shared Axios instance.

Responsibilities

- Base URL
- Authorization header
- Token refresh (future)
- Global error handling

All API requests should use this shared instance.

---

# Pagination

If an endpoint supports pagination, use:

page

limit

search

sort

Do not implement custom pagination logic for each feature.

---

# Frontend Rules

Before implementing any feature:

1. Verify the backend endpoint exists.
2. Use the shared API service.
3. Use TanStack Query.
4. Handle loading, empty, and error states.
5. Keep UI components free of business logic.

---

# Future Expansion

New backend endpoints should:

- Follow existing response format.
- Be added to the shared API layer.
- Use React Query.
- Reuse existing UI components where possible.