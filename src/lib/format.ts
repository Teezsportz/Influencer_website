import type { Platform, PostStatus } from "../types";

export const STATUS_META: Record<PostStatus, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-slate-100 text-slate-600 ring-slate-300" },
  in_review: { label: "In Review", className: "bg-amber-50 text-amber-700 ring-amber-300" },
  changes_requested: { label: "Changes Requested", className: "bg-rose-50 text-rose-700 ring-rose-300" },
  approved: { label: "Approved", className: "bg-emerald-50 text-emerald-700 ring-emerald-300" },
};

export const PLATFORM_META: Record<Platform, { label: string; className: string }> = {
  Instagram: { label: "Instagram", className: "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200" },
  TikTok: { label: "TikTok", className: "bg-slate-900/5 text-slate-800 ring-slate-300" },
  Facebook: { label: "Facebook", className: "bg-blue-50 text-blue-700 ring-blue-200" },
  LinkedIn: { label: "LinkedIn", className: "bg-sky-50 text-sky-700 ring-sky-200" },
  X: { label: "X", className: "bg-slate-100 text-slate-800 ring-slate-300" },
  YouTube: { label: "YouTube", className: "bg-red-50 text-red-700 ring-red-200" },
};

export function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  return `${diffDay}d ago`;
}
