import { RequestHandler } from "express";
import multer from "multer";
import { db } from "../db";
import { users, resumeAnalysis } from "../schema";
import { eq } from "drizzle-orm";

const upload = multer({ storage: multer.memoryStorage() });

export const handleResumeUpload = upload.single("file");

export const handleResumeAnalysis: RequestHandler = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ ok: false, error: "No file provided" });
    }

    const sessionId = (req as any).sessionId;
    let user = null;
    try {
      user = await db.query.users.findFirst({
        where: eq(users.sessionId, sessionId),
      });
    } catch (e) {
      console.warn("[Resume] DB offline, skipping user lookup.");
    }

    // Use native Web API FormData and Blob (supported in Node 18+)
    const formData = new FormData();
    const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
    formData.append("file", blob, req.file.originalname);
    
    if (req.body.job_description) {
      formData.append("job_description", req.body.job_description);
    }

    // Call Python FastAPI service
    const pyRes = await fetch("http://localhost:8000/analyze-resume", {
      method: "POST",
      body: formData, // Native fetch understands native FormData automatically
    });

    if (!pyRes.ok) {
      const errText = await pyRes.text();
      return res.status(500).json({ ok: false, error: "Python service failed: " + errText });
    }

    const pyData = await pyRes.json();

    if (user) {
      try {
        await db.insert(resumeAnalysis).values({
          userId: user.id,
          results: pyData,
        });
      } catch(e) {
        console.warn("[Resume] DB offline, skipping save to DB.");
      }
    }

    res.json({ ok: true, data: pyData });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message || "Failed to analyze resume" });
  }
};
