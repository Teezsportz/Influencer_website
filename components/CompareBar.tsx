"use client";

import { DiscoverResult } from "@/lib/discover";
import { useAppState } from "@/context/AppStateContext";

export default function CompareBar({
  results,
  selected,
  onClear,
  onOpenCompare,
}: {
  results: DiscoverResult[];
  selected: Set<string>;
  onClear: () => void;
  onOpenCompare: () => void;
}) {
  const { addToShortlist } = useAppState();
  if (selected.size === 0) return null;

  const selectedResults = results.filter((r) => selected.has(`${r.influencer.id}::${r.platform}`));

  return (
    <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
      <div className="flex items-center gap-3 rounded-2xl border border-base-border bg-base-panel px-5 py-3 shadow-card">
        <span className="text-sm font-medium">{selected.size} selected</span>
        <button
          onClick={onOpenCompare}
          disabled={selected.size < 2}
          className="btn-secondary !py-1.5 !px-3 text-xs disabled:cursor-not-allowed disabled:opacity-40"
        >
          Compare
        </button>
        <button
          onClick={() => {
            selectedResults.forEach((r) =>
              addToShortlist({
                influencerId: r.influencer.id,
                platform: r.platform,
                deliverables: [{ label: "1 Feed Post", quantity: 1 }],
                addedAt: new Date().toISOString(),
                notes: "",
              }),
            );
          }}
          className="btn-secondary !py-1.5 !px-3 text-xs"
        >
          Add all to shortlist
        </button>
        <button onClick={onClear} className="text-xs text-base-muted hover:text-base-text">
          Clear
        </button>
      </div>
    </div>
  );
}
