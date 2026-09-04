"use client";

import { usePathname } from "next/navigation";

/**
 * True when `href` is the current route or an ancestor of it, so nav items
 * still highlight correctly once nested routes exist (e.g. a future
 * /projects/[id] should keep "Projects" active). "/" only matches itself
 * exactly — otherwise every route would light up Dashboard.
 */
export function useIsActivePath(href: string): boolean {
  const pathname = usePathname();

  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
