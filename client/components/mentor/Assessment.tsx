import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { AnimatePresence, motion } from "framer-motion";
import type { AnalyzeResponse } from "@shared/api";
import { Check, HelpCircle, Loader2, Download } from "lucide-react";

const schema = z.object({
  skills: z.string().optional().default(""),
  interests: z.string().optional().default(""),
  resumeText: z.string().optional().default(""),
  rolePref: z.enum(["engineering","data","design","product","other"]).default("engineering"),
  experience: z.enum(["student","junior","mid","senior"]).default("junior"),
}).refine((val) => (val.skills?.trim() || val.interests?.trim() || val.resumeText?.trim()), {
  message: "Provide at least one: skills, interests, or resume text.",
  path: ["skills"],
});

function Helper({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <p id={id} className="text-xs text-muted-foreground">
      {children}
    </p>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-accent px-2.5 py-1 text-xs text-accent-foreground">{children}</span>;
}

export default function Assessment() {
  const [form, setForm] = useState({ skills: "", interests: "", resumeText: "", rolePref: "engineering", experience: "junior" } as z.infer<typeof schema>);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("mentorai_last_inputs");
    if (saved) {
      try { setForm({ ...form, ...JSON.parse(saved) }); } catch {}
    }
    const savedRes = localStorage.getItem("mentorai_last_result");
    if (savedRes) { try { setResult(JSON.parse(savedRes)); } catch {} }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    const next = { ...form, [k]: v };
    setForm(next);
    const parsed = schema.safeParse(next);
    const newErrors: Record<string, string> = {};
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        if (issue.path.length) newErrors[String(issue.path[0])] = issue.message;
      }
    }
    setErrors(newErrors);
  }

  const progress = useMemo(() => (loading ? 66 : result ? 100 : 0), [loading, result]);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const type = f.type;
    if (type.includes("text") || f.name.endsWith(".md")) {
      const text = await f.text();
      update("resumeText", text.slice(0, 7000));
      return;
    }
    if (f.name.endsWith(".pdf") || f.name.endsWith(".doc") || f.name.endsWith(".docx")) {
      setApiError("For PDF/DOCX please paste the resume text for now. Native parsing can be enabled later.");
      return;
    }
    setApiError("Unsupported file type. Please upload a text/markdown file or paste your resume text.");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const newErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        if (issue.path.length) newErrors[String(issue.path[0])] = issue.message;
      }
      setErrors(newErrors);
      return;
    }
    setLoading(true);
    setApiError(null);
    setResult(null);
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) throw new Error("Request failed");
      const data = (await res.json()) as AnalyzeResponse;
      setResult(data);
      localStorage.setItem("mentorai_last_inputs", JSON.stringify(parsed.data));
      localStorage.setItem("mentorai_last_result", JSON.stringify(data));
    } catch (err) {
      setApiError("Could not analyze at the moment. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function exportJSON() {
    if (!result) return;
    const blob = new Blob([JSON.stringify({ inputs: form, result }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mentorai-results.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportCSV() {
    if (!result) return;
    const rows = [
      ["Step", "Title", "Type", "URL"],
      ...result.learningPath.map((r, i) => [String(i + 1), r.title, r.type, r.url ?? ""]) ,
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replaceAll('"','""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mentorai-roadmap.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section id="quiz" className="relative">
      <div className="container py-12">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">AI Skill Assessment</CardTitle>
              <CardDescription>Answer a few questions. Tooltips explain each field.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-5" onSubmit={onSubmit} aria-describedby="form-help">
                {/* Multiple choice */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="rolePref">Preferred Track</Label>
                    <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Preferred Track">
                      {[
                        { v: "engineering", l: "Engineering" },
                        { v: "data", l: "Data" },
                        { v: "design", l: "Design" },
                        { v: "product", l: "Product" },
                      ].map((o) => (
                        <button
                          key={o.v}
                          type="button"
                          role="radio"
                          aria-checked={form.rolePref === o.v}
                          onClick={() => update("rolePref", o.v as any)}
                          className={`rounded-md border px-3 py-2 text-sm ${form.rolePref === o.v ? "border-primary bg-primary/10" : "hover:bg-accent"}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span>{o.l}</span>
                            {form.rolePref === o.v ? <Check className="h-4 w-4 text-primary" /> : null}
                          </div>
                        </button>
                      ))}
                      <button
                        type="button"
                        role="radio"
                        aria-checked={form.rolePref === "other"}
                        onClick={() => update("rolePref", "other")}
                        className={`col-span-2 rounded-md border px-3 py-2 text-sm ${form.rolePref === "other" ? "border-primary bg-primary/10" : "hover:bg-accent"}`}
                      >
                        Other
                      </button>
                    </div>
                    <Helper id="help-role">Choose what you enjoy most today.</Helper>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="experience">Experience Level</Label>
                    <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Experience Level">
                      {[
                        { v: "student", l: "Student" },
                        { v: "junior", l: "Junior" },
                        { v: "mid", l: "Mid" },
                        { v: "senior", l: "Senior" },
                      ].map((o) => (
                        <button
                          key={o.v}
                          type="button"
                          role="radio"
                          aria-checked={form.experience === o.v}
                          onClick={() => update("experience", o.v as any)}
                          className={`rounded-md border px-3 py-2 text-sm ${form.experience === o.v ? "border-primary bg-primary/10" : "hover:bg-accent"}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span>{o.l}</span>
                            {form.experience === o.v ? <Check className="h-4 w-4 text-primary" /> : null}
                          </div>
                        </button>
                      ))}
                    </div>
                    <Helper id="help-exp">This helps tailor the learning plan.</Helper>
                  </div>
                </div>

                {/* Text inputs */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="skills">Skills</Label>
                    <TooltipProvider delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button type="button" aria-label="Help for skills" className="text-muted-foreground">
                            <HelpCircle className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>Comma-separated. Example: react, typescript, sql</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input id="skills" aria-describedby="help-skills" placeholder="react, typescript, sql" value={form.skills} onChange={(e) => update("skills", e.target.value)} />
                  <Helper id="help-skills">Your strongest technical and soft skills.</Helper>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="interests">Interests</Label>
                    <TooltipProvider delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button type="button" aria-label="Help for interests" className="text-muted-foreground">
                            <HelpCircle className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>Comma-separated. Example: ai/ml, product, fintech</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input id="interests" aria-describedby="help-interests" placeholder="ai/ml, product, fintech" value={form.interests} onChange={(e) => update("interests", e.target.value)} />
                  <Helper id="help-interests">Topics and domains you enjoy.</Helper>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 justify-between">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="resume">Resume text (optional)</Label>
                      <TooltipProvider delayDuration={100}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button type="button" aria-label="Supported files" className="text-muted-foreground">
                              <HelpCircle className="h-4 w-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Paste text or upload .txt/.md. PDF/DOCX support coming soon.</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Pill>Optional</Pill>
                    </div>
                  </div>
                  <Textarea id="resume" rows={5} value={form.resumeText} onChange={(e) => update("resumeText", e.target.value)} placeholder="Paste relevant resume content here..." />
                  <Input ref={fileRef} type="file" accept=".txt,.md,.pdf,.doc,.docx" onChange={onFileChange} />
                </div>

                {Object.values(errors).length ? (
                  <div role="alert" aria-live="assertive" className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                    {Object.values(errors)[0]}
                  </div>
                ) : null}
                {apiError ? (
                  <div role="alert" aria-live="assertive" className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                    {apiError}
                  </div>
                ) : null}

                {progress > 0 ? (
                  <div className="space-y-2">
                    <Label>Progress</Label>
                    <Progress value={progress} />
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-3">
                  <Button type="submit" aria-busy={loading} disabled={loading}>
                    {loading ? (<span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</span>) : "Analyze & get suggestions"}
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => { localStorage.setItem("mentorai_last_inputs", JSON.stringify(form)); }}>
                    Save inputs locally
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <AnimatePresence>
            {result ? (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Personalized Suggestions</CardTitle>
                    <CardDescription>Download your roadmap or save the JSON</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium">Suggested Careers</h4>
                      <ul className="mt-2 space-y-2">
                        {result.suggestions.map((s) => (
                          <li key={s.domain} className="flex items-start gap-2">
                            <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">✓</span>
                            <span><span className="font-semibold">{s.domain}.</span> {s.reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium">Skill Gaps</h4>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {result.skillGaps.map((g) => (
                          <span key={g} className="rounded-full bg-accent px-2.5 py-1 text-xs text-accent-foreground">{g}</span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium">Learning Roadmap</h4>
                      <ol className="mt-2 space-y-2">
                        {result.learningPath.map((i, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{idx + 1}</span>
                            {i.url ? (
                              <a href={i.url} className="underline underline-offset-4" target="_blank" rel="noreferrer">{i.title}</a>
                            ) : (<span>{i.title}</span>)}
                            <Pill>{i.type}</Pill>
                          </li>
                        ))}
                      </ol>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button onClick={exportJSON}><Download className="mr-2 h-4 w-4" /> Export JSON</Button>
                      <Button variant="outline" onClick={exportCSV}><Download className="mr-2 h-4 w-4" /> Download roadmap CSV</Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
