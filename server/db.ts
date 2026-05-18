import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Lazy database connection — only connect when DATABASE_URL is available.
// This prevents crashes in serverless environments (Netlify) where the DB
// may not be configured. All routes already have try/catch around DB calls
// so they gracefully degrade when db operations throw.

let _db: PostgresJsDatabase<typeof schema> | null = null;

function getDb(): PostgresJsDatabase<typeof schema> {
  if (_db) return _db;

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL not set — database is unavailable");
  }

  const queryClient = postgres(url);
  _db = drizzle(queryClient, { schema });
  return _db;
}

// Proxy that lazily initializes the DB connection on first property access.
// This lets routes import `db` without crashing at module load time.
export const db = new Proxy({} as PostgresJsDatabase<typeof schema>, {
  get(_target, prop, receiver) {
    const realDb = getDb();
    const value = Reflect.get(realDb, prop, receiver);
    if (typeof value === "function") {
      return value.bind(realDb);
    }
    return value;
  },
});

// Helper to push migrations if needed, or we can use drizzle-kit push
export async function ensureSchema() {
  // We will rely on drizzle-kit push/migrate for schema syncing.
  // For MVP, if we want auto-push, we can use migrate() but it requires 'drizzle-orm/postgres-js/migrator'
  // Or simply instruct the user to run `pnpm drizzle-kit push`
}

export async function saveQuiz(data: any) {
  // this is a mock compat function for the existing api if needed temporarily
  // but we will remove it later
}

export async function getLatestQuiz() {
  return null;
}
