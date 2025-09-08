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
    const pct = Math.max(0, Math.min(100, 100 - Math.round((gaps / totalSkills) * 100)));
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
                <div className="text-sm text-muted-foreground">Preferred Track</div>
                <div className="text-lg font-medium">{inputs?.rolePref ?? "—"}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Experience</div>
                <div className="text-lg font-medium">{inputs?.experience ?? "—"}</div>
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
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} />
                      <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                      <RTooltip cursor={{ fill: "hsl(var(--accent))" }} />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Weekly Study Plan</CardTitle>
                  <CardDescription>{weeklyHours} hrs/week · 6 weeks</CardDescription>
                </CardHeader>
                <CardContent className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={studyPlan}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                      <XAxis dataKey="week" tickLine={false} axisLine={false} />
                      <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                      <RTooltip cursor={{ stroke: "hsl(var(--accent))" }} />
                      <Line type="monotone" dataKey="hours" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
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
                <li key={s.domain}>{s.domain} — {s.reason}</li>
              )) ?? (
                <li className="text-muted-foreground">Run Analyzer to see suggestions.</li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
