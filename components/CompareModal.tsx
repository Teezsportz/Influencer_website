"use client";

import { DiscoverResult } from "@/lib/discover";
import { formatCompactNumber, formatNaira, formatPercent } from "@/lib/format";
import Avatar from "@/components/Avatar";
import ScoreBadge from "@/components/ScoreBadge";

const ROWS: { label: string; get: (r: DiscoverResult) => React.ReactNode }[] = [
  { label: "Platform", get: (r) => r.platform },
  { label: "Tier", get: (r) => r.influencer.tierByPlatform[r.platform] },
  { label: "Followers", get: (r) => formatCompactNumber(r.influencer.followersByPlatform[r.platform]) },
  { label: "Engagement Rate", get: (r) => formatPercent(r.influencer.performanceByPlatform[r.platform]?.engagementRate.value) },
  { label: "Avg. Views", get: (r) => formatCompactNumber(r.influencer.performanceByPlatform[r.platform]?.avgViews.value) },
  { label: "Avg. Likes", get: (r) => formatCompactNumber(r.influencer.performanceByPlatform[r.platform]?.avgLikes.value) },
  { label: "Avg. Comments", get: (r) => formatCompactNumber(r.influencer.performanceByPlatform[r.platform]?.avgComments.value) },
  { label: "Posting frequency", get: (r) => `${r.influencer.postingFrequencyPerWeek}x/week` },
  { label: "Audience in Nigeria", get: (r) => formatPercent(r.influencer.audience.nigeriaPct.value, 0) },
  { label: "Brand collaborations", get: (r) => r.influencer.brandCollaborations.length },
  { label: "Est. cost per post", get: (r) => formatNaira(r.influencer.pricing.costPerPost.value) },
  { label: "Risk flags", get: (r) => r.score.riskFlags.length },
];

export default function CompareModal({ results, onClose }: { results: DiscoverResult[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="max-h-[85vh] w-full max-w-5xl overflow-auto rounded-2xl border border-base-border bg-base-panel p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Compare Influencers</h2>
          <button onClick={onClose} className="btn-secondary !py-1.5 !px-3 text-xs">
            Close
          </button>
        </div>
        <table className="w-full min-w-[600px] border-collapse text-sm">
          <thead>
            <tr>
              <th className="w-40 px-3 py-2 text-left text-xs text-base-muted">Metric</th>
              {results.map((r) => (
                <th key={`${r.influencer.id}-${r.platform}`} className="px-3 py-2 text-left">
                  <div className="flex flex-col items-start gap-1.5">
                    <Avatar seed={r.influencer.avatarSeed} name={r.influencer.name} size={32} />
                    <span className="font-medium">{r.influencer.name}</span>
                    <ScoreBadge score={r.score.total} size="sm" />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.label} className="border-t border-base-border/60">
                <td className="px-3 py-2.5 text-xs text-base-muted">{row.label}</td>
                {results.map((r) => (
                  <td key={`${r.influencer.id}-${r.platform}-${row.label}`} className="px-3 py-2.5">
                    {row.get(r)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
