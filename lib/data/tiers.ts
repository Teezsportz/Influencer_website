import { Platform, Tier } from "@/lib/types";

/**
 * Follower-count thresholds used to classify an influencer's tier, per platform.
 *
 * These are deliberately NOT identical across platforms: TikTok and YouTube
 * subscriber/follower dynamics differ materially from Instagram (e.g. TikTok
 * follower counts inflate faster relative to genuine reach, YouTube subscriber
 * counts under-represent view-based reach). Ranges reflect commonly used
 * Nigerian/African market benchmarks circa 2025-2026 and are configurable —
 * adjust here if your market data provider publishes different bands.
 */
export const TIER_RANGES: Record<Platform, { tier: Tier; min: number; max: number }[]> = {
  Instagram: [
    { tier: "Nano", min: 1_000, max: 9_999 },
    { tier: "Micro", min: 10_000, max: 49_999 },
    { tier: "Mid-Tier", min: 50_000, max: 199_999 },
    { tier: "Macro", min: 200_000, max: 999_999 },
    { tier: "Mega/Celebrity", min: 1_000_000, max: Infinity },
  ],
  TikTok: [
    { tier: "Nano", min: 1_000, max: 14_999 },
    { tier: "Micro", min: 15_000, max: 74_999 },
    { tier: "Mid-Tier", min: 75_000, max: 299_999 },
    { tier: "Macro", min: 300_000, max: 1_499_999 },
    { tier: "Mega/Celebrity", min: 1_500_000, max: Infinity },
  ],
  YouTube: [
    { tier: "Nano", min: 1_000, max: 9_999 },
    { tier: "Micro", min: 10_000, max: 39_999 },
    { tier: "Mid-Tier", min: 40_000, max: 149_999 },
    { tier: "Macro", min: 150_000, max: 699_999 },
    { tier: "Mega/Celebrity", min: 700_000, max: Infinity },
  ],
  Facebook: [
    { tier: "Nano", min: 2_000, max: 19_999 },
    { tier: "Micro", min: 20_000, max: 99_999 },
    { tier: "Mid-Tier", min: 100_000, max: 349_999 },
    { tier: "Macro", min: 350_000, max: 1_499_999 },
    { tier: "Mega/Celebrity", min: 1_500_000, max: Infinity },
  ],
  X: [
    { tier: "Nano", min: 1_000, max: 9_999 },
    { tier: "Micro", min: 10_000, max: 49_999 },
    { tier: "Mid-Tier", min: 50_000, max: 199_999 },
    { tier: "Macro", min: 200_000, max: 799_999 },
    { tier: "Mega/Celebrity", min: 800_000, max: Infinity },
  ],
  Snapchat: [
    { tier: "Nano", min: 1_000, max: 9_999 },
    { tier: "Micro", min: 10_000, max: 39_999 },
    { tier: "Mid-Tier", min: 40_000, max: 149_999 },
    { tier: "Macro", min: 150_000, max: 599_999 },
    { tier: "Mega/Celebrity", min: 600_000, max: Infinity },
  ],
};

export function tierForFollowers(platform: Platform, followers: number): Tier {
  const ranges = TIER_RANGES[platform];
  const match = ranges.find((r) => followers >= r.min && followers <= r.max);
  return match ? match.tier : ranges[0].tier;
}

export function tierRangeLabel(platform: Platform, tier: Tier): string {
  const r = TIER_RANGES[platform].find((x) => x.tier === tier);
  if (!r) return "";
  const fmt = (n: number) => (n === Infinity ? "+" : n.toLocaleString());
  return r.max === Infinity ? `${fmt(r.min)}+` : `${fmt(r.min)} - ${fmt(r.max)}`;
}
