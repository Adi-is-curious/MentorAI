import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";

export default function Resources() {
  const [loading, setLoading] = useState(true);
  const [roadmap, setRoadmap] = useState<any>(null);

  useEffect(() => {
    fetch("/api/roadmap", { headers: { "x-session-id": "demo_session" } })
      .then(r => r.json())
      .then(j => {
        if (j.ok) setRoadmap(j.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="container py-12">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight">
            Adaptive Roadmap
          </h1>
          <p className="text-muted-foreground">
            Your personalized daily learning tasks and spaced repetition reviews.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-muted-foreground/40 border-t-primary" />
            <p className="mt-2 text-sm text-muted-foreground">Generating adaptive schedule...</p>
          </div>
        ) : roadmap ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Target Domain: {roadmap.domain}</CardTitle>
                <CardDescription>Tasks scheduled for today</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {roadmap.modules.map((mod: any, i: number) => (
                  <div key={i}>
                    <h3 className="font-semibold text-lg border-b pb-2 mb-3">{mod.title}</h3>
                    {mod.tasks.length > 0 ? (
                      <ul className="space-y-3">
                        {mod.tasks.map((task: any) => (
                          <li key={task.id} className="flex items-center justify-between bg-muted/50 p-3 rounded-md">
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                {task.isReview && <span className="text-xl">🔄</span>}
                                {task.title}
                              </div>
                              <div className="text-xs text-muted-foreground capitalize mt-1 px-2 py-0.5 bg-accent inline-block rounded">
                                {task.type}
                              </div>
                            </div>
                            <Button size="sm" asChild variant={task.isReview ? "default" : "secondary"}>
                              <a href={task.url} target={task.isReview ? "_self" : "_blank"} rel="noreferrer">
                                {task.isReview ? "Start Review" : "Start Learning"}
                              </a>
                            </Button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">No tasks in this module today.</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
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
      </div>
    </section>
  );
}
