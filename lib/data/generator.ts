import {
  AudienceProfile,
  BrandCollaboration,
  Category,
  ContentFormat,
  Influencer,
  Platform,
  PerformanceStats,
  PostSample,
  PricingInfo,
  Tier,
} from "@/lib/types";
import { TIER_RANGES, tierForFollowers } from "@/lib/data/tiers";
import {
  BRAND_POOL,
  CONTENT_THEME_POOL,
  FEMALE_FIRST_NAMES,
  HANDLE_SUFFIXES,
  LANGUAGES_POOL,
  LAST_NAMES,
  MALE_FIRST_NAMES,
  STATE_CITIES,
} from "@/lib/data/namePool";
import { Rng } from "@/lib/data/rng";
import { RELATED_CATEGORIES } from "@/lib/data/categoryRelations";

const SEED = 90210;
const TOTAL_INFLUENCERS = 300;

const CATEGORY_WEIGHTS: { item: Category; weight: number }[] = [
  { item: "Beauty & Skincare", weight: 9 },
  { item: "Fashion", weight: 9 },
  { item: "Lifestyle", weight: 8 },
  { item: "Food & Beverage", weight: 7 },
  { item: "Comedy", weight: 9 },
  { item: "Entertainment", weight: 8 },
  { item: "Music", weight: 6 },
  { item: "Fitness & Wellness", weight: 6 },
  { item: "Technology", weight: 5 },
  { item: "Finance", weight: 4 },
  { item: "Business & Entrepreneurship", weight: 5 },
  { item: "Sports", weight: 5 },
  { item: "Parenting & Family", weight: 4 },
  { item: "Gaming", weight: 4 },
  { item: "Travel", weight: 4 },
  { item: "Education", weight: 4 },
  { item: "Automotive", weight: 3 },
  { item: "Health & Wellness", weight: 5 },
];

const PLATFORM_PRESENCE: Record<Platform, number> = {
  Instagram: 0.82,
  TikTok: 0.68,
  YouTube: 0.3,
  Facebook: 0.22,
  X: 0.28,
  Snapchat: 0.1,
};

const PRIMARY_PRIORITY: Platform[] = ["Instagram", "TikTok", "YouTube", "Facebook", "X", "Snapchat"];

const TIER_WEIGHTS: { item: Tier; weight: number }[] = [
  { item: "Nano", weight: 35 },
  { item: "Micro", weight: 30 },
  { item: "Mid-Tier", weight: 20 },
  { item: "Macro", weight: 10 },
  { item: "Mega/Celebrity", weight: 5 },
];

const ENGAGEMENT_RANGE_BY_TIER: Record<Tier, [number, number]> = {
  Nano: [4.0, 9.5],
  Micro: [3.0, 7.0],
  "Mid-Tier": [2.0, 5.0],
  Macro: [1.2, 3.6],
  "Mega/Celebrity": [0.7, 2.5],
};

const CATEGORY_BRAND_AFFINITY: Partial<Record<Category, string[]>> = {
  "Beauty & Skincare": ["Nivea", "Zaron Cosmetics", "House of Tara", "Wella Professionals"],
  Fashion: ["Zara", "Shein Nigeria", "Temu", "Nike Africa", "Adidas Nigeria"],
  "Food & Beverage": ["Indomie", "Cowbell", "Peak Milk", "Nestle Nigeria", "Chivita", "La Casera", "Fan Milk", "Nasco Foods"],
  Technology: ["Samsung Nigeria", "Infinix Nigeria", "Tecno Mobile", "Oraimo", "Jumia"],
  Finance: ["PiggyVest", "Kuda Bank", "Opay", "GTBank", "Access Bank", "Zenith Bank", "UBA", "Fidelity Bank", "Flutterwave", "Paystack"],
  "Business & Entrepreneurship": ["Flutterwave", "Paystack", "Jumia", "Konga"],
  Sports: ["Nike Africa", "Adidas Nigeria", "MTN Nigeria", "Airtel Nigeria"],
  "Fitness & Wellness": ["Nike Africa", "Adidas Nigeria"],
  Entertainment: ["Netflix Naija", "Showmax", "Spotify Nigeria", "MTN Nigeria"],
  Music: ["Spotify Nigeria", "MTN Nigeria", "Airtel Nigeria", "Guinness Nigeria"],
  Travel: ["Travelstart", "Booking.com", "Airtel Nigeria"],
  Automotive: ["Dangote Group"],
  "Parenting & Family": ["Peak Milk", "Nestle Nigeria", "Cowbell"],
};

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function makeHandle(rng: Rng, firstName: string, lastName: string): string {
  const base = rng.bool(0.5)
    ? `${toSlug(firstName)}${toSlug(lastName)}`
    : `${toSlug(firstName)}_${toSlug(lastName)}`;
  const suffix = rng.pick(HANDLE_SUFFIXES);
  const numeric = rng.bool(0.25) ? String(rng.int(1, 99)) : "";
  return `@${base}${suffix}${numeric}`;
}

