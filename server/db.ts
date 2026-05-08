import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const queryClient = postgres(process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/mentorai");
export const db = drizzle(queryClient, { schema });

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
