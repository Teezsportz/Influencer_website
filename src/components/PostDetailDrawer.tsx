import type { Comment, Post } from "../types";
import { formatDate, PLATFORM_META } from "../lib/format";
import StatusBadge from "./StatusBadge";
import CommentThread from "./CommentThread";

interface PostDetailDrawerProps {
  post: Post;
  comments: Comment[];
  clientName: string;
  onClose: () => void;
  onAddComment: (text: string) => void;
  onApprove: () => void;
  onRequestChanges: () => void;
}

export default function PostDetailDrawer({
  post,
  comments,
  clientName,
  onClose,
  onAddComment,
  onApprove,
  onRequestChanges,
}: PostDetailDrawerProps) {
  const platform = PLATFORM_META[post.platform];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-xl flex-col overflow-hidden bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${platform.className}`}>
              {platform.label}
            </span>
            <StatusBadge status={post.status} />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {post.imageDataUrl && (
            <div className="aspect-video w-full bg-slate-100">
              <img src={post.imageDataUrl} alt={post.title} className="h-full w-full object-cover" />
            </div>
          )}
          <div className="space-y-3 px-5 py-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">{post.title}</h2>
              <p className="text-xs text-slate-400">Scheduled for {formatDate(post.scheduledDate)}</p>
            </div>
            <p className="whitespace-pre-wrap text-sm text-slate-700">{post.caption}</p>
          </div>

          <div className="border-t border-slate-100 px-5 py-4">
            <div className="mb-3 flex gap-2">
              <button
                type="button"
                onClick={onApprove}
                disabled={post.status === "approved"}
                className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                ✓ Approve
              </button>
              <button
                type="button"
                onClick={onRequestChanges}
                disabled={post.status === "changes_requested"}
                className="flex-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                ↺ Request changes
              </button>
            </div>

            <h3 className="mb-2 text-sm font-semibold text-slate-900">Feedback</h3>
            <div className="flex h-96 flex-col">
              <CommentThread
                comments={comments}
                currentAuthorName={clientName}
                onSubmit={onAddComment}
                placeholder="Leave feedback for the team..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
