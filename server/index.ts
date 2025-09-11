import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleAnalyze } from "./routes/ai";
import { handleGetLatestQuiz, handleSaveQuiz } from "./routes/quiz";
import {
  handleUpsertProfile,
  handleGetProfile,
  handleCreatePost,
  handleFeed,
  handleToggleLike,
  handleComments,
  handleCreateComment,
  handleHelpList,
  handleHelpCreate,
  handleHelpReply,
  handleRooms,
  handleCreateRoom,
  handleMessages,
  handleCreateMessage,
  handleLeaderboard,
  handleReport,
} from "./routes/community";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);
  app.post("/api/ai/analyze", handleAnalyze);
  // Quiz persistence endpoints
  app.post("/api/quiz", handleSaveQuiz);
  app.get("/api/quiz/latest", handleGetLatestQuiz);
  // Community API
  app.post("/api/community/profile", handleUpsertProfile);
  app.get("/api/community/profile/:id", handleGetProfile);

  app.get("/api/community/feed", handleFeed);
  app.post("/api/community/posts", handleCreatePost);
  app.post("/api/community/posts/:id/like", handleToggleLike);
  app.get("/api/community/posts/:id/comments", handleComments);
  app.post("/api/community/posts/:id/comments", handleCreateComment);

  app.get("/api/community/help-requests", handleHelpList);
  app.post("/api/community/help-requests", handleHelpCreate);
  app.post("/api/community/help-requests/:id/replies", handleHelpReply);

  app.get("/api/community/rooms", handleRooms);
  app.post("/api/community/rooms", handleCreateRoom);
  app.get("/api/community/rooms/:id/messages", handleMessages);
  app.post("/api/community/rooms/:id/messages", handleCreateMessage);

  app.get("/api/community/leaderboard", handleLeaderboard);
  app.post("/api/community/report", handleReport);

  // Also support Netlify function base path (after basePath strip the route becomes /ai/analyze)
  app.post("/ai/analyze", handleAnalyze);
  app.post("/quiz", handleSaveQuiz);
  app.get("/quiz/latest", handleGetLatestQuiz);

  return app;
}
