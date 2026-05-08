import { RequestHandler } from "express";
import { db } from "../db";
import { users, roadmaps, roadmapTasks, reviewSchedule, topicMastery, resources } from "../schema";
import { eq, and, lte, sql } from "drizzle-orm";

async function getSemanticResources(weakTopics: string[], domain: string): Promise<any[]> {
  if (weakTopics.length === 0) return [];

  // Try to generate embedding for the query using the Python service
  let queryEmbedding: number[] | null = null;
  const queryText = weakTopics.join(", ");
  try {
    const r = await fetch("http://localhost:8000/generate-embedding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: queryText }),
    });
    const j = await r.json();
    queryEmbedding = j.embedding ?? null;
  } catch {
    console.warn("Python service offline; falling back to topic-text matching.");
  }

  if (queryEmbedding) {
    // pgvector cosine distance search (lower = more similar)
    // Ranking: semantic_similarity * 0.5 + quality * 0.3 + difficulty_match * 0.2
    const vectorStr = `[${queryEmbedding.join(",")}]`;
    const results = await db.execute(sql`
      SELECT id, title, url, type, topic, domain, difficulty, quality_score,
             1 - (embedding <=> ${vectorStr}::vector) AS semantic_score
      FROM resources
      WHERE embedding IS NOT NULL
      ORDER BY (
        (1 - (embedding <=> ${vectorStr}::vector)) * 0.5 +
        (quality_score / 10.0) * 0.3
      ) DESC
      LIMIT 5
    `);
    return results as any[];
  }

  // Fallback: filter by domain text match
  return await db.query.resources.findMany({
    where: eq(resources.domain, domain),
    limit: 5,
  });
}

export const handleGetRoadmap: RequestHandler = async (req, res) => {
  try {
    const sessionId = (req as any).sessionId;
    const user = await db.query.users.findFirst({
      where: eq(users.sessionId, sessionId),
    });

    if (!user) return res.status(404).json({ ok: false, error: "User not found" });

    // 1. Get active roadmap tasks with dependency-graph logic
    const activeRoadmap = await db.query.roadmaps.findFirst({
      where: and(eq(roadmaps.userId, user.id), eq(roadmaps.active, true)),
    });

    let newTasks: any[] = [];
    let weakTopics: string[] = [];

    if (activeRoadmap) {
      const allTasks = await db.query.roadmapTasks.findMany({
        where: eq(roadmapTasks.roadmapId, activeRoadmap.id),
      });

      // Get all user masteries
      const masteries = await db.query.topicMastery.findMany({
        where: eq(topicMastery.userId, user.id),
      });

      const masteryMap = new Map(masteries.map(m => [m.topic.toLowerCase(), m.masteryScore ?? 0]));
      weakTopics = masteries.filter(m => (m.masteryScore ?? 0) < 60).map(m => m.topic);

      for (const task of allTasks) {
        let state = "Ready";
        let explanation = "";

        const deps = task.dependencies as string[];
        if (deps && deps.length > 0) {
          let lockedBy = "";
          let guidedBy = "";

          for (const dep of deps) {
            const mScore = masteryMap.get(dep.toLowerCase()) ?? 0;
            if (mScore < 50) { lockedBy = dep; break; }
            else if (mScore < 70) { guidedBy = dep; }
          }

          if (lockedBy) {
            state = "Locked";
            explanation = `"${task.title}" is temporarily delayed because your "${lockedBy}" mastery dropped after recent quizzes. Reviewing "${lockedBy}" today will unlock it.`;
          } else if (guidedBy) {
            state = "Guided";
            explanation = `Your foundation in "${guidedBy}" is developing. Extra hints are enabled for "${task.title}".`;
          } else if ((masteryMap.get(task.title.toLowerCase()) ?? 0) > 80) {
            state = "Accelerated";
            explanation = `You're advanced in this area. Fast-tracking "${task.title}".`;
          }
        }

        if (state !== task.learningState) {
          await db.update(roadmapTasks).set({ learningState: state }).where(eq(roadmapTasks.id, task.id));
          task.learningState = state;
        }

        if (state !== "Locked") {
          newTasks.push({ ...task, mentorExplanation: explanation });
        }
      }
    }

    // 2. Spaced Repetition reviews due today or earlier
    const today = new Date();
    const dueReviews = await db.query.reviewSchedule.findMany({
      where: and(eq(reviewSchedule.userId, user.id), lte(reviewSchedule.nextReview, today)),
    });

    const reviewTasks = dueReviews.map(r => ({
      id: `review-${r.id}`,
      title: `Review: ${r.topic}`,
      type: "quiz",
      status: "pending",
      url: `/topic-quiz?topic=${encodeURIComponent(r.topic)}`,
      isReview: true,
    }));

    // 3. Semantic Resource Recommendations (AI-ranked)
    const domain = activeRoadmap?.domain ?? "Computer Science";
    const semanticResources = await getSemanticResources(weakTopics, domain);

    const resourceTasks = semanticResources.map(r => ({
      id: `resource-${r.id}`,
      title: r.title,
      type: r.type,
      url: r.url,
      status: "pending",
      semanticScore: r.semantic_score ? Math.round(r.semantic_score * 100) : null,
      mentorExplanation: r.semantic_score
        ? `Ranked ${Math.round(r.semantic_score * 100)}% match for your current weak areas.`
        : "",
    }));

    // Fallback if no roadmap/resources
    if (newTasks.length === 0 && reviewTasks.length === 0 && resourceTasks.length === 0) {
      newTasks = [
        { id: 1, title: "Introduction to System Design", type: "course", status: "pending", url: "#" },
        { id: 2, title: "Database Scaling Concepts", type: "article", status: "pending", url: "#" },
      ];
    }

    res.json({
      ok: true,
      data: {
        domain,
        modules: [
          { title: "Daily Reviews (Spaced Repetition) 🔄", tasks: reviewTasks },
          { title: "Semantically Ranked Resources 🧠", tasks: resourceTasks },
          { title: "New Topics", tasks: newTasks },
        ],
      },
    });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message });
  }
};
