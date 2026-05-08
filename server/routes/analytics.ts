import { RequestHandler } from "express";
import { db } from "../db";
import { users, progressEvents, roadmapTasks, topicMastery } from "../schema";
import { eq, gte, and, desc } from "drizzle-orm";

async function getUserId(sessionId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.sessionId, sessionId),
  });
  return user?.id;
}

export const handleGetAnalytics: RequestHandler = async (req, res) => {
  try {
    const userId = await getUserId((req as any).sessionId);
    if (!userId) return res.status(404).json({ ok: false, error: "User not found" });

    // Calculate weekly review (events from last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentEvents = await db.query.progressEvents.findMany({
      where: and(
        eq(progressEvents.userId, userId),
        gte(progressEvents.createdAt, sevenDaysAgo)
      ),
      orderBy: [desc(progressEvents.createdAt)],
    });

    // Behavior Analytics
    let dropOffs = 0;
    let completedThisWeek = 0;
    
    // Very basic heuristic for drop-offs: low score progress events without follow-ups
    // A real system would log session lengths and explicitly skipped tasks.
    for (const event of recentEvents) {
      if ((event.score ?? 0) < 40) {
        dropOffs++;
      } else if ((event.score ?? 0) >= 80) {
        completedThisWeek++;
      }
    }

    const weakTopics = await db.query.topicMastery.findMany({
      where: and(
        eq(topicMastery.userId, userId),
        eq(topicMastery.weakArea, true)
      ),
    });

    let weeklySummary = `You've had ${recentEvents.length} learning interactions this week. `;
    if (dropOffs > 2) {
      weeklySummary += `You tend to struggle or drop off on difficult topics. Let's adjust the pace. `;
    } else if (completedThisWeek > 3) {
      weeklySummary += `Great momentum! You completed several highly scored tasks. `;
    } else {
      weeklySummary += `Consistency is key. Try to complete a few more tasks this week. `;
    }

    if (weakTopics.length > 0) {
      weeklySummary += `Focus next week on: ${weakTopics.map(t => t.topic).slice(0, 2).join(", ")}.`;
    }

    const data = {
      recentEventsCount: recentEvents.length,
      dropOffs,
      completedThisWeek,
      weakTopicsCount: weakTopics.length,
      weeklySummary,
    };

    res.json({ ok: true, data });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message });
  }
};
