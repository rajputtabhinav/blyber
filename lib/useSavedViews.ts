"use client";

import { useCallback, useEffect, useState } from "react";

export interface SavedView {
  id: string;
  name: string;
  query: string; // URL search string, no leading '?'
  createdISO: string;
}

const PREFIX = "blyber.views.";

export function useSavedViews(scope: string): {
  views: SavedView[];
  save: (name: string, query: string) => SavedView;
  remove: (id: string) => void;
} {
  const [views, setViews] = useState<SavedView[]>([]);

  // Lazy read on mount to avoid SSR mismatch.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PREFIX + scope);
      if (raw) setViews(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, [scope]);

  const persist = useCallback(
    (next: SavedView[]) => {
      setViews(next);
      try {
        localStorage.setItem(PREFIX + scope, JSON.stringify(next));
      } catch {
        /* ignore */
      }
    },
    [scope],
  );

  const save = useCallback(
    (name: string, query: string) => {
      const v: SavedView = {
        id: `v-${Date.now().toString(36)}`,
        name,
        query,
        createdISO: new Date().toISOString(),
      };
      persist([v, ...views]);
      return v;
    },
    [views, persist],
  );

  const remove = useCallback(
    (id: string) => {
      persist(views.filter((v) => v.id !== id));
    },
    [views, persist],
  );

  return { views, save, remove };
}
