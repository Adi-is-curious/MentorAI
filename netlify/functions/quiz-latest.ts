import type { Handler } from "@netlify/functions";
import { getLatestQuiz } from "../../server/db";

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod !== "GET") {
      return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
    }
    const data = await getLatestQuiz();
    if (!data) return { statusCode: 404, body: JSON.stringify({ ok: false, error: "No data" }) };
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: true, data }),
    };
  } catch (e: any) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: false, error: e?.message || "Failed to load" }),
    };
  }
};
