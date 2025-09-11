import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Profile } from "@shared/api";
import { getUserId, getUserRole, setUserRole } from "@/lib/user";

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState<string | undefined>(getUserRole());
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [goals, setGoals] = useState("");

  useEffect(() => {
    const userId = getUserId();
    fetch(`/api/community/profile/${encodeURIComponent(userId)}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.profile) {
          setProfile(j.profile);
          setName(j.profile.name || "");
          setRole(j.profile.role || role);
          setBio(j.profile.bio || "");
          setSkills((j.profile.skills || []).join(", "));
          setGoals((j.profile.goals || []).join(", "));
        }
      })
      .catch(() => {});
  }, []);

  async function save() {
    const userId = getUserId();
    const body = {
      userId,
      name: name || undefined,
      role: role || undefined,
      bio: bio || undefined,
      skills: skills ? skills.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
      goals: goals ? goals.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
    };
    await fetch("/api/community/profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (role) setUserRole(role as any);
    alert("Profile saved");
  }

  return (
    <section className="container py-12">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Your Profile</h1>
          <p className="text-muted-foreground">Showcase your goals, skills, and achievements</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile details</CardTitle>
            <CardDescription>Customize how others see you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Display name" />
            <div className="grid gap-3 sm:grid-cols-2">
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="graduate">Recent Graduate</SelectItem>
                  <SelectItem value="professional">Industry Professional</SelectItem>
                </SelectContent>
              </Select>
              <Input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Skills (comma-separated)" />
            </div>
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Short bio" />
            <Input value={goals} onChange={(e) => setGoals(e.target.value)} placeholder="Goals (comma-separated)" />
            <div>
              <Button onClick={save}>Save</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
