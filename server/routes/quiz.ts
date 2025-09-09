import { RequestHandler } from "express";
import { getLatestQuiz, saveQuiz } from "../db";

export const handleSaveQuiz: RequestHandler = async (req, res) => {
  try {
    const body = req.body ?? {};
    await saveQuiz(body);
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message || "Failed to save" });
  }
};

export const handleGetLatestQuiz: RequestHandler = async (_req, res) => {
  try {
    const data = await getLatestQuiz();
    if (!data) return res.status(404).json({ ok: false, error: "No data" });
    res.json({ ok: true, data });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message || "Failed to load" });
  }
};
