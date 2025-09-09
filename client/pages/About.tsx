import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const team = [
  { name: "Aditya", role: "Founder & CEO", initials: "AK" },
  { name: "Hitesh", role: "Tech Lead, CTO", initials: "HT" },
  { name: "Parth", role: "Tech Lead, Backend Supporter", initials: "PR" },
  { name: "Abhay", role: "UI/UX", initials: "AB" },
];

export default function About() {
  return (
    <section className="container py-12">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight">
            About MentorAI
          </h1>
          <p className="mt-2 text-muted-foreground">
            MentorAI is an AI-powered career mentor helping individuals discover
            their best-fit career paths, close skill gaps, and grow with a clear
            roadmap.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Our Mission</CardTitle>
            <CardDescription>
              Democratize career guidance with personalized insights, accessible
              learning resources, and a delightful experience.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              We blend user input, resume understanding, and AI models to
              generate suggestions, highlight missing skills, and curate
              actionable learning plans. Our vision is to make expert-level
              career coaching available to everyone.
            </p>
          </CardContent>
        </Card>

        <div>
          <h2 className="text-2xl font-bold tracking-tight">Team</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {team.map((m) => (
              <Card key={m.name}>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {m.initials}
                  </div>
                  <div>
                    <div className="font-semibold">{m.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {m.role}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
