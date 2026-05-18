import { RequestHandler } from "express";
import multer from "multer";
import { db } from "../db";
import { users, resumeAnalysis } from "../schema";
import { eq } from "drizzle-orm";

const upload = multer({ storage: multer.memoryStorage() });

export const handleResumeUpload = upload.single("file");

import { PDFParse as pdfParse } from "pdf-parse";
import mammoth from "mammoth";
import Groq from "groq-sdk";

// Helper to extract text
async function extractText(buffer: Buffer, mimetype: string, originalname: string): Promise<string> {
  if (mimetype === "application/pdf" || originalname.endsWith(".pdf")) {
    const data = await (pdfParse as any)(buffer);
    return data.text;
  } else if (
    mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    originalname.endsWith(".docx")
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } else {
    // Fallback for txt
    return buffer.toString("utf8");
  }
}

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

    const jobDescription = req.body.job_description || "";
    const resumeText = await extractText(req.file.buffer, req.file.mimetype, req.file.originalname);
    const snippet = resumeText.substring(0, 500);

    let pyData;
    try {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const prompt = `
      You are an expert ATS (Applicant Tracking System) AI and technical recruiter.
      Analyze the following resume text.
      ${jobDescription ? `Compare it to this job description:\n${jobDescription}\n` : ""}

      Resume Text:
      ${resumeText.substring(0, 3000)}

      Return a JSON object containing the following keys EXACTLY:
      "ats_score": number between 0 and 100 based on overall resume quality and formatting.
      "match_percentage": number between 0 and 100 (cosine similarity or how well it matches the JD. If no JD, just guess based on how focused the resume is, e.g., 50-80).
      "skill_gaps": array of strings (missing key skills).
      "found_skills": array of strings (skills found in resume).
      "bullet_feedback": array of objects with exactly 3 string keys: "bullet" (the original sentence), "issue" (why it's weak), "suggestion" (how to improve it with stronger verbs/metrics). Give at most 4 bullets.
      "extracted_text_snippet": "${snippet.replace(/"/g, '\\"').replace(/\n/g, ' ')}"
      
      Respond ONLY with valid JSON.
      `;

      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama3-70b-8192",
        temperature: 0.2,
        response_format: { type: "json_object" }
      });

      const responseText = chatCompletion.choices[0]?.message?.content || "{}";
      pyData = JSON.parse(responseText);
      // Ensure snippet is there
      pyData.extracted_text_snippet = snippet;
    } catch (err: any) {
      console.error("[Resume] Groq AI service failed:", err.message);
      // Fallback
      pyData = {
        ats_score: 75,
        match_percentage: jobDescription ? 65.5 : 0.0,
        skill_gaps: ["error_with_ai"],
        found_skills: ["parsed_resume"],
        bullet_feedback: [
          {
            bullet: "Failed to run AI",
            issue: "AI Error",
            suggestion: "Please try again later or check GROQ_API_KEY."
          }
        ],
        extracted_text_snippet: snippet
      };
    }

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
