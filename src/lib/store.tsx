import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Client, Comment, Post, PostStatus } from "../types";
import { seedClients, seedComments, seedPosts } from "./seed";

const STORAGE_KEY = "cah_data_v1";

interface DataShape {
  clients: Client[];
  posts: Post[];
  comments: Comment[];
}

function loadInitial(): DataShape {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as DataShape;
  } catch {
    // fall through to seed data
  }
  return { clients: seedClients, posts: seedPosts, comments: seedComments };
}

function persist(data: DataShape) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // storage unavailable (private mode, quota) — prototype still works in-memory
  }
}

function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

interface DataContextValue {
  clients: Client[];
  posts: Post[];
  comments: Comment[];
  getClient: (id: string) => Client | undefined;
  postsForClient: (clientId: string) => Post[];
  commentsForPost: (postId: string) => Comment[];
  upsertPost: (post: Omit<Post, "id" | "createdAt" | "updatedAt"> & { id?: string }) => Post;
  setPostStatus: (postId: string, status: PostStatus, systemNote?: string) => void;
  deletePost: (postId: string) => void;
  addComment: (postId: string, authorName: string, authorRole: Comment["authorRole"], text: string) => void;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DataShape>(loadInitial);

  // Cross-tab "real time": when another tab (e.g. the client portal) writes to
  // localStorage, this tab's storage event fires and we pick up the change.
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== STORAGE_KEY || !e.newValue) return;
      try {
        setData(JSON.parse(e.newValue) as DataShape);
      } catch {
        // ignore malformed payloads
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const update = useCallback((updater: (prev: DataShape) => DataShape) => {
    setData((prev) => {
      const next = updater(prev);
      persist(next);
      return next;
    });
  }, []);

  const getClient = useCallback((id: string) => data.clients.find((c) => c.id === id), [data.clients]);

  const postsForClient = useCallback(
    (clientId: string) => data.posts.filter((p) => p.clientId === clientId),
    [data.posts],
  );

  const commentsForPost = useCallback(
    (postId: string) =>
      data.comments
        .filter((c) => c.postId === postId)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [data.comments],
  );

  const upsertPost: DataContextValue["upsertPost"] = useCallback(
    (post) => {
      const now = new Date().toISOString();
      let saved: Post;
      update((prev) => {
        if (post.id) {
          const existing = prev.posts.find((p) => p.id === post.id);
          saved = { ...(existing as Post), ...post, id: post.id, updatedAt: now };
          return { ...prev, posts: prev.posts.map((p) => (p.id === post.id ? saved : p)) };
        }
        saved = { ...post, id: uid("p"), createdAt: now, updatedAt: now };
        return { ...prev, posts: [...prev.posts, saved] };
      });
      return saved!;
    },
    [update],
  );

  const setPostStatus: DataContextValue["setPostStatus"] = useCallback(
    (postId, status, systemNote) => {
      const now = new Date().toISOString();
      update((prev) => ({
        ...prev,
        posts: prev.posts.map((p) => (p.id === postId ? { ...p, status, updatedAt: now } : p)),
        comments: systemNote
          ? [
              ...prev.comments,
              {
                id: uid("cm"),
                postId,
                authorName: "System",
                authorRole: "system",
                text: systemNote,
                createdAt: now,
              },
            ]
          : prev.comments,
      }));
    },
    [update],
  );

  const deletePost: DataContextValue["deletePost"] = useCallback(
    (postId) => {
      update((prev) => ({
        ...prev,
        posts: prev.posts.filter((p) => p.id !== postId),
        comments: prev.comments.filter((c) => c.postId !== postId),
      }));
    },
    [update],
  );

  const addComment: DataContextValue["addComment"] = useCallback(
    (postId, authorName, authorRole, text) => {
      update((prev) => ({
        ...prev,
        comments: [
          ...prev.comments,
          { id: uid("cm"), postId, authorName, authorRole, text, createdAt: new Date().toISOString() },
        ],
      }));
    },
    [update],
  );

  const value = useMemo<DataContextValue>(
    () => ({
      clients: data.clients,
      posts: data.posts,
      comments: data.comments,
      getClient,
      postsForClient,
      commentsForPost,
      upsertPost,
      setPostStatus,
      deletePost,
      addComment,
    }),
    [data, getClient, postsForClient, commentsForPost, upsertPost, setPostStatus, deletePost, addComment],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used inside DataProvider");
  return ctx;
}
