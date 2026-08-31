"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppState } from "@/context/AppStateContext";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/discover", label: "Discover" },
  { href: "/shortlist", label: "Shortlist" },
  { href: "/methodology", label: "Methodology" },
];

export default function NavBar() {
  const pathname = usePathname();
  const { shortlist, hydrated } = useAppState();

  return (
    <header className="sticky top-0 z-40 border-b border-base-border bg-base-bg/90 backdrop-blur">
      <div className="border-b border-base-border/60 bg-brand/10 px-4 py-1.5 text-center text-[11px] text-brand-soft sm:px-6 lg:px-8">
        Demo build — influencer profiles use clearly-labelled synthetic sample data, not real individuals. See{" "}
        <Link href="/methodology" className="underline underline-offset-2">
          data &amp; compliance approach
        </Link>
        .
      </div>
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-brand-soft text-sm font-bold text-[#06110d]">
            NI
          </span>
          <span className="text-sm font-semibold tracking-tight">
            Influencer<span className="text-brand-soft">Intel</span> NG
          </span>
        </Link>
        <nav className="hidden items-center gap-1 sm:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                pathname === l.href ? "bg-base-panel2 text-base-text" : "text-base-muted hover:text-base-text"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <Link href="/shortlist" className="btn-secondary flex items-center gap-2 !py-2 !px-3 text-sm">
          Shortlist
          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand px-1 text-[11px] font-bold text-[#06110d]">
            {hydrated ? shortlist.length : 0}
          </span>
        </Link>
      </div>
    </header>
  );
}
