import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

type Item = { title: string; url?: string };

function useRoadmapProgress(domain: string) {
  const key = `mentorai_roadmap_progress_${domain}`;
  const [state, setState] = useState<Record<string, boolean>>({});
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setState(JSON.parse(raw));
    } catch {}
  }, [key]);
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {}
  }, [key, state]);
  return [state, setState] as const;
}

function Quest({
  id,
  title,
  url,
  checked,
  onToggle,
}: {
  id: string;
  title: string;
  url?: string;
  checked: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 rounded-md border p-3 text-sm hover:bg-accent">
      <input
        type="checkbox"
        className="mt-1 h-4 w-4"
        checked={checked}
        onChange={(e) => onToggle(e.target.checked)}
        aria-label={title}
      />
      <div>
        <div className="font-medium">{title}</div>
        {url ? (
          <a
            className="underline underline-offset-4 text-muted-foreground"
            href={url}
            target="_blank"
            rel="noreferrer"
          >
            Open resource
          </a>
        ) : null}
      </div>
    </label>
  );
}

export default function RoadmapGame({
  domain,
  items,
}: {
  domain: string;
  items: Item[];
}) {
  const [progress, setProgress] = useRoadmapProgress(domain);

  const levels = useMemo(() => {
    const base: { id: string; title: string; quests: Item[] }[] = [
      {
        id: "L1",
        title: "Level 1 · Foundations",
        quests: [
          { title: `Set up environment for ${domain}` },
          { title: "Read core guide", url: items[0]?.url },
          { title: "Complete a basics tutorial", url: items[1]?.url },
        ],
      },
      {
        id: "L2",
        title: "Level 2 · Build",
        quests: [
          { title: "Implement a mini project" },
          { title: "Document learnings in a README" },
          { title: "Share progress publicly" },
        ],
      },
      {
        id: "L3",
        title: "Level 3 · Ship",
        quests: [
          { title: "Build a portfolio project" },
          { title: "Write a blog/video walkthrough" },
          { title: "Mock interview / peer review" },
        ],
      },
      {
        id: "L4",
        title: "Level 4 · Interview Ready",
        quests: [
          { title: "Solve 15 practice problems" },
          { title: "2 system design or case studies" },
          { title: "Resume tailored to target role" },
        ],
      },
      {
        id: "L5",
        title: "Level 5 · Specialize",
        quests: [
          { title: "Deep dive course in a subdomain", url: items[2]?.url },
          { title: "Advanced project with real users" },
          { title: "Mentor/teach someone a concept" },
        ],
      },
      {
        id: "B1",
        title: "Boss Challenge · Capstone",
        quests: [
          { title: "Ship a polished capstone with demo video" },
          { title: "Publish a detailed write-up" },
          { title: "Get external feedback and iterate" },
        ],
      },
    ];
    // Add remaining domain items as optional side quests
    const extra = items
      .slice(2)
      .map((it) => ({ title: `Side Quest: ${it.title}`, url: it.url }));
    if (extra.length)
      base.push({ id: "SX", title: "Side Quests", quests: extra });
    return base;
  }, [domain, items]);

  const allQuestIds = levels.flatMap((lvl) =>
    lvl.quests.map((q, i) => `${lvl.id}-${i}`),
  );
  const totalXP = allQuestIds.length * 10;
  const earnedXP = allQuestIds.reduce(
    (acc, id) => acc + (progress[id] ? 10 : 0),
    0,
  );
  const pct = totalXP ? Math.round((earnedXP / totalXP) * 100) : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Roadmap · {domain}</CardTitle>
          <CardDescription>
            Complete quests to earn XP and level up
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span>
              Total XP: {earnedXP}/{totalXP}
            </span>
            <span>{pct}%</span>
          </div>
          <Progress value={pct} />
          <div className="mt-4">
            <Button
              variant="secondary"
              onClick={() => {
                const cleared: Record<string, boolean> = {};
                setProgress(cleared);
              }}
            >
              Reset progress
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {levels.map((lvl) => (
          <Card key={lvl.id}>
            <CardHeader>
              <CardTitle className="text-base">{lvl.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {lvl.quests.map((q, i) => {
                const id = `${lvl.id}-${i}`;
                const checked = !!progress[id];
                return (
                  <Quest
                    key={id}
                    id={id}
                    title={q.title}
                    url={q.url}
                    checked={checked}
                    onToggle={(v) => setProgress((s) => ({ ...s, [id]: v }))}
                  />
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
