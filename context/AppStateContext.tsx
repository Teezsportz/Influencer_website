"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  CampaignBriefParseResult,
  DEFAULT_FILTERS,
  DEFAULT_WEIGHTS,
  ScoringWeights,
  SearchFilters,
  ShortlistEntry,
} from "@/lib/types";

const STORAGE_KEY = "influencer-intel-ng-state-v1";

interface PersistedState {
  filters: SearchFilters;
  weights: ScoringWeights;
  shortlist: ShortlistEntry[];
  lastBrief: CampaignBriefParseResult | null;
}

interface AppState extends PersistedState {
  hydrated: boolean;
  setFilters: (f: SearchFilters) => void;
  setWeights: (w: ScoringWeights) => void;
  setLastBrief: (b: CampaignBriefParseResult | null) => void;
  addToShortlist: (entry: ShortlistEntry) => void;
  removeFromShortlist: (influencerId: string, platform: string) => void;
  updateShortlistEntry: (influencerId: string, platform: string, patch: Partial<ShortlistEntry>) => void;
  isShortlisted: (influencerId: string, platform: string) => boolean;
  clearShortlist: () => void;
  resetFilters: () => void;
}

const defaultState: PersistedState = {
  filters: DEFAULT_FILTERS,
  weights: DEFAULT_WEIGHTS,
  shortlist: [],
  lastBrief: null,
};

const AppStateCtx = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PersistedState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setState({ ...defaultState, ...parsed });
      }
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage unavailable — non-fatal, state simply won't persist
    }
  }, [state, hydrated]);

  const value: AppState = useMemo(
    () => ({
      ...state,
      hydrated,
      setFilters: (f) => setState((s) => ({ ...s, filters: f })),
      setWeights: (w) => setState((s) => ({ ...s, weights: w })),
      setLastBrief: (b) => setState((s) => ({ ...s, lastBrief: b })),
      addToShortlist: (entry) =>
        setState((s) => {
          const exists = s.shortlist.some((e) => e.influencerId === entry.influencerId && e.platform === entry.platform);
          if (exists) return s;
          return { ...s, shortlist: [...s.shortlist, entry] };
        }),
      removeFromShortlist: (influencerId, platform) =>
        setState((s) => ({
          ...s,
          shortlist: s.shortlist.filter((e) => !(e.influencerId === influencerId && e.platform === platform)),
        })),
      updateShortlistEntry: (influencerId, platform, patch) =>
        setState((s) => ({
          ...s,
          shortlist: s.shortlist.map((e) =>
            e.influencerId === influencerId && e.platform === platform ? { ...e, ...patch } : e,
          ),
        })),
      isShortlisted: (influencerId, platform) =>
        state.shortlist.some((e) => e.influencerId === influencerId && e.platform === platform),
      clearShortlist: () => setState((s) => ({ ...s, shortlist: [] })),
      resetFilters: () => setState((s) => ({ ...s, filters: DEFAULT_FILTERS, weights: DEFAULT_WEIGHTS })),
    }),
    [state, hydrated],
  );

  return <AppStateCtx.Provider value={value}>{children}</AppStateCtx.Provider>;
}

export function useAppState(): AppState {
  const ctx = useContext(AppStateCtx);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
