import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { AnalyzeRequest, AnalyzeResponse } from "@shared/api";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import RoadmapGame from "@/components/resources/RoadmapGame";
import { domainResources } from "@/components/resources/domainResources";

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
        setError("Failed to generate suggestions. Try again.");
      } finally {
        setLoading(false);
      }
    }
    run();
  }, [location]);

  const top = useMemo(() => data?.suggestions?.[0]?.domain, [data]);
  const [selected, setSelected] = useState<string | undefined>(top);
  useEffect(() => {
    if (top) setSelected((prev) => prev ?? top);
  }, [top]);
  const allSuggested = useMemo(
    () =>
      (data?.suggestions?.map((s) => s.domain) ?? []).filter(
        (d, i, a) => a.indexOf(d) === i,
      ),
    [data],
  );
  const items = selected ? domainResources[selected] : undefined;

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
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground/40 border-t-primary" />
                <span className="text-sm text-muted-foreground">Analyzing your inputs…</span>
              </div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-11/12" />
              <Skeleton className="h-3 w-9/12" />
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
                <CardTitle>Explore roadmaps & resources</CardTitle>
                <CardDescription>Select any suggested path below.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {allSuggested.length ? (
                  <>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Select value={selected} onValueChange={setSelected}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a suggested domain" />
                        </SelectTrigger>
                        <SelectContent>
                          {allSuggested.map((d) => (
                            <SelectItem key={d} value={d}>
                              {d}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div>
                        <div className="text-sm text-muted-foreground">Suggestions</div>
                        <ul className="mt-1 space-y-1 text-sm">
                          {data?.suggestions?.map((s) => (
                            <li key={s.domain}>
                              <button
                                className="underline underline-offset-4"
                                onClick={() => setSelected(s.domain)}
                              >
                                {s.domain}
                              </button>
                              {selected === s.domain ? " — selected" : ""}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    {selected && items ? (
                      <>
                        <RoadmapGame domain={selected} items={items} />
                        <div>
                          <div className="mt-4 text-sm font-medium">Resources</div>
                          <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                            {items.map((r) => (
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
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        No resources for this domain yet.
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No suggestions found. Try the quiz again.
                  </div>
                )}
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
