import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import type { AnalyzeResponse } from "@shared/api";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [inputs, setInputs] = useState<any>(null);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);

  useEffect(() => {
    const i = localStorage.getItem("mentorai_last_inputs");
    if (i) { try { setInputs(JSON.parse(i)); } catch {} }
    const r = localStorage.getItem("mentorai_last_result");
    if (r) { try { setResult(JSON.parse(r)); } catch {} }
  }, []);

  const progress = useMemo(() => {
    const total = 12; // canonical skills size used on server
    const gaps = result?.skillGaps?.length ?? total;
    const pct = Math.max(0, Math.min(100, 100 - Math.round((gaps / total) * 100)));
    return pct;
  }, [result]);

  return (
    <section className="container py-12">
      <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>Summary of your latest quiz and analysis</CardDescription>
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
            <div className="flex gap-2">
              <Button asChild><Link to="/resume-analyzer">Re-run Analyzer</Link></Button>
              <Button asChild variant="outline"><Link to="/resources">Resources</Link></Button>
              <Button asChild variant="secondary"><Link to="/">Edit answers</Link></Button>
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
              {result?.suggestions?.slice(0,3).map((s) => (
                <li key={s.domain}>{s.domain} — {s.reason}</li>
              )) ?? <li className="text-muted-foreground">Run Analyzer to see suggestions.</li>}
            </ul>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
