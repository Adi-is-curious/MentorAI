import Assessment from "@/components/mentor/Assessment";

export default function Quiz() {
  return (
    <section>
      <div className="container py-12">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Career Quiz</h1>
          <p className="mt-2 text-muted-foreground">Answer the questionnaire and get AI-powered suggestions.</p>
        </div>
        <Assessment />
      </div>
    </section>
  );
}
