import { RequestHandler } from "express";
import type { AnalyzeRequest, AnalyzeResponse } from "@shared/api";

function parseCSV(input: string) {
  return input
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 12);
}

export const handleAnalyze: RequestHandler = (req, res) => {
  const body = (req.body || {}) as any;
  const {
    skills = "",
    interests = "",
    resumeText = "",
  } = body as AnalyzeRequest;
  const rolePref = String(body.rolePref ?? "");
  const industries: string[] = Array.isArray(body.industries)
    ? body.industries
    : [];
  const codingLanguages: string[] = Array.isArray(body.codingLanguages)
    ? body.codingLanguages
    : [];
  const tools: string[] = Array.isArray(body.tools) ? body.tools : [];
  const interestsTags: string[] = Array.isArray(body.interestsTags)
    ? body.interestsTags
    : [];
  const values: string[] = Array.isArray(body.values) ? body.values : [];
  const learningStyle = String(body.learningStyle ?? "");
  const environment = String(body.environment ?? "");
  const goals = String(body.goals ?? "");

  const skillList = parseCSV(skills.toLowerCase());
  const interestList = parseCSV(interests.toLowerCase());
  const extra = [
    rolePref,
    ...industries,
    ...codingLanguages,
    ...tools,
    ...interestsTags,
    ...values,
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
      domain: "Frontend Engineering",
      baseReason: "UI/UX focus with JavaScript, React, and CSS",
      keywords: [
        "react",
        "javascript",
        "typescript",
        "css",
        "ui",
        "design",
        "tailwind",
        "next",
      ],
      boosts: ["frontend", "web", "ui"],
    },
    {
      domain: "Backend Engineering",
      baseReason: "API/database strengths with Node and SQL",
      keywords: [
        "node",
        "express",
        "api",
        "database",
        "postgres",
        "sql",
        "prisma",
        "auth",
      ],
      boosts: ["backend", "api", "server"],
    },
    {
      domain: "AI/ML Engineering",
      baseReason: "model building and ML frameworks",
      keywords: [
        "ml",
        "machine learning",
        "ai",
        "pytorch",
        "tensorflow",
        "llm",
        "huggingface",
      ],
      boosts: ["ai/ml", "mlops"],
    },
    {
      domain: "Prompt Engineering",
      baseReason: "LLM tooling and prompt design",
      keywords: [
        "prompt",
        "rag",
        "langchain",
        "llamaindex",
        "vector",
        "retrieval",
        "openai",
      ],
      boosts: ["prompt engineering", "genai"],
    },
    {
      domain: "Cybersecurity",
      baseReason: "security mindset and defensive tooling",
      keywords: [
        "security",
        "siem",
        "soc",
        "threat",
        "vulnerability",
        "owasp",
        "splunk",
      ],
      boosts: ["security", "blue team", "red team"],
    },
    {
      domain: "Cloud/DevOps",
      baseReason: "cloud platforms and automation (CI/CD)",
      keywords: [
        "aws",
        "gcp",
        "azure",
        "docker",
        "kubernetes",
        "devops",
        "terraform",
        "ci/cd",
      ],
      boosts: ["cloud/devops", "sre"],
    },
    {
      domain: "Product Management",
      baseReason: "product thinking and stakeholder collaboration",
      keywords: [
        "product",
        "roadmap",
        "stakeholder",
        "communication",
        "analytics",
        "experimentation",
      ],
      boosts: ["product", "pm"],
    },
  ];

  const tokens = text
    .split(/[^a-z0-9+.#/]+/)
    .map((t) => t.trim())
    .filter(Boolean);

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
    for (const b of c.boosts || []) {
      if (tokens.includes(b)) score += 1.5;
    }
    // Role preference boosts
    if (rolePref) {
      const rp = rolePref.toLowerCase();
      if (
        rp === "engineering" &&
        (c.domain.includes("Frontend") || c.domain.includes("Backend"))
      )
        score += 1.5;
      if (rp === "data" && c.domain.includes("Data")) score += 2;
      if (rp === "product" && c.domain.includes("Product")) score += 2;
      if (rp === "design" && c.domain.includes("Frontend")) score += 1;
    }
    // Industry hints
    for (const ind of industries)
      if (text.includes(ind.toLowerCase())) score += 0.5;
    // Learning style/environment tiny nudges
    if (learningStyle) score += 0.1;
    if (environment) score += 0.1;

    return { domain: c.domain, score, matched, baseReason: c.baseReason };
  });

  scores.sort((a, b) => b.score - a.score);
  const top = scores.slice(0, 4);

  const suggestions = top.map((t) => ({
    domain: t.domain,
    reason:
      t.matched.length > 0
        ? `based on (${t.matched.slice(0, 4).join(", ")}) and your preferences`
        : t.baseReason,
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
    {
      title: "Build a portfolio project in your target domain",
      type: "project" as const,
    },
    {
      title: "FreeCodeCamp: JavaScript Algorithms and Data Structures",
      type: "course" as const,
      url: "https://www.freecodecamp.org/learn",
    },
    {
      title: "The Missing Semester of CS (MIT)",
      type: "course" as const,
      url: "https://missing.csail.mit.edu/",
    },
  ];

  const response: AnalyzeResponse = {
    suggestions,
    skillGaps: skillGaps.slice(0, 6),
    learningPath,
    summary: `Based on your input, we recommend exploring ${suggestions.map((s) => s.domain).join(", ")}. Focus on closing ${skillGaps.slice(0, 3).join(", ")}.`,
  };

  res.json(response);
};
