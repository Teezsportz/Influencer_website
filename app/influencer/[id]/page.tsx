"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getInfluencerById } from "@/lib/discover";
import { scoreInfluencer } from "@/lib/scoring";
import { useAppState } from "@/context/AppStateContext";
import { formatCompactNumber, formatDateMonthYear, formatRelativeDays } from "@/lib/format";
import { tierRangeLabel } from "@/lib/data/tiers";
import { Platform } from "@/lib/types";
import Avatar from "@/components/Avatar";
import ScoreBadge from "@/components/ScoreBadge";
import DataValue from "@/components/DataValue";
import Bar from "@/components/Bar";

export default function InfluencerProfilePage({ params }: { params: { id: string } }) {
  const influencer = getInfluencerById(params.id);
  const searchParams = useSearchParams();
  const { filters, weights, hydrated, addToShortlist, removeFromShortlist, isShortlisted } = useAppState();

  const platform = (searchParams.get("platform") as Platform) || influencer?.primaryPlatform;

  const score = useMemo(() => {
    if (!influencer || !platform) return null;
    return scoreInfluencer(influencer, platform, filters, weights);
  }, [influencer, platform, filters, weights]);

  if (!influencer || !platform) {
    return (
      <div className="card p-10 text-center text-sm text-base-muted">
        Influencer not found. <Link href="/discover" className="text-brand-soft underline">Back to discovery</Link>
      </div>
    );
  }

  const perf = influencer.performanceByPlatform[platform];
  const followers = influencer.followersByPlatform[platform];
  const tier = influencer.tierByPlatform[platform];
  const posts = influencer.recentPosts[platform] ?? influencer.recentPosts[influencer.primaryPlatform] ?? [];
  const shortlisted = hydrated && isShortlisted(influencer.id, platform);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar seed={influencer.avatarSeed} name={influencer.name} size={64} />
          <div>
            <h1 className="text-2xl font-semibold">{influencer.name}</h1>
            <div className="text-sm text-base-muted">
              {influencer.handle} · {influencer.location.city}, {influencer.location.state}
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {influencer.categories.map((c) => (
                <span key={c} className="chip">
                  {c}
                </span>
              ))}
              <span className="chip chip-active">{tier}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {score && <ScoreBadge score={score.total} size="lg" />}
          <button
            onClick={() =>
              shortlisted
                ? removeFromShortlist(influencer.id, platform)
                : addToShortlist({
                    influencerId: influencer.id,
                    platform,
                    deliverables: [{ label: "1 Feed Post", quantity: 1 }],
                    addedAt: new Date().toISOString(),
                    notes: "",
                  })
            }
            className={shortlisted ? "btn-secondary" : "btn-primary"}
          >
            {shortlisted ? "✓ In Shortlist" : "+ Add to Shortlist"}
          </button>
        </div>
      </div>

      {/* Platform switcher */}
      <div className="flex flex-wrap gap-1.5">
        {influencer.platforms.map((p) => (
          <Link key={p} href={`/influencer/${influencer.id}?platform=${p}`} className={`chip ${p === platform ? "chip-active" : ""}`}>
            {p} · {formatCompactNumber(influencer.followersByPlatform[p])}
          </Link>
        ))}
      </div>

      <p className="max-w-3xl text-sm text-base-muted">{influencer.bio}</p>

      {/* Fit score explanation */}
      {score && (
        <section className="card p-5">
          <div className="section-label mb-2">Fit Score Explanation — {score.total}/100</div>
          <p className="mb-4 text-sm text-base-text/90">{score.summary}</p>
          <div className="space-y-3">
            {score.factors.map((f) => (
              <div key={f.key}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-base-muted">
                    {f.label} <span className="text-base-muted/60">({Math.round(f.weight * 100)}% weight)</span>
                  </span>
                  <span className="font-medium">{f.rawScore}/100</span>
                </div>
                <Bar pct={f.rawScore} />
                <p className="mt-1 text-xs text-base-muted">{f.explanation}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Risk flags */}
      {score && score.riskFlags.length > 0 && (
        <section className="card p-5">
          <div className="section-label mb-2">Risk &amp; Brand-Safety Flags</div>
          <div className="space-y-2">
            {score.riskFlags.map((f, i) => (
              <div
                key={i}
                className={`rounded-xl border p-3 text-sm ${
                  f.severity === "high" ? "border-brand-rose/40 bg-brand-rose/5" : f.severity === "medium" ? "border-brand-amber/40 bg-brand-amber/5" : "border-base-border bg-base-panel2"
                }`}
              >
                <div className="font-medium">{f.label}</div>
                <div className="mt-0.5 text-xs text-base-muted">{f.detail}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Performance */}
      <section className="card p-5">
        <div className="section-label mb-1">
          Performance — {perf?.analysisPeriod} ({perf?.postsAnalysed} posts analysed on {platform})
        </div>
        <p className="mb-3 text-xs text-base-muted">
          Data source: {perf?.dataSource === "public" ? "Publicly observable post data" : "Estimated"}. Metrics that
          cannot be reliably accessed are labelled below rather than estimated silently.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <DataValue label="Followers" data={{ value: followers ?? null, source: "public" }} />
          <DataValue label="Engagement Rate" data={perf?.engagementRate ?? { value: null, source: "unavailable" }} isPercent />
          <DataValue label="Avg. Likes" data={perf?.avgLikes ?? { value: null, source: "unavailable" }} />
          <DataValue label="Avg. Comments" data={perf?.avgComments ?? { value: null, source: "unavailable" }} />
          <DataValue label="Avg. Shares/Reposts" data={perf?.avgSharesReposts ?? { value: null, source: "unavailable" }} />
          <DataValue label="Avg. Saves" data={perf?.avgSaves ?? { value: null, source: "unavailable" }} />
          <DataValue label="Avg. Views" data={perf?.avgViews ?? { value: null, source: "unavailable" }} />
          <DataValue label="Avg. Reach/Impressions" data={perf?.avgReachImpressions ?? { value: null, source: "unavailable" }} />
          <DataValue label="90-day Growth" data={perf?.growthTrend90d ?? { value: null, source: "unavailable" }} isPercent />
        </div>
        <div className="mt-3 text-xs text-base-muted">
          Posts ~{influencer.postingFrequencyPerWeek}x/week · Last active {formatRelativeDays(influencer.lastActiveAt)}
        </div>
      </section>

      {/* Content intelligence */}
      <section className="card p-5">
        <div className="section-label mb-2">Content Intelligence</div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <div className="mb-1 text-xs text-base-muted">Top content themes</div>
            <div className="flex flex-wrap gap-1.5">
              {influencer.contentThemes.map((t) => (
                <span key={t} className="chip">
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-1 text-xs text-base-muted">Content format &amp; languages</div>
            <div className="text-sm">{influencer.contentFormat} · {influencer.languages.join(", ")}</div>
          </div>
        </div>
        <div className="mt-4">
          <div className="mb-2 text-xs text-base-muted">Audience snapshot ({influencer.audience.source === "estimated" ? "estimated" : "publicly observable"})</div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              {influencer.audience.ageRange.map((a) => (
                <div key={a.range} className="flex items-center gap-2 text-xs">
                  <span className="w-12 text-base-muted">{a.range}</span>
                  <Bar pct={a.pct} color="#3D8BFF" />
                  <span className="w-8 text-right">{a.pct}%</span>
                </div>
              ))}
            </div>
            <div className="space-y-1.5">
              {influencer.audience.topStates.map((s) => (
                <div key={s.state} className="flex items-center gap-2 text-xs">
                  <span className="w-28 truncate text-base-muted">{s.state}</span>
                  <Bar pct={s.pct} color="#8B6BFF" />
                  <span className="w-8 text-right">{s.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Brand collaborations */}
      <section className="card p-5">
        <div className="section-label mb-2">Brand Collaboration History</div>
        {influencer.brandCollaborations.length === 0 ? (
          <p className="text-sm text-base-muted">No publicly attributable brand collaborations on record.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="text-xs uppercase text-base-muted">
                  <th className="py-2 pr-4">Brand</th>
                  <th className="py-2 pr-4">Approx. Date</th>
                  <th className="py-2 pr-4">Campaign Category</th>
                  <th className="py-2 pr-4">Disclosure</th>
                </tr>
              </thead>
              <tbody>
                {influencer.brandCollaborations.map((c, i) => (
                  <tr key={i} className="border-t border-base-border/60">
                    <td className="py-2 pr-4 font-medium">{c.brand}</td>
                    <td className="py-2 pr-4 text-base-muted">{c.approxDate}</td>
                    <td className="py-2 pr-4 text-base-muted">{c.campaignCategory}</td>
                    <td className="py-2 pr-4 text-base-muted">{c.disclosure}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-2 text-xs text-base-muted">
          Collaborations are inferred only from clearly attributable public content or authorised data — appearing in
          content is not treated as evidence of a paid partnership unless disclosed.
        </p>
      </section>

      {/* Recent posts */}
      {posts.length > 0 && (
        <section className="card p-5">
          <div className="section-label mb-2">Recent Posts Analysed ({posts.length})</div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="text-xs uppercase text-base-muted">
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Format</th>
                  <th className="py-2 pr-4">Likes</th>
                  <th className="py-2 pr-4">Comments</th>
                  <th className="py-2 pr-4">Views</th>
                  <th className="py-2 pr-4">Sponsored</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((p) => (
                  <tr key={p.id} className="border-t border-base-border/60">
                    <td className="py-2 pr-4 text-base-muted">{formatDateMonthYear(p.postedAt)}</td>
                    <td className="py-2 pr-4">{p.format}</td>
                    <td className="py-2 pr-4">{formatCompactNumber(p.likes)}</td>
                    <td className="py-2 pr-4">{formatCompactNumber(p.comments)}</td>
                    <td className="py-2 pr-4">{formatCompactNumber(p.views.value)}</td>
                    <td className="py-2 pr-4">{p.isSponsored ? `Yes (${p.brand})` : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Pricing */}
      <section className="card p-5">
        <div className="section-label mb-2">Estimated Pricing</div>
        <p className="mb-3 text-xs text-base-muted">
          No public rate card is available for this creator — figures below are estimated from tier benchmarks, not
          confirmed pricing.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <DataValue label="Cost per Post" data={influencer.pricing.costPerPost} isCurrency />
          <DataValue label="Cost per Video" data={influencer.pricing.costPerVideo} isCurrency />
          <DataValue label="Cost per Campaign" data={influencer.pricing.costPerCampaign} isCurrency />
        </div>
      </section>
    </div>
  );
}
