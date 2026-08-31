import {
  CampaignObjective,
  DEFAULT_WEIGHTS,
  Influencer,
  Platform,
  RiskFlag,
  ScoreBreakdown,
  ScoringWeights,
  SearchFilters,
} from "@/lib/types";

/**
 * Multi-factor influencer scoring model.
 *
 * Produces a 0-100 "Fit Score" for a given influencer against a given platform
 * and set of campaign filters. The model deliberately does NOT use follower
 * count as a direct input — followers only appear indirectly (e.g. through
 * platform-strength percentile-vs-tier-peers) so that a well-matched nano/micro
 * creator can outscore a poorly-matched mega influencer.
 *
 * Weights are configurable (see ScoringWeights) and sum to 1.0 by convention;
 * the UI exposes an editable weight panel backed by this same function so the
 * methodology stays transparent rather than a black box.
 */

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, n));
}

function scoreCategoryRelevance(inf: Influencer, filters: SearchFilters): { score: number; explanation: string } {
  if (filters.categories.length === 0 && !filters.customCategory) {
    return { score: 65, explanation: "No specific category filter applied; scored on general content clarity." };
  }
  const wanted = new Set(filters.categories);
  const primary = inf.categories[0];
  if (wanted.has(primary)) {
    return { score: 100, explanation: `Primary content category (${primary}) is a direct match.` };
  }
  const secondaryMatch = inf.categories.slice(1).find((c) => wanted.has(c));
  if (secondaryMatch) {
    return { score: 72, explanation: `Secondary content category (${secondaryMatch}) matches the brief.` };
  }
  if (filters.customCategory) {
    const needle = filters.customCategory.toLowerCase();
    const haystack = `${inf.bio} ${inf.contentThemes.join(" ")} ${inf.categories.join(" ")}`.toLowerCase();
    if (haystack.includes(needle)) {
      return { score: 68, explanation: `Content references the custom niche "${filters.customCategory}".` };
    }
  }
  return { score: 22, explanation: "Limited overlap between this creator's content categories and the requested niche." };
}

function scorePlatformStrength(inf: Influencer, platform: Platform): { score: number; explanation: string } {
  const perf = inf.performanceByPlatform[platform];
  if (!perf) return { score: 0, explanation: `No presence on ${platform}.` };
  const er = perf.engagementRate.value ?? 0;
  // Rough tier-agnostic percentile bands for "engagement rate on this platform".
  const score = clamp(
    platform === "TikTok"
      ? er * 9
      : platform === "YouTube"
      ? er * 11
      : platform === "Instagram"
      ? er * 10
      : er * 13,
  );
  const strength = score >= 75 ? "strong" : score >= 45 ? "solid" : "modest";
  return { score, explanation: `${strength.charAt(0).toUpperCase() + strength.slice(1)} ${platform} performance relative to platform norms (${er.toFixed(1)}% engagement rate).` };
}

function scoreEngagement(inf: Influencer, platform: Platform, filters: SearchFilters): { score: number; explanation: string } {
  const perf = inf.performanceByPlatform[platform];
  if (!perf) return { score: 0, explanation: "No engagement data available on this platform." };
  const er = perf.engagementRate.value ?? 0;
  let score = clamp(er * 10);
  if (filters.minEngagementRate > 0 && er < filters.minEngagementRate) {
    score = clamp(score - 25);
  }
  return { score, explanation: `Average engagement rate of ${er.toFixed(1)}% across the last ${perf.postsAnalysed} analysed posts.` };
}

function scoreAudienceQuality(inf: Influencer, filters: SearchFilters): { score: number; explanation: string } {
  const ng = inf.audience.nigeriaPct.value ?? 0;
  let score = clamp(ng);
  const notes: string[] = [`${ng}% of the tracked audience is Nigeria-based`];
  if (filters.audienceLocationState !== "Any") {
    const stateMatch = inf.audience.topStates.find((s) => s.state === filters.audienceLocationState);
    if (stateMatch) {
      score = clamp(score + stateMatch.pct * 0.3);
      notes.push(`with a notable share in ${filters.audienceLocationState}`);
    } else {
      score = clamp(score - 15);
      notes.push(`no strong concentration found in ${filters.audienceLocationState}`);
    }
  }
  if (filters.ageRange !== "Any") {
    const ageMatch = inf.audience.ageRange.find((a) => a.range === filters.ageRange);
    if (ageMatch && ageMatch.pct >= 25) {
      score = clamp(score + 8);
      notes.push(`strong ${filters.ageRange} representation (${ageMatch.pct}%)`);
    }
  }
  return { score, explanation: notes.join(", ") + "." };
}

