import { Link } from "react-router-dom";
import { useData } from "../lib/store";

export default function Landing() {
  const { clients, postsForClient } = useData();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="mb-12 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-lg font-bold text-white">
            CH
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Content Approval Hub</h1>
          <p className="mx-auto mt-2 max-w-xl text-slate-500">
            A shared content calendar where your social team creates and schedules posts, and clients
            see and approve them in real time — no more email attachments or forgotten Slack threads.
          </p>
          <p className="mx-auto mt-1 max-w-xl text-xs text-slate-400">
            Prototype build — data lives in your browser's local storage. Open the Agency view and a
            Client view in two tabs side by side to see live sync in action.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Link
            to="/agency/c-northwind"
            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
              📅
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Agency team</h2>
            <p className="mt-1 text-sm text-slate-500">
              Build the content calendar, upload creatives, write captions, and manage every client
              workspace from one place.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 group-hover:gap-2">
              Open agency dashboard <span aria-hidden>→</span>
            </span>
          </Link>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              👤
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Client view</h2>
            <p className="mt-1 text-sm text-slate-500">
              Pick a client workspace to preview what that client sees: their scheduled content,
              comment threads, and approval actions.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              {clients.map((client) => (
                <Link
                  key={client.id}
                  to={`/client/${client.id}`}
                  className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm hover:border-slate-300 hover:bg-slate-50"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                      style={{ backgroundColor: client.colorHex }}
                    >
                      {client.initials}
                    </span>
                    {client.name}
                  </span>
                  <span className="text-xs text-slate-400">
                    {postsForClient(client.id).length} posts →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
