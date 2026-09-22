import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PostCard from "../components/PostCard";
import PostDetailDrawer from "../components/PostDetailDrawer";
import { useData } from "../lib/store";
import type { Post } from "../types";

const CLIENT_VIEWER_NAME = "You";
const VISIBLE_STATUSES: Post["status"][] = ["in_review", "changes_requested", "approved"];

export default function ClientPortal() {
  const { clientId } = useParams<{ clientId: string }>();
  const { getClient, postsForClient, commentsForPost, setPostStatus, addComment } = useData();
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const client = clientId ? getClient(clientId) : undefined;

  const posts = useMemo(() => {
    if (!clientId) return [];
    return postsForClient(clientId)
      .filter((p) => VISIBLE_STATUSES.includes(p.status))
      .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));
  }, [clientId, postsForClient]);

  const pendingCount = posts.filter((p) => p.status === "in_review").length;
  const selectedPost = posts.find((p) => p.id === selectedPostId) ?? null;

  if (!clientId || !client) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-500">
        Unknown workspace.{" "}
        <Link to="/" className="ml-1 text-indigo-600 underline">
          Go home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white"
              style={{ backgroundColor: client.colorHex }}
            >
              {client.initials}
            </span>
            <div>
              <h1 className="text-base font-semibold text-slate-900">{client.name}</h1>
              <p className="text-xs text-slate-500">Content calendar</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {pendingCount > 0 && (
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-300">
                {pendingCount} awaiting your review
              </span>
            )}
            <Link to="/" className="text-xs font-medium text-slate-400 hover:text-slate-600">
              Log out
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {posts.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 text-sm text-slate-400">
            Nothing shared for review yet — check back soon.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                commentCount={commentsForPost(post.id).length}
                onClick={() => setSelectedPostId(post.id)}
              />
            ))}
          </div>
        )}
      </main>

      {selectedPost && (
        <PostDetailDrawer
          post={selectedPost}
          comments={commentsForPost(selectedPost.id)}
          clientName={CLIENT_VIEWER_NAME}
          onClose={() => setSelectedPostId(null)}
          onAddComment={(text) => addComment(selectedPost.id, `${client.name.split(" ")[0]} (Client)`, "client", text)}
          onApprove={() =>
            setPostStatus(selectedPost.id, "approved", `${client.name.split(" ")[0]} approved this post.`)
          }
          onRequestChanges={() =>
            setPostStatus(
              selectedPost.id,
              "changes_requested",
              `${client.name.split(" ")[0]} requested changes on this post.`,
            )
          }
        />
      )}
    </div>
  );
}
