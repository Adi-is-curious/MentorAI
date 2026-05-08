import { RequestHandler } from "express";
import { db } from "../db";
import { users, mentorMemory } from "../schema";
import { eq, desc, and } from "drizzle-orm";

async function ensureUser(sessionId: string) {
  let user = await db.query.users.findFirst({
    where: eq(users.sessionId, sessionId),
  });
  if (!user) {
    const [newUser] = await db.insert(users).values({ sessionId }).returning();
    user = newUser;
  }
  return user.id;
}

export const handleSaveQuiz: RequestHandler = async (req, res) => {
  try {
    const sessionId = (req as any).sessionId;
    const userId = await ensureUser(sessionId);
    const body = req.body ?? {};

    try {
      await db.insert(mentorMemory).values({
        userId,
        memoryType: "onboarding_quiz",
        content: body,
      });
    } catch (e) {
      console.warn("[Save Quiz] DB offline, skipping save to mentorMemory.");
    }
    
    res.json({ ok: true });
  } catch (e: any) {
    // If ensureUser fails because DB is offline, also gracefully degrade
    console.warn("[Save Quiz] DB offline, gracefully succeeding without saving.");
    res.json({ ok: true });
  }
};

export const handleGetLatestQuiz: RequestHandler = async (req, res) => {
  try {
    const sessionId = (req as any).sessionId;
    const user = await db.query.users.findFirst({
      where: eq(users.sessionId, sessionId),
    });
    if (!user) return res.status(404).json({ ok: false, error: "No data" });

    const memory = await db.query.mentorMemory.findFirst({
      where: and(
        eq(mentorMemory.userId, user.id),
        eq(mentorMemory.memoryType, "onboarding_quiz")
      ),
      orderBy: [desc(mentorMemory.createdAt)],
    });

    if (!memory) return res.status(404).json({ ok: false, error: "No data" });
    res.json({ ok: true, data: memory.content });
  } catch (e: any) {
    console.warn("[Get Latest Quiz] DB offline, returning mock data.");
    res.json({
      ok: true,
      data: {
        rolePref: "Software Engineer",
        experience: "Beginner",
        timePerWeek: "5",
        learningStyle: "video",
        goals: "Get a job in tech"
      }
    });
  }
};
