import { Link } from "react-router-dom";

const footerLinks = [
  { to: "/about", label: "About" },
  { to: "/faq", label: "FAQ" },
  { to: "/privacy", label: "Privacy" },
  { to: "/contact", label: "Contact" },
];

export function SiteFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-10">
        <div className="flex flex-col items-center gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-gradient-to-br from-primary to-secondary" />
            <div>
              <p className="font-extrabold">MentorAI</p>
              <p className="text-sm text-muted-foreground">AI Career Mentor</p>
            </div>
          </div>
          <nav className="flex gap-6 text-sm text-muted-foreground">
            {footerLinks.map((l) => (
              <Link key={l.to} to={l.to} className="hover:text-foreground">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} MentorAI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
