/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

export interface AnalyzeRequest {
  skills: string;
  interests: string;
  resumeText?: string;
}

export interface AnalyzeResponse {
  suggestions: { domain: string; reason: string }[];
  skillGaps: string[];
  learningPath: {
    title: string;
    type: "course" | "article" | "project";
    url?: string;
  }[];
  summary: string;
}

// Community types
export type UserRole = "student" | "graduate" | "professional";

export interface Profile {
  userId: string;
  name?: string;
  role?: UserRole;
  bio?: string;
  skills?: string[];
  goals?: string[];
  avatarUrl?: string;
  badges?: string[];
  createdAt?: string;
}

export interface Post {
  id: number;
  createdAt: string;
  authorId: string | null;
  author?: Profile | null;
  content: string;
  imageUrl?: string | null;
  linkUrl?: string | null;
  visibility?: "public" | "community" | "private";
  likeCount: number;
  commentCount: number;
}

export interface Comment {
  id: number;
  postId: number;
  parentId?: number | null;
  createdAt: string;
  authorId: string | null;
  author?: Profile | null;
  content: string;
}

export interface HelpRequest {
  id: number;
  createdAt: string;
  authorId: string | null;
  title: string;
  body: string;
  tags?: string[];
  status: "open" | "closed";
}

export interface HelpReply {
  id: number;
  requestId: number;
  createdAt: string;
  authorId: string | null;
  body: string;
}

export interface Room {
  id: number;
  name: string;
  topic?: string | null;
  createdAt: string;
}

export interface Message {
  id: number;
  roomId: number;
  createdAt: string;
  authorId: string | null;
  body: string;
}

export interface LeaderboardEntry {
  userId: string;
  name?: string;
  role?: UserRole;
  points: number;
  badges?: string[];
}
