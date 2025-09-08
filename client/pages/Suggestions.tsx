import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { AnalyzeRequest, AnalyzeResponse } from "@shared/api";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Suggestions() {
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
        setError("Failed to generate suggestions. Try again.");
      } finally {
        setLoading(false);
      }
    }
    run();
  }, [location]);

  const top = useMemo(() => data?.suggestions?.[0]?.domain, [data]);

  return (
    <section className="container py-12">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight">
            AI Suggestions
          </h1>
          <p className="text-muted-foreground">
            Personalized roles matched from your inputs
          </p>
        </div>

        {loading ? (
          <Card>
            <CardHeader>
              <CardTitle>Generating suggestions…</CardTitle>
              <CardDescription>Please wait a moment.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-2 w-full animate-pulse rounded bg-accent" />
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardHeader>
              <CardTitle>We need your inputs</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link to="/quiz">Take the Career Quiz</Link>
              </Button>
            </CardContent>
          </Card>
        ) : data ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Top Matches</CardTitle>
                <CardDescription>Best-fit career paths for you</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {data.suggestions.map((s) => (
                    <li key={s.domain} className="rounded-md border p-3">
                      <div className="font-semibold">{s.domain}</div>
                      <div className="text-sm text-muted-foreground">
                        {s.reason}
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex gap-3">
                  <Button asChild>
                    <Link to="/resources">View resources</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/dashboard">Go to Dashboard</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
                <CardDescription>Your profile at a glance</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{data.summary}</p>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </section>
  );
}
