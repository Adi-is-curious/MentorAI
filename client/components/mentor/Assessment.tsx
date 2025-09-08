import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { Check, HelpCircle } from "lucide-react";

const schema = z
  .object({
    skills: z.string().optional().default(""),
    interests: z.string().optional().default(""),
    resumeText: z.string().optional().default(""),
    rolePref: z
      .enum(["engineering", "data", "design", "product", "other"])
      .default("engineering"),
    experience: z
      .enum(["student", "junior", "mid", "senior"])
      .default("junior"),
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
    interestsTags: z.array(z.string()).default([]),
    values: z.array(z.string()).default([]),
    learningStyle: z.enum(["project", "concept", "collab"]).default("project"),
    environment: z
      .enum(["startup", "bigtech", "remote", "academia"])
      .default("remote"),
  })
  .refine(
    (val) =>
      val.skills?.trim() ||
      val.interests?.trim() ||
      val.resumeText?.trim() ||
      val.industries.length > 0 ||
      val.codingLanguages.length > 0,
    {
      message:
        "Provide some background: fill skills/interests or select industries/languages.",
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
    interestsTags: [],
    values: [],
    learningStyle: "project",
    environment: "remote",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [choiceOpen, setChoiceOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  const POPULAR_SKILLS = [
    "react",
    "next.js",
    "typescript",
    "javascript",
    "node",
    "express",
    "graphql",
    "sql",
    "python",
    "pandas",
    "docker",
    "kubernetes",
    "aws",
    "gcp",
    "ml fundamentals",
    "pytorch",
  ];
  const POPULAR_INTERESTS = [
    "frontend",
    "backend",
    "ai/ml",
    "prompt engineering",
    "security",
    "cloud/devops",
    "product",
    "data science",
    "mobile",
    "ar/vr",
  ];
  const CERTS = [
    "AWS CCP",
    "AWS SAA",
    "AZ-900",
    "Security+",
    "CySA+",
    "Google Data Analytics",
  ];

  function addToken(field: "skills" | "interests", token: string) {
    const current = String((form as any)[field] ?? "");
    const parts = current
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!parts.includes(token)) parts.push(token);
    update(field as any, parts.join(", "));
  }

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
    if (
      f.name.endsWith(".pdf") ||
      f.name.endsWith(".doc") ||
      f.name.endsWith(".docx")
    ) {
      setApiError(
        "For PDF/DOCX please paste the resume text for now. Native parsing can be enabled later.",
      );
      return;
    }
    setApiError(
      "Unsupported file type. Please upload a text/markdown file or paste your resume text.",
    );
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
              <CardDescription>
                Answer in-depth questions. Tooltips explain each field.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                className="space-y-5"
                onSubmit={onSubmit}
                aria-describedby="form-help"
              >
                {/* Multiple choice */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="rolePref">Preferred Track</Label>
                    <Select
                      value={form.rolePref}
                      onValueChange={(v) => update("rolePref", v as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a track" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="engineering">Engineering</SelectItem>
                        <SelectItem value="data">Data</SelectItem>
                        <SelectItem value="design">Design</SelectItem>
                        <SelectItem value="product">Product</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <Helper id="help-role">
                      Choose what you enjoy most today.
                    </Helper>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="experience">Experience Level</Label>
                    <Select
                      value={form.experience}
                      onValueChange={(v) => update("experience", v as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="junior">Junior</SelectItem>
                        <SelectItem value="mid">Mid</SelectItem>
                        <SelectItem value="senior">Senior</SelectItem>
                      </SelectContent>
                    </Select>
                    <Helper id="help-exp">
                      This helps tailor the learning plan.
                    </Helper>
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
                      <label
                        key={ind}
                        className="flex items-center gap-2 rounded-md border p-2 text-sm hover:bg-accent"
                      >
                        <Checkbox
                          checked={form.industries.includes(ind)}
                          onCheckedChange={(c) => {
                            const next = c
                              ? [...form.industries, ind]
                              : form.industries.filter((x) => x !== ind);
                            update("industries", next as any);
                          }}
                          aria-label={ind}
                        />
                        <span>{ind}</span>
                      </label>
                    ))}
                  </div>
                  <Helper id="help-industries">
                    Select multiple that excite you.
                  </Helper>
                </div>

                {/* Coding languages */}
                <div className="space-y-2">
                  <Label>Programming languages you know</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      "C",
                      "C++",
                      "JavaScript",
                      "TypeScript",
                      "Python",
                      "Java",
                      "Go",
                      "Rust",
                      "Kotlin",
                      "Swift",
                      "PHP",
                      "Ruby",
                      "Scala",
                      "SQL",
                      "Bash",
                      "R",
                      "MATLAB",
                    ].map((lang) => (
                      <label
                        key={lang}
                        className="flex items-center gap-2 rounded-md border p-2 text-sm hover:bg-accent"
                      >
                        <Checkbox
                          checked={form.codingLanguages.includes(lang)}
                          onCheckedChange={(c) => {
                            const next = c
                              ? [...form.codingLanguages, lang]
                              : form.codingLanguages.filter((x) => x !== lang);
                            update("codingLanguages", next as any);
                          }}
                          aria-label={lang}
                        />
                        <span>{lang}</span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Checkbox
                      checked={form.codingLanguages.some((x) =>
                        x.startsWith("Other:"),
                      )}
                      onCheckedChange={(c) => {
                        const base = form.codingLanguages.filter(
                          (x) => !x.startsWith("Other:"),
                        );
                        const val = (
                          document.getElementById(
                            "other-lang",
                          ) as HTMLInputElement | null
                        )?.value?.trim();
                        const next =
                          c && val ? [...base, `Other: ${val}`] : base;
                        update("codingLanguages", next as any);
                      }}
                      aria-label="Other language"
                    />
                    <Input
                      id="other-lang"
                      placeholder="Other (type here)"
                      onBlur={(e) => {
                        const base = form.codingLanguages.filter(
                          (x) => !x.startsWith("Other:"),
                        );
                        const val = e.target.value.trim();
                        const has = form.codingLanguages.some((x) =>
                          x.startsWith("Other:"),
                        );
                        const next =
                          has && val
                            ? [...base, `Other: ${val}`]
                            : has
                              ? base
                              : base;
                        update("codingLanguages", next as any);
                      }}
                    />
                  </div>
                </div>

                {/* Tools */}
                <div className="space-y-2">
                  <Label>Tools & frameworks you've used</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      "React",
                      "Next.js",
                      "Vue",
                      "Svelte",
                      "Node",
                      "Express",
                      "Django",
                      "Flask",
                      "Laravel",
                      "Spring",
                      "GraphQL",
                      "Prisma",
                      "Postgres",
                      "MongoDB",
                      "Redis",
                      "Kafka",
                      "RabbitMQ",
                      "Elasticsearch",
                      "Docker",
                      "Kubernetes",
                      "Ansible",
                      "Terraform",
                      "GitHub Actions",
                      "AWS",
                      "GCP",
                      "Azure",
                      "Figma",
                    ].map((tool) => (
                      <label
                        key={tool}
                        className="flex items-center gap-2 rounded-md border p-2 text-sm hover:bg-accent"
                      >
                        <Checkbox
                          checked={form.tools.includes(tool)}
                          onCheckedChange={(c) => {
                            const next = c
                              ? [...form.tools, tool]
                              : form.tools.filter((x) => x !== tool);
                            update("tools", next as any);
                          }}
                          aria-label={tool}
                        />
                        <span>{tool}</span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Checkbox
                      checked={form.tools.some((x) => x.startsWith("Other:"))}
                      onCheckedChange={(c) => {
                        const base = form.tools.filter(
                          (x) => !x.startsWith("Other:"),
                        );
                        const val = (
                          document.getElementById(
                            "other-tool",
                          ) as HTMLInputElement | null
                        )?.value?.trim();
                        const next =
                          c && val ? [...base, `Other: ${val}`] : base;
                        update("tools", next as any);
                      }}
                      aria-label="Other tool"
                    />
                    <Input
                      id="other-tool"
                      placeholder="Other (type here)"
                      onBlur={(e) => {
                        const base = form.tools.filter(
                          (x) => !x.startsWith("Other:"),
                        );
                        const val = e.target.value.trim();
                        const has = form.tools.some((x) =>
                          x.startsWith("Other:"),
                        );
                        const next =
                          has && val
                            ? [...base, `Other: ${val}`]
                            : has
                              ? base
                              : base;
                        update("tools", next as any);
                      }}
                    />
                  </div>
                </div>

                {/* Interests & Motivation */}
                <div className="space-y-2">
                  <Label>What do you enjoy the most?</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      "Problem solving",
                      "Building products",
                      "Research/ML",
                      "Security",
                      "Systems/Backend",
                      "UI/Design",
                      "Data storytelling",
                      "DevOps",
                      "Cloud Architecture",
                      "Data Engineering",
                      "MLOps",
                      "UX Research",
                      "Mobile",
                      "AR/VR",
                      "Robotics",
                    ].map((tag) => (
                      <label
                        key={tag}
                        className="flex items-center gap-2 rounded-md border p-2 text-sm hover:bg-accent"
                      >
                        <Checkbox
                          checked={form.interestsTags.includes(tag)}
                          onCheckedChange={(c) => {
                            const next = c
                              ? [...form.interestsTags, tag]
                              : form.interestsTags.filter((x) => x !== tag);
                            update("interestsTags", next as any);
                          }}
                          aria-label={tag}
                        />
                        <span>{tag}</span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Checkbox
                      checked={form.interestsTags.some((x) =>
                        x.startsWith("Other:"),
                      )}
                      onCheckedChange={(c) => {
                        const base = form.interestsTags.filter(
                          (x) => !x.startsWith("Other:"),
                        );
                        const val = (
                          document.getElementById(
                            "other-enjoy",
                          ) as HTMLInputElement | null
                        )?.value?.trim();
                        const next =
                          c && val ? [...base, `Other: ${val}`] : base;
                        update("interestsTags", next as any);
                      }}
                      aria-label="Other interest"
                    />
                    <Input
                      id="other-enjoy"
                      placeholder="Other (type here)"
                      onBlur={(e) => {
                        const base = form.interestsTags.filter(
                          (x) => !x.startsWith("Other:"),
                        );
                        const val = e.target.value.trim();
                        const has = form.interestsTags.some((x) =>
                          x.startsWith("Other:"),
                        );
                        const next =
                          has && val
                            ? [...base, `Other: ${val}`]
                            : has
                              ? base
                              : base;
                        update("interestsTags", next as any);
                      }}
                    />
                  </div>
                </div>

                {/* Values */}
                <div className="space-y-2">
                  <Label>Work values that matter</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      "Impact",
                      "Salary",
                      "Flexibility",
                      "Stability",
                      "Innovation",
                      "Mentorship",
                      "Learning",
                      "Autonomy",
                      "Work-life",
                      "Recognition",
                      "Ownership",
                      "Team culture",
                    ].map((val) => (
                      <label
                        key={val}
                        className="flex items-center gap-2 rounded-md border p-2 text-sm hover:bg-accent"
                      >
                        <Checkbox
                          checked={form.values.includes(val)}
                          onCheckedChange={(c) => {
                            const next = c
                              ? [...form.values, val]
                              : form.values.filter((x) => x !== val);
                            update("values", next as any);
                          }}
                          aria-label={val}
                        />
                        <span>{val}</span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Checkbox
                      checked={form.values.some((x) => x.startsWith("Other:"))}
                      onCheckedChange={(c) => {
                        const base = form.values.filter(
                          (x) => !x.startsWith("Other:"),
                        );
                        const val = (
                          document.getElementById(
                            "other-value",
                          ) as HTMLInputElement | null
                        )?.value?.trim();
                        const next =
                          c && val ? [...base, `Other: ${val}`] : base;
                        update("values", next as any);
                      }}
                      aria-label="Other value"
                    />
                    <Input
                      id="other-value"
                      placeholder="Other (type here)"
                      onBlur={(e) => {
                        const base = form.values.filter(
                          (x) => !x.startsWith("Other:"),
                        );
                        const val = e.target.value.trim();
                        const has = form.values.some((x) =>
                          x.startsWith("Other:"),
                        );
                        const next =
                          has && val
                            ? [...base, `Other: ${val}`]
                            : has
                              ? base
                              : base;
                        update("values", next as any);
                      }}
                    />
                  </div>
                </div>

                {/* Learning style & Environment */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Learning style</Label>
                    <Select
                      value={form.learningStyle}
                      onValueChange={(v) => update("learningStyle", v as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="project">Project-based</SelectItem>
                        <SelectItem value="concept">Concept-first</SelectItem>
                        <SelectItem value="collab">Collaborative</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Preferred environment</Label>
                    <Select
                      value={form.environment}
                      onValueChange={(v) => update("environment", v as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="startup">Startup</SelectItem>
                        <SelectItem value="bigtech">Big Tech</SelectItem>
                        <SelectItem value="remote">Remote-first</SelectItem>
                        <SelectItem value="academia">
                          Open-source/Academia
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Preferences sliders */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Salary priority (1-5)</Label>
                    <Slider
                      value={[form.salaryPriority]}
                      min={1}
                      max={5}
                      step={1}
                      onValueChange={(v) =>
                        update("salaryPriority", v[0] as any)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Growth priority (1-5)</Label>
                    <Slider
                      value={[form.growthPriority]}
                      min={1}
                      max={5}
                      step={1}
                      onValueChange={(v) =>
                        update("growthPriority", v[0] as any)
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Communication</Label>
                    <Slider
                      value={[form.softComm]}
                      min={1}
                      max={5}
                      step={1}
                      onValueChange={(v) => update("softComm", v[0] as any)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Leadership</Label>
                    <Slider
                      value={[form.softLeader]}
                      min={1}
                      max={5}
                      step={1}
                      onValueChange={(v) => update("softLeader", v[0] as any)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Teamwork</Label>
                    <Slider
                      value={[form.softTeam]}
                      min={1}
                      max={5}
                      step={1}
                      onValueChange={(v) => update("softTeam", v[0] as any)}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label>Preferred work style</Label>
                    <Select
                      value={form.workStyle}
                      onValueChange={(v) => update("workStyle", v as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="remote">Remote</SelectItem>
                        <SelectItem value="onsite">Onsite</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Willing to relocate?</Label>
                    <Select
                      value={form.relocate}
                      onValueChange={(v) => update("relocate", v as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                        <SelectItem value="maybe">Maybe</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Available hours per week</Label>
                    <Slider
                      value={[form.timePerWeek]}
                      min={1}
                      max={40}
                      step={1}
                      onValueChange={(v) => update("timePerWeek", v[0] as any)}
                    />
                  </div>
                </div>

                {/* Text inputs */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="skills">Skills</Label>
                    <TooltipProvider delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            aria-label="Help for skills"
                            className="text-muted-foreground"
                          >
                            <HelpCircle className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          Comma-separated. Example: react, typescript, sql
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    id="skills"
                    aria-describedby="help-skills"
                    placeholder="react, typescript, sql"
                    value={form.skills}
                    onChange={(e) => update("skills", e.target.value)}
                  />
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_SKILLS.map((s) => (
                      <Button
                        key={s}
                        type="button"
                        size="sm"
                        variant="outline"
                        className="rounded-full"
                        onClick={() => addToken("skills", s)}
                      >
                        + {s}
                      </Button>
                    ))}
                  </div>
                  <Helper id="help-skills">
                    Add quickly using suggestions or type your own.
                  </Helper>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="interests">Interests</Label>
                    <TooltipProvider delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            aria-label="Help for interests"
                            className="text-muted-foreground"
                          >
                            <HelpCircle className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          Comma-separated. Example: ai/ml, product, fintech
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    id="interests"
                    aria-describedby="help-interests"
                    placeholder="ai/ml, product, fintech"
                    value={form.interests}
                    onChange={(e) => update("interests", e.target.value)}
                  />
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_INTERESTS.map((s) => (
                      <Button
                        key={s}
                        type="button"
                        size="sm"
                        variant="outline"
                        className="rounded-full"
                        onClick={() => addToken("interests", s)}
                      >
                        + {s}
                      </Button>
                    ))}
                  </div>
                  <Helper id="help-interests">
                    Pick from suggestions or type your own.
                  </Helper>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="resume">Resume text (optional)</Label>
                      <TooltipProvider delayDuration={100}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              aria-label="Supported files"
                              className="text-muted-foreground"
                            >
                              <HelpCircle className="h-4 w-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Paste text or upload .txt/.md. PDF/DOCX support
                            coming soon.
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                  <Textarea
                    id="resume"
                    rows={5}
                    value={form.resumeText}
                    onChange={(e) => update("resumeText", e.target.value)}
                    placeholder="Paste relevant resume content here..."
                  />
                  <Input
                    ref={fileRef}
                    type="file"
                    accept=".txt,.md,.pdf,.doc,.docx"
                    onChange={onFileChange}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="portfolio">
                      Portfolio / GitHub (optional)
                    </Label>
                    <Input
                      id="portfolio"
                      placeholder="https://github.com/username"
                      value={form.portfolio}
                      onChange={(e) => update("portfolio", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="degree">Highest degree</Label>
                    <Select
                      value={form.degree}
                      onValueChange={(v) => update("degree", v as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="bachelor">Bachelor</SelectItem>
                        <SelectItem value="master">Master</SelectItem>
                        <SelectItem value="phd">PhD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="certs">Certifications (optional)</Label>
                  <Input
                    id="certs"
                    placeholder="AWS CCP, Google Data Analytics"
                    value={form.certifications}
                    onChange={(e) => update("certifications", e.target.value)}
                  />
                  <div className="flex flex-wrap gap-2">
                    {CERTS.map((c) => (
                      <Button
                        key={c}
                        type="button"
                        size="sm"
                        variant="outline"
                        className="rounded-full"
                        onClick={() =>
                          update(
                            "certifications",
                            (form.certifications
                              ? form.certifications + ", "
                              : "") + c,
                          )
                        }
                      >
                        + {c}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goals">Career goals</Label>
                  <Textarea
                    id="goals"
                    rows={3}
                    placeholder="Short/long-term goals..."
                    value={form.goals}
                    onChange={(e) => update("goals", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="constraints">Constraints</Label>
                  <Textarea
                    id="constraints"
                    rows={3}
                    placeholder="Time, location, finances, etc."
                    value={form.constraints}
                    onChange={(e) => update("constraints", e.target.value)}
                  />
                </div>

                {Object.values(errors).length ? (
                  <div
                    role="alert"
                    aria-live="assertive"
                    className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
                  >
                    {Object.values(errors)[0]}
                  </div>
                ) : null}
                {apiError ? (
                  <div
                    role="alert"
                    aria-live="assertive"
                    className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
                  >
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
                      localStorage.setItem(
                        "mentorai_last_inputs",
                        JSON.stringify(form),
                      );
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
                <DialogDescription>
                  Select an option to proceed with your responses.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-2 sm:grid-cols-2">
                <Button onClick={() => navigate("/suggestions")}>
                  Get AI Suggestions
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/resume-analyzer")}
                >
                  Analyze Responses
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </section>
  );
}
