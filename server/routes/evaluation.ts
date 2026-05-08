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

    const user = await db.query.users.findFirst({
      where: eq(users.sessionId, sessionId),
    });

    if (!user) return res.status(404).json({ ok: false, error: "User not found" });

    // Formula: (accuracy * 0.35 + confidence_alignment * 0.20 + completion_rate * 0.15 + revision_frequency * 0.15 + consistency * 0.10 + response_time_quality * 0.05)
    // We expect frontend to pass `confidence` (1-5) and `accuracy` (0-100)
    const confidenceScore = body.confidence ? (body.confidence / 5) * 100 : accuracy; // Normalize to 100
    
    // Confidence Alignment logic
    let confidenceAlignment = 0;
    if (accuracy >= 80 && confidenceScore >= 80) confidenceAlignment = 100; // Strong mastery
    else if (accuracy >= 80 && confidenceScore < 80) confidenceAlignment = 60; // Uncertain understanding
    else if (accuracy < 50 && confidenceScore >= 80) confidenceAlignment = 10; // Misconception danger
    else if (accuracy < 50 && confidenceScore < 50) confidenceAlignment = 50; // Learning stage

    const newMasteryScore = 
      (accuracy * 0.35) + 
      (confidenceAlignment * 0.20) + 
      (completionRate * 0.15) + 
      (revisionFrequency * 0.15) + 
      (consistency * 0.10) + 
      (100 * 0.05); // mock response_time_quality for now

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

    // 🔥 Fire async background jobs (non-blocking)
    // 1. Generate and store embedding for this mastery record
    queueEmbedding({ text: topic, table: "topic_mastery", id: masteryId }).catch(() => {
      // Silently degrade if Redis is offline — evaluation still succeeds
    });
    // 2. Re-run full analytics for this user in the background
    queueAnalytics({ userId: user.id }).catch(() => {});

    // Spaced Repetition Logic (SM-2 simplified)
    // accuracy is mapped 0-100. Let's map it to a quality score 0-5.
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
        newInterval = 1; // Failed, reset
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

    // Adaptive Roadmap Logic: if mastery is low (< 50), inject a new foundational task for this topic
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
          url: "https://www.w3schools.com", // mocked generic resource
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

    res.json({ ok: true, newMasteryScore, weakArea: newMasteryScore < 50 });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message || "Failed to evaluate" });
  }
};
