import type { Handler } from "@netlify/functions";
import { analyzeCareer } from "../../server/services/analyze";

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
    }
    const body = event.body ? JSON.parse(event.body) : {};
    const result = analyzeCareer(body);
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result),
    };
  } catch (e: any) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: e?.message || "Invalid request" }),
    };
  }
};
