// Core domain types for the Nigerian Influencer Discovery & Intelligence Platform.
// See /lib/data/tiers.ts for platform-specific tier follower-range definitions,
// and /README.md for the data-compliance model these types are built around.

export type Platform =
  | "Instagram"
  | "TikTok"
  | "YouTube"
  | "Facebook"
  | "X"
  | "Snapchat";

export const PLATFORMS: Platform[] = [
  "Instagram",
  "TikTok",
  "YouTube",
  "Facebook",
  "X",
  "Snapchat",
];

export type Category =
  | "Beauty & Skincare"
  | "Fashion"
  | "Lifestyle"
  | "Food & Beverage"
  | "Technology"
  | "Finance"
  | "Business & Entrepreneurship"
  | "Comedy"
  | "Entertainment"
  | "Music"
  | "Sports"
  | "Fitness & Wellness"
  | "Parenting & Family"
  | "Gaming"
  | "Travel"
  | "Education"
  | "Automotive"
  | "Health & Wellness";

export const CATEGORIES: Category[] = [
  "Beauty & Skincare",
  "Fashion",
  "Lifestyle",
  "Food & Beverage",
  "Technology",
  "Finance",
  "Business & Entrepreneurship",
  "Comedy",
  "Entertainment",
  "Music",
  "Sports",
  "Fitness & Wellness",
  "Parenting & Family",
  "Gaming",
  "Travel",
  "Education",
  "Automotive",
  "Health & Wellness",
];

export type Tier = "Nano" | "Micro" | "Mid-Tier" | "Macro" | "Mega/Celebrity";

export const TIERS: Tier[] = ["Nano", "Micro", "Mid-Tier", "Macro", "Mega/Celebrity"];

export type CampaignObjective =
  | "Awareness"
  | "Engagement"
  | "Traffic"
  | "Leads"
  | "Sales/Conversion"
  | "Product Launch"
  | "Brand Education"
  | "Event Promotion";

export const CAMPAIGN_OBJECTIVES: CampaignObjective[] = [
  "Awareness",
  "Engagement",
  "Traffic",
  "Leads",
  "Sales/Conversion",
  "Product Launch",
  "Brand Education",
  "Event Promotion",
];

export type ContentFormat = "Video-first" | "Image-first" | "Mixed";

/** Marks how a data point was obtained — surfaced throughout the UI per the platform's data-compliance policy. */
export type DataSource = "public" | "creator_authorised" | "estimated" | "unavailable";

export interface ValueWithSource<T> {
  value: T | null;
  source: DataSource;
}

export interface PostSample {
  id: string;
  postedAt: string; // ISO date
  format: "Reel" | "Video" | "Image" | "Carousel" | "Short" | "Story" | "Live";
  likes: number;
  comments: number;
  shares: ValueWithSource<number>;
  saves: ValueWithSource<number>;
  views: ValueWithSource<number>;
  caption: string;
  isSponsored: boolean;
  brand?: string;
}

export interface BrandCollaboration {
  brand: string;
  approxDate: string; // "2025-11" style, or "Undated" if unknown
  campaignCategory: Category | string;
  disclosure: "Disclosed (#ad/#sponsored)" | "Paid Partnership Tag" | "Not clearly disclosed" | "Unverified";
  competitorOf?: string[]; // brand names this collab could be seen as competitive with
}

export interface AudienceProfile {
  nigeriaPct: ValueWithSource<number>;
  topStates: { state: string; pct: number }[];
  ageRange: { range: string; pct: number }[];
  genderSplit: { male: number; female: number } | null;
  source: DataSource;
}

export interface PerformanceStats {
  analysisPeriod: string; // e.g. "Last 90 days"
  postsAnalysed: number;
  dataSource: DataSource;
  engagementRate: ValueWithSource<number>; // %
  avgLikes: ValueWithSource<number>;
  avgComments: ValueWithSource<number>;
  avgSharesReposts: ValueWithSource<number>;
  avgSaves: ValueWithSource<number>;
  avgViews: ValueWithSource<number>;
  avgReachImpressions: ValueWithSource<number>;
  engagementPerFollower: ValueWithSource<number>;
  postsPerWeek: number;
  growthTrend90d: ValueWithSource<number>; // % follower growth, null if unavailable
}

