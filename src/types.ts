export type Platform = "Instagram" | "TikTok" | "Facebook" | "LinkedIn" | "X" | "YouTube";

export type PostStatus = "draft" | "in_review" | "changes_requested" | "approved";

export interface Client {
  id: string;
  name: string;
  colorHex: string;
  initials: string;
}

export interface Post {
  id: string;
  clientId: string;
  title: string;
  caption: string;
  platform: Platform;
  scheduledDate: string; // ISO date, yyyy-mm-dd
  imageDataUrl: string | null;
  status: PostStatus;
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
}

export type CommentAuthorRole = "agency" | "client" | "system";

export interface Comment {
  id: string;
  postId: string;
  authorName: string;
  authorRole: CommentAuthorRole;
  text: string;
  createdAt: string; // ISO datetime
}
