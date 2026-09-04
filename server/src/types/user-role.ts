export const USER_ROLE = {
  OWNER: "OWNER",
  MEMBER: "MEMBER",
  CLIENT: "CLIENT",
} as const;

export type UserRole =
  (typeof USER_ROLE)[keyof typeof USER_ROLE];