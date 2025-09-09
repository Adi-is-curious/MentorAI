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

  useEffect(() => {
    const i = localStorage.getItem("mentorai_last_inputs");
    if (i) {
      try {
        setInputs(JSON.parse(i));
      } catch {}
    }
    const r = localStorage.getItem("mentorai_last_result");
    if (r) {
      try {
        setResult(JSON.parse(r));
      } catch {}
    }
  }, []);

  const totalSkills = 12;
  const gaps = result?.skillGaps?.length ?? totalSkills;
  const progress = useMemo(() => {
    const pct = Math.max(
      0,
      Math.min(100, 100 - Math.round((gaps / totalSkills) * 100)),
    );
    return pct;
  }, [gaps]);

  const barData = useMemo(
    () => [
      { name: "Mastered", value: totalSkills - gaps },
      { name: "Gaps", value: gaps },
    ],
    [gaps],
  );

  const weeklyHours = Number(inputs?.timePerWeek ?? 6);
  const studyPlan = useMemo(() => {
    const weeks = 6;
    return Array.from({ length: weeks }).map((_, i) => ({
      week: `W${i + 1}`,
      hours: weeklyHours,
    }));
  }, [weeklyHours]);

  const topDomain = useMemo(() => result?.suggestions?.[0]?.domain, [result]);
  const roadmapState = useMemo(() => {
    if (!topDomain) return null;
    try {
      const raw = localStorage.getItem(
        `mentorai_roadmap_progress_${topDomain}`,
      );
      if (!raw) return null;
      const obj = JSON.parse(raw) as Record<string, boolean>;
      const total = Object.keys(obj).length;
      const done = Object.values(obj).filter(Boolean).length;
      const xp = done * 10;
      const pct = total ? Math.round((done / total) * 100) : 0;
      return { total, done, xp, pct };
    } catch {
      return null;
    }
  }, [topDomain]);

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
      const diff = Math.round(
        (today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24),
      );
      const nextCount = diff === 1 ? obj.count + 1 : 1;
      localStorage.setItem(
        key,
        JSON.stringify({ last: dstr, count: nextCount }),
      );
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
            <CardTitle className="text-base">Roadmap Progress</CardTitle>
            <CardDescription>
              {topDomain
                ? `Domain: ${topDomain}`
                : "Complete the quiz to personalize"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {roadmapState ? (
              <div className="space-y-2">
                <div className="text-sm">XP: {roadmapState.xp}</div>
                <div className="text-sm">
                  Quests: {roadmapState.done}/{roadmapState.total}
                </div>
                <Progress value={roadmapState.pct} />
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
            {!((result?.suggestions?.length ?? 0) >= 3) &&
              progress < 50 &&
              weeklyHours < 10 && (
                <span className="text-sm text-muted-foreground">
                  Complete tasks to unlock badges.
                </span>
              )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Streak</CardTitle>
            <CardDescription>Daily learning streak</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{streak}d</div>
            <p className="text-sm text-muted-foreground">
              Come back tomorrow to keep it going.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
