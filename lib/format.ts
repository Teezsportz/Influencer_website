export function formatCompactNumber(n: number | null | undefined): string {
  if (n === null || n === undefined) return "Data unavailable";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}K`;
  return n.toLocaleString();
}

export function formatNaira(n: number | null | undefined): string {
  if (n === null || n === undefined) return "Data unavailable";
  return `₦${n.toLocaleString("en-NG")}`;
}

export function formatPercent(n: number | null | undefined, digits = 1): string {
  if (n === null || n === undefined) return "Data unavailable";
  return `${n.toFixed(digits)}%`;
}

export function formatRelativeDays(iso: string): string {
  const days = Math.round((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
  const years = Math.round(months / 12);
  return `${years} year${years > 1 ? "s" : ""} ago`;
}

export function formatDateMonthYear(iso: string): string {
  return new Date(iso).toLocaleDateString("en-NG", { month: "short", year: "numeric" });
}
