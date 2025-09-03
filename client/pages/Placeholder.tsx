import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/quiz": "Career Quiz",
  "/suggestions": "Career Suggestions",
  "/resume-analyzer": "Resume Analyzer",
  "/resources": "Learning Resources",
  "/profile": "Profile & Settings",
  "/about": "About",
  "/contact": "Contact",
  "/faq": "FAQ",
  "/privacy": "Privacy Policy",
};

export default function Placeholder() {
  const { pathname } = useLocation();
  const title = titles[pathname] ?? "Page";
  return (
    <section className="relative">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,var(--tw-gradient-stops))] from-primary/15 via-transparent to-transparent" />
      <div className="container py-16">
        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-extrabold tracking-tight">
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              This page is a placeholder. Tell me to generate it next and I will
              build it with the same design system and transitions.
            </p>
            <div className="flex gap-3">
              <Button asChild variant="secondary">
                <Link to="/">Back to Home</Link>
              </Button>
              <Button asChild>
                <Link to="/auth">Sign in to continue</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
