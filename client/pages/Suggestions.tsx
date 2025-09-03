import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "react-router-dom";

export default function Suggestions() {
  return (
    <section className="container py-12">
      <div className="mx-auto max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>AI Suggestions</CardTitle>
            <CardDescription>
              We will integrate AI APIs here to generate personalized
              suggestions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              In the meantime, analyze your responses or explore resources.
            </p>
            <div className="flex gap-3">
              <Button asChild>
                <Link to="/resume-analyzer">Analyze now</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/resources">Resources</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
