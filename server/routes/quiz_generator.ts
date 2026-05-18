import { RequestHandler } from "express";
import { db } from "../db";
import { users, quizzes, quizAttempts, topicMastery } from "../schema";
import { eq, and } from "drizzle-orm";

export const handleGenerateQuiz: RequestHandler = async (req, res) => {
  try {
    const topic = req.query.topic as string;
    if (!topic) return res.status(400).json({ ok: false, error: "Missing topic" });

    // Dynamic Difficulty Engine: try to check current mastery from DB
    let difficulty = "beginner";
    try {
      const sessionId = (req as any).sessionId;
      const user = await db.query.users.findFirst({
        where: eq(users.sessionId, sessionId),
      });

      if (user) {
        const mastery = await db.query.topicMastery.findFirst({
          where: and(eq(topicMastery.userId, user.id), eq(topicMastery.topic, topic))
        });

        if (mastery) {
          if ((mastery.masteryScore ?? 0) >= 80) difficulty = "advanced";
          else if ((mastery.masteryScore ?? 0) >= 50) difficulty = "intermediate";
        }
      }
    } catch (e) {
      console.warn("[Quiz Generator] DB offline, using default difficulty.");
    }

    let quizData;
    console.log("[Quiz] ENV GROQ_API_KEY present:", !!process.env.GROQ_API_KEY);
    console.log("[Quiz] Model:", "llama-3.3-70b-versatile");

    const Groq = (await import("groq-sdk")).default;
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const prompt = `
    You are an expert technical interviewer and computer science professor.
    Generate a ${difficulty} level quiz about '${topic}'.
    
    The quiz must strictly be in valid JSON format matching this schema:
    {
        "topic": "${topic}",
        "difficulty": "${difficulty}",
        "questions": [
            {
                "type": "mcq",
                "question": "string",
                "options": ["string", "string", "string", "string"],
                "correct_index": number (0-3),
                "explanation": "string explaining why"
            },
            {
                "type": "conceptual",
                "question": "string",
                "rubric": "string mentioning keywords to look for in the user's answer"
            }
        ]
    }
    
    Include 2 MCQ questions and 1 conceptual question. Make the questions challenging but fair for a ${difficulty} level.
    Only return the JSON.
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    const responseText = chatCompletion.choices[0]?.message?.content || "{}";
    console.log("[Quiz] Raw Groq response:", responseText);
    quizData = JSON.parse(responseText);

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
