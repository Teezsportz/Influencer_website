"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppState } from "@/context/AppStateContext";
import { discoverInfluencers } from "@/lib/discover";
import SearchPanel from "@/components/SearchPanel";
import ResultsTable from "@/components/ResultsTable";
import NarrativePanel from "@/components/NarrativePanel";
import WeightsPanel from "@/components/WeightsPanel";
import CompareBar from "@/components/CompareBar";
import CompareModal from "@/components/CompareModal";
import { downloadCsv } from "@/lib/exportCsv";

const PAGE_SIZE = 25;

export default function DiscoverPage() {
  const { filters, setFilters, weights, setWeights, hydrated } = useAppState();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showCompare, setShowCompare] = useState(false);
  const [showWeights, setShowWeights] = useState(false);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const response = useMemo(() => discoverInfluencers(filters, weights), [filters, weights]);
  const visibleResults = useMemo(() => response.results.slice(0, visibleCount), [response.results, visibleCount]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filters, weights]);

  function toggleSelect(key: string) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function handleExport() {
    const rows: (string | number)[][] = [
      [
        "Rank",
        "Influencer",
        "Handle",
        "Platform",
        "Category",
        "Tier",
        "Followers",
        "Engagement Rate (%)",
        "Avg Views",
        "Avg Likes",
        "Avg Comments",
        "Avg Shares/Reposts",
        "Recent Brand Partnerships",
        "Fit Score",
        "State",
      ],
    ];
    response.results.forEach((r, i) => {
      const perf = r.influencer.performanceByPlatform[r.platform];
      rows.push([
        i + 1,
        r.influencer.name,
        r.influencer.handle,
        r.platform,
        r.influencer.categories[0],
        r.influencer.tierByPlatform[r.platform] ?? "",
        r.influencer.followersByPlatform[r.platform] ?? "",
        perf?.engagementRate.value ?? "Data unavailable",
        perf?.avgViews.value ?? "Data unavailable",
        perf?.avgLikes.value ?? "Data unavailable",
        perf?.avgComments.value ?? "Data unavailable",
        perf?.avgSharesReposts.value ?? "Data unavailable",
        r.influencer.brandCollaborations.map((b) => b.brand).join("; "),
        r.score.total,
        r.influencer.location.state,
      ]);
    });
    downloadCsv(`influencer-shortlist-${Date.now()}.csv`, rows);
  }

  if (!hydrated) return null;

  const selectedResults = response.results.filter((r) => selected.has(`${r.influencer.id}::${r.platform}`));

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      <div className="hidden lg:block">
        <div className="sticky top-24">
          <SearchPanel filters={filters} onChange={setFilters} onSubmit={() => {}} submitLabel="Update Results" compact />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">Discovery Results</h1>
            <p className="text-sm text-base-muted">
              Showing {visibleResults.length} of {response.results.length} matching creators · ranked by Fit Score ·{" "}
              {response.totalCandidatesConsidered} profiles considered
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowFiltersMobile((v) => !v)} className="btn-secondary text-sm lg:hidden">
              Filters
            </button>
            <button onClick={() => setShowWeights((v) => !v)} className="btn-secondary text-sm">
              {showWeights ? "Hide" : "Adjust"} Scoring Methodology
            </button>
            <button onClick={handleExport} className="btn-primary text-sm">
              Export CSV
            </button>
          </div>
        </div>

        {showFiltersMobile && (
          <div className="lg:hidden">
            <SearchPanel filters={filters} onChange={setFilters} onSubmit={() => setShowFiltersMobile(false)} submitLabel="Apply Filters" compact />
          </div>
        )}

        {response.relaxationNotes.length > 0 && (
          <div className="card border-brand-amber/40 bg-brand-amber/5 p-4 text-sm">
            <div className="mb-1 font-medium text-brand-amber">Search criteria broadened to reach a reliable shortlist</div>
            <ul className="list-disc space-y-0.5 pl-4 text-base-muted">
              {response.relaxationNotes.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          </div>
        )}

        {showWeights && <WeightsPanel weights={weights} onChange={setWeights} />}

        <NarrativePanel results={response.results} filters={filters} />

        {visibleResults.length > 0 ? (
          <>
            <ResultsTable results={visibleResults} selected={selected} onToggleSelect={toggleSelect} />
            {visibleCount < response.results.length && (
              <div className="flex justify-center">
                <button onClick={() => setVisibleCount((v) => v + PAGE_SIZE)} className="btn-secondary text-sm">
                  Load {Math.min(PAGE_SIZE, response.results.length - visibleCount)} more
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="card p-10 text-center text-sm text-base-muted">
            No influencers matched. Try broadening filters or using Campaign Brief mode.
          </div>
        )}
      </div>

      <CompareBar
        results={response.results}
        selected={selected}
        onClear={() => setSelected(new Set())}
        onOpenCompare={() => setShowCompare(true)}
      />
      {showCompare && <CompareModal results={selectedResults.slice(0, 5)} onClose={() => setShowCompare(false)} />}
    </div>
  );
}
