"use client";

import { useRouter } from "next/navigation";
import { useAppState } from "@/context/AppStateContext";
import SearchPanel from "@/components/SearchPanel";
import { getInfluencers } from "@/lib/data/generator";
import { CATEGORIES, PLATFORMS } from "@/lib/types";

const STEPS = [
  { n: "01", title: "Create Campaign Request", desc: "Set filters or paste a full campaign brief." },
  { n: "02", title: "Discover Influencers", desc: "Engine scores 300+ profiles against your criteria." },
  { n: "03", title: "Analyse Performance", desc: "Engagement, views, growth — from the last 15 posts." },
  { n: "04", title: "Compare & Shortlist", desc: "Rank by Fit Score, not just follower count." },
  { n: "05", title: "Export Recommendation", desc: "Campaign-level summary ready for stakeholders." },
];

export default function HomePage() {
  const router = useRouter();
  const { filters, setFilters } = useAppState();
  const total = getInfluencers().length;

  function goDiscover() {
    router.push("/discover");
  }

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-2xl border border-base-border bg-gradient-to-br from-base-panel via-base-panel to-brand/10 px-6 py-12 sm:px-10">
        <div className="max-w-2xl">
          <span className="chip chip-active mb-4">Nigerian Influencer Intelligence Platform</span>
          <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            Find the influencers who actually fit your campaign — not just the biggest ones.
          </h1>
          <p className="mt-4 text-base-muted">
            Filter by category, platform and tier, or paste a full campaign brief. Our multi-factor Fit Score ranks{" "}
            {total}+ sample Nigerian creator profiles by relevance, audience quality, engagement and brand-experience —
            not follower count alone.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 text-xs text-base-muted">
            <span>{total}+ sample profiles</span>
            <span>·</span>
            <span>{CATEGORIES.length} categories</span>
            <span>·</span>
            <span>{PLATFORMS.length} platforms</span>
            <span>·</span>
            <span>5 tiers</span>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {STEPS.map((s) => (
          <div key={s.n} className="card p-4">
            <div className="text-xs font-bold text-brand-soft">{s.n}</div>
            <div className="mt-1 text-sm font-semibold">{s.title}</div>
            <div className="mt-1 text-xs text-base-muted">{s.desc}</div>
          </div>
        ))}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Start your campaign request</h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="card flex flex-col justify-center gap-4 p-8 text-sm text-base-muted">
            <p>
              Set your filters on the right — category, platform, tier, audience, performance, budget and campaign
              objective — or switch to <span className="text-base-text">Campaign Brief</span> mode and paste a full
              brief for AI-assisted interpretation.
            </p>
            <p>
              Every recommendation is transparent: each influencer gets a 0–100 Fit Score with a plain-language
              explanation, and metrics we cannot reliably access are clearly labelled{" "}
              <span className="font-medium text-base-text">Data unavailable</span> rather than estimated silently.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {["Beauty & Skincare", "Fashion", "Comedy", "Fitness & Wellness", "Technology"].map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setFilters({ ...filters, categories: [c as any] });
                    goDiscover();
                  }}
                  className="chip hover:border-brand/50"
                >
                  Quick start: {c}
                </button>
              ))}
            </div>
          </div>
          <SearchPanel filters={filters} onChange={setFilters} onSubmit={goDiscover} />
        </div>
      </section>
    </div>
  );
}
