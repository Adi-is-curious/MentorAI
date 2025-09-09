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
