import { Queue } from "bullmq";
import Redis from "ioredis";

let redisAvailable = false;

// Create connection only if Redis is expected (REDIS_URL set or explicit opt-in)
// This prevents connection spam during local dev without Redis
export const redisConnection = new Redis(
  process.env.REDIS_URL || "redis://localhost:6379",
  {
    maxRetriesPerRequest: null,
    lazyConnect: true,
    enableOfflineQueue: false,
    retryStrategy: (times) => {
      if (times > 3) {
        redisAvailable = false;
        return null; // Stop retrying
      }
      return Math.min(times * 1000, 3000);
    },
  }
);

redisConnection.on("connect", () => { redisAvailable = true; });
redisConnection.on("error", () => { redisAvailable = false; });

// Named queues
export const embeddingQueue = new Queue("embedding", { connection: redisConnection });
export const evaluationQueue = new Queue("evaluation", { connection: redisConnection });
export const analyticsQueue  = new Queue("analytics",  { connection: redisConnection });

// Safe helpers — silently no-op if Redis is offline
export async function queueEmbedding(payload: { text: string; table: string; id: number }) {
  try {
    await embeddingQueue.add("generate-embedding", payload, {
      attempts: 3,
      backoff: { type: "exponential", delay: 3000 },
    });
  } catch {
    // Redis offline — embedding will be generated on next mastery load
  }
}

export async function queueAnalytics(payload: { userId: number }) {
  try {
    await analyticsQueue.add("recalc-analytics", payload, {
      attempts: 2,
      backoff: { type: "fixed", delay: 5000 },
    });
  } catch {
    // Redis offline — analytics run synchronously on next dashboard load
  }
}
