import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleAnalyze } from "./routes/ai";
import { handleGetLatestQuiz, handleSaveQuiz } from "./routes/quiz";

// Boot async workers only when Redis is configured
// Workers are run as a separate process in production (e.g. `tsx server/queue/workers.ts`)
// In dev, they're optionally loaded if REDIS_URL is present
if (process.env.REDIS_URL) {
  import("./queue/workers").catch((e) => {
    console.warn("[Server] BullMQ workers failed to start:", (e as Error).message);
  });
} else {
  console.info("[Server] REDIS_URL not set — async jobs disabled. Set REDIS_URL to enable.");
}

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Mock Authentication Middleware
  app.use(async (req, res, next) => {
    // Basic mock session ID header: "x-session-id"
    let sessionId = req.headers["x-session-id"] as string;
    if (!sessionId) {
      // In a real app we'd reject or create a cookie. For MVP we'll default to 'demo_user' 
      // if the frontend doesn't send one, or generate one. Let's just assume 'demo_session'
      sessionId = "demo_session";
    }
    
    // We can inject user info into req if needed later, e.g. req.user = ...
    // For now, let's just make it available
    (req as any).sessionId = sessionId;
    next();
  });

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
  
  // Dashboard endpoints
  app.get("/api/dashboard", async (req, res, next) => {
    const { handleGetDashboardMetrics } = await import("./routes/dashboard");
    handleGetDashboardMetrics(req, res, next);
  });
  
  // Evaluation endpoints
  app.post("/api/evaluate", async (req, res, next) => {
    const { handleQuizEvaluation } = await import("./routes/evaluation");
    handleQuizEvaluation(req, res, next);
  });
  
  // Resume Analyzer
  app.post("/api/resume/analyze", async (req, res, next) => {
    const { handleResumeUpload, handleResumeAnalysis } = await import("./routes/resume");
    handleResumeUpload(req, res, (err) => {
      if (err) return next(err);
      handleResumeAnalysis(req, res, next);
    });
  });

  // Memory & Analytics endpoints
  app.get("/api/memory", async (req, res, next) => {
    const { handleGetMemory } = await import("./routes/memory");
    handleGetMemory(req, res, next);
  });
  app.post("/api/memory", async (req, res, next) => {
    const { handleAddMemory } = await import("./routes/memory");
    handleAddMemory(req, res, next);
  });
  app.get("/api/analytics", async (req, res, next) => {
    const { handleGetAnalytics } = await import("./routes/analytics");
    handleGetAnalytics(req, res, next);
  });

  // Roadmap endpoint
  app.get("/api/roadmap", async (req, res, next) => {
    const { handleGetRoadmap } = await import("./routes/roadmap");
    handleGetRoadmap(req, res, next);
  });

  // Quiz Generation endpoint
  app.get("/api/quiz/generate", async (req, res, next) => {
    const { handleGenerateQuiz } = await import("./routes/quiz_generator");
    handleGenerateQuiz(req, res, next);
  });

  // Learning Style endpoints
  app.get("/api/learning-style", async (req, res, next) => {
    const { handleGetLearningStyle } = await import("./routes/learning_style");
    handleGetLearningStyle(req, res, next);
  });
  app.post("/api/learning-style", async (req, res, next) => {
    const { handleUpdateLearningStyle } = await import("./routes/learning_style");
    handleUpdateLearningStyle(req, res, next);
  });

  // Queue health / status
  app.get("/api/queue/status", async (req, res, next) => {
    const { handleQueueStatus } = await import("./routes/queue_status");
    handleQueueStatus(req, res, next);
  });

  // Also support Netlify function base path (after basePath strip the route becomes /ai/analyze)
  app.post("/ai/analyze", handleAnalyze);
  app.post("/quiz", handleSaveQuiz);
  app.get("/quiz/latest", handleGetLatestQuiz);
  app.get("/dashboard", async (req, res, next) => {
    const { handleGetDashboardMetrics } = await import("./routes/dashboard");
    handleGetDashboardMetrics(req, res, next);
  });

  return app;
}
