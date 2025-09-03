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

  if (pathname === "/contact") {
    return (
      <section className="relative">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,var(--tw-gradient-stops))] from-primary/15 via-transparent to-transparent" />
        <div className="container py-16">
          <div className="mx-auto max-w-3xl text-center mb-10">
            <h1 className="text-3xl font-extrabold tracking-tight">Contact</h1>
            <p className="text-muted-foreground mt-2">We'd love to hear from you. Reach out for questions, feedback, or collaboration ideas.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>General Inquiries</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>Email us anytime and we'll respond within 1–2 business days.</p>
                <div className="flex items-center gap-2 text-foreground">
                  <span className="font-medium">Email:</span>
                  <a className="underline underline-offset-4" href="mailto:aditya.aloe29@gmail.com?subject=Inquiry%20from%20MentorAI%20website">aditya.aloe29@gmail.com</a>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button asChild>
                    <a href="mailto:aditya.aloe29@gmail.com?subject=Inquiry%20from%20MentorAI%20website">Send an email</a>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/faq">Visit FAQ</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Support & Feedback</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>Report issues, request features, or share suggestions to improve MentorAI.</p>
                <ul className="list-disc pl-5">
                  <li>Bug reports with steps to reproduce</li>
                  <li>Feature requests and use-cases</li>
                  <li>Visual/UI inconsistencies</li>
                </ul>
                <div className="pt-2">
                  <Button asChild variant="secondary">
                    <a href="mailto:aditya.aloe29@gmail.com?subject=Support%20request%20-%20MentorAI">Email Support</a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Connect</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>Follow and connect for updates and community.</p>
                <div className="flex flex-wrap gap-3">
                  <Button asChild variant="outline">
                    <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer">LinkedIn</a>
                  </Button>
                  <Button asChild variant="outline">
                    <a href="https://github.com/" target="_blank" rel="noreferrer">GitHub</a>
                  </Button>
                  <Button asChild variant="outline">
                    <a href="https://x.com/" target="_blank" rel="noreferrer">X (Twitter)</a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Office Hours</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>Mon–Fri, 10:00–18:00 IST</p>
                <p>Responses may be slower on weekends and holidays.</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-10 flex justify-center">
            <Button asChild variant="secondary">
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

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
