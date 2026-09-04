import prisma from "../lib/prisma";
import { UserRole } from "@prisma/client";

interface CreateTenantWithOwnerData {
  tenantName: string;
  ownerName: string;
  email: string;
  passwordHash: string;
}

interface CreateMemberData {
  tenantId: string;
  name: string;
  email: string;
  passwordHash: string;
}

interface CreateClientData {
  tenantId: string;
  name: string;
  email: string;
  passwordHash: string;
}

export class AuthRepository {
  async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: {
        email,
      },
    });
    
  }

  async createTenantWithOwner(data: CreateTenantWithOwnerData) {
    return prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: data.tenantName,
        },
      });

      const owner = await tx.user.create({
        data: {
          tenantId: tenant.id,
          name: data.ownerName,
          email: data.email,
          passwordHash: data.passwordHash,
          role: UserRole.OWNER,
        },
      });

      return {
        tenant,
        owner,
      };
    });
  }

  async createMember(data: CreateMemberData) {
    return prisma.user.create({
      data: {
        tenantId: data.tenantId,
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
        role: UserRole.MEMBER,
      },
    });
  }
  async updatePassword(
    userId: string,
    passwordHash: string
) {
    return prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            passwordHash,
        },
    });
}
  async createClient(data: CreateClientData) {
    return prisma.user.create({
      data: {
        tenantId: data.tenantId,
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
        role: UserRole.CLIENT,
      },
    });
  }
  async findUserById(userId: string) {
    return prisma.user.findUnique({
        where: {
            id: userId
        }
    });
}
}