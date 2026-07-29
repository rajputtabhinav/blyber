/**
 * Client-side CSV download helper. No runtime dependencies — uses
 * a Blob URL + transient <a download> click. Output is RFC-4180
 * compliant: fields containing comma, quote, or newline get quoted
 * and embedded quotes are doubled.
 *
 * Excel opens these files natively (.csv association). Sheets does
 * too. This avoids pulling in a 700 KB SheetJS dependency just to
 * write spreadsheets.
 */

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = typeof value === "string" ? value : String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/** Generate a CSV string from an array of plain objects. */
export function rowsToCsv<T extends Record<string, unknown>>(
  rows: T[],
  /** Optional explicit column order; defaults to first row's keys. */
  columns?: readonly (keyof T & string)[],
): string {
  if (rows.length === 0) return "";
  const headers = (columns ?? (Object.keys(rows[0]) as (keyof T & string)[])) as string[];
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => csvEscape((row as Record<string, unknown>)[h])).join(","));
  }
  return lines.join("\n");
}

/** Trigger a download of a string as a file via Blob URL. */
export function downloadBlob(
  filename: string,
  content: string,
  type = "text/plain;charset=utf-8",
): void {
  const blob = new Blob(["﻿", content], { type }); // BOM helps Excel detect UTF-8
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Defer revoke so Safari doesn't lose the download
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** One-shot helper: build a CSV from rows and download it. */
export function downloadCSV<T extends Record<string, unknown>>(
  filename: string,
  rows: T[],
  columns?: readonly (keyof T & string)[],
): void {
  const csv = rowsToCsv(rows, columns);
  downloadBlob(filename.endsWith(".csv") ? filename : `${filename}.csv`, csv, "text/csv;charset=utf-8");
}

/** Stable ISO timestamp suitable for filenames. */
export function fileTimestamp(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `-${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
  );
}
