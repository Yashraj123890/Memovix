import type { UserRole } from "@/constants/roles";

/**
 * Full user profile as returned by POST /auth/login (the backend's "safe
 * user" — passwordHash stripped). See server/src/services/auth.service.ts.
 *
 * Fields past `role` are optional because POST /client/register returns a
 * narrower user shape — { id, name, email, role } only (see
 * server/src/services/clientInvitation.service.ts registerClient) — and
 * that response is stored into this same auth store field (see
 * ClientRegisterResponseData below, used by
 * features/client-registration/hooks/use-client-register-mutation.ts).
 * None of these optional fields are read anywhere in the frontend today
 * (grepped before loosening this), so making them optional doesn't change
 * any existing behavior for login/register.
 */
export interface AuthUser {
  id: string;
  tenantId?: string;
  name: string;
  email: string;
  role: UserRole;
  emailVerified?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponseData {
  user: AuthUser;
  accessToken: string;
}

/**
 * Response body of POST /auth/refresh (server/src/controllers/auth.controller.ts).
 * The refresh token itself is rotated in the HttpOnly cookie and never appears
 * here — only the new access token plus fresh user claims.
 */
export interface RefreshResponseData {
  accessToken: string;
  user: AuthUser;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  companyName: string;
}

/**
 * Minimal Tenant shape as returned inline by POST /auth/register (see
 * server/src/repositories/auth.repository.ts createTenantWithOwner). Not the
 * full workspace-settings shape — just enough to greet the new owner.
 */
export interface Tenant {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Response body of POST /auth/register. Note the key is `owner`, not `user`
 * like LoginResponseData — the backend controller returns
 * `{ tenant, owner, token }` because registration also creates the tenant.
 * `owner` is the same "safe user" shape as AuthUser.
 */
export interface RegisterResponseData {
  tenant: Tenant;
  owner: AuthUser;
  accessToken: string;
}

/**
 * Shape returned by GET /auth/me. The backend's `authenticate` middleware
 * (server/src/middleware/auth.middleware.ts) only attaches the decoded JWT
 * payload to req.user — userId/tenantId/role — it does not reload the full
 * user row. This is intentionally narrower than AuthUser: use it only to
 * confirm a persisted token is still valid, never to hydrate name/email.
 */
export interface AuthSession {
  userId: string;
  tenantId: string;
  role: UserRole;
}

/**
 * Body of POST /client/register — server/src/types/client-register.ts
 * ClientRegisterDto. `token` comes from the /client/register/:token URL,
 * not a form field.
 */
export interface ClientRegisterRequest {
  token: string;
  name: string;
  password: string;
}

/**
 * Response shape of POST /client/register
 * (server/src/services/clientInvitation.service.ts registerClient) — note
 * this `user` is *not* the full AuthUser shape, only
 * { id, name, email, role }. See the AuthUser doc comment above for why
 * that's fine to store as-is.
 */
export interface ClientRegisterResponseData {
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
  accessToken: string;
}

/**
 * Body of POST /members/register (server/src/controllers/member.controller.ts
 * registerFromInvitation) — structurally identical to ClientRegisterRequest.
 * `token` comes from the /member/register/:token URL, not a form field.
 */
export interface MemberRegisterRequest {
  token: string;
  name: string;
  password: string;
}

/**
 * Response shape of POST /members/register
 * (server/src/services/member.service.ts registerFromInvitation). Unlike the
 * client flow this returns the full "safe user" (passwordHash stripped), so
 * `user` is the complete AuthUser shape.
 */
export interface MemberRegisterResponseData {
  user: AuthUser;
  accessToken: string;
}
