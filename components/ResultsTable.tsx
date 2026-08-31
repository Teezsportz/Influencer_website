"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { DiscoverResult } from "@/lib/discover";
import { formatCompactNumber, formatPercent } from "@/lib/format";
import Avatar from "@/components/Avatar";
import ScoreBadge from "@/components/ScoreBadge";
import { useAppState } from "@/context/AppStateContext";

type SortKey = "score" | "followers" | "engagement" | "views" | "likes" | "comments" | "name";

const COLUMNS: { key: SortKey | null; label: string }[] = [
  { key: null, label: "Rank" },
  { key: "name", label: "Influencer" },
  { key: null, label: "Platform" },
  { key: null, label: "Category" },
  { key: null, label: "Tier" },
  { key: "followers", label: "Followers" },
  { key: "engagement", label: "Eng. Rate" },
  { key: "views", label: "Avg. Views" },
  { key: "likes", label: "Avg. Likes" },
  { key: "comments", label: "Avg. Comments" },
  { key: null, label: "Brand Partnerships" },
  { key: "score", label: "Fit Score" },
  { key: null, label: "" },
];

export default function ResultsTable({
  results,
  selected,
  onToggleSelect,
}: {
  results: DiscoverResult[];
  selected: Set<string>;
  onToggleSelect: (key: string) => void;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const { addToShortlist, removeFromShortlist, isShortlisted } = useAppState();

  const sorted = useMemo(() => {
    const arr = [...results];
    arr.sort((a, b) => {
      const perfA = a.influencer.performanceByPlatform[a.platform];
      const perfB = b.influencer.performanceByPlatform[b.platform];
      let av = 0;
      let bv = 0;
      switch (sortKey) {
        case "score":
          av = a.score.total;
          bv = b.score.total;
          break;
        case "followers":
          av = a.influencer.followersByPlatform[a.platform] ?? 0;
          bv = b.influencer.followersByPlatform[b.platform] ?? 0;
          break;
        case "engagement":
          av = perfA?.engagementRate.value ?? 0;
          bv = perfB?.engagementRate.value ?? 0;
          break;
        case "views":
          av = perfA?.avgViews.value ?? -1;
          bv = perfB?.avgViews.value ?? -1;
          break;
        case "likes":
          av = perfA?.avgLikes.value ?? 0;
          bv = perfB?.avgLikes.value ?? 0;
          break;
        case "comments":
          av = perfA?.avgComments.value ?? 0;
          bv = perfB?.avgComments.value ?? 0;
          break;
        case "name":
          return sortDir === "asc" ? a.influencer.name.localeCompare(b.influencer.name) : b.influencer.name.localeCompare(a.influencer.name);
      }
      return sortDir === "asc" ? av - bv : bv - av;
    });
    return arr;
  }, [results, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[1100px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-base-border text-left text-xs uppercase tracking-wide text-base-muted">
            <th className="px-3 py-3 font-medium">
              <span className="sr-only">Select</span>
            </th>
            {COLUMNS.map((c) => (
              <th key={c.label} className="whitespace-nowrap px-3 py-3 font-medium">
                {c.key ? (
                  <button onClick={() => handleSort(c.key as SortKey)} className="flex items-center gap-1 hover:text-base-text">
                    {c.label}
                    {sortKey === c.key && <span>{sortDir === "asc" ? "↑" : "↓"}</span>}
                  </button>
                ) : (
                  c.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((r, idx) => {
            const key = `${r.influencer.id}::${r.platform}`;
            const perf = r.influencer.performanceByPlatform[r.platform];
            const followers = r.influencer.followersByPlatform[r.platform];
            const tier = r.influencer.tierByPlatform[r.platform];
            const shortlisted = isShortlisted(r.influencer.id, r.platform);
            const recentBrands = r.influencer.brandCollaborations.slice(0, 2).map((b) => b.brand);

            return (
              <tr key={key} className="border-b border-base-border/60 last:border-0 hover:bg-base-panel2/60">
                <td className="px-3 py-3">
                  <input type="checkbox" checked={selected.has(key)} onChange={() => onToggleSelect(key)} className="accent-brand" />
                </td>
                <td className="px-3 py-3 text-base-muted">{idx + 1}</td>
                <td className="px-3 py-3">
                  <Link href={`/influencer/${r.influencer.id}?platform=${r.platform}`} className="flex items-center gap-2 hover:underline">
                    <Avatar seed={r.influencer.avatarSeed} name={r.influencer.name} size={32} />
                    <div className="min-w-0">
                      <div className="truncate font-medium">{r.influencer.name}</div>
                      <div className="truncate text-xs text-base-muted">{r.influencer.handle}</div>
                    </div>
                  </Link>
                </td>
                <td className="px-3 py-3">{r.platform}</td>
                <td className="whitespace-nowrap px-3 py-3">{r.influencer.categories[0]}</td>
                <td className="px-3 py-3">
                  <span className="chip">{tier}</span>
                </td>
                <td className="px-3 py-3">{formatCompactNumber(followers)}</td>
                <td className="px-3 py-3">{formatPercent(perf?.engagementRate.value)}</td>
                <td className="px-3 py-3">{formatCompactNumber(perf?.avgViews.value)}</td>
                <td className="px-3 py-3">{formatCompactNumber(perf?.avgLikes.value)}</td>
                <td className="px-3 py-3">{formatCompactNumber(perf?.avgComments.value)}</td>
                <td className="max-w-[160px] truncate px-3 py-3 text-xs text-base-muted" title={recentBrands.join(", ")}>
                  {recentBrands.length > 0 ? recentBrands.join(", ") : "None on record"}
                </td>
                <td className="px-3 py-3">
                  <ScoreBadge score={r.score.total} size="sm" />
                </td>
                <td className="px-3 py-3">
                  <button
                    onClick={() =>
                      shortlisted
                        ? removeFromShortlist(r.influencer.id, r.platform)
                        : addToShortlist({
                            influencerId: r.influencer.id,
                            platform: r.platform,
                            deliverables: [{ label: "1 Feed Post", quantity: 1 }],
                            addedAt: new Date().toISOString(),
                            notes: "",
                          })
                    }
                    className={`chip whitespace-nowrap ${shortlisted ? "chip-active" : "hover:border-brand/50"}`}
                  >
                    {shortlisted ? "✓ Shortlisted" : "+ Shortlist"}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
