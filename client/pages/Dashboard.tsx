import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import type { AnalyzeResponse } from "@shared/api";
import { Link } from "react-router-dom";
import DailyTodos from "@/components/todos/DailyTodos";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function Dashboard() {
  const [inputs, setInputs] = useState<any>(null);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [queueStatus, setQueueStatus] = useState<any>(null);

  useEffect(() => {
    // Fetch user answers/quiz
    fetch("/api/quiz/latest", { headers: { "x-session-id": "demo_session" } })
      .then((r) => r.json())
      .then((j) => { if (j.ok && j.data) setInputs(j.data); })
      .catch(console.error);

    const r = localStorage.getItem("mentorai_last_result");
    if (r) { try { setResult(JSON.parse(r)); } catch {} }

    // Fetch dashboard metrics
    fetch("/api/dashboard", { headers: { "x-session-id": "demo_session" } })
      .then((r) => r.json())
      .then((j) => { if (j.ok && j.data) setMetrics(j.data); })
      .catch(console.error);
      
    // Fetch analytics
    fetch("/api/analytics", { headers: { "x-session-id": "demo_session" } })
      .then((r) => r.json())
      .then((j) => { if (j.ok && j.data) setAnalytics(j.data); })
      .catch(console.error);

    // Fetch queue status
    fetch("/api/queue/status")
      .then((r) => r.json())
      .then((j) => { if (j.ok) setQueueStatus(j); })
      .catch(console.error);
  }, []);

  const totalSkills = 12;
  const gaps = result?.skillGaps?.length ?? totalSkills;
  const progress = useMemo(() => {
    const pct = Math.max(0, Math.min(100, 100 - Math.round((gaps / totalSkills) * 100)));
    return pct;
  }, [gaps]);

  const barData = useMemo(() => {
    if (!metrics) return [];
    return metrics.masteryZones.slice(0, 6).map((m: any) => ({
      name: m.topic.slice(0, 10),
      value: m.mastery,
    }));
  }, [metrics]);

  const weeklyHours = Number(inputs?.timePerWeek ?? 6);
  const studyPlan = useMemo(() => {
    const weeks = 6;
    return Array.from({ length: weeks }).map((_, i) => ({
      week: `W${i + 1}`,
      hours: weeklyHours,
    }));
  }, [weeklyHours]);

  const topDomain = useMemo(() => result?.suggestions?.[0]?.domain, [result]);
  
  // Roadmap Readiness
  const overallReadiness = metrics?.overallReadiness ?? 0;
  
  // Fake streak for now until event logic is fully built
  const [streak, setStreak] = useState(0);
  useEffect(() => {
    const key = "mentorai_streak";
    const today = new Date();
    const dstr = today.toISOString().slice(0, 10);
    try {
      const raw = localStorage.getItem(key);
      if (!raw) {
        localStorage.setItem(key, JSON.stringify({ last: dstr, count: 1 }));
        setStreak(1);
        return;
      }
      const obj = JSON.parse(raw) as { last: string; count: number };
      if (obj.last === dstr) {
        setStreak(obj.count);
        return;
      }
      const last = new Date(obj.last);
      const diff = Math.round((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
      const nextCount = diff === 1 ? obj.count + 1 : 1;
      localStorage.setItem(key, JSON.stringify({ last: dstr, count: nextCount }));
      setStreak(nextCount);
    } catch {}
  }, []);

  return (
    <section className="container py-12">
      <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>
              Summary of your latest quiz and analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <div className="text-sm text-muted-foreground">
                  Preferred Track
                </div>
                <div className="text-lg font-medium">
                  {inputs?.rolePref ?? "—"}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Experience</div>
                <div className="text-lg font-medium">
                  {inputs?.experience ?? "—"}
                </div>
              </div>
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span>Progress toward core skills</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Skills Overview</CardTitle>
                </CardHeader>
                <CardContent className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--muted))"
                      />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} />
                      <YAxis
                        allowDecimals={false}
                        tickLine={false}
                        axisLine={false}
                      />
                      <RTooltip cursor={{ fill: "hsl(var(--accent))" }} />
                      <Bar
                        dataKey="value"
                        fill="hsl(var(--primary))"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Weekly Study Plan</CardTitle>
                  <CardDescription>
                    {weeklyHours} hrs/week · 6 weeks
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={studyPlan}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--muted))"
                      />
                      <XAxis dataKey="week" tickLine={false} axisLine={false} />
                      <YAxis
                        allowDecimals={false}
                        tickLine={false}
                        axisLine={false}
                      />
                      <RTooltip cursor={{ stroke: "hsl(var(--accent))" }} />
                      <Line
                        type="monotone"
                        dataKey="hours"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            <div className="flex gap-2">
              <Button asChild>
                <Link to="/resume-analyzer">Re-run Analyzer</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/resources">Resources</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link to="/">Edit answers</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Latest Suggestions</CardTitle>
            <CardDescription>From your last analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {result?.suggestions?.slice(0, 3).map((s) => (
                <li key={s.domain}>
                  {s.domain} — {s.reason}
                </li>
              )) ?? (
                <li className="text-muted-foreground">
                  Run Analyzer to see suggestions.
                </li>
              )}
            </ul>
          </CardContent>
        </Card>

        <DailyTodos />
      </div>

      <div className="mx-auto mt-6 grid max-w-5xl gap-6 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mastery & Readiness</CardTitle>
            <CardDescription>
              {topDomain
                ? `Domain: ${topDomain}`
                : "Complete the quiz to personalize"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {metrics ? (
              <div className="space-y-2">
                <div className="text-sm font-semibold">
                  Overall Readiness: {overallReadiness}%
                </div>
                <div className="text-sm">
                  Confidence: {metrics.confidenceLevels?.Advanced ?? 0} Advanced, {metrics.confidenceLevels?.Intermediate ?? 0} Intermediate
                </div>
                <Progress value={overallReadiness} />
                <div className="pt-2">
                  <Button asChild size="sm">
                    <Link to="/resources">Open roadmap</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                No progress yet. Start with the roadmap.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Focus Next</CardTitle>
            <CardDescription>Top skill gaps</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm">
              {(result?.skillGaps ?? []).slice(0, 5).map((g) => (
                <li key={g} className="flex items-center justify-between">
                  <span>{g}</span>
                  <Button asChild size="sm" variant="outline">
                    <Link to="/resources">Plan</Link>
                  </Button>
                </li>
              ))}
              {!result?.skillGaps?.length && (
                <li className="text-muted-foreground">
                  Run Analyzer to see gaps.
                </li>
              )}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Achievements</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {(result?.suggestions?.length ?? 0) >= 3 && (
              <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs">
                Explorer
              </span>
            )}
            {progress >= 50 && (
              <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs">
                Halfway There
              </span>
            )}
            {weeklyHours >= 10 && (
              <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs">
                Committed
              </span>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Weekly Review & Analytics</CardTitle>
            <CardDescription>AI Insights based on your learning behavior</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics ? (
              <div className="space-y-4">
                <p className="text-sm italic text-muted-foreground border-l-4 border-primary pl-4 py-1">
                  "{analytics.weeklySummary}"
                </p>
                <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                  <div className="bg-muted p-2 rounded">
                    <div className="text-xl font-bold">{analytics.recentEventsCount}</div>
                    <div className="text-xs text-muted-foreground">Events</div>
                  </div>
                  <div className="bg-muted p-2 rounded">
                    <div className="text-xl font-bold">{analytics.completedThisWeek}</div>
                    <div className="text-xs text-muted-foreground">Completed</div>
                  </div>
                  <div className="bg-muted p-2 rounded">
                    <div className="text-xl font-bold text-destructive">{analytics.dropOffs}</div>
                    <div className="text-xs text-muted-foreground">Drop-offs</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No data available for this week.</div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">⚡ Background Job Queue</CardTitle>
            <CardDescription>Async worker health — embedding generation, analytics recalculation</CardDescription>
          </CardHeader>
          <CardContent>
            {queueStatus?.offline ? (
              <p className="text-sm text-muted-foreground italic">
                Queue service offline (Redis not running). Jobs run synchronously as fallback.
              </p>
            ) : queueStatus?.queues ? (
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(queueStatus.queues).map(([name, q]: [string, any]) => (
                  <div key={name} className="bg-muted rounded p-3 space-y-1">
                    <div className="font-semibold capitalize">{name}</div>
                    <div className="grid grid-cols-3 text-xs text-muted-foreground gap-1">
                      <span>⏳ {q.waiting} waiting</span>
                      <span>🔄 {q.active} active</span>
                      <span className={q.failed > 0 ? "text-destructive" : ""}>
                        ❌ {q.failed} failed
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
