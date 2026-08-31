"use client";

import { DEFAULT_WEIGHTS, ScoringWeights } from "@/lib/types";

const LABELS: { key: keyof ScoringWeights; label: string }[] = [
  { key: "categoryRelevance", label: "Category Relevance" },
  { key: "platformStrength", label: "Platform Strength" },
  { key: "engagement", label: "Engagement Quality" },
  { key: "audienceQuality", label: "Audience Quality (NG focus)" },
  { key: "consistency", label: "Content Consistency" },
  { key: "growth", label: "Growth Trend" },
  { key: "brandExperience", label: "Brand Collaboration Experience" },
  { key: "campaignFit", label: "Campaign Objective Fit" },
];

export default function WeightsPanel({
  weights,
  onChange,
}: {
  weights: ScoringWeights;
  onChange: (w: ScoringWeights) => void;
}) {
  const total = Object.values(weights).reduce((a, b) => a + b, 0);

  return (
    <div className="card space-y-3 p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="section-label">Fit Score Methodology</div>
          <p className="mt-0.5 text-xs text-base-muted">
            Adjust factor weights to match how your team prioritises campaign fit. Total: {Math.round(total * 100)}%
          </p>
        </div>
        <button onClick={() => onChange(DEFAULT_WEIGHTS)} className="btn-secondary !py-1.5 !px-3 text-xs">
          Reset
        </button>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {LABELS.map(({ key, label }) => (
          <div key={key}>
            <label className="mb-1 flex justify-between text-xs text-base-muted">
              <span>{label}</span>
              <span>{Math.round(weights[key] * 100)}%</span>
            </label>
            <input
              type="range"
              min={0}
              max={0.4}
              step={0.01}
              value={weights[key]}
              onChange={(e) => onChange({ ...weights, [key]: Number(e.target.value) })}
              className="w-full accent-brand"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
