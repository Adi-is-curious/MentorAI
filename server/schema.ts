import {
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  real,
  customType,
} from "drizzle-orm/pg-core";

// Define pgvector custom type
export const vector = customType<{ data: number[]; driverData: string }>({
  dataType() {
    return "vector(384)"; // all-MiniLM-L6-v2 size
  },
  toDriver(value: number[]): string {
    return JSON.stringify(value);
  },
  fromDriver(value: string): number[] {
    return typeof value === "string" ? JSON.parse(value) : value;
  },
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  learningStyle: jsonb("learning_style").default({}), // Tracks formatting preference, burnout
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  type: text("type").notNull(), // article, video, course
  domain: text("domain"), // e.g. Data Science
  topic: text("topic"), // e.g. Trees
  difficulty: text("difficulty").default("beginner"),
  qualityScore: real("quality_score").default(5.0),
  embedding: vector("embedding"),
});

export const roadmaps = pgTable("roadmaps", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  domain: text("domain").notNull(),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const roadmapTasks = pgTable("roadmap_tasks", {
  id: serial("id").primaryKey(),
  roadmapId: integer("roadmap_id").references(() => roadmaps.id),
  title: text("title").notNull(),
  type: text("type").notNull(), // course, article, project
  url: text("url"),
  status: text("status").default("pending"), // pending, in_progress, completed
  dependencies: jsonb("dependencies").default([]), // Array of task titles this task depends on
  learningState: text("learning_state").default("Ready"), // Locked, Guided, Ready, Accelerated
});

export const topicMastery = pgTable("topic_mastery", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  topic: text("topic").notNull(),
  masteryScore: real("mastery_score").default(0),
  confidenceScore: real("confidence_score").default(0),
  lastReviewed: timestamp("last_reviewed"),
  weakArea: boolean("weak_area").default(false),
  embedding: vector("embedding"), // Embed the weakness for semantic retrieval
});

export const progressEvents = pgTable("progress_events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  taskId: integer("task_id").references(() => roadmapTasks.id),
  score: real("score").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reviewSchedule = pgTable("review_schedule", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  topic: text("topic").notNull(),
  nextReview: timestamp("next_review").notNull(),
  intervalDays: integer("interval_days").default(1),
  easeFactor: real("ease_factor").default(2.5),
});

export const mentorMemory = pgTable("mentor_memory", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  memoryType: text("memory_type").notNull(),
  content: jsonb("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const resumeAnalysis = pgTable("resume_analysis", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  results: jsonb("results").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  topic: text("topic").notNull(),
  difficulty: text("difficulty").default("beginner"),
  questionsJson: jsonb("questions_json").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const quizAttempts = pgTable("quiz_attempts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  quizId: integer("quiz_id").references(() => quizzes.id),
  answersJson: jsonb("answers_json").notNull(),
  accuracy: real("accuracy").default(0),
  confidence: real("confidence").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
