import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PostCard from "../components/PostCard";
import PostEditorModal from "../components/PostEditorModal";
import { useData } from "../lib/store";
import type { Post, PostStatus } from "../types";
import { STATUS_META } from "../lib/format";

const FILTERS: Array<{ key: "all" | PostStatus; label: string }> = [
  { key: "all", label: "All" },
  { key: "draft", label: STATUS_META.draft.label },
  { key: "in_review", label: STATUS_META.in_review.label },
  { key: "changes_requested", label: STATUS_META.changes_requested.label },
  { key: "approved", label: STATUS_META.approved.label },
];

export default function AgencyDashboard() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { clients, postsForClient, commentsForPost, upsertPost, deletePost, addComment, getClient } = useData();

  const [filter, setFilter] = useState<"all" | PostStatus>("all");
  const [editingPost, setEditingPost] = useState<Post | null | "new">(null);

  const activeClient = clientId ? getClient(clientId) : undefined;
  const posts = useMemo(() => {
    if (!clientId) return [];
    const all = postsForClient(clientId).slice().sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));
    return filter === "all" ? all : all.filter((p) => p.status === filter);
  }, [clientId, filter, postsForClient]);

  if (!clientId || !activeClient) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-500">
        Unknown client workspace.{" "}
        <Link to="/" className="ml-1 text-indigo-600 underline">
          Go home
        </Link>
      </div>
    );
  }

  const editorTarget = editingPost === "new" ? null : editingPost;

  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-4 py-4">
          <Link to="/" className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-xs text-white">
              CH
            </span>
            Content Approval Hub
          </Link>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          <p className="px-2 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Clients
          </p>
          {clients.map((client) => {
            const isActive = client.id === clientId;
            return (
              <button
                key={client.id}
                onClick={() => navigate(`/agency/${client.id}`)}
                className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition ${
                  isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
                  style={{ backgroundColor: client.colorHex }}
                >
                  {client.initials}
                </span>
                <span className="min-w-0 flex-1 truncate">{client.name}</span>
                <span className={`text-xs ${isActive ? "text-white/70" : "text-slate-400"}`}>
                  {postsForClient(client.id).length}
                </span>
              </button>
            );
          })}
        </nav>
        <div className="border-t border-slate-100 p-3">
          <Link
            to={`/client/${clientId}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            👁 Preview as {activeClient.name}
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/90 px-6 py-4 backdrop-blur">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">{activeClient.name}</h1>
            <p className="text-xs text-slate-500">Content calendar · {posts.length} shown</p>
          </div>
          <button
            type="button"
            onClick={() => setEditingPost("new")}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            + New post
          </button>
        </header>

        <div className="flex gap-2 border-b border-slate-200 bg-white px-6 py-3">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                filter === f.key
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {posts.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 text-sm text-slate-400">
              No content here yet.
              <button className="mt-2 text-indigo-600 underline" onClick={() => setEditingPost("new")}>
                Create the first post
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  commentCount={commentsForPost(post.id).length}
                  onClick={() => setEditingPost(post)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {editingPost !== null && (
        <PostEditorModal
          clientId={clientId}
          post={editorTarget}
          onClose={() => setEditingPost(null)}
          onSave={(values) => {
            upsertPost(values);
            setEditingPost(null);
          }}
          onDelete={
            editorTarget
              ? (postId) => {
                  deletePost(postId);
                  setEditingPost(null);
                }
              : undefined
          }
          comments={editorTarget ? commentsForPost(editorTarget.id) : undefined}
          onAddComment={
            editorTarget ? (text) => addComment(editorTarget.id, "Priya (Social Team)", "agency", text) : undefined
          }
        />
      )}
    </div>
  );
}
