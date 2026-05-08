import { Worker, Job } from "bullmq";
import { redisConnection } from "./queues";
import { db } from "../db";
import { topicMastery, mentorMemory, progressEvents } from "../schema";
import { eq, and, gte, desc } from "drizzle-orm";

// Only start workers if REDIS_URL is explicitly set
// This prevents hanging during local dev without Redis
if (!process.env.REDIS_URL) {
  console.warn("[Workers] REDIS_URL not set. BullMQ workers disabled. Set REDIS_URL to enable async jobs.");
  process.exit(0);
}

// ─── Worker 1: Embedding Generator ───────────────────────────────────────────
export const embeddingWorker = new Worker(
  "embedding",
  async (job: Job) => {
    const { text, table, id } = job.data;
    console.log(`[EmbeddingWorker] Generating embedding for ${table}#${id}`);

    const response = await fetch("http://localhost:8000/generate-embedding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) throw new Error("Python service returned non-OK");
    const { embedding } = await response.json() as { embedding: number[] };

    if (table === "topic_mastery") {
      await db.update(topicMastery).set({ embedding }).where(eq(topicMastery.id, id));
    }

    console.log(`[EmbeddingWorker] Done — ${table}#${id} (${embedding.length} dims).`);
  },
  { connection: redisConnection, concurrency: 3 }
);

// ─── Worker 2: Analytics Recalculator ────────────────────────────────────────
export const analyticsWorker = new Worker(
  "analytics",
  async (job: Job) => {
    const { userId } = job.data;
    console.log(`[AnalyticsWorker] Recalculating analytics for user#${userId}`);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentEvents = await db.query.progressEvents.findMany({
      where: and(
        eq(progressEvents.userId, userId),
        gte(progressEvents.createdAt, sevenDaysAgo)
      ),
      orderBy: [desc(progressEvents.createdAt)],
    });

    let dropOffs = 0, completedThisWeek = 0;
    for (const event of recentEvents) {
      if ((event.score ?? 0) < 40) dropOffs++;
      else if ((event.score ?? 0) >= 80) completedThisWeek++;
    }

    await db.insert(mentorMemory).values({
      userId,
      memoryType: "weekly_analytics",
      content: {
        recalculatedAt: new Date().toISOString(),
        recentEventsCount: recentEvents.length,
        dropOffs,
        completedThisWeek,
      },
    });

    console.log(`[AnalyticsWorker] Done — user#${userId}: ${completedThisWeek} completions, ${dropOffs} drop-offs.`);
  },
  { connection: redisConnection, concurrency: 2 }
);

embeddingWorker.on("failed", (job, err) => {
  console.error(`[EmbeddingWorker] Job ${job?.id} failed:`, err.message);
});
analyticsWorker.on("failed", (job, err) => {
  console.error(`[AnalyticsWorker] Job ${job?.id} failed:`, err.message);
});

console.log("✅ BullMQ workers started: [embedding] [analytics]");
