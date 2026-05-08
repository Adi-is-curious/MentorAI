import { db } from "./db";
import { sql } from "drizzle-orm";

async function initDB() {
  console.log("Initializing database extensions...");
  try {
    await db.execute(sql`CREATE EXTENSION IF NOT EXISTS vector;`);
    console.log("pgvector extension is ready.");
  } catch (error) {
    console.error("Failed to create pgvector extension. Please ensure it is installed in Postgres.", error);
  }
}

initDB().then(() => process.exit(0)).catch(e => {
  console.error(e);
  process.exit(1);
});
