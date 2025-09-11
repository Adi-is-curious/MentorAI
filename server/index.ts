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
  // Also support Netlify function base path (after basePath strip the route becomes /ai/analyze)
  app.post("/ai/analyze", handleAnalyze);
  app.post("/quiz", handleSaveQuiz);
  app.get("/quiz/latest", handleGetLatestQuiz);

  return app;
}
