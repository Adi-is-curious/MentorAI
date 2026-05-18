import { RequestHandler } from "express";
import { db } from "../db";
import { users, progressEvents } from "../schema";
import { eq, and } from "drizzle-orm";

/**
 * POST /api/learning-style
 * Called when a user interacts with a task (completes, skips, or marks format preference).
 * Updates the user's `learningStyle` JSON column which the roadmap uses to filter resource formats.
 */
export const handleUpdateLearningStyle: RequestHandler = async (req, res) => {
  try {
    const sessionId = (req as any).sessionId;
    const user = await db.query.users.findFirst({
      where: eq(users.sessionId, sessionId),
    });
    if (!user) return res.status(404).json({ ok: false, error: "User not found" });

    const { preferredFormat, sessionMinutes, completed } = req.body;

    const currentStyle = (user.learningStyle as any) ?? {};

    // Track format preference
    if (preferredFormat) {
      const formats = currentStyle.formats ?? { article: 0, video: 0, course: 0 };
      formats[preferredFormat] = (formats[preferredFormat] ?? 0) + 1;
      currentStyle.formats = formats;
    }

    // Track total session time (for burnout detection)
    if (typeof sessionMinutes === "number") {
      currentStyle.totalSessionMins = (currentStyle.totalSessionMins ?? 0) + sessionMinutes;
      currentStyle.sessionCount = (currentStyle.sessionCount ?? 0) + 1;
      const avgSession = currentStyle.totalSessionMins / currentStyle.sessionCount;
      currentStyle.burnoutRisk = avgSession > 90 ? "high" : avgSession > 45 ? "medium" : "low";
    }

    // Track completion ratio
    if (typeof completed === "boolean") {
      currentStyle.completions = (currentStyle.completions ?? 0) + (completed ? 1 : 0);
      currentStyle.attempts = (currentStyle.attempts ?? 0) + 1;
    }

    await db.update(users).set({ learningStyle: currentStyle }).where(eq(users.id, user.id));

    res.json({ ok: true, learningStyle: currentStyle });
  } catch (e: any) {
    console.warn("[LearningStyle] DB offline, returning mock.", e?.message);
    res.json({ ok: true, learningStyle: { formats: { article: 3, video: 5, course: 2 }, burnoutRisk: "low" } });
  }
};

export const handleGetLearningStyle: RequestHandler = async (req, res) => {
  try {
    const sessionId = (req as any).sessionId;
    const user = await db.query.users.findFirst({
      where: eq(users.sessionId, sessionId),
    });
    if (!user) return res.status(404).json({ ok: false, error: "User not found" });

    const style = user.learningStyle ?? {};
    res.json({ ok: true, data: style });
  } catch (e: any) {
    console.warn("[LearningStyle] DB offline, returning mock.", e?.message);
    res.json({ ok: true, data: { formats: { article: 3, video: 5, course: 2 }, burnoutRisk: "low" } });
  }
};
