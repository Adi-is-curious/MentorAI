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

    await db.insert(mentorMemory).values({
      userId,
      memoryType: "onboarding_quiz",
      content: body,
    });
    
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message || "Failed to save" });
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
    res.status(500).json({ ok: false, error: e?.message || "Failed to load" });
  }
};
