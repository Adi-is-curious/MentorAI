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
    let quizData;
    try {
      const pyResponse = await fetch("http://localhost:8000/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, difficulty })
      });
      if (!pyResponse.ok) {
        throw new Error("Python service failed");
      }
      quizData = await pyResponse.json();
    } catch (e: any) {
      console.warn("[Quiz Generator] Python service offline, returning fallback quiz data.", e.message);
      quizData = {
        topic: topic,
        difficulty: difficulty,
        questions: [
            {
                type: "mcq",
                question: `What is the primary purpose of ${topic}?`,
                options: [
                    "To optimize backend database queries.",
                    "To structure learning correctly.",
                    `A fundamental concept in ${topic}.`,
                    "A deprecated programming pattern."
                ],
                correct_index: 2,
                explanation: `This is a placeholder explanation for ${topic} since the AI engine is offline.`
            },
            {
                type: "conceptual",
                question: `Explain how ${topic} improves system design.`,
                rubric: "Look for keywords related to efficiency, scale, or logic."
            }
        ]
      };
    }

    // Try to save to DB, but don't fail if DB is offline
    let newQuiz = { id: Date.now(), topic, difficulty, questionsJson: quizData };
    try {
      const [savedQuiz] = await db.insert(quizzes).values({
        topic,
        difficulty,
        questionsJson: quizData,
      }).returning();
      newQuiz = savedQuiz as any;
    } catch (e: any) {
      console.warn("[Quiz Generator] DB offline, returning quiz without saving to DB.", e?.message);
    }

    res.json({ ok: true, quiz: newQuiz });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message });
  }
};

export const handleAttemptQuiz: RequestHandler = async (req, res) => {
  // We will handle the quiz submission here
};
