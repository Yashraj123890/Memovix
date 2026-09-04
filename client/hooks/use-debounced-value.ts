"use client";

import { useEffect, useState } from "react";

/**
 * Delays reflecting `value` until it stops changing for `delayMs`.
 * Top-level (not feature-specific) since debouncing user input before it
 * drives a network request is a generic need — first used by
 * features/memories to avoid firing a search request on every keystroke.
 */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timeout);
  }, [value, delayMs]);

  return debounced;
}