export interface PricingInfo {
  costPerPost: ValueWithSource<number>;
  costPerVideo: ValueWithSource<number>;
  costPerCampaign: ValueWithSource<number>;
  currency: "NGN";
  basis: "rate_card" | "estimated_from_tier_benchmarks" | "unavailable";
}

export interface Influencer {
  id: string;
  name: string;
  handle: string;
  avatarSeed: string; // used to deterministically generate an avatar
  platforms: Platform[];
  primaryPlatform: Platform;
  handles: Partial<Record<Platform, string>>;
  categories: Category[];
  customNiche?: string;
  tierByPlatform: Partial<Record<Platform, Tier>>;
  followersByPlatform: Partial<Record<Platform, number>>;
  location: { city: string; state: string };
  languages: string[];
  contentFormat: ContentFormat;
  postingFrequencyPerWeek: number;
  bio: string;
  audience: AudienceProfile;
  performanceByPlatform: Partial<Record<Platform, PerformanceStats>>;
  recentPosts: Partial<Record<Platform, PostSample[]>>;
  brandCollaborations: BrandCollaboration[];
  pricing: PricingInfo;
  contentThemes: string[];
  brandSafety: {
    flagged: boolean;
    notes: string[];
  };
  lastActiveAt: string; // ISO date
  joinedPlatformAt: string; // ISO date, for account age / consistency signal
}

export interface ScoreBreakdown {
  total: number;
  factors: {
    key: string;
    label: string;
    weight: number; // 0-1
    rawScore: number; // 0-100
    weightedScore: number;
    explanation: string;
  }[];
  summary: string;
  riskFlags: RiskFlag[];
}

export interface RiskFlag {
  severity: "low" | "medium" | "high";
  label: string;
  detail: string;
}

export type ScoringWeights = {
  categoryRelevance: number;
  platformStrength: number;
  engagement: number;
  audienceQuality: number;
  consistency: number;
  growth: number;
  brandExperience: number;
  campaignFit: number;
};

export const DEFAULT_WEIGHTS: ScoringWeights = {
  categoryRelevance: 0.22,
  platformStrength: 0.1,
  engagement: 0.2,
  audienceQuality: 0.15,
  consistency: 0.1,
  growth: 0.08,
  brandExperience: 0.1,
  campaignFit: 0.05,
};

export interface SearchFilters {
  categories: Category[];
  customCategory: string;
  platforms: Platform[];
  tiers: Tier[];
  audienceLocationState: string | "Any";
  minNigeriaAudiencePct: number;
  ageRange: string | "Any";
  genderLean: "Any" | "Male-leaning" | "Female-leaning" | "Balanced";
  minEngagementRate: number;
  minAvgViews: number;
  minFollowers: number;
  contentFormat: ContentFormat | "Any";
  language: string | "Any";
  campaignObjectives: CampaignObjective[];
  budgetMin: number;
  budgetMax: number;
  requireBrandExperience: boolean;
  excludeCompetitorsOf: string;
}

export const DEFAULT_FILTERS: SearchFilters = {
  categories: [],
  customCategory: "",
  platforms: [],
  tiers: [],
  audienceLocationState: "Any",
  minNigeriaAudiencePct: 0,
  ageRange: "Any",
  genderLean: "Any",
  minEngagementRate: 0,
  minAvgViews: 0,
  minFollowers: 0,
  contentFormat: "Any",
  language: "Any",
  campaignObjectives: [],
  budgetMin: 0,
  budgetMax: 10_000_000,
  requireBrandExperience: false,
  excludeCompetitorsOf: "",
};

export interface CampaignBriefParseResult {
  rawText: string;
  detectedCategories: Category[];
  detectedPlatforms: Platform[];
  detectedTiers: Tier[];
  detectedObjectives: CampaignObjective[];
  suggestedInfluencerCount: number;
  suggestedTierMix: { tier: Tier; count: number }[];
  targetAgeRange?: string;
  targetGender?: string;
  brandOrProduct?: string;
  confidence: "high" | "medium" | "low";
  notes: string[];
}

export interface ShortlistDeliverable {
  label: string;
  quantity: number;
}

export interface ShortlistEntry {
  influencerId: string;
  platform: Platform;
  deliverables: ShortlistDeliverable[];
  addedAt: string;
  notes: string;
}
