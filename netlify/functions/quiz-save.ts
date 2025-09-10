import type { Handler } from "@netlify/functions";
import { analyzeInputSchema } from "../../server/services/analyze";
import { saveQuiz } from "../../server/db";

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
    }
    const body = event.body ? JSON.parse(event.body) : {};
    // Sanitize input using the same schema (fields optional/defaulted)
    const data = analyzeInputSchema.parse(body);
    await saveQuiz(data);
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: true }),
    };
  } catch (e: any) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: false, error: e?.message || "Failed to save" }),
    };
  }
};