function followersForTier(rng: Rng, platform: Platform, tier: Tier): number {
  const range = TIER_RANGES[platform].find((r) => r.tier === tier)!;
  const max = range.max === Infinity ? range.min * 4 : range.max;
  return rng.int(range.min, Math.floor(max));
}

function genAudience(rng: Rng, state: string): AudienceProfile {
  // 12% of profiles simulate a weaker-than-typical Nigerian audience share,
  // intentionally, so the risk-flag / audience-mismatch logic has real cases to catch.
  const isMismatch = rng.bool(0.12);
  const nigeriaPct = isMismatch ? rng.int(38, 64) : rng.int(72, 98);
  const otherStates = STATE_CITIES.map((s) => s.state).filter((s) => s !== state);
  const secondaryStates = rng.pickMany(otherStates, 2);
  const primaryPct = rng.int(30, 55);
  const remaining = 100 - primaryPct;
  const topStates = [
    { state, pct: primaryPct },
    { state: secondaryStates[0], pct: Math.round(remaining * 0.6) },
    { state: secondaryStates[1], pct: Math.round(remaining * 0.4) },
  ];

  const a1 = rng.int(8, 20);
  const a2 = rng.int(28, 42);
  const a3 = rng.int(20, 32);
  const rest = Math.max(0, 100 - a1 - a2 - a3);
  const a4 = Math.round(rest * 0.7);
  const a5 = rest - a4;

  const malePct = rng.int(30, 70);

  return {
    nigeriaPct: { value: nigeriaPct, source: rng.bool(0.7) ? "public" : "estimated" },
    topStates,
    ageRange: [
      { range: "13-17", pct: a1 },
      { range: "18-24", pct: a2 },
      { range: "25-34", pct: a3 },
      { range: "35-44", pct: a4 },
      { range: "45+", pct: a5 },
    ],
    genderSplit: { male: malePct, female: 100 - malePct },
    source: "estimated",
  };
}

function genPerformance(
  rng: Rng,
  platform: Platform,
  followers: number,
  tier: Tier,
  postingFrequencyPerWeek: number,
): PerformanceStats {
  const [erMin, erMax] = ENGAGEMENT_RANGE_BY_TIER[tier];
  const engagementRate = Number(rng.float(erMin, erMax).toFixed(2));
  const avgLikes = Math.round(followers * (engagementRate / 100) * rng.float(0.75, 0.95));
  const avgComments = Math.round(avgLikes * rng.float(0.02, 0.07));
  const isVideoHeavy = platform === "TikTok" || platform === "YouTube";
  const viewMultiplier = platform === "TikTok" ? rng.float(0.6, 3.2) : platform === "YouTube" ? rng.float(0.3, 1.4) : rng.float(0.15, 0.6);
  const avgViews = isVideoHeavy || rng.bool(0.6) ? Math.round(followers * viewMultiplier) : null;
  const avgShares = Math.round(avgLikes * rng.float(0.03, 0.12));
  const savesAvailable = platform === "Instagram" && rng.bool(0.55);
  const avgSaves = savesAvailable ? Math.round(avgLikes * rng.float(0.05, 0.18)) : null;
  const reachAvailable = rng.bool(0.35);
  const avgReach = reachAvailable ? Math.round(followers * rng.float(0.4, 1.6)) : null;
  const growthAvailable = rng.bool(0.85);
  const growthTrend = growthAvailable ? Number(rng.float(-4, 38).toFixed(1)) : null;

  return {
    analysisPeriod: "Last 90 days",
    postsAnalysed: 15,
    dataSource: "public",
    engagementRate: { value: engagementRate, source: "public" },
    avgLikes: { value: avgLikes, source: "public" },
    avgComments: { value: avgComments, source: "public" },
    avgSharesReposts: { value: avgShares, source: platform === "X" || platform === "Facebook" ? "public" : "estimated" },
    avgSaves: { value: avgSaves, source: avgSaves ? "creator_authorised" : "unavailable" },
    avgViews: { value: avgViews, source: avgViews ? "public" : "unavailable" },
    avgReachImpressions: { value: avgReach, source: avgReach ? "creator_authorised" : "unavailable" },
    engagementPerFollower: { value: Number((engagementRate / 100).toFixed(4)), source: "public" },
    postsPerWeek: postingFrequencyPerWeek,
    growthTrend90d: { value: growthTrend, source: growthTrend !== null ? "estimated" : "unavailable" },
  };
}

