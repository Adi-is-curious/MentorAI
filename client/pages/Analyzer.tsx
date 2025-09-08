import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { AnalyzeResponse, AnalyzeRequest } from "@shared/api";
import { Link, useLocation } from "react-router-dom";

export default function Analyzer() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnalyzeResponse | null>(null);
  const location = useLocation();

  useEffect(() => {
    async function run() {
      let body: AnalyzeRequest | null = null;
      const nav = (location as any)?.state as any;

      if (nav && typeof nav === "object") {
        body = {
          skills: String(nav.skills ?? ""),
          interests: String(nav.interests ?? ""),
          resumeText: String(nav.resumeText ?? ""),
          ...(nav as any),
        } as AnalyzeRequest;
      } else {
        const saved = localStorage.getItem("mentorai_last_inputs");
        if (saved) {
          try {
            body = JSON.parse(saved) as AnalyzeRequest;
          } catch {}
        }
      }

      if (!body) {
        try {
          const latest = await fetch("/api/quiz/latest");
          if (latest.ok) {
            const j = await latest.json();
            body = j.data as AnalyzeRequest;
          }
        } catch {}
      }

      if (!body) {
        setError("No responses found. Please take the quiz first.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/ai/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("Request failed");
        const json = (await res.json()) as AnalyzeResponse;
        setData(json);
        localStorage.setItem("mentorai_last_result", JSON.stringify(json));
      } catch (e) {
        setError("Failed to analyze. Try again.");
      } finally {
        setLoading(false);
      }
    }
    run();
  }, [location]);

  return (
    <section className="container py-12">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight">Analyzer</h1>
          <p className="text-muted-foreground">
            We analyze your responses to provide insights.
          </p>
        </div>

        {loading ? (
          <div className="space-y-2">
            <Progress value={66} />
            <p className="text-sm text-muted-foreground">Analyzing...</p>
          </div>
        ) : error ? (
          <Card>
            <CardHeader>
              <CardTitle>We need your inputs</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link to="/">Go to Career Quiz</Link>
              </Button>
            </CardContent>
          </Card>
        ) : data ? (
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Suggested Careers</CardTitle>
                <CardDescription>Top matches for your profile</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {data.suggestions.map((s) => (
                    <li key={s.domain} className="flex items-start gap-2">
                      <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        ✓
                      </span>
                      <span>
                        <span className="font-semibold">{s.domain}.</span>{" "}
                        {s.reason}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Skill Gaps</CardTitle>
                <CardDescription>Focus areas to improve</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {data.skillGaps.map((g) => (
                    <span
                      key={g}
                      className="rounded-full bg-accent px-3 py-1 text-sm text-accent-foreground"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Learning Roadmap</CardTitle>
                <CardDescription>Your next steps</CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2">
                  {data.learningPath.map((i, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {idx + 1}
                      </span>
                      {i.url ? (
                        <a
                          href={i.url}
                          className="underline underline-offset-4"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {i.title}
                        </a>
                      ) : (
                        <span>{i.title}</span>
                      )}
                      <span className="ml-2 rounded-full bg-accent px-2.5 py-0.5 text-xs text-accent-foreground">
                        {i.type}
                      </span>
                    </li>
                  ))}
                </ol>
                <div className="mt-6 flex gap-3">
                  <Button asChild>
                    <Link to="/resources">View resources</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/suggestions">See suggestions</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </section>
  );
}
