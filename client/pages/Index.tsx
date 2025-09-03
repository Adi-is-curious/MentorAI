import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, ShieldCheck, Upload, LineChart, CheckCircle2 } from "lucide-react";

export default function Index() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-secondary/20 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        </div>
        <div className="container grid gap-10 py-20 md:grid-cols-2 md:py-28">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
              <Sparkles className="h-4 w-4" /> AI Career Mentor
            </span>
            <h1 className="text-balance text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Find your best-fit career path with personalized AI guidance
            </h1>
            <p className="text-balance text-lg text-muted-foreground">
              MentorAI analyzes your skills, interests, and resume to recommend roles, uncover skill gaps, and craft a learning roadmap.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="shadow">
                <Link to="/quiz">Take the Career Quiz</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/resources">Explore resources</Link>
              </Button>
            </div>
            <div className="flex items-center gap-4 pt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Secure & private</div>
              <div className="flex items-center gap-2"><LineChart className="h-4 w-4 text-primary" /> Actionable insights</div>
            </div>
          </div>
          <Card className="place-self-end w-full max-w-xl md:mt-6">
            <CardHeader>
              <CardTitle>Preview: Personalized suggestions</CardTitle>
              <CardDescription>See how your inputs turn into recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 text-primary" /> Tailored role suggestions with reasons</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 text-primary" /> Clear skill gap analysis</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 text-primary" /> Curated learning plan</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Value props */}
      <section className="container grid gap-6 pb-10 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Personalized", desc: "Recommendations aligned to your skill profile", icon: <Sparkles className="text-primary" /> },
          { title: "Resume analysis", desc: "Identify strengths and gaps instantly", icon: <Upload className="text-primary" /> },
          { title: "Roadmap", desc: "Step-by-step learning path to grow", icon: <LineChart className="text-primary" /> },
          { title: "Secure", desc: "Authentication-ready and privacy-first", icon: <ShieldCheck className="text-primary" /> },
        ].map((f) => (
          <Card key={f.title}>
            <CardHeader className="space-y-2">
              <div className="h-8 w-8">{f.icon}</div>
              <CardTitle className="text-lg">{f.title}</CardTitle>
              <CardDescription>{f.desc}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>

      {/* Textual info about resumes */}
      <section className="border-t bg-gradient-to-b from-background via-background to-accent/20">
        <div className="container grid gap-6 py-16 md:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">Why an ATS‑friendly resume matters</h2>
            <p className="text-muted-foreground">
              Recruiters use Applicant Tracking Systems (ATS) to parse and rank resumes. A clear structure, relevant keywords, and clean formatting
              ensure your profile isn’t filtered out before a human ever sees it.
            </p>
            <ul className="list-disc pl-5 text-muted-foreground">
              <li>Use standard section titles: Summary, Experience, Education, Skills.</li>
              <li>Quantify impact with metrics and action verbs.</li>
              <li>Match job description keywords naturally.</li>
              <li>Avoid heavy graphics, tables, or unusual fonts.</li>
            </ul>
            <div className="flex gap-3 pt-2">
              <Button asChild><Link to="/resume-analyzer">Analyze my resume</Link></Button>
              <Button asChild variant="outline"><Link to="/resources">See sample roadmaps</Link></Button>
            </div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>How to structure your resume</CardTitle>
              <CardDescription>Simple, scannable, and keyword‑aware</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>1. Header with name, role, location, contact, GitHub/LinkedIn.</p>
              <p>2. 2–3 line summary highlighting core skills and domain.</p>
              <p>3. Experience: bullets with action + impact + metric.</p>
              <p>4. Skills: grouped (Languages, Frameworks, Tools, Cloud).</p>
              <p>5. Education/Certifications: most recent first.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Blogs */}
      <section className="container py-16">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold tracking-tight">Blogs & Guides</h2>
          <p className="text-muted-foreground">Learn how to craft a standout, ATS‑friendly resume.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[{
            title: "Why resumes still matter in the AI era",
            excerpt: "Understand how recruiters screen and why clarity beats buzzwords.",
          },{
            title: "ATS‑friendly formatting: do’s and don’ts",
            excerpt: "Practical tips for templates, fonts, and section ordering.",
          },{
            title: "From bullet to impact: writing experience like a pro",
            excerpt: "Turn tasks into quantified achievements with simple formulas.",
          }].map((b,i)=> (
            <Card key={i}>
              <CardHeader>
                <CardTitle className="text-lg">{b.title}</CardTitle>
                <CardDescription>{b.excerpt}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="link" asChild className="px-0"><Link to="/resources">Read more →</Link></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Community */}
      <section className="border-t">
        <div className="container py-16">
          <div className="mx-auto max-w-3xl text-center space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">Community & Accountability</h2>
            <p className="text-muted-foreground">
              Join focus groups formed via LinkedIn and GitHub to code together, share daily progress, and support each other’s journey. Post your
              commits, PRs, and learnings—build consistent habits with peers.
            </p>
            <div className="flex justify-center gap-3">
              <Button asChild><a href="https://www.linkedin.com/" target="_blank" rel="noreferrer">Join on LinkedIn</a></Button>
              <Button asChild variant="outline"><a href="https://github.com/" target="_blank" rel="noreferrer">Join on GitHub</a></Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