function genRecentPosts(rng: Rng, platform: Platform, perf: PerformanceStats, category: Category, brands: string[]): PostSample[] {
  const themes = CONTENT_THEME_POOL[category] ?? ["lifestyle content"];
  const posts: PostSample[] = [];
  const formatsByPlatform: Record<Platform, PostSample["format"][]> = {
    Instagram: ["Reel", "Image", "Carousel", "Story"],
    TikTok: ["Video"],
    YouTube: ["Video", "Short"],
    Facebook: ["Video", "Image"],
    X: ["Image", "Story"],
    Snapchat: ["Story"],
  };
  const formats = formatsByPlatform[platform];
  const baseLikes = perf.avgLikes.value ?? 100;
  const baseComments = perf.avgComments.value ?? 5;
  const baseViews = perf.avgViews.value;

  for (let i = 0; i < 15; i++) {
    const daysAgo = i * rng.int(2, 6) + rng.int(0, 2);
    const variance = rng.float(0.6, 1.5);
    const isSponsored = rng.bool(0.18) && brands.length > 0;
    posts.push({
      id: `p${i}`,
      postedAt: new Date(Date.now() - daysAgo * 86400000).toISOString(),
      format: rng.pick(formats),
      likes: Math.max(5, Math.round(baseLikes * variance)),
      comments: Math.max(0, Math.round(baseComments * variance)),
      shares: { value: Math.round((perf.avgSharesReposts.value ?? 0) * variance), source: perf.avgSharesReposts.source },
      saves: { value: perf.avgSaves.value ? Math.round(perf.avgSaves.value * variance) : null, source: perf.avgSaves.source },
      views: { value: baseViews ? Math.round(baseViews * variance) : null, source: perf.avgViews.source },
      caption: `${rng.pick(themes)} — episode ${15 - i}`,
      isSponsored,
      brand: isSponsored ? rng.pick(brands) : undefined,
    });
  }
  return posts;
}

function genBrandCollabs(rng: Rng, category: Category): BrandCollaboration[] {
  const affinity = CATEGORY_BRAND_AFFINITY[category] ?? [];
  const pool = affinity.length > 0 && rng.bool(0.75) ? [...affinity, ...rng.pickMany(BRAND_POOL, 3)] : BRAND_POOL;
  const count = rng.weighted([
    { item: 0, weight: 15 },
    { item: 1, weight: 20 },
    { item: 2, weight: 25 },
    { item: 3, weight: 20 },
    { item: 4, weight: 12 },
    { item: 5, weight: 8 },
  ]);
  const chosen = rng.pickMany(pool, count);
  const disclosures: BrandCollaboration["disclosure"][] = [
    "Disclosed (#ad/#sponsored)",
    "Disclosed (#ad/#sponsored)",
    "Paid Partnership Tag",
    "Not clearly disclosed",
    "Unverified",
  ];
  return chosen.map((brand) => {
    const monthsAgo = rng.int(0, 22);
    const d = new Date();
    d.setMonth(d.getMonth() - monthsAgo);
    return {
      brand,
      approxDate: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      campaignCategory: category,
      disclosure: rng.pick(disclosures),
    };
  });
}

function genPricing(tier: Tier, followers: number, rng: Rng): PricingInfo {
  const baseByTier: Record<Tier, number> = {
    Nano: 25_000,
    Micro: 90_000,
    "Mid-Tier": 300_000,
    Macro: 950_000,
    "Mega/Celebrity": 3_500_000,
  };
  const jitter = rng.float(0.75, 1.35);
  const costPerPost = Math.round((baseByTier[tier] * jitter) / 1000) * 1000;
  return {
    costPerPost: { value: costPerPost, source: "estimated" },
    costPerVideo: { value: Math.round((costPerPost * rng.float(1.2, 1.9)) / 1000) * 1000, source: "estimated" },
    costPerCampaign: { value: Math.round((costPerPost * rng.float(2.5, 4.5)) / 1000) * 1000, source: "estimated" },
    currency: "NGN",
    basis: "estimated_from_tier_benchmarks",
  };
}

function genDaysAgoISO(rng: Rng, minDays: number, maxDays: number): string {
  const days = rng.int(minDays, maxDays);
  return new Date(Date.now() - days * 86400000).toISOString();
}

