import { DiscoverResult } from "@/lib/discover";
import { SearchFilters } from "@/lib/types";

/**
 * Rule-based "AI recommendation" narrative layer. Summarises a result set in
 * plain language and surfaces evidence-based risk themes across the shortlist.
 * This is template-driven (not a hosted-LLM call) so every sentence traces
 * back to concrete data already shown in the table/profile — no unsupported claims.
 */
export function buildShortlistNarrative(results: DiscoverResult[], filters: SearchFilters): { why: string; risks: string[] } {
  if (results.length === 0) {
    return { why: "No influencers matched the current criteria. Try broadening your filters or switching to Campaign Brief mode.", risks: [] };
  }

  const top = results.slice(0, Math.min(20, results.length));
  const avgScore = Math.round(top.reduce((s, r) => s + r.score.total, 0) / top.length);
  const avgEr =
    top.reduce((s, r) => s + (r.influencer.performanceByPlatform[r.platform]?.engagementRate.value ?? 0), 0) / top.length;
  const avgNg = Math.round(top.reduce((s, r) => s + (r.influencer.audience.nigeriaPct.value ?? 0), 0) / top.length);
  const platformCounts = new Map<string, number>();
  top.forEach((r) => platformCounts.set(r.platform, (platformCounts.get(r.platform) ?? 0) + 1));
  const dominantPlatform = [...platformCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  const withBrandExp = top.filter((r) => r.influencer.brandCollaborations.length > 0).length;

  const categoryLabel =
    filters.categories.length > 0 ? filters.categories.join(", ") : filters.customCategory || "the requested niche";

  const why = [
    `These ${top.length} creators were prioritised for a strong combination of relevance to ${categoryLabel}, `,
    `an average Fit Score of ${avgScore}/100, and an average engagement rate of ${avgEr.toFixed(1)}% across their most recent analysed posts. `,
    `${dominantPlatform ? `${dominantPlatform} is the strongest-represented platform in this shortlist. ` : ""}`,
    `On average, ${avgNg}% of their tracked audience is Nigeria-based, and ${withBrandExp} of ${top.length} have at least one identifiable prior brand collaboration.`,
  ].join("");

  const riskCounts = new Map<string, number>();
  top.forEach((r) => r.score.riskFlags.forEach((f) => riskCounts.set(f.label, (riskCounts.get(f.label) ?? 0) + 1)));
  const risks = [...riskCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => `${label}: flagged for ${count} of ${top.length} shortlisted creators — reviewed individually on each profile.`);

  return { why, risks };
}
