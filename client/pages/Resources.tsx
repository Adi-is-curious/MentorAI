import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { AnalyzeResponse } from "@shared/api";
import { Link } from "react-router-dom";

const domainResources: Record<string, { title: string; url: string }[]> = {
  "Data Science": [
    {
      title: "Hands-On ML with Scikit-Learn & TF",
      url: "https://www.oreilly.com/library/view/hands-on-machine-learning/9781492032632/",
    },
    { title: "Kaggle Learn", url: "https://www.kaggle.com/learn" },
    { title: "fast.ai", url: "https://course.fast.ai/" },
  ],
  "Frontend Engineering": [
    { title: "React docs", url: "https://react.dev/" },
    {
      title: "TypeScript Handbook",
      url: "https://www.typescriptlang.org/docs/",
    },
    { title: "CSS Tricks", url: "https://css-tricks.com/" },
  ],
  "Backend Engineering": [
    { title: "Node.js Docs", url: "https://nodejs.org/en/docs" },
    {
      title: "Designing Data-Intensive Applications",
      url: "https://dataintensive.net/",
    },
    { title: "PostgreSQL Tutorial", url: "https://www.postgresql.org/docs/" },
  ],
  "AI/ML Engineering": [
    { title: "DeepLearning.AI", url: "https://www.deeplearning.ai/" },
    { title: "Hugging Face Course", url: "https://huggingface.co/learn" },
    { title: "Practical DL", url: "https://course.fast.ai/" },
  ],
  "Cybersecurity": [
    { title: "TryHackMe", url: "https://tryhackme.com/" },
    { title: "Blue Team Labs Online", url: "https://blueteamlabs.online/" },
    { title: "OWASP Top 10", url: "https://owasp.org/www-project-top-ten/" },
  ],
  "Cloud/DevOps": [
    { title: "AWS Skill Builder", url: "https://skillbuilder.aws/" },
    { title: "Kubernetes Docs", url: "https://kubernetes.io/docs/home/" },
    { title: "Terraform Docs", url: "https://developer.hashicorp.com/terraform/docs" },
  ],
  "Product Management": [
    { title: "SVPG Articles", url: "https://www.svpg.com/articles/" },
    { title: "Refactoring UI (for PMs)", url: "https://refactoringui.com/" },
    { title: "Lean Analytics", url: "https://leananalyticsbook.com/" },
  ],
};

const generalCoding = [
  {
    title: "C Programming Language (K&R)",
    url: "https://en.wikipedia.org/wiki/The_C_Programming_Language",
  },
  { title: "C++ Tour", url: "https://isocpp.org/" },
  { title: "Python Beginner", url: "https://docs.python.org/3/tutorial/" },
  { title: "Go by Example", url: "https://gobyexample.com/" },
  { title: "Rust Book", url: "https://doc.rust-lang.org/book/" },
];

export default function Resources() {
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  useEffect(() => {
    const saved = localStorage.getItem("mentorai_last_result");
    if (saved) {
      try {
        setResult(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const topDomain = useMemo(() => result?.suggestions?.[0]?.domain, [result]);
  const items = topDomain ? domainResources[topDomain] : undefined;

  return (
    <section className="container py-12">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight">
            Learning Resources
          </h1>
          <p className="text-muted-foreground">
            Curated content and a roadmap based on your chosen career path.
          </p>
        </div>

        {topDomain && items ? (
          <Card>
            <CardHeader>
              <CardTitle>Roadmap for {topDomain}</CardTitle>
              <CardDescription>
                Start here to build strong foundations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2">
                {items.map((r, i) => (
                  <li key={r.url} className="flex items-start gap-2">
                    <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {i + 1}
                    </span>
                    <a
                      className="underline underline-offset-4"
                      href={r.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {r.title}
                    </a>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Take the quiz or run Analyzer</CardTitle>
              <CardDescription>
                We need your target domain to personalize resources.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link to="/">Go to Career Quiz</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>General coding resources</CardTitle>
            <CardDescription>
              Explore languages and core CS skills
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2 sm:grid-cols-2">
              {generalCoding.map((r) => (
                <li key={r.url}>
                  <a
                    className="underline underline-offset-4"
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {r.title}
                  </a>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
