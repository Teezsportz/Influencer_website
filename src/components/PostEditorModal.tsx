import { useEffect, useRef, useState } from "react";
import type { Comment, Platform, Post, PostStatus } from "../types";
import { PLATFORM_META, STATUS_META } from "../lib/format";
import CommentThread from "./CommentThread";

const PLATFORMS = Object.keys(PLATFORM_META) as Platform[];
const STATUSES = Object.keys(STATUS_META) as PostStatus[];

interface PostEditorModalProps {
  clientId: string;
  post: Post | null; // null = creating a new post
  onClose: () => void;
  onSave: (values: Omit<Post, "id" | "createdAt" | "updatedAt"> & { id?: string }) => void;
  onDelete?: (postId: string) => void;
  comments?: Comment[];
  onAddComment?: (text: string) => void;
}

export default function PostEditorModal({
  clientId,
  post,
  onClose,
  onSave,
  onDelete,
  comments,
  onAddComment,
}: PostEditorModalProps) {
  const [title, setTitle] = useState(post?.title ?? "");
  const [caption, setCaption] = useState(post?.caption ?? "");
  const [platform, setPlatform] = useState<Platform>(post?.platform ?? "Instagram");
  const [scheduledDate, setScheduledDate] = useState(post?.scheduledDate ?? new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<PostStatus>(post?.status ?? "draft");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(post?.imageDataUrl ?? null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleFile(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleSubmit() {
    if (!title.trim()) return;
    onSave({
      id: post?.id,
      clientId,
      title: title.trim(),
      caption,
      platform,
      scheduledDate,
      imageDataUrl,
      status,
    });
  }

  const showComments = Boolean(post && comments && onAddComment);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onClick={onClose}>
      <div
        className={`flex max-h-[90vh] w-full ${showComments ? "max-w-3xl" : "max-w-lg"} overflow-hidden rounded-2xl bg-white shadow-xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-1 overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">
            {post ? "Edit content" : "New content"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 px-5 py-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Creative</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex aspect-video w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 hover:border-accent/50"
            >
              {imageDataUrl ? (
                <img src={imageDataUrl} alt="Creative preview" className="h-full w-full object-cover" />
              ) : (
                <span className="text-sm text-slate-400">Click to upload an image</span>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Title (internal)</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Autumn Latte Launch"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Caption</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={4}
              placeholder="Write the post copy the client will see..."
              className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as Platform)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {PLATFORM_META[p].label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Scheduled date</label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Status</label>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset transition ${
                    status === s ? "ring-2 ring-accent" : "opacity-60 hover:opacity-100"
                  } ${STATUS_META[s].className}`}
                >
                  {STATUS_META[s].label}
                </button>
              ))}
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Only "In Review" and later statuses are visible to the client.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
          {post && onDelete ? (
            <button
              type="button"
              onClick={() => onDelete(post.id)}
              className="text-sm font-medium text-rose-600 hover:text-rose-700"
            >
              Delete
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!title.trim()}
              className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-light disabled:cursor-not-allowed disabled:opacity-40"
            >
              {post ? "Save changes" : "Add to calendar"}
            </button>
          </div>
        </div>
        </div>

        {showComments && (
          <div className="flex w-72 shrink-0 flex-col border-l border-slate-100 bg-slate-50/50 px-4 py-4">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">Client feedback</h3>
            <CommentThread
              comments={comments!}
              currentAuthorName="Priya (Social Team)"
              onSubmit={onAddComment!}
            />
          </div>
        )}
      </div>
    </div>
  );
}
