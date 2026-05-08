import { RequestHandler } from "express";
import { embeddingQueue, analyticsQueue } from "../queue/queues";

export const handleQueueStatus: RequestHandler = async (req, res) => {
  try {
    const [embWaiting, embActive, embFailed] = await Promise.all([
      embeddingQueue.getWaitingCount(),
      embeddingQueue.getActiveCount(),
      embeddingQueue.getFailedCount(),
    ]);

    const [anlWaiting, anlActive, anlFailed] = await Promise.all([
      analyticsQueue.getWaitingCount(),
      analyticsQueue.getActiveCount(),
      analyticsQueue.getFailedCount(),
    ]);

    res.json({
      ok: true,
      queues: {
        embedding: { waiting: embWaiting, active: embActive, failed: embFailed },
        analytics:  { waiting: anlWaiting, active: anlActive, failed: anlFailed },
      },
    });
  } catch (e: any) {
    // Redis likely not running — return graceful degraded response
    res.json({
      ok: true,
      queues: null,
      offline: true,
      message: "Queue service offline (Redis not connected). Jobs run synchronously.",
    });
  }
};
