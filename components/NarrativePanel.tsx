import { DiscoverResult } from "@/lib/discover";
import { buildShortlistNarrative } from "@/lib/aiNarrative";
import { SearchFilters } from "@/lib/types";

export default function NarrativePanel({ results, filters }: { results: DiscoverResult[]; filters: SearchFilters }) {
  const { why, risks } = buildShortlistNarrative(results, filters);

  return (
    <div className="card space-y-4 p-5">
      <div>
        <div className="section-label mb-1.5">Why these influencers?</div>
        <p className="text-sm leading-relaxed text-base-text/90">{why}</p>
      </div>
      {risks.length > 0 && (
        <div>
          <div className="section-label mb-1.5">Themes to review</div>
          <ul className="space-y-1 text-sm text-base-muted">
            {risks.map((r, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-brand-amber">⚠</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
