import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function TopicQuiz() {
  const [searchParams] = useSearchParams();
  const topic = searchParams.get("topic");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [quizData, setQuizData] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [confidence, setConfidence] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (!topic) return;
    fetch(`/api/quiz/generate?topic=${encodeURIComponent(topic)}`, {
      headers: { "x-session-id": "demo_session" },
    })
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) setQuizData(j.quiz.questionsJson);
      })
      .finally(() => setLoading(false));
  }, [topic]);

  const handleSubmit = async () => {
    setSubmitting(true);
    
    // Calculate simple mock accuracy for MCQs locally (in a real app, do this on backend)
    let correct = 0;
    let totalMcq = 0;
    
    quizData?.questions?.forEach((q: any, idx: number) => {
      if (q.type === "mcq") {
        totalMcq++;
        if (parseInt(answers[idx]) === q.correct_index) correct++;
      }
    });

    const accuracy = totalMcq > 0 ? (correct / totalMcq) * 100 : 80;

    try {
      const r = await fetch("/api/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": "demo_session",
        },
        body: JSON.stringify({
          topic,
          accuracy,
          confidence: parseInt(confidence) || 3,
          completionRate: 100,
          revisionFrequency: 1,
          consistency: 100
        }),
      });
      const j = await r.json();
      if (j.ok) {
        setResult(j);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  if (!topic) {
    return <div className="p-12 text-center">Missing topic parameter.</div>;
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="mt-4 text-muted-foreground">Generating AI Quiz for {topic}...</p>
      </div>
    );
  }

  if (result) {
    return (
      <div className="container max-w-2xl py-12">
        <Card>
          <CardHeader>
            <CardTitle>Quiz Complete!</CardTitle>
            <CardDescription>We've updated your mastery engine.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-lg">
              New Mastery Score: <span className="font-bold text-primary">{result.newMasteryScore?.toFixed(1)}%</span>
            </div>
            {result.weakArea ? (
              <p className="text-destructive">This is currently a weak area. We'll add foundational reviews to your roadmap.</p>
            ) : (
              <p className="text-green-500">Great job! Your confidence aligns with your performance.</p>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate("/resources")} className="w-full">Return to Roadmap</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-12">
      <Card>
        <CardHeader>
          <CardTitle>AI Quiz: {topic}</CardTitle>
          <CardDescription>Answer the questions and rate your confidence.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {quizData?.questions?.map((q: any, idx: number) => (
            <div key={idx} className="space-y-3 bg-muted/30 p-4 rounded-lg">
              <h3 className="font-medium text-lg">{idx + 1}. {q.question}</h3>
              {q.type === "mcq" ? (
                <RadioGroup
                  value={answers[idx] !== undefined ? String(answers[idx]) : ""}
                  onValueChange={(val) => setAnswers({ ...answers, [idx]: val })}
                >
                  {q.options.map((opt: string, optIdx: number) => (
                    <div key={optIdx} className="flex items-center space-x-2">
                      <RadioGroupItem value={String(optIdx)} id={`q${idx}-opt${optIdx}`} />
                      <Label htmlFor={`q${idx}-opt${optIdx}`}>{opt}</Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <Textarea 
                  placeholder="Type your explanation..." 
                  value={answers[idx] || ""}
                  onChange={(e) => setAnswers({ ...answers, [idx]: e.target.value })}
                />
              )}
            </div>
          ))}

          <div className="pt-6 border-t">
            <h3 className="font-semibold mb-2">Metacognition Check</h3>
            <p className="text-sm text-muted-foreground mb-4">How confident do you feel about this topic?</p>
            <RadioGroup
              value={confidence}
              onValueChange={setConfidence}
              className="flex gap-4"
            >
              {[1, 2, 3, 4, 5].map((num) => (
                <div key={num} className="flex flex-col items-center gap-1">
                  <RadioGroupItem value={String(num)} id={`conf${num}`} />
                  <Label htmlFor={`conf${num}`}>{num}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={handleSubmit} 
            disabled={submitting || !confidence}
          >
            {submitting ? "Evaluating..." : "Submit & Evaluate"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
