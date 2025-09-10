import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AnalyzeResponse } from "@shared/api";
import { Link } from "react-router-dom";
import RoadmapGame from "@/components/resources/RoadmapGame";

import { domainResources } from "@/components/resources/domainResources";

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
  const allSuggested = useMemo(
    () =>
      (result?.suggestions?.map((s) => s.domain) ?? []).filter(
        (d, i, a) => a.indexOf(d) === i,
      ),
    [result],
  );
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
              <CardDescription>
                Select any suggested path to view its roadmap and resources.
              </CardDescription>
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
                  <div className="text-sm text-muted-foreground">
                    Suggestions
                  </div>
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
                <div className="text-sm text-muted-foreground">
                  No resources for this domain yet.
                </div>
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
              Also see:{" "}
              <a
                className="underline underline-offset-4"
                href="https://www.w3schools.com/"
                target="_blank"
                rel="noreferrer"
              >
                W3Schools
              </a>{" "}
              ·{" "}
              <a
                className="underline underline-offset-4"
                href="https://www.kaggle.com/"
                target="_blank"
                rel="noreferrer"
              >
                Kaggle
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
