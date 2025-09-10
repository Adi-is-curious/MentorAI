import type { AnalyzeResponse } from "@shared/api";
import { z } from "zod";

const AnalyzeInput = z.object({
  skills: z.string().default(""),
  interests: z.string().default(""),
  resumeText: z.string().default(""),
  rolePref: z.string().default(""),
  industries: z.array(z.string()).default([]),
  codingLanguages: z.array(z.string()).default([]),
  tools: z.array(z.string()).default([]),
  interestsTags: z.array(z.string()).default([]),
  values: z.array(z.string()).default([]),
  roles: z.array(z.string()).default([]),
  learningStyle: z.string().default(""),
  environment: z.string().default(""),
  goals: z.string().default(""),
});

function parseCSV(input: string) {
  return input
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 12);
}

export function analyzeCareer(input: unknown): AnalyzeResponse {
  const body = AnalyzeInput.parse(input);
  const { skills, interests, resumeText } = body;
  const rolePref = body.rolePref;
  const { industries, codingLanguages, tools, interestsTags, values, roles } = body;
  const { learningStyle, environment, goals } = body;

  const skillList = parseCSV(skills.toLowerCase());
  const interestList = parseCSV(interests.toLowerCase());
  const extra = [
    rolePref,
    ...industries,
    ...codingLanguages,
    ...tools,
    ...interestsTags,
    ...values,
    ...roles,
    learningStyle,
    environment,
    goals,
  ]
    .filter(Boolean)
    .join(", ");
  const text = `${skills} ${interests} ${resumeText} ${extra}`.toLowerCase();

  type Domain = {
    domain: string;
    keywords: string[];
    boosts?: string[];
    baseReason: string;
  };

  const catalog: Domain[] = [
    {
      domain: "Data Science",
      baseReason: "analytical mindset with Python/SQL and data tooling",
      keywords: [
        "python",
        "pandas",
        "numpy",
        "statistics",
        "ml",
        "data",
        "sql",
        "visualization",
        "notebook",
      ],
      boosts: ["data", "analytics", "bi"],
    },
    {
      domain: "AI/ML Engineering",
      baseReason: "model building and ML frameworks",
      keywords: ["ml", "machine learning", "ai", "pytorch", "tensorflow", "llm", "huggingface"],
      boosts: ["ai/ml", "mlops"],
    },
    {
      domain: "Frontend Engineering",
      baseReason: "UI/UX focus with JavaScript, React, and CSS",
      keywords: ["react", "javascript", "typescript", "css", "ui", "design", "tailwind", "next"],
      boosts: ["frontend", "web", "ui"],
    },
    {
      domain: "Backend Engineering",
      baseReason: "API/database strengths with Node and SQL",
      keywords: ["node", "express", "api", "database", "postgres", "sql", "prisma", "auth"],
      boosts: ["backend", "api", "server"],
    },
    {
      domain: "Full Stack Engineering",
      baseReason: "end‑to‑end product building across frontend and backend",
      keywords: ["fullstack", "full stack", "react", "node", "next", "api", "sql"],
      boosts: ["full stack", "software engineer"],
    },
    {
      domain: "Mobile Development",
      baseReason: "building native or cross‑platform mobile apps",
      keywords: ["ios", "android", "swift", "kotlin", "flutter", "react native"],
      boosts: ["mobile", "app"],
    },
    {
      domain: "SRE",
      baseReason: "reliability, monitoring, and incident response",
      keywords: ["sre", "observability", "prometheus", "grafana", "alerts", "oncall", "reliability"],
      boosts: ["sre", "reliability"],
    },
    {
      domain: "Cybersecurity",
      baseReason: "security mindset and defensive tooling",
      keywords: ["security", "siem", "soc", "threat", "vulnerability", "owasp", "splunk", "mitre"],
      boosts: ["security", "blue team", "red team"],
    },
    {
      domain: "Cloud/DevOps",
      baseReason: "cloud platforms and automation (CI/CD)",
      keywords: ["aws", "gcp", "azure", "docker", "kubernetes", "devops", "terraform", "ci/cd"],
      boosts: ["cloud/devops", "sre"],
    },
    {
      domain: "UI/UX Design",
      baseReason: "designing usable, accessible interfaces",
      keywords: ["ui", "ux", "figma", "prototyping", "wireframe", "design", "research"],
      boosts: ["design", "ui/ux"],
    },
    {
      domain: "Product Management",
      baseReason: "product thinking and stakeholder collaboration",
      keywords: ["product", "roadmap", "stakeholder", "communication", "analytics", "experimentation"],
      boosts: ["product", "pm"],
    },
    {
      domain: "QA/Test",
      baseReason: "quality assurance and test automation",
      keywords: ["test", "automation", "qa", "selenium", "cypress", "playwright"],
      boosts: ["qa", "testing"],
    },
    {
      domain: "Game Development",
      baseReason: "interactive experiences and engines",
      keywords: ["unity", "unreal", "godot", "game", "shader"],
      boosts: ["game"],
    },
    {
      domain: "Embedded Systems",
      baseReason: "firmware and hardware‑software integration",
      keywords: ["embedded", "firmware", "rtos", "mcu", "c", "c++"],
      boosts: ["embedded", "firmware"],
    },
    {
      domain: "Blockchain",
      baseReason: "smart contracts and distributed systems",
      keywords: ["solidity", "ethereum", "web3", "smart contract", "defi"],
      boosts: ["blockchain", "web3"],
    },
    {
      domain: "Database Administration",
      baseReason: "operating and tuning database systems",
      keywords: ["postgres", "mysql", "oracle", "backup", "replication", "index"],
      boosts: ["dba", "database"],
    },
    {
      domain: "Solutions/Systems Architecture",
      baseReason: "systems design, scalability, and architecture",
      keywords: ["architecture", "scalability", "design patterns", "high availability", "diagram"],
      boosts: ["architect", "solutions"],
    },
    {
      domain: "Technical Writing",
      baseReason: "creating clear technical documentation",
      keywords: ["documentation", "write", "tutorial", "docs"],
      boosts: ["technical writer", "docs"],
    },
  ];

  const tokens = text
    .split(/[^a-z0-9+.#/]+/)
    .map((t) => t.trim())
    .filter(Boolean);
  const roleTokens = roles.map((r) => r.toLowerCase());

  const scores = catalog.map((c) => {
    let score = 0;
    const matched: string[] = [];
    for (const k of c.keywords) {
      const has = tokens.includes(k) || text.includes(k);
      if (has) {
        score += 3;
        matched.push(k);
      }
    }
    for (const b of c.boosts || []) if (tokens.includes(b)) score += 1.5;
    if (rolePref) {
      const rp = rolePref.toLowerCase();
      if (rp === "engineering" && (c.domain.includes("Frontend") || c.domain.includes("Backend") || c.domain.includes("Full Stack"))) score += 1.5;
      if (rp === "data" && (c.domain.includes("Data") || c.domain.includes("AI/ML"))) score += 2;
      if (rp === "product" && c.domain.includes("Product")) score += 2;
      if (rp === "design" && (c.domain.includes("Frontend") || c.domain.includes("UI/UX"))) score += 1.2;
    }
    for (const r of roleTokens) {
      if (r.includes("frontend") && c.domain.includes("Frontend")) score += 2.5;
      if (r.includes("backend") && c.domain.includes("Backend")) score += 2.5;
      if (r.includes("full stack") && c.domain.includes("Full Stack")) score += 2.5;
      if ((r.includes("software engineer") || r.includes("developer")) && (c.domain.includes("Frontend") || c.domain.includes("Backend") || c.domain.includes("Full Stack"))) score += 1.5;
      if (r.includes("mobile") && c.domain.includes("Mobile")) score += 2.5;
      if ((r.includes("devops") || r.includes("sre")) && (c.domain.includes("Cloud/DevOps") || c.domain.includes("SRE"))) score += 2.5;
      if (r.includes("cloud") && c.domain.includes("Cloud/DevOps")) score += 2;
      if ((r.includes("security") || r.includes("cyber")) && c.domain.includes("Cybersecurity")) score += 2.5;
      if (r.includes("data scientist") && c.domain.includes("Data Science")) score += 2.5;
      if (r.includes("data engineer") && (c.domain.includes("Data Engineer") || c.domain.includes("Backend"))) score += 2;
      if ((r.includes("ml engineer") || r.includes("ai")) && c.domain.includes("AI/ML")) score += 2.5;
      if ((r.includes("ui") || r.includes("ux")) && c.domain.includes("UI/UX")) score += 2.5;
      if (r.includes("product manager") && c.domain.includes("Product Management")) score += 2.5;
      if ((r.includes("qa") || r.includes("test")) && c.domain.includes("QA/Test")) score += 2;
      if (r.includes("embedded") && c.domain.includes("Embedded")) score += 2;
      if (r.includes("game") && c.domain.includes("Game")) score += 2;
      if (r.includes("blockchain") && c.domain.includes("Blockchain")) score += 2;
      if (r.includes("database") && c.domain.includes("Database")) score += 2;
      if (r.includes("architect") && c.domain.includes("Architect")) score += 2;
      if (r.includes("technical writer") && c.domain.includes("Technical Writing")) score += 2;
    }
    for (const ind of industries) if (text.includes(ind.toLowerCase()))) score += 0.5;
    if (learningStyle) score += 0.1;
    if (environment) score += 0.1;
    return { domain: c.domain, score, matched, baseReason: c.baseReason };
  });

  scores.sort((a, b) => b.score - a.score);
  const top = scores.slice(0, 4).filter((t) => t.score > 0);
  const suggestions = (top.length ? top : scores.slice(0, 4)).map((t) => ({
    domain: t.domain,
    reason: t.matched.length > 0 ? `based on (${t.matched.slice(0, 6).join(", ")}) and your preferences` : t.baseReason,
  }));

  const canonicalSkills = [
    "python",
    "sql",
    "statistics",
    "react",
    "typescript",
    "node",
    "api design",
    "cloud",
    "docker",
    "ml fundamentals",
    "data visualization",
    "testing",
  ];
  const skillGaps = canonicalSkills.filter((s) => !skillList.includes(s));

  const learningPath = [
    { title: "Build a portfolio project in your target domain", type: "project" as const },
    { title: "FreeCodeCamp: JavaScript Algorithms and Data Structures", type: "course" as const, url: "https://www.freecodecamp.org/learn" },
    { title: "The Missing Semester of CS (MIT)", type: "course" as const, url: "https://missing.csail.mit.edu/" },
  ];

  return {
    suggestions,
    skillGaps: skillGaps.slice(0, 6),
    learningPath,
    summary: `Based on your input, we recommend exploring ${suggestions.map((s) => s.domain).join(", ")}. Focus on closing ${skillGaps.slice(0, 3).join(", ")}.`,
  };
}