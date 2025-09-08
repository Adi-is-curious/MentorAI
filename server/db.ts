import { Pool } from "pg";

let pool: Pool | null = null;

function getPool() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  if (!pool) {
    pool = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });
  }
  return pool;
}

export async function ensureSchema() {
  const p = getPool();
  await p.query(`
    CREATE TABLE IF NOT EXISTS quizzes (
      id BIGSERIAL PRIMARY KEY,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      data JSONB NOT NULL
    );
  `);
}

export async function saveQuiz(data: any) {
  await ensureSchema();
  const p = getPool();
  await p.query("INSERT INTO quizzes(data) VALUES ($1)", [data]);
}

export async function getLatestQuiz() {
  await ensureSchema();
  const p = getPool();
  const r = await p.query("SELECT data FROM quizzes ORDER BY created_at DESC LIMIT 1");
  return r.rows[0]?.data ?? null;
}
