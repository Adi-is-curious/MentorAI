import { RequestHandler } from "express";
import { db } from "../db";
import { users, mentorMemory } from "../schema";
import { eq, and } from "drizzle-orm";

async function getUserId(sessionId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.sessionId, sessionId),
  });
  return user?.id;
}

export const handleGetMemory: RequestHandler = async (req, res) => {
  try {
    const userId = await getUserId((req as any).sessionId);
    if (!userId) return res.status(404).json({ ok: false, error: "User not found" });

    const memories = await db.query.mentorMemory.findMany({
      where: eq(mentorMemory.userId, userId),
    });

    res.json({ ok: true, data: memories });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message });
  }
};

export const handleAddMemory: RequestHandler = async (req, res) => {
  try {
    const userId = await getUserId((req as any).sessionId);
    if (!userId) return res.status(404).json({ ok: false, error: "User not found" });

    const { memoryType, content } = req.body;
    
    // Upsert or insert depending on if memoryType is meant to be singular.
    // For now we just insert.
    await db.insert(mentorMemory).values({
      userId,
      memoryType,
      content,
    });

    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message });
  }
};
