/** Query key factory for the settings/profile feature. */
export const profileKeys = {
  all: ["profile"] as const,
  me: ["profile", "me"] as const,
};
