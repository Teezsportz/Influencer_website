"use client";

import Link from "next/link";
import { useState } from "react";
import { Influencer, ShortlistDeliverable, ShortlistEntry } from "@/lib/types";
import { ScoreBreakdown } from "@/lib/types";
import { formatCompactNumber, formatNaira, formatPercent } from "@/lib/format";
import Avatar from "@/components/Avatar";
import ScoreBadge from "@/components/ScoreBadge";
import { useAppState } from "@/context/AppStateContext";

const DELIVERABLE_OPTIONS = ["1 Feed Post", "1 Reel/Short Video", "1 Story Set (3 frames)", "1 Carousel Post", "1 Dedicated Video"];

export default function ShortlistCard({
  influencer,
  entry,
  score,
  estimatedCost,
}: {
  influencer: Influencer;
  entry: ShortlistEntry;
  score: ScoreBreakdown;
  estimatedCost: number;
}) {
  const { updateShortlistEntry, removeFromShortlist } = useAppState();
  const [newDeliverable, setNewDeliverable] = useState(DELIVERABLE_OPTIONS[0]);
  const perf = influencer.performanceByPlatform[entry.platform];

  function addDeliverable() {
    const existing = entry.deliverables.find((d) => d.label === newDeliverable);
    const deliverables: ShortlistDeliverable[] = existing
      ? entry.deliverables.map((d) => (d.label === newDeliverable ? { ...d, quantity: d.quantity + 1 } : d))
      : [...entry.deliverables, { label: newDeliverable, quantity: 1 }];
    updateShortlistEntry(influencer.id, entry.platform, { deliverables });
  }

  function updateQty(label: string, quantity: number) {
    const deliverables = entry.deliverables
      .map((d) => (d.label === label ? { ...d, quantity } : d))
      .filter((d) => d.quantity > 0);
    updateShortlistEntry(influencer.id, entry.platform, { deliverables });
  }

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <Link href={`/influencer/${influencer.id}?platform=${entry.platform}`} className="flex items-center gap-3 hover:underline">
          <Avatar seed={influencer.avatarSeed} name={influencer.name} size={44} />
          <div>
            <div className="font-semibold">{influencer.name}</div>
            <div className="text-xs text-base-muted">
              {entry.platform} · {influencer.tierByPlatform[entry.platform]} · {formatCompactNumber(influencer.followersByPlatform[entry.platform])} followers
            </div>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <ScoreBadge score={score.total} size="sm" />
          <button onClick={() => removeFromShortlist(influencer.id, entry.platform)} className="text-xs text-brand-rose hover:underline">
            Remove
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
        <div>
          <div className="text-base-muted">Engagement</div>
          <div className="font-medium">{formatPercent(perf?.engagementRate.value)}</div>
        </div>
        <div>
          <div className="text-base-muted">Brand collabs</div>
          <div className="font-medium">{influencer.brandCollaborations.length}</div>
        </div>
        <div>
          <div className="text-base-muted">Risk flags</div>
          <div className={`font-medium ${score.riskFlags.length > 0 ? "text-brand-amber" : ""}`}>{score.riskFlags.length}</div>
        </div>
        <div>
          <div className="text-base-muted">Est. line cost</div>
          <div className="font-medium">{formatNaira(estimatedCost)}</div>
        </div>
      </div>

      {score.riskFlags.length > 0 && (
        <ul className="mt-3 space-y-1 text-xs text-base-muted">
          {score.riskFlags.map((f, i) => (
            <li key={i}>⚠ {f.label}</li>
          ))}
        </ul>
      )}

      <div className="mt-4 border-t border-base-border pt-3">
        <div className="section-label mb-2">Deliverables</div>
        <div className="space-y-1.5">
          {entry.deliverables.map((d) => (
            <div key={d.label} className="flex items-center justify-between text-sm">
              <span>{d.label}</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  value={d.quantity}
                  onChange={(e) => updateQty(d.label, Number(e.target.value))}
                  className="input-field w-16 !py-1 text-center"
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <select className="input-field flex-1" value={newDeliverable} onChange={(e) => setNewDeliverable(e.target.value)}>
            {DELIVERABLE_OPTIONS.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
          <button onClick={addDeliverable} className="btn-secondary text-xs">
            Add
          </button>
        </div>
      </div>

      <div className="mt-3">
        <textarea
          className="input-field w-full resize-none"
          rows={2}
          placeholder="Internal notes (e.g. negotiated rate, usage rights, timeline)…"
          value={entry.notes}
          onChange={(e) => updateShortlistEntry(influencer.id, entry.platform, { notes: e.target.value })}
        />
      </div>
    </div>
  );
}
