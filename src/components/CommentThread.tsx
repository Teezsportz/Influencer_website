import { useState } from "react";
import type { Comment, CommentAuthorRole } from "../types";
import { relativeTime } from "../lib/format";

const ROLE_STYLE: Record<CommentAuthorRole, string> = {
  agency: "bg-indigo-600",
  client: "bg-emerald-600",
  system: "bg-slate-400",
};

function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

interface CommentThreadProps {
  comments: Comment[];
  currentAuthorName: string;
  onSubmit: (text: string) => void;
  placeholder?: string;
}

export default function CommentThread({
  comments,
  currentAuthorName,
  onSubmit,
  placeholder,
}: CommentThreadProps) {
  const [draft, setDraft] = useState("");

  function submit() {
    const text = draft.trim();
    if (!text) return;
    onSubmit(text);
    setDraft("");
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        {comments.length === 0 && (
          <p className="py-6 text-center text-sm text-slate-400">No feedback yet on this post.</p>
        )}
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white ${ROLE_STYLE[comment.authorRole]}`}
            >
              {comment.authorRole === "system" ? "•" : initialsOf(comment.authorName)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium text-slate-900">{comment.authorName}</span>
                <span className="text-xs text-slate-400">{relativeTime(comment.createdAt)}</span>
              </div>
              <p
                className={`mt-0.5 text-sm ${comment.authorRole === "system" ? "italic text-slate-500" : "text-slate-700"}`}
              >
                {comment.text}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 border-t border-slate-100 pt-3">
        <div className="flex items-end gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder={placeholder ?? `Comment as ${currentAuthorName}...`}
            rows={2}
            className="flex-1 resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
          />
          <button
            type="button"
            onClick={submit}
            disabled={!draft.trim()}
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Send
          </button>
        </div>
        <p className="mt-1 text-[11px] text-slate-400">⌘/Ctrl + Enter to send</p>
      </div>
    </div>
  );
}
