# InfluencerIntel NG — Nigerian Influencer Discovery, Intelligence & Recommendation Platform

A working Next.js implementation of an influencer discovery/intelligence engine for
Nigerian marketing campaigns: filter or brief-in a campaign, get a multi-factor
**Fit Score**-ranked shortlist (never sorted by follower count alone), drill into
per-influencer performance/brand-history/risk analysis, compare, shortlist, and
export a campaign plan.

> **This build ships with a synthetic sample dataset** (~300 generated, clearly
> fictional Nigerian creator profiles) so the full product is functional end-to-end
> without requiring live social-platform API credentials. No real individual's data
> is included. See [Data Acquisition & Compliance](#8-data-acquisition--compliance-approach)
> for how this plugs into real data sources in production, and `/methodology` in the
> running app for the same documentation surfaced in-product.

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
# or
npm run build && npm run start
```

No environment variables or API keys are required to run the demo build.

---

## 1. Platform Architecture & Core Features

**Stack:** Next.js 14 (App Router) + TypeScript + Tailwind CSS, entirely client-rendered
data/state (no external database in this build — see roadmap). Single deployable app.

```
app/
  page.tsx                 Landing + campaign request entry point
  discover/page.tsx        Filter sidebar + results dashboard + compare/shortlist
  influencer/[id]/page.tsx Influencer profile
  shortlist/page.tsx       Shortlist & campaign planning
  methodology/page.tsx     Scoring methodology & data-compliance documentation
lib/
  types.ts                 Domain model (Influencer, ScoreBreakdown, SearchFilters, …)
  data/                    Tier definitions, seeded synthetic-data generator, name pools
  scoring.ts                Multi-factor Fit Score engine + risk-flag detector
  discover.ts               Search/filter/relaxation pipeline
  briefParser.ts             Campaign Brief (AI) keyword interpreter
  aiNarrative.ts             "Why these influencers?" narrative generator
  campaignSummary.ts         Shortlist → campaign-level rollup
context/AppStateContext.tsx  Global filters/weights/shortlist state (localStorage-persisted)
components/                  SearchPanel, ResultsTable, profile widgets, etc.
```

**Core features implemented:**
- Category / platform / tier / audience / performance / content / campaign-objective /
  budget / brand-experience filtering, plus free-text **Campaign Brief mode**.
- Discovery engine returning a minimum-20 Fit-Score-ranked shortlist, with transparent,
  logged constraint-relaxation when a narrow combination has too few exact matches.
- Configurable, transparent 0–100 Fit Score with a per-factor explanation.
- Sortable/filterable results table, multi-select compare, CSV export.
- Full influencer profile: overview, performance (with data-source labelling),
  content intelligence, brand-collaboration history, Fit Score breakdown, risk flags.
- Shortlist with editable deliverables/notes and a campaign-level summary (tier/platform
  mix, total estimated cost, combined followers, caveated potential-reach estimate,
  strengths/gaps).

## 2. User Journey & Key Screens

**CREATE CAMPAIGN REQUEST → SELECT FILTERS OR ADD BRIEF → DISCOVER → ANALYSE → COMPARE
→ SHORTLIST → EXPORT**

1. **Home (`/`)** — hero + campaign-request form (Filters or Campaign Brief tabs).
2. **Discover (`/discover`)** — sticky filter sidebar, relaxation-transparency banner,
   AI "why these" narrative, sortable comparison table, multi-select compare, shortlist
   toggle per row, CSV export, adjustable scoring-weight panel.
3. **Influencer Profile (`/influencer/[id]`)** — full intelligence dossier for one
   creator on one platform (switchable across their other platforms).
4. **Shortlist (`/shortlist`)** — per-creator deliverables/notes editor plus a live
   campaign-level summary panel.
5. **Methodology (`/methodology`)** — the scoring/tier/data-compliance documentation,
   always accessible so recommendations are auditable, not a black box.

## 3. Search & Filtering Logic

Category, platform and tier are the **structural hard filters** — a "Beauty & Skincare
/ Instagram / Micro" search returns beauty creators on Instagram in that follower band,
not the full universe re-sorted. All other filters (audience, performance minimums,
budget, format, language, brand experience) are also applied as hard filters by default.

Because over-constraining a real campaign brief can legitimately return too few
candidates, `lib/discover.ts` runs a **progressive relaxation pipeline** whenever fewer
than 20 results survive: it drops secondary constraints first (budget → format →
language → performance minimums → brand-experience requirement), then broadens category
to closely-related niches, then to adjacent tiers, then drops the tier constraint, then
widens platform scope — in that order, to preserve campaign intent as much as possible.
Every relaxation is logged and surfaced in the UI banner, so the user always knows *why*
a given result appears rather than silently getting an unrelated list.

**Campaign Brief mode** (`lib/briefParser.ts`) is a transparent, local keyword/heuristic
interpreter (no hosted LLM call in this build) that maps free text to categories,
platforms, tiers, objectives, target age/gender and a suggested creator count + tier
mix — all editable before running discovery.

## 4. Influencer Scoring Methodology

`lib/scoring.ts` computes a 0–100 **Fit Score** from eight weighted factors — Category
Relevance, Platform Strength, Engagement Quality, Audience Quality, Content Consistency,
Growth Trend, Brand Collaboration Experience, Campaign Objective Fit — deliberately
**excluding raw follower count** as a direct input. Default weights and full factor
descriptions are documented at `/methodology` and in `lib/types.ts`
(`DEFAULT_WEIGHTS`); users can adjust weights live from the Discover page, and every
profile page shows the per-factor breakdown that produced that creator's score.

A separate **risk-flag detector** (`detectRiskFlags`) surfaces evidence-based, non-
accusatory flags: low engagement relative to follower size, unusual engagement patterns
(e.g. abnormally low comment-to-like ratio), limited recent activity, inconsistent
posting cadence, audience-location mismatch, and (when an "exclude competitors of"
brand is supplied) recent competitor association.

## 5. Results Dashboard Structure

The results table (`components/ResultsTable.tsx`) implements the required columns —
Rank, Influencer, Platform, Category, Tier, Followers, Engagement Rate, Avg. Views,
Avg. Likes, Avg. Comments, Recent Brand Partnerships, Fit Score — with per-column sort,
multi-select for comparison, one-click shortlist toggle, and CSV export. An AI narrative
panel above the table explains the shortlist in plain language and rolls up recurring
risk themes across it.

## 6. Influencer Profile Structure

`/influencer/[id]` renders: profile overview (handles, category, tier, location);
performance metrics with the analysis period, post count and **data-source label**
(publicly observable / creator-authorised / estimated / unavailable) on every figure;
content intelligence (top themes, format, languages, audience age/state breakdown);
brand-collaboration history (brand, approximate date, campaign category, disclosure
status — a brand appearing in content is never treated as a paid partnership unless
disclosed); the full Fit Score factor breakdown; risk/brand-safety flags; the 15 most
recently analysed posts; and estimated pricing (clearly labelled as tier-benchmark
estimates, not a confirmed rate card).

## 7. Campaign Shortlist Functionality

`/shortlist` lets users edit deliverables and internal notes per creator, and computes
a live campaign-level summary (`lib/campaignSummary.ts`): influencer count, tier mix,
platform mix, total estimated cost, combined follower base, a **caveated** potential-
reach estimate (explicitly labelled non-deduplicated/directional, since audiences
overlap across creators), plus rule-based strengths/gaps analysis (tier/platform
concentration, average Fit Score, open risk flags, shortlist size). Exports to CSV.

## 8. Data Acquisition & Compliance Approach

This build's dataset is synthetic so the product is fully demonstrable without
credentials. The intended production data model:

- **Official platform APIs** where available (Meta Graph API for Instagram/Facebook
  Business accounts, YouTube Data API, TikTok Business/Research API) for owned or
  creator-authorised metrics.
- **Authorised third-party influencer-data providers** (e.g. HypeAuditor/Modash/
  Upfluence-class vendors) for cross-platform discovery and audience-quality signals,
  under their terms of service.
- **Public information only where legally permitted** — never bypassing platform
  access controls or scraping private/restricted data.
- **Creator authentication** required before displaying private analytics (reach,
  impressions, saves).
- **"Data unavailable" is shown explicitly**, never silently estimated, whenever a
  metric cannot be reliably sourced — enforced throughout via the `DataSource` /
  `ValueWithSource<T>` types and the `DataValue` component.
- Brand-collaboration inference is conservative: appearance in content is not, by
  itself, evidence of a paid partnership.

## 9. Recommended Technology Stack

- **Frontend/app:** Next.js (App Router) + TypeScript + Tailwind — as built here.
- **Data layer (production):** Postgres (creator profiles, campaigns, shortlists) +
  a search/scoring service (could stay in TypeScript, or move hot-path scoring to a
  dedicated service) + a scheduled ingestion pipeline from the API/vendor sources above
  into a normalized metrics warehouse (e.g. BigQuery/Snowflake) feeding the app via a
  fast read replica or cache (Redis) for discovery-time filtering.
- **Auth & creator connections:** OAuth against Meta/TikTok/YouTube Business APIs for
  creator-authorised analytics.
- **AI layer (production):** an LLM (e.g. Claude) for Campaign Brief interpretation and
  narrative generation, replacing/augmenting the local keyword parser used here, with
  the same evidence-grounding discipline (no fabricated metrics).
- **Infra:** Vercel or containerized deployment; background workers for data refresh.

## 10. MVP vs. Future Roadmap

**This build (MVP-in-demo-form):** full UX — filters, brief mode, scoring, discovery
with transparent relaxation, comparison table, profile intelligence, shortlist &
campaign summary, CSV export, methodology transparency — running end-to-end on a
labelled synthetic dataset with no backend dependency.

**Near-term roadmap:**
- Replace the generator with live ingestion from official APIs + an authorised data
  vendor; persist to a real database; add creator OAuth for authorised metrics.
- Multi-user accounts, saved campaigns, team collaboration on shortlists.
- Replace the local keyword brief-parser and template narrative generator with an LLM,
  keeping the same "cite the underlying metric" discipline.
- PDF/PPT export of the campaign recommendation deck, not just CSV.
- Historical trend tracking (growth, engagement over time) once real time-series data
  is available.
- Negotiated-rate tracking (real rate cards replacing tier-benchmark cost estimates).
- Automated brand-safety/authenticity signals (e.g. bot-follower heuristics) backed by
  a licensed authenticity-scoring provider rather than heuristics alone.

---

## Known caveats of this build

- **Sample data, not real people.** All influencer names, handles and metrics are
  deterministically generated and fictional. Treat this as a demonstration of the
  product's mechanics, not real Nigerian creator data.
- **No hosted LLM call.** Campaign Brief interpretation and the "why these influencers"
  narrative are rule-based/template-driven for full transparency and to avoid
  fabricated claims about (synthetic) individuals — see roadmap above for the intended
  production upgrade path.
- A transitive `postcss` dependency bundled inside `next@14.2.x` carries known
  advisories (see `npm audit`) that are only fully resolved by upgrading to Next 15/16
  — a deliberately deferred breaking change for this iteration.
