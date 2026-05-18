import { RequestHandler } from "express";
import { db } from "../db";
import { users, topicMastery, progressEvents, roadmapTasks, roadmaps, reviewSchedule } from "../schema";
import { eq, and } from "drizzle-orm";
import { queueEmbedding, queueAnalytics } from "../queue/queues";

export const handleQuizEvaluation: RequestHandler = async (req, res) => {
  try {
    const sessionId = (req as any).sessionId;
    const body = req.body ?? {};
    const { topic, accuracy, completionRate, revisionFrequency, consistency } = body;

    // Compute mastery score regardless of DB availability
    const confidenceScore = body.confidence ? (body.confidence / 5) * 100 : accuracy;
    
    let confidenceAlignment = 0;
    if (accuracy >= 80 && confidenceScore >= 80) confidenceAlignment = 100;
    else if (accuracy >= 80 && confidenceScore < 80) confidenceAlignment = 60;
    else if (accuracy < 50 && confidenceScore >= 80) confidenceAlignment = 10;
    else if (accuracy < 50 && confidenceScore < 50) confidenceAlignment = 50;

    const newMasteryScore = 
      (accuracy * 0.35) + 
      (confidenceAlignment * 0.20) + 
      ((completionRate ?? 0) * 0.15) + 
      ((revisionFrequency ?? 0) * 0.15) + 
      ((consistency ?? 0) * 0.10) + 
      (100 * 0.05);

    // Try to persist to DB — gracefully degrade if offline
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.sessionId, sessionId),
      });

      if (!user) {
        return res.json({ ok: true, newMasteryScore, weakArea: newMasteryScore < 50, note: "User not found in DB, score computed but not saved." });
      }

      const newConfidenceScore = confidenceScore;
      
      let masteryId: number;
      const existing = await db.query.topicMastery.findFirst({
        where: and(eq(topicMastery.userId, user.id), eq(topicMastery.topic, topic)),
      });

      if (existing) {
        await db.update(topicMastery).set({
          masteryScore: newMasteryScore,
          confidenceScore: newConfidenceScore,
          weakArea: newMasteryScore < 50,
          lastReviewed: new Date(),
        }).where(eq(topicMastery.id, existing.id));
        masteryId = existing.id;
      } else {
        const [inserted] = await db.insert(topicMastery).values({
          userId: user.id,
          topic,
          masteryScore: newMasteryScore,
          confidenceScore: newConfidenceScore,
          weakArea: newMasteryScore < 50,
          lastReviewed: new Date(),
        }).returning();
        masteryId = inserted.id;
      }

      // Fire async background jobs (non-blocking)
      queueEmbedding({ text: topic, table: "topic_mastery", id: masteryId }).catch(() => {});
      queueAnalytics({ userId: user.id }).catch(() => {});

      // Spaced Repetition Logic (SM-2 simplified)
      const quality = Math.max(0, Math.min(5, Math.round(accuracy / 20)));
      
      const existingSchedule = await db.query.reviewSchedule.findFirst({
        where: and(eq(reviewSchedule.userId, user.id), eq(reviewSchedule.topic, topic)),
      });

      let newInterval = 1;
      let newEaseFactor = 2.5;

      if (existingSchedule) {
        newEaseFactor = (existingSchedule.easeFactor ?? 2.5) + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
        newEaseFactor = Math.max(1.3, newEaseFactor);

        if (quality < 3) {
          newInterval = 1;
        } else {
          const prevInterval = existingSchedule.intervalDays ?? 1;
          newInterval = prevInterval === 1 ? 6 : Math.round(prevInterval * newEaseFactor);
        }
        
        const nextReview = new Date();
        nextReview.setDate(nextReview.getDate() + newInterval);

        await db.update(reviewSchedule).set({
          nextReview,
          intervalDays: newInterval,
          easeFactor: newEaseFactor,
        }).where(eq(reviewSchedule.id, existingSchedule.id));

      } else {
        const nextReview = new Date();
        nextReview.setDate(nextReview.getDate() + newInterval);
        
        await db.insert(reviewSchedule).values({
          userId: user.id,
          topic,
          nextReview,
          intervalDays: newInterval,
          easeFactor: newEaseFactor,
        });
      }

      // Adaptive Roadmap Logic
      if (newMasteryScore < 50) {
        const activeRoadmap = await db.query.roadmaps.findFirst({
          where: and(eq(roadmaps.userId, user.id), eq(roadmaps.active, true)),
        });

        if (activeRoadmap) {
          await db.insert(roadmapTasks).values({
            roadmapId: activeRoadmap.id,
            title: `Review fundamentals: ${topic}`,
            type: "article",
            status: "pending",
            url: "https://www.w3schools.com",
          });
        }
      }

      const relatedTask = await db.query.roadmapTasks.findFirst({
        where: and(eq(roadmapTasks.title, topic)),
      });

      await db.insert(progressEvents).values({
        userId: user.id,
        taskId: relatedTask?.id || null,
        score: newMasteryScore,
      });
    } catch (dbErr: any) {
      console.warn("[Evaluation] DB offline, returning computed score without persistence.", dbErr?.message);
    }

    res.json({ ok: true, newMasteryScore, weakArea: newMasteryScore < 50 });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message || "Failed to evaluate" });
  }
};
