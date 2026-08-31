import { PLATFORMS } from "@/lib/types";
import { TIER_RANGES, tierRangeLabel } from "@/lib/data/tiers";

const WEIGHT_ROWS = [
  { label: "Category Relevance", pct: 22, desc: "How closely the creator's primary/secondary content categories match the requested niche." },
  { label: "Engagement Quality", pct: 20, desc: "Engagement rate from the most recent analysed posts, adjusted against any minimum threshold set." },
  { label: "Audience Quality", pct: 15, desc: "Share of tracked audience based in Nigeria, plus state/age alignment with the brief." },
  { label: "Platform Strength", pct: 10, desc: "Performance on the selected platform relative to typical norms for that platform." },
  { label: "Content Consistency", pct: 10, desc: "Posting frequency and recency of activity." },
  { label: "Brand Collaboration Experience", pct: 10, desc: "Number and relevance of identifiable prior brand partnerships." },
  { label: "Growth Trend", pct: 8, desc: "90-day follower growth trend, where available." },
  { label: "Campaign Objective Fit", pct: 5, desc: "Alignment between content style/performance and the stated campaign objective(s)." },
];

const DATA_SOURCES = [
  { label: "Publicly observable", desc: "Derived from public post metrics (likes, comments, captions) as would be visible to any viewer or accessible via official platform APIs." },
  { label: "Creator-authorised", desc: "Metrics such as saves or reach that platforms only expose to the account owner or an authorised business-tools connection." },
  { label: "Estimated", desc: "Modelled from available signals (e.g. tier benchmarks, engagement patterns) when a precise figure cannot be directly observed. Always labelled, never presented as confirmed." },
  { label: "Data unavailable", desc: "Shown explicitly rather than guessing, whenever a metric cannot be reliably sourced." },
];

export default function MethodologyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-10 pb-10">
      <section>
        <h1 className="text-2xl font-semibold">Methodology &amp; Data Compliance</h1>
        <p className="mt-2 text-sm text-base-muted">
          This page documents how influencer Fit Scores are calculated, how tiers are defined, and how this platform
          approaches data sourcing and compliance — in line with the transparency principles the product is built on.
        </p>
      </section>

      <section className="card p-5">
        <h2 className="mb-1 text-sm font-semibold">⚠ About this build</h2>
        <p className="text-sm text-base-muted">
          This deployment ships with a <span className="text-base-text">synthetic sample dataset</span> of ~300
          generated Nigerian creator profiles (fictional names, deterministic sample metrics) so the full product
          experience — search, scoring, profiles, shortlist, export — is fully functional end-to-end without
          requiring live platform API credentials. No real individual&apos;s data is included. See &quot;Data Acquisition
          &amp; Compliance&quot; below for how this plugs into real data sources in production.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Fit Score Methodology (0–100)</h2>
        <p className="mb-4 text-sm text-base-muted">
          The Fit Score deliberately excludes raw follower count as a direct input. Weights below are the defaults —
          every user can adjust them live from the Discover page (&quot;Adjust Scoring Methodology&quot;), and the
          per-influencer profile page shows exactly how each factor contributed to that creator&apos;s score.
        </p>
        <div className="space-y-3">
          {WEIGHT_ROWS.map((r) => (
            <div key={r.label} className="card p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{r.label}</span>
                <span className="text-brand-soft">{r.pct}%</span>
              </div>
              <p className="mt-1 text-xs text-base-muted">{r.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Influencer Tier Definitions (follower ranges by platform)</h2>
        <p className="mb-4 text-sm text-base-muted">
          Thresholds intentionally differ by platform — TikTok and YouTube follower dynamics do not behave like
          Instagram, so the same absolute follower count does not imply the same tier everywhere.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-base-muted">
                <th className="py-2 pr-4">Platform</th>
                <th className="py-2 pr-4">Nano</th>
                <th className="py-2 pr-4">Micro</th>
                <th className="py-2 pr-4">Mid-Tier</th>
                <th className="py-2 pr-4">Macro</th>
                <th className="py-2 pr-4">Mega/Celebrity</th>
              </tr>
            </thead>
            <tbody>
              {PLATFORMS.map((p) => (
                <tr key={p} className="border-t border-base-border/60">
                  <td className="py-2 pr-4 font-medium">{p}</td>
                  {TIER_RANGES[p].map((r) => (
                    <td key={r.tier} className="py-2 pr-4 text-base-muted">
                      {tierRangeLabel(p, r.tier)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Data Sourcing Labels</h2>
        <div className="space-y-3">
          {DATA_SOURCES.map((d) => (
            <div key={d.label} className="card p-4">
              <div className="text-sm font-medium">{d.label}</div>
              <p className="mt-1 text-xs text-base-muted">{d.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Data Acquisition &amp; Compliance Approach</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-base-muted">
          <li>Use official platform APIs where available (e.g. Instagram/Facebook Graph API via a Meta Business connection, YouTube Data API, TikTok Research/Business API) for owned or authorised metrics.</li>
          <li>Use authorised third-party influencer-data providers (e.g. HypeAuditor, Modash, Upfluence-style vendors) for cross-platform discovery and audience-quality signals, under their terms of service.</li>
          <li>Use only publicly available information where legally permitted, and never bypass platform access controls or scrape private, restricted or non-public data.</li>
          <li>Require creator authentication/authorisation (e.g. a connected Business/Creator account) before displaying private analytics such as reach, impressions or saves.</li>
          <li>Display &quot;Data unavailable&quot; rather than fabricating a number whenever a metric cannot be reliably sourced.</li>
          <li>Treat brand-collaboration inference conservatively: a brand appearing in content is not, on its own, treated as evidence of a paid partnership unless disclosure is present.</li>
        </ul>
      </section>
    </div>
  );
}
