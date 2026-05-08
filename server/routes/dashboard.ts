import { RequestHandler } from "express";
import { db } from "../db";
import { users, topicMastery, progressEvents } from "../schema";
import { eq, desc, sql } from "drizzle-orm";

async function getUserId(sessionId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.sessionId, sessionId),
  });
  return user?.id;
}

export const handleGetDashboardMetrics: RequestHandler = async (req, res) => {
  try {
    const sessionId = (req as any).sessionId;
    const userId = await getUserId(sessionId);
    if (!userId) {
      return res.json({
        ok: true,
        data: {
          masteryZones: [],
          overallReadiness: 0,
          confidenceLevels: {},
          recentActivity: [],
        },
      });
    }

    const topics = await db.query.topicMastery.findMany({
      where: eq(topicMastery.userId, userId),
    });

    let overallReadiness = 0;
    if (topics.length > 0) {
      const totalMastery = topics.reduce((acc, t) => acc + (t.masteryScore ?? 0), 0);
      overallReadiness = Math.round(totalMastery / topics.length);
    }

    const masteryZones = topics.map((t) => ({
      topic: t.topic,
      mastery: t.masteryScore ?? 0,
      confidence: t.confidenceScore ?? 0,
      isWeak: t.weakArea ?? false,
    }));

    const confidenceLevels = {
      Beginner: topics.filter((t) => (t.confidenceScore ?? 0) < 40).length,
      Intermediate: topics.filter((t) => (t.confidenceScore ?? 0) >= 40 && (t.confidenceScore ?? 0) < 80).length,
      Advanced: topics.filter((t) => (t.confidenceScore ?? 0) >= 80).length,
    };

    const recentActivity = await db.query.progressEvents.findMany({
      where: eq(progressEvents.userId, userId),
      orderBy: [desc(progressEvents.createdAt)],
      limit: 5,
    });

    res.json({
      ok: true,
      data: {
        masteryZones,
        overallReadiness,
        confidenceLevels,
        recentActivity,
      },
    });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message || "Internal error" });
  }
};
