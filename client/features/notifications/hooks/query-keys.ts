/** Query key factory for notifications — same convention as memoryKeys/fileKeys/teamKeys. */
export const notificationKeys = {
  all: ["notifications"] as const,
  list: () => [...notificationKeys.all, "list"] as const,
};
