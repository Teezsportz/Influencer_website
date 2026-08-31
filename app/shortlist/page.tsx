"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAppState } from "@/context/AppStateContext";
import { getInfluencerById } from "@/lib/discover";
import { scoreInfluencer } from "@/lib/scoring";
import { buildCampaignSummary } from "@/lib/campaignSummary";
import { formatCompactNumber, formatNaira } from "@/lib/format";
import ShortlistCard from "@/components/ShortlistCard";
import { downloadCsv } from "@/lib/exportCsv";

export default function ShortlistPage() {
  const { shortlist, filters, weights, hydrated, clearShortlist } = useAppState();

  const summary = useMemo(() => buildCampaignSummary(shortlist, filters, weights), [shortlist, filters, weights]);

  function handleExport() {
    const rows: (string | number)[][] = [
      ["Influencer", "Platform", "Tier", "Followers", "Fit Score", "Deliverables", "Estimated Cost (NGN)", "Notes"],
    ];
    summary.lineItems.forEach((li) => {
      rows.push([
        li.influencerName,
        li.platform,
        li.tier ?? "",
        li.followers,
        li.fitScore,
        li.entry.deliverables.map((d) => `${d.quantity}x ${d.label}`).join("; "),
        li.estimatedCost,
        li.entry.notes,
      ]);
    });
    rows.push([]);
    rows.push(["Campaign Summary"]);
    rows.push(["Influencer Count", summary.influencerCount]);
    rows.push(["Combined Followers", summary.combinedFollowers]);
    rows.push(["Estimated Potential Reach (non-deduplicated)", summary.estimatedPotentialReach]);
    rows.push(["Total Estimated Cost (NGN)", summary.totalEstimatedCost]);
    downloadCsv(`campaign-shortlist-${Date.now()}.csv`, rows);
  }

  if (!hydrated) return null;

  if (shortlist.length === 0) {
    return (
      <div className="card p-10 text-center">
        <p className="text-sm text-base-muted">Your shortlist is empty.</p>
        <Link href="/discover" className="btn-primary mt-4 inline-block text-sm">
          Discover Influencers
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Campaign Shortlist &amp; Planning</h1>
          <p className="text-sm text-base-muted">{shortlist.length} influencer(s) selected</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="btn-primary text-sm">
            Export Campaign Plan (CSV)
          </button>
          <button onClick={clearShortlist} className="btn-secondary text-sm">
            Clear Shortlist
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          {summary.lineItems.map((li) => {
            const inf = getInfluencerById(li.influencerId);
            if (!inf) return null;
            const score = scoreInfluencer(inf, li.entry.platform, filters, weights);
            return <ShortlistCard key={`${li.influencerId}-${li.platform}`} influencer={inf} entry={li.entry} score={score} estimatedCost={li.estimatedCost} />;
          })}
        </div>

        <div className="space-y-4">
          <div className="card sticky top-24 space-y-4 p-5">
            <div className="section-label">Campaign-Level Summary</div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-xs text-base-muted">Influencers</div>
                <div className="text-lg font-semibold">{summary.influencerCount}</div>
              </div>
              <div>
                <div className="text-xs text-base-muted">Combined Followers</div>
                <div className="text-lg font-semibold">{formatCompactNumber(summary.combinedFollowers)}</div>
              </div>
              <div>
                <div className="text-xs text-base-muted">Total Est. Cost</div>
                <div className="text-lg font-semibold">{formatNaira(summary.totalEstimatedCost)}</div>
              </div>
              <div>
                <div className="text-xs text-base-muted">Est. Potential Reach</div>
                <div className="text-lg font-semibold">{formatCompactNumber(summary.estimatedPotentialReach)}</div>
              </div>
            </div>
            <p className="text-[11px] text-base-muted">
              Potential reach is a rough, non-deduplicated estimate (followers × an engagement-based visibility
              factor) — audiences overlap across creators, so treat this as directional, not a guaranteed number. All
              costs are estimated from tier benchmarks, not confirmed rate cards.
            </p>

            <div>
              <div className="mb-1 text-xs text-base-muted">Tier mix</div>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(summary.tierMix).map(([tier, count]) => (
                  <span key={tier} className="chip">
                    {tier}: {count}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-1 text-xs text-base-muted">Platform mix</div>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(summary.platformMix).map(([platform, count]) => (
                  <span key={platform} className="chip">
                    {platform}: {count}
                  </span>
                ))}
              </div>
            </div>

            {summary.strengths.length > 0 && (
              <div>
                <div className="mb-1 text-xs font-medium text-brand-soft">Strengths</div>
                <ul className="space-y-1 text-xs text-base-muted">
                  {summary.strengths.map((s, i) => (
                    <li key={i}>✓ {s}</li>
                  ))}
                </ul>
              </div>
            )}
            {summary.gaps.length > 0 && (
              <div>
                <div className="mb-1 text-xs font-medium text-brand-amber">Potential gaps</div>
                <ul className="space-y-1 text-xs text-base-muted">
                  {summary.gaps.map((s, i) => (
                    <li key={i}>⚠ {s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
