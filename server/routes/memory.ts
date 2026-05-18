import { RequestHandler } from "express";
import { db } from "../db";
import { users, mentorMemory } from "../schema";
import { eq, and } from "drizzle-orm";

async function getUserId(sessionId: string): Promise<number | null> {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.sessionId, sessionId),
    });
    return user?.id ?? null;
  } catch (e) {
    console.warn("[Memory] DB offline, cannot look up user.");
    return null;
  }
}

export const handleGetMemory: RequestHandler = async (req, res) => {
  try {
    const userId = await getUserId((req as any).sessionId);
    if (!userId) return res.json({ ok: true, data: [] });

    const memories = await db.query.mentorMemory.findMany({
      where: eq(mentorMemory.userId, userId),
    });

    res.json({ ok: true, data: memories });
  } catch (e: any) {
    console.warn("[Memory] DB offline, returning empty.", e?.message);
    res.json({ ok: true, data: [] });
  }
};

export const handleAddMemory: RequestHandler = async (req, res) => {
  try {
    const userId = await getUserId((req as any).sessionId);
    if (!userId) return res.json({ ok: true, note: "DB offline, memory not saved." });

    const { memoryType, content } = req.body;
    
    await db.insert(mentorMemory).values({
      userId,
      memoryType,
      content,
    });

    res.json({ ok: true });
  } catch (e: any) {
    console.warn("[Memory] DB offline, skipping save.", e?.message);
    res.json({ ok: true, note: "DB offline, memory not saved." });
  }
};
