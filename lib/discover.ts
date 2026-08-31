import { getInfluencers } from "@/lib/data/generator";
import { tierForFollowers, TIER_RANGES } from "@/lib/data/tiers";
import { RELATED_CATEGORIES } from "@/lib/data/categoryRelations";
import { scoreInfluencer } from "@/lib/scoring";
import {
  Category,
  DEFAULT_WEIGHTS,
  Influencer,
  Platform,
  PLATFORMS,
  ScoreBreakdown,
  ScoringWeights,
  SearchFilters,
  Tier,
  TIERS,
} from "@/lib/types";

export interface DiscoverResult {
  influencer: Influencer;
  platform: Platform;
  score: ScoreBreakdown;
}

export interface DiscoverResponse {
  results: DiscoverResult[];
  relaxationNotes: string[];
  hardFiltersUsed: string[];
  totalCandidatesConsidered: number;
}

const MINIMUM_TARGET = 20;

type CategoryMode = "exact" | "related" | "any";

function categoryMatches(inf: Influencer, filters: SearchFilters, mode: CategoryMode): boolean {
  if (filters.categories.length === 0 && !filters.customCategory) return true;
  if (mode === "any") return true;

  const customHit =
    !!filters.customCategory &&
    `${inf.bio} ${inf.contentThemes.join(" ")} ${inf.categories.join(" ")}`
      .toLowerCase()
      .includes(filters.customCategory.toLowerCase());
  if (customHit) return true;
  if (filters.categories.length === 0) return false;

  const exactHit = inf.categories.some((c) => filters.categories.includes(c));
  if (exactHit) return true;
  if (mode === "exact") return false;

  // mode === "related": accept if the influencer's category is adjacent to any requested category.
  const acceptable = new Set<Category>();
  filters.categories.forEach((c) => {
    acceptable.add(c);
    (RELATED_CATEGORIES[c] ?? []).forEach((r) => acceptable.add(r));
  });
  return inf.categories.some((c) => acceptable.has(c));
}

function passesHardFilters(inf: Influencer, platform: Platform, tier: Tier, filters: SearchFilters, relaxed: Set<string>): boolean {
  const followers = inf.followersByPlatform[platform] ?? 0;
  const perf = inf.performanceByPlatform[platform];

  if (!relaxed.has("tiers") && filters.tiers.length > 0 && !filters.tiers.includes(tier)) return false;
  if (!relaxed.has("minFollowers") && followers < filters.minFollowers) return false;
  if (!relaxed.has("minAvgViews") && filters.minAvgViews > 0) {
    const views = perf?.avgViews.value ?? 0;
    if (views < filters.minAvgViews) return false;
  }
  if (!relaxed.has("contentFormat") && filters.contentFormat !== "Any" && inf.contentFormat !== filters.contentFormat) return false;
  if (!relaxed.has("language") && filters.language !== "Any" && !inf.languages.includes(filters.language)) return false;
  if (!relaxed.has("requireBrandExperience") && filters.requireBrandExperience && inf.brandCollaborations.length === 0) return false;
  if (!relaxed.has("budget")) {
    const cpp = inf.pricing.costPerPost.value ?? 0;
    if (filters.budgetMax > 0 && cpp > filters.budgetMax) return false;
    if (filters.budgetMin > 0 && cpp < filters.budgetMin) return false;
  }
  if (!relaxed.has("minEngagementRate") && filters.minEngagementRate > 0) {
    const er = perf?.engagementRate.value ?? 0;
    if (er < filters.minEngagementRate) return false;
  }
  return true;
}

function adjacentTiers(tiers: Tier[]): Tier[] {
  const set = new Set(tiers);
  for (const t of tiers) {
    const idx = TIERS.indexOf(t);
    if (idx > 0) set.add(TIERS[idx - 1]);
    if (idx < TIERS.length - 1) set.add(TIERS[idx + 1]);
  }
  return Array.from(set);
}

/**
 * Runs the discovery/search + multi-factor scoring pipeline.
 *
 * Category, platform and tier are applied as structural hard filters first —
 * a search for "Beauty & Skincare on Instagram, Micro tier" should return
 * beauty creators, not the full 300-profile universe re-sorted by score.
 * If fewer than MINIMUM_TARGET candidates survive, the engine progressively
 * relaxes constraints in an order chosen to preserve campaign intent as much
 * as possible — secondary filters first, then category (exact → related →
 * dropped), then tier range, then platform scope — logging every relaxation
 * so the UI can explain exactly why a given result appears.
 */
