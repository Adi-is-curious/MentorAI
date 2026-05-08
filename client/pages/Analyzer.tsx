import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function Analyzer() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [jd, setJd] = useState("");

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("job_description", jd);

      const res = await fetch("/api/resume/analyze", {
        method: "POST",
        body: formData,
        headers: { "x-session-id": "demo_session" },
      });

      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Analysis failed");
      setData(json.data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="container py-12">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight">AI Resume Analyzer</h1>
          <p className="text-muted-foreground">
            Upload your resume and optionally a job description to get ATS scoring and bullet analysis.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upload Resume</CardTitle>
            <CardDescription>PDF or DOCX supported</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resume">Resume File</Label>
              <input
                id="resume"
                type="file"
                accept=".pdf,.docx,.txt"
                className="block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground hover:file:bg-primary/90"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jd">Target Job Description (Optional)</Label>
              <Textarea
                id="jd"
                placeholder="Paste the job description here for semantic matching..."
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                className="h-24"
              />
            </div>
            <Button onClick={handleAnalyze} disabled={!file || loading} className="w-full sm:w-auto">
              {loading ? "Analyzing..." : "Run Analysis"}
            </Button>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
        </Card>

        {loading ? (
          <div className="space-y-4 text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-muted-foreground/40 border-t-primary" />
            <p className="text-sm text-muted-foreground">Extracting text and running NLP models...</p>
          </div>
        ) : data ? (
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>ATS Score</CardTitle>
                <CardDescription>Overall quality and match</CardDescription>
              </CardHeader>
              <CardContent className="text-center py-6">
                <div className="text-5xl font-black text-primary">{data.ats_score}</div>
                <div className="text-sm text-muted-foreground mt-2">out of 100</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Semantic Match</CardTitle>
                <CardDescription>Similarity to Job Description</CardDescription>
              </CardHeader>
              <CardContent className="text-center py-6">
                <div className="text-5xl font-black text-primary">{data.match_percentage}%</div>
                <div className="text-sm text-muted-foreground mt-2">Cosine Similarity</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Skill Analysis</CardTitle>
                <CardDescription>Detected skills and missing requirements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold mb-2">Found Skills:</h4>
                  <div className="flex flex-wrap gap-2">
                    {data.found_skills?.map((s: string) => (
                      <span key={s} className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">{s}</span>
                    )) || <span className="text-xs text-muted-foreground">None detected</span>}
                  </div>
                </div>
                {jd && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Missing Skills:</h4>
                    <div className="flex flex-wrap gap-2">
                      {data.skill_gaps?.map((g: string) => (
                        <span key={g} className="rounded-full bg-destructive/10 px-3 py-1 text-xs text-destructive">{g}</span>
                      )) || <span className="text-xs text-muted-foreground">No major gaps</span>}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Bullet Quality Analysis</CardTitle>
                <CardDescription>NLP feedback on your action verbs and phrasing</CardDescription>
              </CardHeader>
              <CardContent>
                {data.bullet_feedback?.length > 0 ? (
                  <ul className="space-y-4">
                    {data.bullet_feedback.map((f: any, i: number) => (
                      <li key={i} className="rounded-lg border p-4 text-sm">
                        <div className="font-mono text-xs mb-2 bg-muted p-2 rounded">"{f.bullet}"</div>
                        <div className="text-destructive font-semibold">Issue: {f.issue}</div>
                        <div className="text-muted-foreground mt-1">💡 {f.suggestion}</div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm text-muted-foreground">Your bullets look strong! No weak verbs detected.</div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </section>
  );
}