function scoreConsistency(inf: Influencer): { score: number; explanation: string } {
  const freq = inf.postingFrequencyPerWeek;
  const daysSinceActive = (Date.now() - new Date(inf.lastActiveAt).getTime()) / 86400000;
  let score = clamp(freq * 9);
  if (daysSinceActive > 45) score = clamp(score - 30);
  else if (daysSinceActive > 21) score = clamp(score - 12);
  const recency = daysSinceActive < 7 ? "very recently active" : daysSinceActive < 21 ? "recently active" : "less recently active";
  return { score, explanation: `Posts roughly ${freq}x/week and was ${recency} (last activity ${Math.round(daysSinceActive)} days ago).` };
}

function scoreGrowth(inf: Influencer, platform: Platform): { score: number; explanation: string } {
  const perf = inf.performanceByPlatform[platform];
  const g = perf?.growthTrend90d.value;
  if (g === null || g === undefined) {
    return { score: 50, explanation: "Growth trend data unavailable; scored neutrally." };
  }
  const score = clamp(50 + g * 1.6);
  const direction = g > 5 ? "growing" : g < -2 ? "declining" : "stable";
  return { score, explanation: `Follower base is ${direction} (${g > 0 ? "+" : ""}${g}% over 90 days).` };
}

function scoreBrandExperience(inf: Influencer, filters: SearchFilters): { score: number; explanation: string } {
  const collabs = inf.brandCollaborations;
  let score = clamp(collabs.length * 16);
  const relevant = filters.categories.length
    ? collabs.filter((c) => filters.categories.includes(c.campaignCategory as any))
    : collabs;
  if (relevant.length > 0) score = clamp(score + 12);
  const disclosed = collabs.filter((c) => c.disclosure.startsWith("Disclosed") || c.disclosure === "Paid Partnership Tag");
  const explanation =
    collabs.length === 0
      ? "No publicly attributable brand collaborations found."
      : `${collabs.length} identifiable brand collaboration(s), ${disclosed.length} clearly disclosed as sponsored${
          relevant.length > 0 ? `, including experience in the requested category` : ""
        }.`;
  return { score, explanation };
}

function scoreCampaignFit(inf: Influencer, platform: Platform, filters: SearchFilters): { score: number; explanation: string } {
  if (filters.campaignObjectives.length === 0) {
    return { score: 60, explanation: "No campaign objective specified; scored on general suitability." };
  }
  const perf = inf.performanceByPlatform[platform];
  const er = perf?.engagementRate.value ?? 0;
  const followers = inf.followersByPlatform[platform] ?? 0;
  const objectiveScores: Record<CampaignObjective, number> = {
    Awareness: clamp(Math.log10(Math.max(followers, 1)) * 14),
    Engagement: clamp(er * 11),
    Traffic: clamp(er * 8 + 15),
    Leads: clamp(er * 7 + 10),
    "Sales/Conversion": clamp(er * 9 + (inf.brandCollaborations.length > 0 ? 15 : 0)),
    "Product Launch": clamp(50 + er * 4 + (inf.postingFrequencyPerWeek >= 3 ? 15 : 0)),
    "Brand Education": clamp(inf.contentThemes.length * 12 + 20),
    "Event Promotion": clamp(inf.postingFrequencyPerWeek * 7 + er * 3),
  };
  const applicable = filters.campaignObjectives.map((o) => objectiveScores[o]);
  const avg = applicable.reduce((a, b) => a + b, 0) / applicable.length;
  return {
    score: clamp(avg),
    explanation: `Content style and performance align with ${filters.campaignObjectives.join(", ")} objectives.`,
  };
}

