import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, ShieldCheck, Upload, LineChart, CheckCircle2 } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

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

      {/* Spotlight slider */}
      <section className="border-t bg-gradient-to-b from-background via-background to-accent/20">
        <div className="container py-16">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold tracking-tight">Career & Resume Spotlights</h2>
            <p className="text-muted-foreground">Swipe through quick guides on hot roles and resume success.</p>
          </div>
          <div className="relative mx-auto max-w-5xl">
            <Carousel className="px-12" autoPlay autoPlayInterval={5000} autoPlayDelay={2500}>
              <CarouselContent>
                <CarouselItem>
                  <Card>
                    <CardHeader>
                      <CardTitle>Why an ATS‑friendly resume matters</CardTitle>
                      <CardDescription>Get past filters and in front of recruiters</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                      <ul className="list-disc pl-5">
                        <li>Use standard sections (Summary, Experience, Education, Skills).</li>
                        <li>Quantify impact with metrics and action verbs.</li>
                        <li>Match job description keywords naturally.</li>
                        <li>Avoid graphics-heavy templates or unusual fonts.</li>
                      </ul>
                      <div className="pt-3 flex gap-3">
                        <Button asChild><Link to="/resume-analyzer">Analyze my resume</Link></Button>
                        <Button asChild variant="outline"><Link to="/resources">See roadmaps</Link></Button>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
                <CarouselItem>
                  <Card>
                    <CardHeader>
                      <CardTitle>GenAI Engineer & Prompt Engineering</CardTitle>
                      <CardDescription>Blend ML foundations with LLM tooling</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                      <ul className="list-disc pl-5">
                        <li>Skills: Python/TS, vector DBs, prompt design, evaluation, RAG.</li>
                        <li>Tools: OpenAI/HF APIs, LangChain/LlamaIndex, orchestration.</li>
                        <li>Portfolio: chatbots, retrieval apps, agents with guardrails.</li>
                      </ul>
                      <div className="pt-3 flex gap-3">
                        <Button asChild><Link to="/quiz">Find fit via quiz</Link></Button>
                        <Button asChild variant="outline"><Link to="/suggestions">Get AI suggestions</Link></Button>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
                <CarouselItem>
                  <Card>
                    <CardHeader>
                      <CardTitle>Cybersecurity Analyst demand is rising</CardTitle>
                      <CardDescription>Threat detection, blue teaming, and cloud security</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                      <ul className="list-disc pl-5">
                        <li>Skills: networking, SIEM, threat modeling, scripting.</li>
                        <li>Certs: Security+, CySA+, AZ-500, practical labs.</li>
                        <li>Path: SOC → Incident Response → Cloud Security.</li>
                      </ul>
                      <div className="pt-3 flex gap-3">
                        <Button asChild><Link to="/resources">View learning resources</Link></Button>
                        <Button asChild variant="outline"><Link to="/quiz">Check your fit</Link></Button>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </div>
      </section>

      {/* Career path spotlights + Blogs */}
      <section className="container py-16">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold tracking-tight">Explore Career Paths</h2>
          <p className="text-muted-foreground">Curated reads on AI/ML, GenAI, Security, Backend, Prompt Engineering, and Cloud.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { title: "AI/ML Engineer", text: "Math + Python + ML systems; build models and data pipelines." },
            { title: "GenAI Engineer", text: "LLM apps, RAG, evaluation, safety, and prompt design." },
            { title: "Security Analyst", text: "Detect threats, harden systems, and respond to incidents." },
            { title: "Backend Engineer", text: "APIs, databases, scalability, reliability, and testing." },
            { title: "Prompt Engineer", text: "Instruction crafting, tools, and evaluation for LLMs." },
            { title: "AWS Cloud Engineer", text: "Infra-as-code, networking, observability, and cost control." },
          ].map((c, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle className="text-lg">{c.title}</CardTitle>
                <CardDescription>{c.text}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Button asChild><Link to="/quiz">Check your fit</Link></Button>
                  <Button asChild variant="outline"><Link to="/resources">Learn more</Link></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 mb-6 text-center">
          <h3 className="text-xl font-semibold tracking-tight">Blogs & Guides</h3>
          <p className="text-muted-foreground">Resume tips and general career advice.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "How to get a job with no experience",
              excerpt: "Practical steps to break in using projects, networking, and tailored applications.",
              href: "https://www.indeed.com/career-advice/finding-a-job/how-to-get-a-job-with-no-experience",
            },
            {
              title: "The STAR method for interviews",
              excerpt: "Structure your answers to behavioral questions for maximum impact.",
              href: "https://www.glassdoor.com/blog/guide/star-method/",
            },
            {
              title: "Resume writing: 10 proven tips",
              excerpt: "Clarity, impact, keywords, and design choices that pass ATS and humans.",
              href: "https://www.linkedin.com/pulse/resume-writing-tips/",
            },
            {
              title: "System design interview primer",
              excerpt: "Core concepts, trade-offs, and how to practice effectively.",
              href: "https://www.educative.io/blog/complete-guide-to-system-design",
            },
            {
              title: "SQL interview questions",
              excerpt: "Common patterns and exercises seen in data and backend interviews.",
              href: "https://www.interviewbit.com/sql-interview-questions/",
            },
            {
              title: "Cybersecurity career roadmap",
              excerpt: "Skills, certifications, and roles from SOC to Cloud Security.",
              href: "https://www.cyberseek.org/pathway.html",
            },
          ].map((b, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle className="text-lg">{b.title}</CardTitle>
                <CardDescription>{b.excerpt}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="link" asChild className="px-0">
                  <a href={b.href} target="_blank" rel="noreferrer">Read on site →</a>
                </Button>
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
