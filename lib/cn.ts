import clsx, { type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

const AVATAR_COLORS = [
  "#6D5EF7",
  "#14B8A6",
  "#F59E0B",
  "#EF4444",
  "#3B82F6",
  "#22C55E",
  "#EC4899",
  "#8B5CF6",
  "#06B6D4",
  "#F97316",
];

export function avatarColor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Format an ISO timestamp relative to `now`. Handles past and future:
 *   past   →  "3m ago", "2h ago", "5d ago"
 *   future →  "in 11h", "in 2d", "in 3w"
 *
 * Server/client time drift causes hydration mismatches if rendered inline
 * during SSR. Prefer the <TimeAgo /> component which renders only after
 * mount; only call this function directly inside `useEffect` or `useMemo`
 * with a `now` you control.
 */
export function formatRelative(iso: string, now = new Date()): string {
  const t = new Date(iso).getTime();
  const diff = (now.getTime() - t) / 1000;
  const future = diff < 0;
  const abs = Math.abs(diff);
  const fmt = (n: number, unit: string) =>
    future ? `in ${n}${unit}` : `${n}${unit} ago`;
  if (abs < 60) return future ? `in ${Math.floor(abs)}s` : `${Math.floor(abs)}s ago`;
  if (abs < 3600) return fmt(Math.floor(abs / 60), "m");
  if (abs < 86400) return fmt(Math.floor(abs / 3600), "h");
  if (abs < 86400 * 7) return fmt(Math.floor(abs / 86400), "d");
  if (abs < 86400 * 30) return fmt(Math.floor(abs / (86400 * 7)), "w");
  return fmt(Math.floor(abs / (86400 * 30)), "mo");
}

export function fmtNum(n: number): string {
  if (Math.abs(n) >= 1000) return (n / 1000).toFixed(1) + "k";
  return n.toString();
}

export function pad(n: number, width = 2): string {
  return n.toString().padStart(width, "0");
}
