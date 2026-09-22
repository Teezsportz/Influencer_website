import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import digitxMark from "../assets/brand/digitx-mark-orange.png";
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
    <div className="relative min-h-screen overflow-hidden bg-brand-dark">
      {/* Layered decorative background — digitXplus brand palette + honeycomb motif */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-10%,#4E1304_0%,#38040E_65%)]" />
        <img
          src={digitxMark}
          aria-hidden
          className="absolute -top-24 left-1/2 h-[46rem] w-[46rem] -translate-x-1/2 opacity-[0.07]"
        />
        <svg className="absolute inset-0 h-full w-full opacity-[0.05]" aria-hidden>
          <defs>
            <pattern id="honeycomb" width="56" height="97" patternUnits="userSpaceOnUse">
              <path
                d="M28,0 L52.5,14 L52.5,42 L28,56 L3.5,42 L3.5,14 Z"
                fill="none"
                stroke="#FFA10A"
                strokeWidth="1.5"
              />
              <path
                d="M0,56 L24.5,70 L24.5,98 L0,112 L-24.5,98 L-24.5,70 Z"
                fill="none"
                stroke="#FFA10A"
                strokeWidth="1.5"
              />
              <path
                d="M56,56 L80.5,70 L80.5,98 L56,112 L31.5,98 L31.5,70 Z"
                fill="none"
                stroke="#FFA10A"
                strokeWidth="1.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#honeycomb)" />
        </svg>
      </div>

      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-16">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand p-2.5 shadow-lg shadow-black/30 ring-1 ring-accent/30">
            <img src={digitxMark} alt="digitX" className="h-full w-full object-contain" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">DigitX Content</h1>
          <p className="mt-2 max-w-sm text-sm text-white/60">
            One shared content calendar for your creative team and every brand you work with —
            built and approved together, in real time.
          </p>
        </div>

        <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-xl">
          <div className="mb-5 grid grid-cols-2 gap-1 rounded-lg bg-black/20 p-1">
            {(["agency", "client"] as Role[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                  role === r ? "bg-accent text-brand-dark shadow" : "text-white/70 hover:text-white"
                }`}
              >
                {r === "agency" ? "Agency creative" : "Client"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <label className="mb-1.5 block text-xs font-medium text-white/70">
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
                className="w-full rounded-lg border border-white/15 bg-black/20 px-3.5 py-2.5 text-sm text-white placeholder-white/40 outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              />
              {showSuggestions && (
                <div className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-white/10 bg-[#2A0B03] shadow-xl">
                  {suggestions.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onMouseDown={() => {
                        setQuery(c.name);
                        setError(null);
                      }}
                      className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm text-white/90 hover:bg-white/10"
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

            {error && <p className="mt-2 text-xs text-rose-300">{error}</p>}

            <button
              type="submit"
              className="mt-4 w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-brand-dark transition hover:bg-accent-dark"
            >
              Enter workspace →
            </button>
          </form>

          <div className="mt-5 border-t border-white/10 pt-4">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-white/40">
              Quick access
            </p>
            <div className="flex flex-wrap gap-1.5">
              {clients.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => enterWorkspace(c.id)}
                  className="rounded-full border border-white/15 bg-black/20 px-2.5 py-1 text-xs text-white/70 transition hover:border-accent/50 hover:text-white"
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-6 text-[11px] text-white/40">
          Prototype build — no real accounts yet. Data lives in your browser and syncs live across
          tabs on this device.
        </p>
      </div>
    </div>
  );
}
