"use client";

import { useSyncExternalStore } from "react";

// No external source ever changes after mount - this is purely a
// server/client snapshot switch, so there is nothing to subscribe to.
function subscribe() {
  return () => {};
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

/**
 * True once this has rendered in the browser. Anything that reads
 * browser-only state during its first render (localStorage-backed Zustand
 * stores, `window`, media queries, etc.) should gate on this so the first
 * client render still matches the server render, avoiding a hydration
 * mismatch — see stores/auth.store.ts and stores/sidebar.store.ts, both of
 * which read localStorage synchronously once this flips true.
 *
 * Implemented with useSyncExternalStore (server/client snapshots) rather
 * than a useEffect + setState pair - the latter trips the
 * react-hooks/set-state-in-effect rule and causes an avoidable extra
 * render. Lives at the top level (not inside features/auth) because more
 * than one feature now needs it — see features/layout/components/theme-toggle.tsx.
 */
export function useHasHydrated(): boolean {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
