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
  const industries: string[] = Array.isArray(body.industries) ? body.industries : [];
  const codingLanguages: string[] = Array.isArray(body.codingLanguages) ? body.codingLanguages : [];
  const tools: string[] = Array.isArray(body.tools) ? body.tools : [];
  const interestsTags: string[] = Array.isArray(body.interestsTags) ? body.interestsTags : [];
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

  const domains: { domain: string; reason: string; match: RegExp }[] = [
    {
      domain: "Data Science",
      reason: "strong analytical and Python background",
      match: /(python|pandas|numpy|statistics|ml|data)/,
    },
    {
      domain: "Frontend Engineering",
      reason: "solid UI/UX and JavaScript skills",
      match: /(react|javascript|typescript|css|ui|design)/,
    },
    {
      domain: "Backend Engineering",
      reason: "experience with APIs and databases",
      match: /(node|express|api|database|postgres|sql)/,
    },
    {
      domain: "AI/ML Engineering",
      reason: "interest in machine learning and model building",
      match: /(ml|machine learning|ai|pytorch|tensorflow|llm)/,
    },
    {
      domain: "Prompt Engineering",
      reason: "strength in LLM tooling and prompt design",
      match: /(prompt|rag|langchain|llamaindex|vector|retrieval)/,
    },
    {
      domain: "Cybersecurity",
      reason: "aptitude for securing systems and incident response",
      match: /(security|siem|soc|blue team|threat|vulnerability|owasp|splunk)/,
    },
    {
      domain: "Cloud/DevOps",
      reason: "experience with cloud platforms and automation",
      match: /(aws|gcp|azure|docker|kubernetes|devops|terraform|ci\/cd)/,
    },
    {
      domain: "Product Management",
      reason: "blend of technical and communication skills",
      match: /(product|roadmap|stakeholder|communication|analytics)/,
    },
  ];

  const matched = domains.filter((d) => d.match.test(text));
  const suggestions = (matched.length ? matched : domains.slice(0, 2)).map(
    ({ domain, reason }) => ({ domain, reason }),
  );

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
