import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import type { AnalyzeResponse } from "@shared/api";
import { Sparkles, ShieldCheck, Upload, LineChart, CheckCircle2 } from "lucide-react";

export default function Index() {
  const [skills, setSkills] = useState("");
  const [interests, setInterests] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const progress = useMemo(() => (loading ? 66 : result ? 100 : 0), [loading, result]);
  const fileRef = useRef<HTMLInputElement | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const text = await f.text();
      setResumeText(text.slice(0, 5000));
    } catch {
      setError("Could not read file. Please paste your resume text instead.");
    }
  }

  async function onAnalyze(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills, interests, resumeText }),
      });
      if (!res.ok) throw new Error("Request failed");
      const data = (await res.json()) as AnalyzeResponse;
      setResult(data);
    } catch (err) {
      setError("Something went wrong while analyzing. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-secondary/20 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        </div>
        <div className="container grid gap-10 py-20 md:grid-cols-2 md:py-28">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
              <Sparkles className="h-4 w-4" /> AI Career Mentor
            </span>
            <h1 className="text-balance text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Find your best-fit career path with personalized AI guidance
            </h1>
            <p className="text-balance text-lg text-muted-foreground">
              MentorAI analyzes your skills, interests, and resume to recommend roles, uncover skill gaps, and craft a learning roadmap.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="shadow">
                <Link to="#quiz">Start free career quiz</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/auth">Sign in</Link>
              </Button>
            </div>
            <div className="flex items-center gap-4 pt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Secure & private</div>
              <div className="flex items-center gap-2"><LineChart className="h-4 w-4 text-primary" /> Actionable insights</div>
            </div>
          </div>
          <Card className="place-self-end w-full max-w-xl md:mt-6">
            <CardHeader>
              <CardTitle>Preview: Personalized suggestions</CardTitle>
              <CardDescription>See how your inputs turn into recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 text-primary" /> Tailored role suggestions with reasons</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 text-primary" /> Clear skill gap analysis</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 text-primary" /> Curated learning plan</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Value props */}
      <section className="container grid gap-6 pb-10 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Personalized", desc: "Recommendations aligned to your skill profile", icon: <Sparkles className="text-primary" /> },
          { title: "Resume analysis", desc: "Identify strengths and gaps instantly", icon: <Upload className="text-primary" /> },
          { title: "Roadmap", desc: "Step-by-step learning path to grow", icon: <LineChart className="text-primary" /> },
          { title: "Secure", desc: "Authentication-ready and privacy-first", icon: <ShieldCheck className="text-primary" /> },
        ].map((f) => (
          <Card key={f.title}>
            <CardHeader className="space-y-2">
              <div className="h-8 w-8">{f.icon}</div>
              <CardTitle className="text-lg">{f.title}</CardTitle>
              <CardDescription>{f.desc}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>

      {/* Quiz */}
      <section id="quiz" className="relative border-t bg-gradient-to-b from-background via-background to-accent/20">
        <div className="container py-16">
          <div className="mx-auto max-w-5xl">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">AI Skill Assessment & Career Suggestions</h2>
              <p className="mt-2 text-muted-foreground">Interactive questionnaire, resume upload, and AI-powered results.</p>
            </div>
            {(await import("@/components/mentor/Assessment")).default()}
          </div>
        </div>
      </section>
    </div>
  );
}
