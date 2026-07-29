"use client";

import { useEffect, useState } from "react";
import { formatRelative } from "@/lib/cn";

interface TimeAgoProps {
  iso: string;
  prefix?: string;
  className?: string;
  /** Re-render every minute so labels stay fresh. Default true. */
  live?: boolean;
  /** Placeholder rendered during SSR + first client paint. Default "…" */
  fallback?: string;
}

/**
 * Hydration-safe relative time.
 *
 * Reading `new Date()` on both the server and client produces different
 * values, so any inline `{formatRelative(iso)}` crashes hydration. This
 * component renders a stable fallback during SSR + first client paint
 * (so they match), and switches to the real relative time after mount.
 */
export function TimeAgo({
  iso,
  prefix = "",
  className,
  live = true,
  fallback = "…",
}: TimeAgoProps) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    if (!live) return;
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, [live]);

  // Title attribute always shows the absolute ISO for engineers who want it.
  return (
    <span className={className} title={iso}>
      {prefix}
      {now ? formatRelative(iso, now) : fallback}
    </span>
  );
}
