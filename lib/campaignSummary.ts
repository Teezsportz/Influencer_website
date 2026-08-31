import { getInfluencerById } from "@/lib/discover";
import { scoreInfluencer } from "@/lib/scoring";
import { ScoringWeights, SearchFilters, ShortlistEntry, Tier } from "@/lib/types";

export interface CampaignLineItem {
  entry: ShortlistEntry;
  influencerName: string;
  influencerId: string;
  platform: string;
  tier: Tier | undefined;
  followers: number;
  fitScore: number;
  estimatedCost: number;
  costIsEstimate: boolean;
  riskCount: number;
}

export interface CampaignSummary {
  lineItems: CampaignLineItem[];
  influencerCount: number;
  tierMix: Record<string, number>;
  platformMix: Record<string, number>;
  totalEstimatedCost: number;
  combinedFollowers: number;
  estimatedPotentialReach: number;
  strengths: string[];
  gaps: string[];
}

function deliverableMultiplier(label: string): number {
  const l = label.toLowerCase();
  if (l.includes("video")) return 1.6;
  if (l.includes("story")) return 0.35;
  if (l.includes("carousel")) return 1.2;
  return 1;
}

export function buildCampaignSummary(shortlist: ShortlistEntry[], filters: SearchFilters, weights: ScoringWeights): CampaignSummary {
  const lineItems: CampaignLineItem[] = [];
  const tierMix: Record<string, number> = {};
  const platformMix: Record<string, number> = {};
  let totalCost = 0;
  let combinedFollowers = 0;
  let reachAccumulator = 0;

  for (const entry of shortlist) {
    const inf = getInfluencerById(entry.influencerId);
    if (!inf) continue;
    const platform = entry.platform;
    const followers = inf.followersByPlatform[platform] ?? 0;
    const tier = inf.tierByPlatform[platform];
    const score = scoreInfluencer(inf, platform, filters, weights);
    const costPerPost = inf.pricing.costPerPost.value;
    const costIsEstimate = inf.pricing.basis !== "rate_card";
    const deliverableCost = entry.deliverables.reduce(
      (sum, d) => sum + (costPerPost ?? 0) * deliverableMultiplier(d.label) * d.quantity,
      0,
    );

    lineItems.push({
      entry,
      influencerName: inf.name,
      influencerId: inf.id,
      platform,
      tier,
      followers,
      fitScore: score.total,
      estimatedCost: Math.round(deliverableCost),
      costIsEstimate,
      riskCount: score.riskFlags.length,
    });

    if (tier) tierMix[tier] = (tierMix[tier] ?? 0) + 1;
    platformMix[platform] = (platformMix[platform] ?? 0) + 1;
    totalCost += deliverableCost;
    combinedFollowers += followers;

    const perf = inf.performanceByPlatform[platform];
    const er = perf?.engagementRate.value ?? 2;
    // Rough, deliberately conservative "potential reach" estimate: followers scaled by
    // engagement rate as a proxy for people who actively see/interact with content.
    // This is NOT a guarantee of unique reach — audiences overlap across creators —
    // and is surfaced with that caveat in the UI rather than presented as a hard number.
    reachAccumulator += followers * Math.min(0.6, 0.15 + er / 100);
  }

  const strengths: string[] = [];
  const gaps: string[] = [];

  const tierCount = Object.keys(tierMix).length;
  const platformCount = Object.keys(platformMix).length;

  if (tierCount >= 3) strengths.push("Diversified tier mix balances reach (macro/mega) with trust and engagement (nano/micro).");
  else if (shortlist.length > 0) gaps.push("Tier mix is concentrated in one or two tiers — consider adding creators from other tiers for balance.");

  if (platformCount >= 2) strengths.push(`Multi-platform coverage across ${Object.keys(platformMix).join(", ")}.`);
  else if (shortlist.length > 0) gaps.push("Shortlist is concentrated on a single platform — consider diversifying platform coverage.");

  const avgFit = lineItems.length > 0 ? lineItems.reduce((s, i) => s + i.fitScore, 0) / lineItems.length : 0;
  if (avgFit >= 75) strengths.push(`Strong average Fit Score (${Math.round(avgFit)}/100) across the shortlist.`);
  else if (shortlist.length > 0 && avgFit < 55) gaps.push(`Average Fit Score (${Math.round(avgFit)}/100) is relatively low — review lower-scoring creators before finalising.`);

  const highRiskCount = lineItems.filter((i) => i.riskCount > 0).length;
  if (highRiskCount > 0) gaps.push(`${highRiskCount} of ${lineItems.length} shortlisted creators have at least one open risk flag to review.`);

  if (shortlist.length > 0 && shortlist.length < 5) gaps.push("Shortlist is small — a broader creator mix typically reduces single-creator dependency risk.");

  return {
    lineItems,
    influencerCount: shortlist.length,
    tierMix,
    platformMix,
    totalEstimatedCost: Math.round(totalCost),
    combinedFollowers,
    estimatedPotentialReach: Math.round(reachAccumulator),
    strengths,
    gaps,
  };
}
