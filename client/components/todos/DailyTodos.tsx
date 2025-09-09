import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

type Todo = { id: string; text: string; done: boolean };

function todayKey(prefix = "mentorai_todos") {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${prefix}_${y}-${m}-${day}`;
}

export default function DailyTodos({ title = "Today's Goals" }: { title?: string }) {
  const storageKey = useMemo(() => todayKey(), []);
  const [items, setItems] = useState<Todo[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setItems(JSON.parse(raw) as Todo[]);
    } catch {}
  }, [storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch {}
  }, [items, storageKey]);

  function add() {
    const t = text.trim();
    if (!t) return;
    setItems((prev) => [{ id: Math.random().toString(36).slice(2), text: t, done: false }, ...prev]);
    setText("");
  }

  function toggle(id: string, done: boolean) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, done } : i)));
  }

  function remove(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Track and complete your daily targets</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Input
            placeholder="Add a goal for today"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") add();
            }}
          />
          <Button onClick={add}>Add</Button>
        </div>
        <ul className="mt-4 space-y-2">
          {items.length === 0 && (
            <li className="text-sm text-muted-foreground">No goals yet. Add your first.</li>
          )}
          {items.map((i) => (
            <li key={i.id} className="flex items-center justify-between gap-3 rounded-md border p-2">
              <label className="flex items-center gap-2">
                <Checkbox checked={i.done} onCheckedChange={(v) => toggle(i.id, Boolean(v))} />
                <span className={i.done ? "line-through text-muted-foreground" : ""}>{i.text}</span>
              </label>
              <Button size="sm" variant="outline" onClick={() => remove(i.id)}>
                Remove
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