function buildInfluencer(rng: Rng, index: number): Influencer {
  const isFemale = rng.bool(0.55);
  const firstName = isFemale ? rng.pick(FEMALE_FIRST_NAMES) : rng.pick(MALE_FIRST_NAMES);
  const lastName = rng.pick(LAST_NAMES);
  const name = `${firstName} ${lastName}`;
  const handle = makeHandle(rng, firstName, lastName);

  const platforms = (Object.keys(PLATFORM_PRESENCE) as Platform[]).filter((p) => rng.bool(PLATFORM_PRESENCE[p]));
  if (platforms.length === 0) platforms.push("Instagram");

  const primaryPlatform = rng.bool(0.65)
    ? PRIMARY_PRIORITY.find((p) => platforms.includes(p))!
    : rng.pick(platforms);

  const primaryCategory = rng.weighted(CATEGORY_WEIGHTS);
  const categories: Category[] = [primaryCategory];
  if (rng.bool(0.3)) {
    const related = RELATED_CATEGORIES[primaryCategory];
    if (related && related.length > 0) categories.push(rng.pick(related));
  }

  const stateEntry = rng.weighted(
    STATE_CITIES.map((s, i) => ({ item: s, weight: i === 0 ? 30 : i === 1 ? 15 : i <= 4 ? 8 : 4 })),
  );
  const city = rng.pick(stateEntry.cities);

  const languages = ["English"];
  if (rng.bool(0.7)) languages.push("Pidgin");
  if (rng.bool(0.5)) languages.push(rng.pick(LANGUAGES_POOL.filter((l) => l !== "English" && l !== "Pidgin")));

  const baseTier = rng.weighted(TIER_WEIGHTS);
  const postingFrequencyPerWeek = rng.int(1, 12);

  const followersByPlatform: Partial<Record<Platform, number>> = {};
  const tierByPlatform: Partial<Record<Platform, Tier>> = {};
  const performanceByPlatform: Partial<Record<Platform, PerformanceStats>> = {};
  const recentPosts: Partial<Record<Platform, PostSample[]>> = {};
  const handles: Partial<Record<Platform, string>> = {};

  const brandNames = genBrandCollabs(rng, primaryCategory);

  for (const platform of platforms) {
    const tierJitter = rng.bool(0.75) ? baseTier : rng.pick(TIER_WEIGHTS).item;
    const followers = followersForTier(rng, platform, tierJitter);
    const actualTier = tierForFollowers(platform, followers);
    followersByPlatform[platform] = followers;
    tierByPlatform[platform] = actualTier;
    handles[platform] = `${handle}${platform === primaryPlatform ? "" : ""}`;
    const perf = genPerformance(rng, platform, followers, actualTier, postingFrequencyPerWeek);
    performanceByPlatform[platform] = perf;
    if (platform === primaryPlatform) {
      recentPosts[platform] = genRecentPosts(rng, platform, perf, primaryCategory, brandNames.map((b) => b.brand));
    }
  }

  const contentFormat: ContentFormat =
    primaryPlatform === "TikTok" || primaryPlatform === "YouTube"
      ? "Video-first"
      : primaryPlatform === "Instagram"
      ? rng.bool(0.55)
        ? "Mixed"
        : "Image-first"
      : "Mixed";

  const flagged = rng.bool(0.06);
  const brandSafetyNotes = flagged
    ? [
        rng.pick([
          "One brand-sensitive comment surfaced during monitoring; reviewed with no further action.",
          "Occasional mature-language content flagged in a small share of posts.",
          "One instance of unclear sponsored-content disclosure noted.",
        ]),
      ]
    : [];

  const lastActiveAt = rng.bool(0.85) ? genDaysAgoISO(rng, 0, 21) : genDaysAgoISO(rng, 45, 150);
  const joinedPlatformAt = genDaysAgoISO(rng, 365, 365 * 8);

  const themes = CONTENT_THEME_POOL[primaryCategory] ?? [];

  return {
    id: `inf-${String(index).padStart(4, "0")}`,
    name,
    handle,
    avatarSeed: handle,
    platforms,
    primaryPlatform,
    handles,
    categories,
    tierByPlatform,
    followersByPlatform,
    location: { city, state: stateEntry.state },
    languages: Array.from(new Set(languages)),
    contentFormat,
    postingFrequencyPerWeek,
    bio: `${primaryCategory} creator based in ${city}, ${stateEntry.state}. Sharing ${rng.pick(themes) ?? "content"} for a growing Nigerian audience.`,
    audience: genAudience(rng, stateEntry.state),
    performanceByPlatform,
    recentPosts,
    brandCollaborations: brandNames,
    pricing: genPricing(tierByPlatform[primaryPlatform] ?? baseTier, followersByPlatform[primaryPlatform] ?? 10000, rng),
    contentThemes: rng.pickMany(themes, Math.min(themes.length, rng.int(2, 4))),
    brandSafety: { flagged, notes: brandSafetyNotes },
    lastActiveAt,
    joinedPlatformAt,
  };
}

function generateAll(): Influencer[] {
  const rng = new Rng(SEED);
  const out: Influencer[] = [];
  for (let i = 1; i <= TOTAL_INFLUENCERS; i++) {
    out.push(buildInfluencer(rng, i));
  }
  return out;
}

let cached: Influencer[] | null = null;

export function getInfluencers(): Influencer[] {
  if (!cached) cached = generateAll();
  return cached;
}
