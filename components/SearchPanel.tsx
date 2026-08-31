"use client";

import { useState } from "react";
import {
  CAMPAIGN_OBJECTIVES,
  CATEGORIES,
  Category,
  CampaignBriefParseResult,
  ContentFormat,
  PLATFORMS,
  Platform,
  SearchFilters,
  TIERS,
  Tier,
} from "@/lib/types";
import { STATE_CITIES, LANGUAGES_POOL } from "@/lib/data/namePool";
import { tierRangeLabel } from "@/lib/data/tiers";
import { parseCampaignBrief } from "@/lib/briefParser";
import FilterChip from "@/components/FilterChip";

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2 border-b border-base-border py-4 first:pt-0 last:border-0">
      <div>
        <div className="section-label">{title}</div>
        {hint && <div className="mt-0.5 text-xs text-base-muted">{hint}</div>}
      </div>
      {children}
    </div>
  );
}

function toggleInArray<T>(arr: T[], val: T): T[] {
  return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
}

export default function SearchPanel({
  filters,
  onChange,
  onSubmit,
  onApplyBrief,
  submitLabel = "Discover Influencers",
  compact = false,
}: {
  filters: SearchFilters;
  onChange: (f: SearchFilters) => void;
  onSubmit: () => void;
  onApplyBrief?: (parsed: CampaignBriefParseResult) => void;
  submitLabel?: string;
  compact?: boolean;
}) {
  const [mode, setMode] = useState<"filters" | "brief">("filters");
  const [briefText, setBriefText] = useState("");
  const [parsed, setParsed] = useState<CampaignBriefParseResult | null>(null);

  function patch(p: Partial<SearchFilters>) {
    onChange({ ...filters, ...p });
  }

  function handleParse() {
    if (!briefText.trim()) return;
    const result = parseCampaignBrief(briefText);
    setParsed(result);
  }

  function handleApplyBrief() {
    if (!parsed) return;
    patch({
      categories: parsed.detectedCategories,
      platforms: parsed.detectedPlatforms,
      tiers: parsed.detectedTiers,
      campaignObjectives: parsed.detectedObjectives,
      ageRange: parsed.targetAgeRange ?? filters.ageRange,
      genderLean: (parsed.targetGender as SearchFilters["genderLean"]) ?? filters.genderLean,
    });
    onApplyBrief?.(parsed);
    setMode("filters");
  }

  const primaryPlatformForRanges: Platform = filters.platforms[0] ?? "Instagram";

  return (
    <div className="card p-5">
      <div className="mb-4 flex gap-1 rounded-lg bg-base-panel2 p-1 text-sm">
        <button
          type="button"
          onClick={() => setMode("filters")}
          className={`flex-1 rounded-md py-2 font-medium transition-colors ${
            mode === "filters" ? "bg-brand text-[#06110d]" : "text-base-muted hover:text-base-text"
          }`}
        >
          Filters
        </button>
        <button
          type="button"
          onClick={() => setMode("brief")}
          className={`flex-1 rounded-md py-2 font-medium transition-colors ${
            mode === "brief" ? "bg-brand text-[#06110d]" : "text-base-muted hover:text-base-text"
          }`}
        >
          Campaign Brief (AI)
        </button>
      </div>

      {mode === "brief" ? (
        <div className="space-y-3">
          <textarea
            className="input-field h-40 w-full resize-none"
            placeholder='e.g. "We are launching a pain-relief patch targeting active Nigerian adults aged 25-45. We need TikTok and Instagram creators in fitness, lifestyle and sports, with strong engagement and a predominantly Nigerian audience."'
            value={briefText}
            onChange={(e) => setBriefText(e.target.value)}
          />
          <button type="button" onClick={handleParse} className="btn-secondary w-full text-sm">
            Interpret Brief
          </button>

          {parsed && (
            <div className="space-y-3 rounded-xl border border-base-border bg-base-panel2 p-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="section-label">AI Interpretation</span>
                <span
                  className={`chip ${
                    parsed.confidence === "high" ? "chip-active" : parsed.confidence === "low" ? "border-brand-rose/50 text-brand-rose" : ""
                  }`}
                >
                  {parsed.confidence} confidence
                </span>
              </div>
              <div>
                <span className="text-base-muted">Categories: </span>
                {parsed.detectedCategories.join(", ") || "—"}
              </div>
              <div>
                <span className="text-base-muted">Platforms: </span>
                {parsed.detectedPlatforms.join(", ") || "All platforms"}
              </div>
              <div>
                <span className="text-base-muted">Tiers: </span>
                {parsed.detectedTiers.join(", ") || "Balanced Nano/Micro/Mid-Tier mix"}
              </div>
              <div>
                <span className="text-base-muted">Objectives: </span>
                {parsed.detectedObjectives.join(", ") || "—"}
              </div>
              <div>
                <span className="text-base-muted">Suggested creator count: </span>
                {parsed.suggestedInfluencerCount} ({parsed.suggestedTierMix.map((m) => `${m.count} ${m.tier}`).join(", ")})
              </div>
              {parsed.targetAgeRange && (
                <div>
                  <span className="text-base-muted">Target age: </span>
                  {parsed.targetAgeRange}
                </div>
              )}
              {parsed.notes.length > 0 && (
                <ul className="list-disc space-y-1 pl-4 text-xs text-base-muted">
                  {parsed.notes.map((n, i) => (
                    <li key={i}>{n}</li>
                  ))}
                </ul>
              )}
              <button type="button" onClick={handleApplyBrief} className="btn-primary w-full text-sm">
                Apply to Filters &amp; Continue
              </button>
              <p className="text-xs text-base-muted">You can review and edit every field after applying.</p>
            </div>
          )}
        </div>
      ) : (
        <div className={compact ? "max-h-[70vh] overflow-y-auto pr-1" : ""}>
          <Section title="Influencer Category" hint="Select one or more. Use Custom for a specific niche.">
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => (
                <FilterChip
                  key={c}
                  label={c}
                  active={filters.categories.includes(c)}
                  onClick={() => patch({ categories: toggleInArray(filters.categories, c) })}
                />
              ))}
            </div>
            <input
              className="input-field mt-2 w-full"
              placeholder="Other / custom niche (e.g. 'car detailing')"
              value={filters.customCategory}
              onChange={(e) => patch({ customCategory: e.target.value })}
            />
          </Section>

          <Section title="Social Media Platform" hint="Multi-platform search supported.">
            <div className="flex flex-wrap gap-1.5">
              {PLATFORMS.map((p) => (
                <FilterChip key={p} label={p} active={filters.platforms.includes(p)} onClick={() => patch({ platforms: toggleInArray(filters.platforms, p) })} />
              ))}
            </div>
          </Section>

          <Section title="Influencer Tier" hint={`Ranges shown for ${primaryPlatformForRanges} (thresholds vary by platform).`}>
            <div className="flex flex-wrap gap-1.5">
              {TIERS.map((t: Tier) => (
                <FilterChip
                  key={t}
                  label={`${t} (${tierRangeLabel(primaryPlatformForRanges, t)})`}
                  active={filters.tiers.includes(t)}
                  onClick={() => patch({ tiers: toggleInArray(filters.tiers, t) })}
                />
              ))}
            </div>
          </Section>

          <Section title="Audience">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs text-base-muted">Primary NG state</label>
                <select className="input-field w-full" value={filters.audienceLocationState} onChange={(e) => patch({ audienceLocationState: e.target.value })}>
                  <option>Any</option>
                  {STATE_CITIES.map((s) => (
                    <option key={s.state}>{s.state}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-base-muted">Age range</label>
                <select className="input-field w-full" value={filters.ageRange} onChange={(e) => patch({ ageRange: e.target.value })}>
                  <option>Any</option>
                  {["13-17", "18-24", "25-34", "35-44", "45+"].map((a) => (
                    <option key={a}>{a}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-2">
              <label className="mb-1 block text-xs text-base-muted">Min. % audience in Nigeria: {filters.minNigeriaAudiencePct}%</label>
              <input
                type="range"
                min={0}
                max={100}
                value={filters.minNigeriaAudiencePct}
                onChange={(e) => patch({ minNigeriaAudiencePct: Number(e.target.value) })}
                className="w-full accent-brand"
              />
            </div>
            <div className="mt-2">
              <label className="mb-1 block text-xs text-base-muted">Gender lean</label>
              <select className="input-field w-full" value={filters.genderLean} onChange={(e) => patch({ genderLean: e.target.value as SearchFilters["genderLean"] })}>
                <option>Any</option>
                <option>Male-leaning</option>
                <option>Female-leaning</option>
                <option>Balanced</option>
              </select>
            </div>
          </Section>

          <Section title="Performance">
            <label className="mb-1 block text-xs text-base-muted">Min. engagement rate: {filters.minEngagementRate}%</label>
            <input type="range" min={0} max={15} step={0.5} value={filters.minEngagementRate} onChange={(e) => patch({ minEngagementRate: Number(e.target.value) })} className="w-full accent-brand" />
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs text-base-muted">Min. avg. views</label>
                <input type="number" min={0} className="input-field w-full" value={filters.minAvgViews} onChange={(e) => patch({ minAvgViews: Number(e.target.value) })} />
              </div>
              <div>
                <label className="mb-1 block text-xs text-base-muted">Min. followers</label>
                <input type="number" min={0} className="input-field w-full" value={filters.minFollowers} onChange={(e) => patch({ minFollowers: Number(e.target.value) })} />
              </div>
            </div>
          </Section>

          <Section title="Content">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs text-base-muted">Format</label>
                <select className="input-field w-full" value={filters.contentFormat} onChange={(e) => patch({ contentFormat: e.target.value as ContentFormat | "Any" })}>
                  <option>Any</option>
                  <option>Video-first</option>
                  <option>Image-first</option>
                  <option>Mixed</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-base-muted">Language</label>
                <select className="input-field w-full" value={filters.language} onChange={(e) => patch({ language: e.target.value })}>
                  <option>Any</option>
                  {LANGUAGES_POOL.map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
              </div>
            </div>
          </Section>

          <Section title="Campaign Fit" hint="What is this campaign trying to achieve?">
            <div className="flex flex-wrap gap-1.5">
              {CAMPAIGN_OBJECTIVES.map((o) => (
                <FilterChip key={o} label={o} active={filters.campaignObjectives.includes(o)} onClick={() => patch({ campaignObjectives: toggleInArray(filters.campaignObjectives, o) })} />
              ))}
            </div>
          </Section>

          <Section title="Budget" hint="Estimated cost-per-post range (₦). Unavailable rate cards are clearly labelled.">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs text-base-muted">Min ₦</label>
                <input type="number" min={0} className="input-field w-full" value={filters.budgetMin} onChange={(e) => patch({ budgetMin: Number(e.target.value) })} />
              </div>
              <div>
                <label className="mb-1 block text-xs text-base-muted">Max ₦</label>
                <input type="number" min={0} className="input-field w-full" value={filters.budgetMax} onChange={(e) => patch({ budgetMax: Number(e.target.value) })} />
              </div>
            </div>
          </Section>

          <Section title="Brand Experience">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={filters.requireBrandExperience} onChange={(e) => patch({ requireBrandExperience: e.target.checked })} className="accent-brand" />
              Require prior brand collaboration
            </label>
            <input
              className="input-field mt-2 w-full"
              placeholder="Exclude creators associated with (brand name)"
              value={filters.excludeCompetitorsOf}
              onChange={(e) => patch({ excludeCompetitorsOf: e.target.value })}
            />
          </Section>

          <button type="button" onClick={onSubmit} className="btn-primary mt-4 w-full">
            {submitLabel}
          </button>
        </div>
      )}
    </div>
  );
}
