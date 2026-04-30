export function toCsv<T extends Record<string, unknown>>(rows: T[], columns: { key: keyof T; label: string }[]) {
  const header = columns.map((c) => escapeCsv(c.label)).join(",");
  const body = rows
    .map((r) => columns.map((c) => escapeCsv(formatValue(r[c.key]))).join(","))
    .join("\n");
  // BOM para que Excel detecte UTF-8 correctamente
  return "﻿" + header + "\n" + body;
}

function escapeCsv(value: string): string {
  if (value == null) return "";
  const needsQuotes = /[",\n\r]/.test(value);
  const escaped = value.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

function formatValue(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}
