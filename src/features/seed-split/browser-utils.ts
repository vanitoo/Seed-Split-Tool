import type { RefObject } from "react";
import type { SharingScheme } from "./model";

export function countWords(value: string): number {
  return value.trim() ? value.trim().split(/\s+/u).length : 0;
}

export function downloadText(filename: string, content: string): void {
  const url = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function parseParts(value: string, scheme: SharingScheme): string[] {
  const separator = scheme === "slip39" ? /\n/u : /\n\s*\n/u;
  return value.split(separator).map((item) => item.trim()).filter(Boolean);
}

export function scrollTo(ref: RefObject<HTMLElement | null>): void {
  window.setTimeout(() => ref.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
}

export function isErrorStatus(status: string): boolean {
  return ["Некоррект", "Нужно", "Невер", "повреж", "Не удалось", "неожиданной"].some((marker) => status.includes(marker));
}
