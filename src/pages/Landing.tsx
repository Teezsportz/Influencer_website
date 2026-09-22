import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "../lib/store";

type Role = "agency" | "client";

export default function Landing() {
  const { clients } = useData();
  const navigate = useNavigate();

  const [role, setRole] = useState<Role>("agency");
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((c) => c.name.toLowerCase().includes(q));
  }, [clients, query]);

  // Nothing left to suggest once the typed text is already an exact match —
  // hiding the dropdown here also keeps it from overlapping the submit button.
  const showSuggestions =
    focused && suggestions.length > 0 && !(suggestions.length === 1 && suggestions[0].name.toLowerCase() === query.trim().toLowerCase());

  function enterWorkspace(clientId: string) {
    navigate(role === "agency" ? `/agency/${clientId}` : `/client/${clientId}`);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const match = clients.find((c) => c.name.toLowerCase() === query.trim().toLowerCase());
    if (!match) {
      setError(
        query.trim()
          ? `We couldn't find a brand called "${query.trim()}". Try one of the brands below.`
          : "Type a brand name to continue.",
      );
      return;
    }
    setError(null);
    enterWorkspace(match.id);
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0B1220]">
      {/* Layered decorative background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-10%,#1B2A4A_0%,#0B1220_60%)]" />
        <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-[28rem] w-[28rem] rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
        <svg className="absolute inset-0 h-full w-full opacity-[0.04]" aria-hidden>
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M40 0H0V40" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-16">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-indigo-500 text-lg font-bold text-white shadow-lg shadow-emerald-500/20">
            DX
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">DigitX Content</h1>
          <p className="mt-2 max-w-sm text-sm text-slate-400">
            One shared content calendar for your creative team and every brand you work with —
            built and approved together, in real time.
          </p>
        </div>

        <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl">
          <div className="mb-5 grid grid-cols-2 gap-1 rounded-lg bg-white/5 p-1">
            {(["agency", "client"] as Role[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                  role === r ? "bg-white text-slate-900 shadow" : "text-slate-300 hover:text-white"
                }`}
              >
                {r === "agency" ? "Agency creative" : "Client"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <label className="mb-1.5 block text-xs font-medium text-slate-300">
              Enter your brand to continue
            </label>
            <div className="relative">
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setError(null);
                }}
                onFocus={() => setFocused(true)}
                onBlur={() => setTimeout(() => setFocused(false), 120)}
                placeholder="e.g. Firstbank"
                autoComplete="off"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
              />
              {showSuggestions && (
                <div className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-white/10 bg-[#111827] shadow-xl">
                  {suggestions.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onMouseDown={() => {
                        setQuery(c.name);
                        setError(null);
                      }}
                      className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm text-slate-200 hover:bg-white/10"
                    >
                      <span
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                        style={{ backgroundColor: c.colorHex }}
                      >
                        {c.initials}
                      </span>
                      {c.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {error && <p className="mt-2 text-xs text-rose-400">{error}</p>}

            <button
              type="submit"
              className="mt-4 w-full rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-emerald-400"
            >
              Enter workspace →
            </button>
          </form>

          <div className="mt-5 border-t border-white/10 pt-4">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-slate-500">
              Quick access
            </p>
            <div className="flex flex-wrap gap-1.5">
              {clients.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => enterWorkspace(c.id)}
                  className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300 transition hover:border-emerald-400/40 hover:text-white"
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-6 text-[11px] text-slate-500">
          Prototype build — no real accounts yet. Data lives in your browser and syncs live across
          tabs on this device.
        </p>
      </div>
    </div>
  );
}
