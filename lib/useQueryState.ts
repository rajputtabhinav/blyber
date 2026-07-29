"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * useQueryState — bind a single search param to React state.
 *
 * Writes go through router.replace so back/forward stays clean and
 * the URL is shareable. Pass `defaultValue` to omit the param when
 * the state equals it (cleaner URLs).
 *
 * Example:
 *   const [sev, setSev] = useQueryState<Severity | "all">("sev", "all");
 */
export function useQueryState<T extends string>(
  key: string,
  defaultValue: T,
): [T, (next: T) => void] {
  const pathname = usePathname();
  const router = useRouter();
  const params = useSearchParams();
  const value = (params?.get(key) as T) ?? defaultValue;

  const set = useCallback(
    (next: T) => {
      const sp = new URLSearchParams(params?.toString() ?? "");
      if (next === defaultValue || !next) sp.delete(key);
      else sp.set(key, next);
      const qs = sp.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [key, defaultValue, params, pathname, router],
  );

  return [value, set];
}
