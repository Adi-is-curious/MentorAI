import { RequestHandler } from "express";
import { db } from "../db";
import { users, quizzes, quizAttempts, topicMastery } from "../schema";
import { eq, and } from "drizzle-orm";

export const handleGenerateQuiz: RequestHandler = async (req, res) => {
  try {
    const sessionId = (req as any).sessionId;
    const user = await db.query.users.findFirst({
      where: eq(users.sessionId, sessionId),
    });

    if (!user) return res.status(404).json({ ok: false, error: "User not found" });

    const topic = req.query.topic as string;
    if (!topic) return res.status(400).json({ ok: false, error: "Missing topic" });

    // Dynamic Difficulty Engine: Check current mastery
    let difficulty = "beginner";
    const mastery = await db.query.topicMastery.findFirst({
      where: and(eq(topicMastery.userId, user.id), eq(topicMastery.topic, topic))
    });

    if (mastery) {
      if ((mastery.masteryScore ?? 0) >= 80) difficulty = "advanced";
      else if ((mastery.masteryScore ?? 0) >= 50) difficulty = "intermediate";
    }

    // Call Python Service
    const pyResponse = await fetch("http://localhost:8000/generate-quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, difficulty })
    });

    const quizData = await pyResponse.json();

    // Save quiz to DB
    const [newQuiz] = await db.insert(quizzes).values({
      topic,
      difficulty,
      questionsJson: quizData,
    }).returning();

    res.json({ ok: true, quiz: newQuiz });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message });
  }
};

export const handleAttemptQuiz: RequestHandler = async (req, res) => {
  // We will handle the quiz submission here
};
