import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { Menu } from "lucide-react";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/quiz", label: "Career Quiz" },
  { to: "/suggestions", label: "Suggestions" },
  { to: "/resume-analyzer", label: "Analyzer" },
  { to: "/resources", label: "Resources" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                <circle cx="12" cy="7" r="3" fill="white" />
                <path d="M4 20c0-3.5 3-6 8-6s8 2.5 8 6" fill="white" />
                <path
                  d="M9 13l3 2 3-2 2 3c-2-.5-4-.8-5-.8s-3 .3-5 .8l2-3z"
                  fill="white"
                />
              </svg>
            </div>
            <span className="text-lg font-extrabold tracking-tight">
              MentorAI
            </span>
          </Link>
          <nav className="ml-6 hidden gap-1 lg:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? "text-primary bg-accent"
                      : "text-foreground/70 hover:text-foreground hover:bg-accent"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="hidden items-center gap-2 lg:flex">
          <Button asChild variant="ghost">
            <Link to="/auth">Sign in</Link>
          </Button>
          <Button asChild className="shadow-sm">
            <Link to="/quiz">Get started</Link>
          </Button>
        </div>
        <div className="lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open navigation">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="mt-6 flex flex-col gap-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `px-3 py-2 text-base font-medium rounded-md transition-colors ${
                        isActive
                          ? "text-primary bg-accent"
                          : "text-foreground/80 hover:text-foreground hover:bg-accent"
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
                <div className="mt-4 flex gap-2">
                  <Button
                    asChild
                    variant="ghost"
                    className="flex-1"
                    onClick={() => setOpen(false)}
                  >
                    <Link to="/auth">Sign in</Link>
                  </Button>
                  <Button
                    asChild
                    className="flex-1"
                    onClick={() => setOpen(false)}
                  >
                    <Link to="/quiz">Get started</Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
