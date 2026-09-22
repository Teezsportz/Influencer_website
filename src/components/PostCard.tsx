import type { Post } from "../types";
import { formatDate, PLATFORM_META } from "../lib/format";
import StatusBadge from "./StatusBadge";

interface PostCardProps {
  post: Post;
  commentCount?: number;
  onClick?: () => void;
}

export default function PostCard({ post, commentCount, onClick }: PostCardProps) {
  const platform = PLATFORM_META[post.platform];

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <div className="aspect-square w-full overflow-hidden bg-slate-100">
        {post.imageDataUrl ? (
          <img
            src={post.imageDataUrl}
            alt={post.title}
            className="h-full w-full object-cover transition group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
            No creative yet
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex items-center justify-between gap-2">
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${platform.className}`}>
            {platform.label}
          </span>
          <StatusBadge status={post.status} />
        </div>
        <h3 className="line-clamp-1 text-sm font-semibold text-slate-900">{post.title}</h3>
        <p className="line-clamp-2 text-xs text-slate-500">{post.caption}</p>
        <div className="mt-auto flex items-center justify-between pt-1 text-xs text-slate-400">
          <span>{formatDate(post.scheduledDate)}</span>
          {typeof commentCount === "number" && commentCount > 0 && (
            <span className="inline-flex items-center gap-1">
              <span aria-hidden>💬</span> {commentCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
