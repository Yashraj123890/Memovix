# F10 – Team Management

## Goal

Build the Team Management page for a project.

This feature allows project owners to manage project membership independently of workspace invitations.

---

## Background

The backend now has a dedicated Project Membership system.

Workspace invitations only add users to the tenant.

Assigning users to projects is a separate action using the ProjectMember model.

Do NOT modify the invitation flow.

---

## APIs

### Get Workspace Members

GET /api/members/workspace

Returns all OWNER and MEMBER users in the current workspace.

Example:

[
  {
    "id": "...",
    "name": "John Doe",
    "email": "john@gmail.com",
    "role": "MEMBER"
  }
]

---

### Get Project Members

GET /api/projects/:projectId/members

Returns all members assigned to the project.

---

### Add Member

POST /api/projects/:projectId/members

Body

{
    "userId":"..."
}

---

### Remove Member

DELETE /api/projects/:projectId/members/:userId

---

## Requirements

Create Team page.

Display:

- Project Members
- Add Member button

When Add Member is clicked:

Open modal.

Load workspace members from

GET /api/members/workspace

Display them inside a Select.

Selecting a member and clicking Add should call

POST /api/projects/:projectId/members

Close modal.

Refresh project members.

Show success toast.

---

Each member card should display

- Avatar
- Name
- Email
- Role
- Joined date

Each card has

Remove

button.

Clicking Remove asks for confirmation.

If confirmed

DELETE /api/projects/:projectId/members/:userId

Refresh members.

Show success toast.

---

Loading states

Show skeletons while loading.

---

Empty state

"No members assigned yet."

---

Error handling

Display backend messages.

Example

User is already a member of this project.

---

Use React Query for fetching and cache invalidation.

Do not duplicate backend validation.

The backend is the source of truth.

---

Deliverables

- Team page
- Add Member dialog
- Member cards
- Remove confirmation
- React Query hooks
- API service
- Proper loading/error states