export function discoverInfluencers(filters: SearchFilters, weights: ScoringWeights = DEFAULT_WEIGHTS): DiscoverResponse {
  const all = getInfluencers();
  const relaxationNotes: string[] = [];
  const relaxed = new Set<string>();
  const platformScope = filters.platforms.length > 0 ? filters.platforms : PLATFORMS;

  const relaxationSteps: { key: string; note: string }[] = [
    { key: "budget", note: "Budget range constraint relaxed to reach a viable shortlist." },
    { key: "contentFormat", note: "Content-format constraint relaxed." },
    { key: "language", note: "Language constraint relaxed." },
    { key: "minAvgViews", note: "Minimum average-views threshold relaxed." },
    { key: "minEngagementRate", note: "Minimum engagement-rate threshold relaxed (still factored into scoring)." },
    { key: "requireBrandExperience", note: "Prior brand-experience requirement relaxed." },
  ];

  function runPass(tiersToUse: Tier[], platformsToUse: Platform[], categoryMode: CategoryMode): DiscoverResult[] {
    const out: DiscoverResult[] = [];
    for (const inf of all) {
      if (!categoryMatches(inf, filters, categoryMode)) continue;
      const candidatePlatforms = inf.platforms.filter((p) => platformsToUse.includes(p));
      if (candidatePlatforms.length === 0) continue;

      let best: DiscoverResult | null = null;
      for (const platform of candidatePlatforms) {
        const followers = inf.followersByPlatform[platform];
        if (followers === undefined) continue;
        const tier = tierForFollowers(platform, followers);
        if (tiersToUse.length > 0 && !tiersToUse.includes(tier)) continue;
        if (!passesHardFilters(inf, platform, tier, filters, relaxed)) continue;
        const score = scoreInfluencer(inf, platform, filters, weights);
        if (!best || score.total > best.score.total) {
          best = { influencer: inf, platform, score };
        }
      }
      if (best) out.push(best);
    }
    return out.sort((a, b) => b.score.total - a.score.total);
  }

  let tiersToUse = filters.tiers;
  let platformsToUse = platformScope;
  let categoryMode: CategoryMode = "exact";
  let results = runPass(tiersToUse, platformsToUse, categoryMode);

  // Progressive relaxation of secondary constraints.
  for (const step of relaxationSteps) {
    if (results.length >= MINIMUM_TARGET) break;
    relaxed.add(step.key);
    const next = runPass(tiersToUse, platformsToUse, categoryMode);
    if (next.length > results.length) {
      relaxationNotes.push(step.note);
      results = next;
    }
  }

  // Broaden category match to closely related categories before giving up on category entirely.
  if (results.length < MINIMUM_TARGET && categoryMode === "exact" && (filters.categories.length > 0 || filters.customCategory)) {
    const next = runPass(tiersToUse, platformsToUse, "related");
    if (next.length > results.length) {
      relaxationNotes.push("Category match broadened to closely related niches — too few exact-category matches for a reliable shortlist.");
      categoryMode = "related";
      results = next;
    }
  }

  // Expand tier range to adjacent tiers if still short.
  if (results.length < MINIMUM_TARGET && tiersToUse.length > 0) {
    const expanded = adjacentTiers(tiersToUse);
    if (expanded.length > tiersToUse.length) {
      const next = runPass(expanded, platformsToUse, categoryMode);
      if (next.length > results.length) {
        relaxationNotes.push(
          `Tier range broadened to include adjacent tiers (${expanded.join(", ")}) — too few exact-tier matches for a reliable shortlist.`,
        );
        tiersToUse = expanded;
        results = next;
      }
    }
  }

  // Drop tier constraint entirely if still short.
  if (results.length < MINIMUM_TARGET && tiersToUse.length > 0) {
    const next = runPass([], platformsToUse, categoryMode);
    if (next.length > results.length) {
      relaxationNotes.push("Influencer-tier filter removed entirely — too few matches across the requested tiers.");
      tiersToUse = [];
      results = next;
    }
  }

  // Expand platform scope to all platforms if still short.
  if (results.length < MINIMUM_TARGET && platformsToUse.length < PLATFORMS.length) {
    const next = runPass(tiersToUse, PLATFORMS, categoryMode);
    if (next.length > results.length) {
      relaxationNotes.push("Platform scope broadened to all platforms — the requested platform(s) alone had too few matches.");
      platformsToUse = PLATFORMS;
      results = next;
    }
  }

  // Last resort: drop category matching entirely (still heavily scored, so relevant creators rank first).
  if (results.length < MINIMUM_TARGET && (categoryMode as CategoryMode) !== "any" && (filters.categories.length > 0 || filters.customCategory)) {
    const next = runPass(tiersToUse, platformsToUse, "any");
    if (next.length > results.length) {
      relaxationNotes.push("Category filter removed entirely — too few matches even in related niches. Remaining results are ranked by overall Fit Score.");
      categoryMode = "any";
      results = next;
    }
  }

  return {
    results,
    relaxationNotes,
    hardFiltersUsed: Array.from(relaxed),
    totalCandidatesConsidered: all.length,
  };
}

export function getInfluencerById(id: string): Influencer | undefined {
  return getInfluencers().find((i) => i.id === id);
}

export { TIER_RANGES };
