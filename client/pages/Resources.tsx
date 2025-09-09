import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AnalyzeResponse } from "@shared/api";
import { Link } from "react-router-dom";
import RoadmapGame from "@/components/resources/RoadmapGame";

const domainResources: Record<string, { title: string; url: string }[]> = {
  "Data Science": [
    { title: "Kaggle Learn", url: "https://www.kaggle.com/learn" },
    { title: "W3Schools Python", url: "https://www.w3schools.com/python/" },
    {
      title: "fast.ai Practical Deep Learning",
      url: "https://course.fast.ai/",
    },
    {
      title: "Harvard CS109 Data Science",
      url: "https://cs109.github.io/2022/",
    },
    {
      title: "Google ML Crash Course",
      url: "https://developers.google.com/machine-learning/crash-course",
    },
  ],
  "Frontend Engineering": [
    { title: "MDN Web Docs", url: "https://developer.mozilla.org/en-US/" },
    { title: "React Docs", url: "https://react.dev/" },
    {
      title: "TypeScript Handbook",
      url: "https://www.typescriptlang.org/docs/",
    },
    { title: "web.dev", url: "https://web.dev/learn/" },
    { title: "W3Schools HTML", url: "https://www.w3schools.com/html/" },
    { title: "W3Schools CSS", url: "https://www.w3schools.com/css/" },
    { title: "W3Schools JavaScript", url: "https://www.w3schools.com/js/" },
  ],
  "Backend Engineering": [
    {
      title: "The Odin Project (Full Stack)",
      url: "https://www.theodinproject.com/",
    },
    { title: "Node.js Docs", url: "https://nodejs.org/en/docs" },
    { title: "PostgreSQL Docs", url: "https://www.postgresql.org/docs/" },
    { title: "W3Schools SQL", url: "https://www.w3schools.com/sql/" },
    { title: "roadmap.sh Backend", url: "https://roadmap.sh/backend" },
  ],
  "Full Stack Engineering": [
    {
      title: "FreeCodeCamp Curriculum",
      url: "https://www.freecodecamp.org/learn",
    },
    { title: "The Odin Project", url: "https://www.theodinproject.com/" },
    { title: "roadmap.sh Fullstack", url: "https://roadmap.sh/full-stack" },
  ],
  "Mobile Development": [
    { title: "Android Developers", url: "https://developer.android.com/" },
    {
      title: "Apple Developer (iOS)",
      url: "https://developer.apple.com/documentation/",
    },
    { title: "Flutter Docs", url: "https://docs.flutter.dev/" },
    {
      title: "React Native Docs",
      url: "https://reactnative.dev/docs/getting-started",
    },
  ],
  SRE: [
    {
      title: "Google SRE Book (free)",
      url: "https://sre.google/sre-book/table-of-contents/",
    },
    { title: "Prometheus Docs", url: "https://prometheus.io/docs/" },
    { title: "Grafana Learn", url: "https://grafana.com/learn/" },
  ],
  "AI/ML Engineering": [
    { title: "Hugging Face Course", url: "https://huggingface.co/learn" },
    { title: "fast.ai", url: "https://course.fast.ai/" },
    { title: "Dive into Deep Learning", url: "https://d2l.ai/" },
  ],
  "Prompt Engineering": [
    {
      title: "LangChain Docs",
      url: "https://python.langchain.com/docs/get_started/introduction/",
    },
    {
      title: "Prompt Engineering Guide",
      url: "https://www.promptingguide.ai/",
    },
    { title: "LlamaIndex Docs", url: "https://docs.llamaindex.ai/" },
  ],
  Cybersecurity: [
    { title: "OverTheWire Wargames", url: "https://overthewire.org/wargames/" },
    { title: "OWASP Top 10", url: "https://owasp.org/www-project-top-ten/" },
    { title: "TryHackMe (free rooms)", url: "https://tryhackme.com/" },
  ],
  "Cloud/DevOps": [
    { title: "AWS Skill Builder (free)", url: "https://skillbuilder.aws/" },
    { title: "Kubernetes Docs", url: "https://kubernetes.io/docs/home/" },
    { title: "roadmap.sh DevOps", url: "https://roadmap.sh/devops" },
  ],
  "UI/UX Design": [
    {
      title: "Figma Learn",
      url: "https://help.figma.com/hc/en-us/categories/360002042153-Learn-design",
    },
    { title: "Material Design", url: "https://m3.material.io/" },
    {
      title: "Nielsen Norman Group Articles",
      url: "https://www.nngroup.com/articles/",
    },
  ],
  "Product Management": [
    { title: "SVPG Articles", url: "https://www.svpg.com/articles/" },
    { title: "Atlassian Agile Guides", url: "https://www.atlassian.com/agile" },
    { title: "Mind the Product Blog", url: "https://www.mindtheproduct.com/" },
  ],
  "QA/Test": [
    { title: "Cypress Docs", url: "https://docs.cypress.io/" },
    { title: "Playwright Docs", url: "https://playwright.dev/docs/intro" },
    { title: "Selenium Docs", url: "https://www.selenium.dev/documentation/" },
  ],
  "Game Development": [
    { title: "Unity Learn", url: "https://learn.unity.com/" },
    { title: "Godot Docs", url: "https://docs.godotengine.org/" },
    {
      title: "Unreal Engine Docs",
      url: "https://dev.epicgames.com/documentation/en-us/unreal-engine",
    },
  ],
  "Embedded Systems": [
    {
      title: "Embedded Artistry Articles",
      url: "https://embeddedartistry.com/blog/",
    },
    {
      title: "FreeRTOS Docs",
      url: "https://freertos.org/Documentation/RTOS_book.html",
    },
    { title: "ARM Developer", url: "https://developer.arm.com/documentation/" },
  ],
  Blockchain: [
    { title: "Solidity Docs", url: "https://docs.soliditylang.org/" },
    {
      title: "Ethereum Dev Portal",
      url: "https://ethereum.org/en/developers/",
    },
    { title: "CryptoZombies", url: "https://cryptozombies.io/" },
  ],
  "Database Administration": [
    { title: "PostgreSQL Docs", url: "https://www.postgresql.org/docs/" },
    {
      title: "MySQL Reference",
      url: "https://dev.mysql.com/doc/refman/8.0/en/",
    },
    { title: "Percona Blog", url: "https://www.percona.com/blog/" },
  ],
  "Solutions/Systems Architecture": [
    {
      title: "System Design Primer",
      url: "https://github.com/donnemartin/system-design-primer",
    },
    {
      title: "Architectural Patterns",
      url: "https://martinfowler.com/architecture/",
    },
    {
      title: "AWS Architecture Center",
      url: "https://aws.amazon.com/architecture/",
    },
  ],
  "Technical Writing": [
    {
      title: "Google Technical Writing",
      url: "https://developers.google.com/tech-writing",
    },
    { title: "Diátaxis Docs Framework", url: "https://diataxis.fr/" },
    { title: "Write the Docs", url: "https://www.writethedocs.org/" },
  ],
};

