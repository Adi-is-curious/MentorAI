import { db } from "./db";
import { resources } from "./schema";
import { sql } from "drizzle-orm";

// Curated seed resources — these are real, high-quality URLs
const SEED_RESOURCES = [
  // Data Science
  { title: "Kaggle Learn", url: "https://www.kaggle.com/learn", type: "course", domain: "Data Science", topic: "Machine Learning", difficulty: "beginner", qualityScore: 9.5 },
  { title: "fast.ai Practical Deep Learning", url: "https://course.fast.ai/", type: "course", domain: "Data Science", topic: "Deep Learning", difficulty: "intermediate", qualityScore: 9.8 },
  { title: "Google ML Crash Course", url: "https://developers.google.com/machine-learning/crash-course", type: "course", domain: "Data Science", topic: "Machine Learning", difficulty: "beginner", qualityScore: 9.0 },
  // Frontend
  { title: "React Docs - Quick Start", url: "https://react.dev/learn", type: "article", domain: "Frontend Engineering", topic: "React", difficulty: "beginner", qualityScore: 9.5 },
  { title: "MDN Web Docs - JavaScript", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript", type: "article", domain: "Frontend Engineering", topic: "JavaScript", difficulty: "beginner", qualityScore: 9.5 },
  { title: "TypeScript Handbook", url: "https://www.typescriptlang.org/docs/", type: "article", domain: "Frontend Engineering", topic: "TypeScript", difficulty: "intermediate", qualityScore: 9.0 },
  // Backend
  { title: "Node.js Official Guides", url: "https://nodejs.org/en/docs/guides", type: "article", domain: "Backend Engineering", topic: "Node.js", difficulty: "beginner", qualityScore: 8.5 },
  { title: "PostgreSQL Docs", url: "https://www.postgresql.org/docs/", type: "article", domain: "Backend Engineering", topic: "PostgreSQL", difficulty: "intermediate", qualityScore: 9.0 },
  { title: "roadmap.sh Backend", url: "https://roadmap.sh/backend", type: "article", domain: "Backend Engineering", topic: "Backend", difficulty: "beginner", qualityScore: 9.0 },
  // CS Fundamentals
  { title: "CS50 Harvard - Intro to CS", url: "https://cs50.harvard.edu/x", type: "course", domain: "Computer Science", topic: "CS Fundamentals", difficulty: "beginner", qualityScore: 9.9 },
  { title: "Big-O Cheat Sheet", url: "https://www.bigocheatsheet.com/", type: "article", domain: "Computer Science", topic: "Algorithms", difficulty: "intermediate", qualityScore: 8.5 },
  { title: "LeetCode Patterns Guide", url: "https://seanprashad.com/leetcode-patterns/", type: "article", domain: "Computer Science", topic: "Data Structures", difficulty: "intermediate", qualityScore: 9.0 },
  // AI/ML
  { title: "Hugging Face NLP Course", url: "https://huggingface.co/learn/nlp-course", type: "course", domain: "AI/ML Engineering", topic: "NLP", difficulty: "intermediate", qualityScore: 9.5 },
  { title: "Dive into Deep Learning (d2l.ai)", url: "https://d2l.ai/", type: "course", domain: "AI/ML Engineering", topic: "Deep Learning", difficulty: "advanced", qualityScore: 9.7 },
  // DevOps
  { title: "Docker Getting Started", url: "https://docs.docker.com/get-started/", type: "article", domain: "Cloud/DevOps", topic: "Docker", difficulty: "beginner", qualityScore: 9.0 },
  { title: "Kubernetes Docs", url: "https://kubernetes.io/docs/home/", type: "article", domain: "Cloud/DevOps", topic: "Kubernetes", difficulty: "intermediate", qualityScore: 9.0 },
  // System Design
  { title: "System Design Primer", url: "https://github.com/donnemartin/system-design-primer", type: "article", domain: "Solutions/Systems Architecture", topic: "System Design", difficulty: "advanced", qualityScore: 9.8 },
];

async function seedResources() {
  console.log("Enabling pgvector extension...");
  try {
    await db.execute(sql`CREATE EXTENSION IF NOT EXISTS vector;`);
    console.log("✅ pgvector ready.");
  } catch (e) {
    console.warn("pgvector extension could not be created. It may need to be installed first:", e);
  }

  console.log(`Seeding ${SEED_RESOURCES.length} resources...`);
  for (const resource of SEED_RESOURCES) {
    // Generate embedding via Python service
    let embedding: number[] | null = null;
    try {
      const r = await fetch("http://localhost:8000/generate-embedding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: `${resource.title} ${resource.topic} ${resource.domain}` }),
      });
      const j = await r.json();
      embedding = j.embedding ?? null;
    } catch (e) {
      console.warn(`Could not generate embedding for "${resource.title}" (Python service offline?). Inserting without embedding.`);
    }

    await db.insert(resources).values({
      ...resource,
      embedding,
    }).onConflictDoNothing();
  }

  console.log("✅ Seeding complete.");
  process.exit(0);
}

seedResources().catch(e => {
  console.error(e);
  process.exit(1);
});
