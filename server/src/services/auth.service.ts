import { UserRole } from "@prisma/client";
import { AuthRepository } from "../repositories/auth.repository";
import { hashPassword, comparePassword } from "../auth/password";
import { sessionService } from "./session.service";
import { workspaceService } from "./workspace.service";
import {
  RegisterInput,
  LoginInput,
} from "../validators/auth.validator";

export class AuthService {
  constructor(
    private authRepository = new AuthRepository()
  ) {}

  async register(data: RegisterInput) {
  const { name, email, password, companyName } = data;

  const existingUser = await this.authRepository.findUserByEmail(email);

  if (existingUser) {
    throw new Error("User already exists");
  }

  const passwordHash = await hashPassword(password);

  const result = await this.authRepository.createTenantWithOwner({
    tenantName: companyName,
    ownerName: name,
    email,
    passwordHash,
  });

  const { accessToken, refreshToken } = await sessionService.issue({
    userId: result.owner.id,
    tenantId: result.tenant.id,
    role: result.owner.role,
  });

  const { passwordHash: _, ...safeOwner } = result.owner;

  return {
    tenant: result.tenant,
    owner: safeOwner,
    accessToken,
    refreshToken,
  };
}
  

  async login(data: LoginInput) {
    const { email, password } = data;

    const user = await this.authRepository.findUserByEmail(email);

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isPasswordValid = await comparePassword(
      password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }
    if (!user.isActive) {
    throw new Error("Account is disabled.");
}

    // M11: a CLIENT session opens in an active workspace (home if still a member,
    // else the first accessible one). Owners/members keep their single tenant and
    // leave the session row's activeTenantId null (behavior unchanged).
    const activeTenantId = await workspaceService.defaultActiveWorkspace(user);
    const isClient = user.role === UserRole.CLIENT;

    const { accessToken, refreshToken } = await sessionService.issue(
      { userId: user.id, tenantId: activeTenantId, role: user.role },
      { activeTenantId: isClient ? activeTenantId : null },
    );

    const { passwordHash: _, ...safeUser } = user;

    return {
      user: { ...safeUser, tenantId: activeTenantId },
      accessToken,
      refreshToken,
    };
  }
}