const generalCoding = [
  {
    title: "C Programming Language (K&R)",
    url: "https://en.wikipedia.org/wiki/The_C_Programming_Language",
  },
  { title: "C++ Tour", url: "https://isocpp.org/" },
  { title: "Python Beginner", url: "https://docs.python.org/3/tutorial/" },
  { title: "Go by Example", url: "https://gobyexample.com/" },
  { title: "Rust Book", url: "https://doc.rust-lang.org/book/" },
];

export default function Resources() {
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  useEffect(() => {
    const saved = localStorage.getItem("mentorai_last_result");
    if (saved) {
      try {
        setResult(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const topDomain = useMemo(() => result?.suggestions?.[0]?.domain, [result]);
  const [selected, setSelected] = useState<string | undefined>(topDomain);
  useEffect(() => {
    if (topDomain) setSelected((prev) => prev ?? topDomain);
  }, [topDomain]);
  const allSuggested = useMemo(() => (result?.suggestions?.map((s) => s.domain) ?? []).filter((d, i, a) => a.indexOf(d) === i), [result]);
  const items = selected ? domainResources[selected] : undefined;

  return (
    <section className="container py-12">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight">
            Learning Resources
          </h1>
          <p className="text-muted-foreground">
            Curated content and a roadmap based on your chosen career path.
          </p>
        </div>

        {allSuggested.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Choose a roadmap</CardTitle>
              <CardDescription>Select any suggested path to view its roadmap and resources.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                    {result?.suggestions?.map((s) => (
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
                <RoadmapGame domain={selected} items={items} />
              ) : (
                <div className="text-sm text-muted-foreground">No resources for this domain yet.</div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Take the quiz or run Analyzer</CardTitle>
              <CardDescription>
                We need your target domain to personalize resources.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link to="/">Go to Career Quiz</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>General coding resources</CardTitle>
            <CardDescription>
              Explore languages and core CS skills
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2 sm:grid-cols-2">
              {generalCoding.map((r) => (
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
            <div className="mt-4 text-sm">
              Also see: <a className="underline underline-offset-4" href="https://www.w3schools.com/" target="_blank" rel="noreferrer">W3Schools</a> · <a className="underline underline-offset-4" href="https://www.kaggle.com/" target="_blank" rel="noreferrer">Kaggle</a>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
