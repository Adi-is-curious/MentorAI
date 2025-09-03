import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Github, Mail } from "lucide-react";

export default function Auth() {
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    alert("This demo uses placeholder auth. Connect Supabase/Auth0 to enable secure authentication.");
  }

  return (
    <section className="relative">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-secondary/15 via-transparent to-transparent" />
      <div className="container py-16">
        <Card className="mx-auto w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-extrabold tracking-tight">Welcome back</CardTitle>
            <CardDescription>Sign in or create your account</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              <TabsContent value="signin">
                <form className="space-y-4" onSubmit={onSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" required placeholder="you@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" required />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
                <div className="my-4 text-center text-xs text-muted-foreground">or continue with</div>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline"><Github className="mr-2" /> GitHub</Button>
                  <Button variant="outline"><Mail className="mr-2" /> Google</Button>
                </div>
              </TabsContent>
              <TabsContent value="signup">
                <form className="space-y-4" onSubmit={onSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full name</Label>
                    <Input id="name" required placeholder="Aditya Kumar" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email2">Email</Label>
                    <Input id="email2" type="email" required placeholder="you@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password2">Password</Label>
                    <Input id="password2" type="password" required />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
                <div className="my-4 text-center text-xs text-muted-foreground">or sign up with</div>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline"><Github className="mr-2" /> GitHub</Button>
                  <Button variant="outline"><Mail className="mr-2" /> Google</Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
