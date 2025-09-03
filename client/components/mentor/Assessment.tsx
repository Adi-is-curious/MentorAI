import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { Check, HelpCircle } from "lucide-react";

const schema = z
  .object({
    skills: z.string().optional().default(""),
    interests: z.string().optional().default(""),
    resumeText: z.string().optional().default(""),
    rolePref: z.enum(["engineering", "data", "design", "product", "other"]).default("engineering"),
    experience: z.enum(["student", "junior", "mid", "senior"]).default("junior"),
    industries: z.array(z.string()).default([]),
    codingLanguages: z.array(z.string()).default([]),
    tools: z.array(z.string()).default([]),
    workStyle: z.enum(["remote", "onsite", "hybrid"]).default("remote"),
    relocate: z.enum(["yes", "no", "maybe"]).default("maybe"),
    salaryPriority: z.number().min(1).max(5).default(3),
    growthPriority: z.number().min(1).max(5).default(4),
    softComm: z.number().min(1).max(5).default(3),
    softLeader: z.number().min(1).max(5).default(3),
    softTeam: z.number().min(1).max(5).default(4),
    timePerWeek: z.number().min(1).max(40).default(8),
    degree: z.enum(["none", "bachelor", "master", "phd"]).default("bachelor"),
    certifications: z.string().optional().default(""),
    portfolio: z.string().optional().default(""),
    goals: z.string().optional().default(""),
    constraints: z.string().optional().default(""),
  })
  .refine(
    (val) =>
      val.skills?.trim() ||
      val.interests?.trim() ||
      val.resumeText?.trim() ||
      val.industries.length > 0 ||
      val.codingLanguages.length > 0,
    {
      message: "Provide some background: fill skills/interests or select industries/languages.",
      path: ["skills"],
    },
  );

function Helper({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <p id={id} className="text-xs text-muted-foreground">
      {children}
    </p>
  );
}