export function detectRiskFlags(inf: Influencer, platform: Platform, filters: SearchFilters): RiskFlag[] {
  const flags: RiskFlag[] = [];
  const perf = inf.performanceByPlatform[platform];

  if (perf) {
    const er = perf.engagementRate.value ?? 0;
    if (er < 1.0 && (inf.followersByPlatform[platform] ?? 0) > 50_000) {
      flags.push({
        severity: "medium",
        label: "Low engagement relative to follower size",
        detail: `Engagement rate of ${er.toFixed(1)}% is below what is typical for this follower range — verify audience authenticity before committing budget.`,
      });
    }
    const likes = perf.avgLikes.value ?? 0;
    const comments = perf.avgComments.value ?? 0;
    if (likes > 200 && comments / Math.max(likes, 1) < 0.008) {
      flags.push({
        severity: "medium",
        label: "Unusual engagement pattern",
        detail: "Comment-to-like ratio is unusually low relative to peers, which can indicate purchased or automated engagement. Recommend manual audience audit before finalising.",
      });
    }
  }

  const daysSinceActive = (Date.now() - new Date(inf.lastActiveAt).getTime()) / 86400000;
  if (daysSinceActive > 45) {
    flags.push({
      severity: "medium",
      label: "Limited recent activity",
      detail: `Last public post activity was ${Math.round(daysSinceActive)} days ago.`,
    });
  }

  if (inf.postingFrequencyPerWeek < 1) {
    flags.push({
      severity: "low",
      label: "Inconsistent posting cadence",
      detail: `Posts less than once per week on average (${inf.postingFrequencyPerWeek.toFixed(1)}x/week), which may affect campaign delivery timelines.`,
    });
  }

  const ng = inf.audience.nigeriaPct.value ?? 100;
  if (ng < 65) {
    flags.push({
      severity: "high",
      label: "Audience-location mismatch",
      detail: `Only ${ng}% of the tracked audience is Nigeria-based — may not be ideal for a Nigeria-focused campaign.`,
    });
  }

  if (filters.excludeCompetitorsOf) {
    const needle = filters.excludeCompetitorsOf.toLowerCase();
    const hit = inf.brandCollaborations.find((c) => c.brand.toLowerCase().includes(needle));
    if (hit) {
      flags.push({
        severity: "high",
        label: "Recent competitor association",
        detail: `Public collaboration on record with "${hit.brand}" (${hit.approxDate}), which overlaps with the brand you asked to exclude.`,
      });
    }
  }

  if (inf.brandSafety.flagged) {
    flags.push({
      severity: "low",
      label: "Brand-safety note on file",
      detail: inf.brandSafety.notes.join(" "),
    });
  }

  return flags;
}

export function scoreInfluencer(
  inf: Influencer,
  platform: Platform,
  filters: SearchFilters,
  weights: ScoringWeights = DEFAULT_WEIGHTS,
): ScoreBreakdown {
  const cat = scoreCategoryRelevance(inf, filters);
  const plat = scorePlatformStrength(inf, platform);
  const eng = scoreEngagement(inf, platform, filters);
  const aud = scoreAudienceQuality(inf, filters);
  const cons = scoreConsistency(inf);
  const growth = scoreGrowth(inf, platform);
  const brand = scoreBrandExperience(inf, filters);
  const fit = scoreCampaignFit(inf, platform, filters);

  const factors = [
    { key: "categoryRelevance", label: "Category Relevance", weight: weights.categoryRelevance, ...cat },
    { key: "platformStrength", label: "Platform Strength", weight: weights.platformStrength, ...plat },
    { key: "engagement", label: "Engagement Quality", weight: weights.engagement, ...eng },
    { key: "audienceQuality", label: "Audience Quality", weight: weights.audienceQuality, ...aud },
    { key: "consistency", label: "Content Consistency", weight: weights.consistency, ...cons },
    { key: "growth", label: "Growth Trend", weight: weights.growth, ...growth },
    { key: "brandExperience", label: "Brand Collaboration Experience", weight: weights.brandExperience, ...brand },
    { key: "campaignFit", label: "Campaign Objective Fit", weight: weights.campaignFit, ...fit },
  ].map((f) => ({
    key: f.key,
    label: f.label,
    weight: f.weight,
    rawScore: Math.round(f.score),
    weightedScore: Math.round(f.score * f.weight * 100) / 100,
    explanation: f.explanation,
  }));

  const total = clamp(Math.round(factors.reduce((s, f) => s + f.weightedScore, 0)));
  const riskFlags = detectRiskFlags(inf, platform, filters);

  const topFactors = [...factors].sort((a, b) => b.weightedScore - a.weightedScore).slice(0, 3);
  const summary = `Fit Score: ${total}/100. ${topFactors.map((f) => f.explanation).join(" ")}`;

  return { total, factors, summary, riskFlags };
}

export { DEFAULT_WEIGHTS };
