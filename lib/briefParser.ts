import {
  CampaignBriefParseResult,
  CampaignObjective,
  Category,
  Platform,
  Tier,
} from "@/lib/types";

/**
 * Lightweight, fully local keyword/heuristic parser for free-text campaign
 * briefs ("Campaign Brief Mode"). This intentionally does not call an
 * external LLM API (none is configured for this deployment) — it uses a
 * transparent keyword-matching approach so results are explainable and the
 * user can see exactly why a category/platform/tier was suggested, then
 * edit any of it before running discovery.
 */

const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  "Beauty & Skincare": ["skincare", "beauty", "makeup", "cosmetic", "skin care", "haircare"],
  Fashion: ["fashion", "style", "clothing", "apparel", "outfit", "wear"],
  Lifestyle: ["lifestyle", "daily life", "vlog"],
  "Food & Beverage": ["food", "drink", "beverage", "recipe", "restaurant", "culinary", "snack"],
  Technology: ["tech", "technology", "gadget", "app", "software", "device", "phone"],
  Finance: ["finance", "fintech", "savings", "investment", "banking", "money"],
  "Business & Entrepreneurship": ["business", "entrepreneur", "startup", "hustle", "smb"],
  Comedy: ["comedy", "skit", "funny", "humor", "humour"],
  Entertainment: ["entertainment", "celebrity", "movie", "show"],
  Music: ["music", "song", "artist", "afrobeats"],
  Sports: ["sport", "football", "athlete", "match"],
  "Fitness & Wellness": ["fitness", "gym", "workout", "training", "active adult", "active adults", "exercise"],
  "Parenting & Family": ["parenting", "mom", "dad", "family", "baby", "child"],
  Gaming: ["gaming", "esports", "gamer", "game"],
  Travel: ["travel", "tourism", "destination", "vacation"],
  Education: ["education", "study", "exam", "student", "learning"],
  Automotive: ["car", "auto", "vehicle", "automotive"],
  "Health & Wellness": ["health", "wellness", "pain relief", "medical", "mental health", "wellbeing"],
};

const PLATFORM_KEYWORDS: Record<Platform, string[]> = {
  Instagram: ["instagram", "ig ", "reels"],
  TikTok: ["tiktok", "tik tok"],
  YouTube: ["youtube", "yt "],
  Facebook: ["facebook", "fb "],
  X: [" x ", "twitter"],
  Snapchat: ["snapchat", "snap "],
};

const TIER_KEYWORDS: Record<Tier, string[]> = {
  Nano: ["nano influencer", "nano-influencer", "very small creator"],
  Micro: ["micro influencer", "micro-influencer", "small creator", "budget-friendly creator"],
  "Mid-Tier": ["mid-tier", "mid tier", "mid-size"],
  Macro: ["macro influencer", "macro-influencer", "large following"],
  "Mega/Celebrity": ["celebrity", "mega influencer", "mega-influencer", "A-list", "household name"],
};

const OBJECTIVE_KEYWORDS: Record<CampaignObjective, string[]> = {
  Awareness: ["awareness", "reach", "visibility", "introduce"],
  Engagement: ["engagement", "conversation", "community"],
  Traffic: ["traffic", "website visits", "click", "link clicks"],
  Leads: ["leads", "sign up", "sign-up", "waitlist"],
  "Sales/Conversion": ["sales", "conversion", "purchase", "buy", "revenue", "orders"],
  "Product Launch": ["launch", "launching", "new product", "unveiling"],
  "Brand Education": ["educate", "education", "explain", "how it works"],
  "Event Promotion": ["event", "concert", "activation", "pop-up", "premiere"],
};

function countHits(text: string, keywords: string[]): number {
  return keywords.reduce((n, kw) => (text.includes(kw) ? n + 1 : n), 0);
}

export function parseCampaignBrief(rawText: string): CampaignBriefParseResult {
  const text = ` ${rawText.toLowerCase()} `;
  const notes: string[] = [];

  const detectedCategories = (Object.keys(CATEGORY_KEYWORDS) as Category[]).filter(
    (c) => countHits(text, CATEGORY_KEYWORDS[c]) > 0,
  );

  const detectedPlatforms = (Object.keys(PLATFORM_KEYWORDS) as Platform[]).filter(
    (p) => countHits(text, PLATFORM_KEYWORDS[p]) > 0,
  );

  const detectedTiers = (Object.keys(TIER_KEYWORDS) as Tier[]).filter(
    (t) => countHits(text, TIER_KEYWORDS[t]) > 0,
  );

  const detectedObjectives = (Object.keys(OBJECTIVE_KEYWORDS) as CampaignObjective[]).filter(
    (o) => countHits(text, OBJECTIVE_KEYWORDS[o]) > 0,
  );

  const ageMatch = text.match(/(\d{2})\s*[-–to]{1,3}\s*(\d{2})/);
  const targetAgeRange = ageMatch ? `${ageMatch[1]}-${ageMatch[2]}` : undefined;

  let targetGender: string | undefined;
  if (/\bwomen\b|\bfemale\b|\bladies\b/.test(text)) targetGender = "Female-leaning";
  else if (/\bmen\b|\bmale\b/.test(text)) targetGender = "Male-leaning";

  const brandMatch = rawText.match(/(?:for|launching|introduce[sd]?)\s+([A-Z][A-Za-z0-9&'\- ]{2,40})/);
  const brandOrProduct = brandMatch ? brandMatch[1].trim() : undefined;

  if (detectedCategories.length === 0) {
    notes.push("No specific category detected — defaulting to Lifestyle so results aren't empty; refine manually below.");
  }
  if (detectedPlatforms.length === 0) {
    notes.push("No platform explicitly mentioned — searching across all platforms by default.");
  }
  if (detectedTiers.length === 0) {
    notes.push("No influencer tier mentioned — suggesting a balanced Nano/Micro/Mid-Tier mix, which typically performs best for engagement-driven Nigerian campaigns.");
  }

  const signalCount = detectedCategories.length + detectedPlatforms.length + detectedTiers.length + detectedObjectives.length;
  const confidence: CampaignBriefParseResult["confidence"] = signalCount >= 4 ? "high" : signalCount >= 2 ? "medium" : "low";

  // Suggest a creator-count and tier mix based on detected (or default) objective(s).
  const wantsBroadAwareness = detectedObjectives.includes("Awareness") || detectedObjectives.includes("Product Launch");
  const suggestedInfluencerCount = wantsBroadAwareness ? 30 : 24;

  const tiersForMix: Tier[] = detectedTiers.length > 0 ? detectedTiers : ["Nano", "Micro", "Mid-Tier"];
  const mixWeights: Record<Tier, number> = { Nano: 0.35, Micro: 0.3, "Mid-Tier": 0.2, Macro: 0.1, "Mega/Celebrity": 0.05 };
  const totalWeight = tiersForMix.reduce((s, t) => s + mixWeights[t], 0);
  const suggestedTierMix = tiersForMix.map((tier) => ({
    tier,
    count: Math.max(1, Math.round((mixWeights[tier] / totalWeight) * suggestedInfluencerCount)),
  }));

  return {
    rawText,
    detectedCategories: detectedCategories.length > 0 ? detectedCategories : ["Lifestyle"],
    detectedPlatforms,
    detectedTiers,
    detectedObjectives,
    suggestedInfluencerCount,
    suggestedTierMix,
    targetAgeRange,
    targetGender,
    brandOrProduct,
    confidence,
    notes,
  };
}