export default function Assessment() {
  const [form, setForm] = useState<z.infer<typeof schema>>({
    skills: "",
    interests: "",
    resumeText: "",
    rolePref: "engineering",
    experience: "junior",
    industries: [],
    codingLanguages: [],
    tools: [],
    workStyle: "remote",
    relocate: "maybe",
    salaryPriority: 3,
    growthPriority: 4,
    softComm: 3,
    softLeader: 3,
    softTeam: 4,
    timePerWeek: 8,
    degree: "bachelor",
    certifications: "",
    portfolio: "",
    goals: "",
    constraints: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [choiceOpen, setChoiceOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("mentorai_last_inputs");
    if (saved) {
      try {
        setForm((f) => ({ ...f, ...JSON.parse(saved) }));
      } catch {}
    }
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

  const progress = useMemo(() => (loading ? 66 : 0), [loading]);

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
    try {
      localStorage.setItem("mentorai_last_inputs", JSON.stringify(parsed.data));
      setChoiceOpen(true);
    } catch (err) {
      setApiError("Unable to save your responses locally.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="quiz" className="relative">
      <div className="container py-12">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">AI Skill Assessment</CardTitle>
              <CardDescription>Answer in-depth questions. Tooltips explain each field.</CardDescription>
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

                {/* Interests: industries */}
                <div className="space-y-2">
                  <Label>Industries you are interested in</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      "Web Development",
                      "Mobile Apps",
                      "Data Science",
                      "AI/ML",
                      "Cloud/DevOps",
                      "Cybersecurity",
                      "Game Dev",
                      "Fintech",
                      "Healthcare",
                      "E-commerce",
                    ].map((ind) => (
                      <label key={ind} className="flex items-center gap-2 rounded-md border p-2 text-sm hover:bg-accent">
                        <Checkbox
                          checked={form.industries.includes(ind)}
                          onCheckedChange={(c) => {
                            const next = c ? [...form.industries, ind] : form.industries.filter((x) => x !== ind);
                            update("industries", next as any);
                          }}
                          aria-label={ind}
                        />
                        <span>{ind}</span>
                      </label>
                    ))}
                  </div>
                  <Helper id="help-industries">Select multiple that excite you.</Helper>
                </div>

                {/* Coding languages */}
                <div className="space-y-2">
                  <Label>Programming languages you know</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {["C", "C++", "JavaScript", "TypeScript", "Python", "Java", "Go", "Rust", "Kotlin", "Swift"].map((lang) => (
                      <label key={lang} className="flex items-center gap-2 rounded-md border p-2 text-sm hover:bg-accent">
                        <Checkbox
                          checked={form.codingLanguages.includes(lang)}
                          onCheckedChange={(c) => {
                            const next = c ? [...form.codingLanguages, lang] : form.codingLanguages.filter((x) => x !== lang);
                            update("codingLanguages", next as any);
                          }}
                          aria-label={lang}
                        />
                        <span>{lang}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Tools */}
                <div className="space-y-2">
                  <Label>Tools & frameworks you've used</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      "React",
                      "Node",
                      "Express",
                      "Django",
                      "Flask",
                      "TensorFlow",
                      "PyTorch",
                      "Postgres",
                      "MongoDB",
                      "Docker",
                      "Kubernetes",
                      "AWS",
                      "GCP",
                      "Figma",
                    ].map((tool) => (
                      <label key={tool} className="flex items-center gap-2 rounded-md border p-2 text-sm hover:bg-accent">
                        <Checkbox
                          checked={form.tools.includes(tool)}
                          onCheckedChange={(c) => {
                            const next = c ? [...form.tools, tool] : form.tools.filter((x) => x !== tool);
                            update("tools", next as any);
                          }}
                          aria-label={tool}
                        />
                        <span>{tool}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Preferences sliders */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Salary priority (1-5)</Label>
                    <Slider value={[form.salaryPriority]} min={1} max={5} step={1} onValueChange={(v) => update("salaryPriority", v[0] as any)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Growth priority (1-5)</Label>
                    <Slider value={[form.growthPriority]} min={1} max={5} step={1} onValueChange={(v) => update("growthPriority", v[0] as any)} />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Communication</Label>
                    <Slider value={[form.softComm]} min={1} max={5} step={1} onValueChange={(v) => update("softComm", v[0] as any)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Leadership</Label>
                    <Slider value={[form.softLeader]} min={1} max={5} step={1} onValueChange={(v) => update("softLeader", v[0] as any)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Teamwork</Label>
                    <Slider value={[form.softTeam]} min={1} max={5} step={1} onValueChange={(v) => update("softTeam", v[0] as any)} />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label>Preferred work style</Label>
                    <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Work style">
                      {["remote", "onsite", "hybrid"].map((w) => (
                        <button
                          key={w}
                          type="button"
                          role="radio"
                          aria-checked={form.workStyle === w}
                          onClick={() => update("workStyle", w as any)}
                          className={`rounded-md border px-3 py-2 text-sm ${form.workStyle === w ? "border-primary bg-primary/10" : "hover:bg-accent"}`}
                        >
                          {w}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Willing to relocate?</Label>
                    <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Relocate">
                      {["yes", "no", "maybe"].map((w) => (
                        <button
                          key={w}
                          type="button"
                          role="radio"
                          aria-checked={form.relocate === w}
                          onClick={() => update("relocate", w as any)}
                          className={`rounded-md border px-3 py-2 text-sm ${form.relocate === w ? "border-primary bg-primary/10" : "hover:bg-accent"}`}
                        >
                          {w}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Available hours per week</Label>
                    <Slider value={[form.timePerWeek]} min={1} max={40} step={1} onValueChange={(v) => update("timePerWeek", v[0] as any)} />
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
                  <div className="flex items-center justify-between gap-2">
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
                  </div>
                  <Textarea id="resume" rows={5} value={form.resumeText} onChange={(e) => update("resumeText", e.target.value)} placeholder="Paste relevant resume content here..." />
                  <Input ref={fileRef} type="file" accept=".txt,.md,.pdf,.doc,.docx" onChange={onFileChange} />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="portfolio">Portfolio / GitHub (optional)</Label>
                    <Input id="portfolio" placeholder="https://github.com/username" value={form.portfolio} onChange={(e) => update("portfolio", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="degree">Highest degree</Label>
                    <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Degree">
                      {["none", "bachelor", "master", "phd"].map((d) => (
                        <button key={d} type="button" role="radio" aria-checked={form.degree === d} onClick={() => update("degree", d as any)} className={`rounded-md border px-3 py-2 text-sm ${form.degree === d ? "border-primary bg-primary/10" : "hover:bg-accent"}`}>{d}</button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="certs">Certifications (optional)</Label>
                  <Input id="certs" placeholder="AWS CCP, Google Data Analytics" value={form.certifications} onChange={(e) => update("certifications", e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goals">Career goals</Label>
                  <Textarea id="goals" rows={3} placeholder="Short/long-term goals..." value={form.goals} onChange={(e) => update("goals", e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="constraints">Constraints</Label>
                  <Textarea id="constraints" rows={3} placeholder="Time, location, finances, etc." value={form.constraints} onChange={(e) => update("constraints", e.target.value)} />
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
                    Continue
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      localStorage.setItem("mentorai_last_inputs", JSON.stringify(form));
                    }}
                  >
                    Save inputs locally
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Choice dialog */}
          <Dialog open={choiceOpen} onOpenChange={setChoiceOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>What would you like to do?</DialogTitle>
                <DialogDescription>Select an option to proceed with your responses.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-2 sm:grid-cols-2">
                <Button onClick={() => navigate("/suggestions")}>Get AI Suggestions</Button>
                <Button variant="outline" onClick={() => navigate("/resume-analyzer")}>Analyze Responses</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </section>
  );
}
