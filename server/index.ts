import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleAnalyze } from "./routes/ai";
import { handleGetLatestQuiz, handleSaveQuiz } from "./routes/quiz";
import { handleResumeUpload, handleResumeAnalysis } from "./routes/resume";

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

  // ─── Route Registration ────────────────────────────────────────────────────
  // Routes are registered under BOTH /api/* (for local dev via Vite proxy)
  // AND /* stripped paths (for Netlify Functions where serverless-http strips
  // the /.netlify/functions/api prefix, leaving just the :splat portion).
  //
  // Example: POST /api/resume/analyze (local) → POST /resume/analyze (Netlify)
  // ───────────────────────────────────────────────────────────────────────────

  // Ping
  const handlePing = (_req: express.Request, res: express.Response) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  };
  app.get("/api/ping", handlePing);
  app.get("/ping", handlePing);

  // Demo
  app.get("/api/demo", handleDemo);
  app.get("/demo", handleDemo);

  // AI Analyze (onboarding skills analysis)
  app.post("/api/ai/analyze", handleAnalyze);
  app.post("/ai/analyze", handleAnalyze);

  // Quiz persistence endpoints
  app.post("/api/quiz", handleSaveQuiz);
  app.post("/quiz", handleSaveQuiz);
  app.get("/api/quiz/latest", handleGetLatestQuiz);
  app.get("/quiz/latest", handleGetLatestQuiz);
  
  // Dashboard endpoints
  const dashboardHandler = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const { handleGetDashboardMetrics } = await import("./routes/dashboard");
    handleGetDashboardMetrics(req, res, next);
  };
  app.get("/api/dashboard", dashboardHandler);
  app.get("/dashboard", dashboardHandler);
  
  // Evaluation endpoints
  const evaluationHandler = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const { handleQuizEvaluation } = await import("./routes/evaluation");
    handleQuizEvaluation(req, res, next);
  };
  app.post("/api/evaluate", evaluationHandler);
  app.post("/evaluate", evaluationHandler);
  
  // Resume Analyzer
  const resumeHandler = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    handleResumeUpload(req, res, (err: any) => {
      if (err) return next(err);
      handleResumeAnalysis(req, res, next);
    });
  };
  app.post("/api/resume/analyze", resumeHandler);
  app.post("/resume/analyze", resumeHandler);

  // Memory & Analytics endpoints
  const getMemoryHandler = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const { handleGetMemory } = await import("./routes/memory");
    handleGetMemory(req, res, next);
  };
  const addMemoryHandler = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const { handleAddMemory } = await import("./routes/memory");
    handleAddMemory(req, res, next);
  };
  app.get("/api/memory", getMemoryHandler);
  app.get("/memory", getMemoryHandler);
  app.post("/api/memory", addMemoryHandler);
  app.post("/memory", addMemoryHandler);

  const analyticsHandler = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const { handleGetAnalytics } = await import("./routes/analytics");
    handleGetAnalytics(req, res, next);
  };
  app.get("/api/analytics", analyticsHandler);
  app.get("/analytics", analyticsHandler);

  // Roadmap endpoint
  const roadmapHandler = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const { handleGetRoadmap } = await import("./routes/roadmap");
    handleGetRoadmap(req, res, next);
  };
  app.get("/api/roadmap", roadmapHandler);
  app.get("/roadmap", roadmapHandler);

  // Quiz Generation endpoint
  const quizGenerateHandler = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const { handleGenerateQuiz } = await import("./routes/quiz_generator");
    handleGenerateQuiz(req, res, next);
  };
  app.get("/api/quiz/generate", quizGenerateHandler);
  app.get("/quiz/generate", quizGenerateHandler);

  // Learning Style endpoints
  const getLearningStyleHandler = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const { handleGetLearningStyle } = await import("./routes/learning_style");
    handleGetLearningStyle(req, res, next);
  };
  const updateLearningStyleHandler = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const { handleUpdateLearningStyle } = await import("./routes/learning_style");
    handleUpdateLearningStyle(req, res, next);
  };
  app.get("/api/learning-style", getLearningStyleHandler);
  app.get("/learning-style", getLearningStyleHandler);
  app.post("/api/learning-style", updateLearningStyleHandler);
  app.post("/learning-style", updateLearningStyleHandler);

  // Queue health / status
  const queueStatusHandler = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const { handleQueueStatus } = await import("./routes/queue_status");
    handleQueueStatus(req, res, next);
  };
  app.get("/api/queue/status", queueStatusHandler);
  app.get("/queue/status", queueStatusHandler);

  return app;
}
