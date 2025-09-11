import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Post, Comment as Cmt, HelpRequest, Message, Room, LeaderboardEntry } from "@shared/api";
import { getUserId, getUserRole, setUserRole } from "@/lib/user";

function fetchJSON<T>(input: RequestInfo, init?: RequestInit) {
  return fetch(input, init).then((r) => {
    if (!r.ok) throw new Error("request failed");
    return r.json() as Promise<T>;
  });
}

function PostComposer() {
  const qc = useQueryClient();
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [visibility, setVisibility] = useState("public");
  const m = useMutation({
    mutationFn: async () => {
      const userId = getUserId();
      const b = { userId, content, imageUrl: imageUrl || undefined, linkUrl: linkUrl || undefined, visibility };
      await fetchJSON<{ id: number }>("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": userId },
        body: JSON.stringify(b),
      });
    },
    onSuccess: () => {
      setContent(""); setImageUrl(""); setLinkUrl("");
      qc.invalidateQueries({ queryKey: ["feed"] });
    },
  });
  return (
    <Card>
      <CardHeader>
        <CardTitle>Share an update</CardTitle>
        <CardDescription>Text, image URL, or link</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="What did you learn today?" />
        <div className="grid gap-2 sm:grid-cols-2">
          <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Optional image URL" />
          <Input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="Optional link URL" />
        </div>
        <div className="flex items-center gap-2">
          <Select value={visibility} onValueChange={setVisibility}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Visibility" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="community">Community</SelectItem>
              <SelectItem value="private">Private</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => m.mutate()} disabled={!content.trim() || m.isPending}>{m.isPending ? "Posting..." : "Post"}</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function LikeButton({ postId, count }: { postId: number; count: number }) {
  const qc = useQueryClient();
  const m = useMutation({
    mutationFn: async () => {
      const userId = getUserId();
      await fetchJSON<{ liked: boolean }>(`/api/community/posts/${postId}/like`, { method: "POST", headers: { "x-user-id": userId } });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["feed"] }),
  });
  return (
    <Button size="sm" variant="outline" onClick={() => m.mutate()} aria-label="Like post">❤��� {count}</Button>
  );
}

function Comments({ postId }: { postId: number }) {
  const userId = getUserId();
  const qc = useQueryClient();
  const { data } = useQuery<{ comments: Cmt[] }>({ queryKey: ["comments", postId], queryFn: () => fetchJSON(`/api/community/posts/${postId}/comments`) });
  const [text, setText] = useState("");
  const m = useMutation({
    mutationFn: async () => {
      await fetchJSON(`/api/community/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": userId },
        body: JSON.stringify({ content: text }),
      });
    },
    onSuccess: () => { setText(""); qc.invalidateQueries({ queryKey: ["comments", postId] }); },
  });
  return (
    <div className="mt-3 space-y-2">
      <div className="flex gap-2">
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a comment" />
        <Button onClick={() => m.mutate()} disabled={!text.trim()}>Reply</Button>
      </div>
      <ul className="space-y-2">
        {data?.comments?.map((c) => (
          <li key={c.id} className="rounded-md border p-2 text-sm">
            <div className="text-muted-foreground text-xs">{new Date(c.createdAt).toLocaleString()}</div>
            <div>{c.content}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Feed() {
  const { data, isLoading } = useQuery<{ posts: Post[] }>({ queryKey: ["feed"], queryFn: () => fetchJSON("/api/community/feed") });
  return (
    <Card>
      <CardHeader>
        <CardTitle>Community Feed</CardTitle>
        <CardDescription>Share progress, ask questions, and celebrate wins</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? <div>Loading…</div> : null}
        {data?.posts?.map((p) => (
          <div key={p.id} className="rounded-lg border p-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div>{p.author?.name || "Anonymous"} {p.author?.role ? `· ${p.author.role}` : ""}</div>
              <div>{new Date(p.createdAt).toLocaleString()}</div>
            </div>
            <div className="mt-2 whitespace-pre-wrap">{p.content}</div>
            {p.imageUrl ? (
              <img src={p.imageUrl} alt="post" className="mt-2 max-h-64 w-full rounded object-cover" />
            ) : null}
            {p.linkUrl ? (
              <a href={p.linkUrl} target="_blank" rel="noreferrer" className="mt-2 block underline underline-offset-4">{p.linkUrl}</a>
            ) : null}
            <div className="mt-3 flex items-center gap-2">
              <LikeButton postId={p.id} count={p.likeCount} />
            </div>
            <Comments postId={p.id} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function HelpRequests() {
  const qc = useQueryClient();
  const { data } = useQuery<{ requests: HelpRequest[] }>({ queryKey: ["help"], queryFn: () => fetchJSON("/api/community/help-requests") });
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const m = useMutation({
    mutationFn: async () => {
      const userId = getUserId();
      await fetchJSON<{ id: number }>("/api/community/help-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": userId },
        body: JSON.stringify({ title, body }),
      });
    },
    onSuccess: () => { setTitle(""); setBody(""); qc.invalidateQueries({ queryKey: ["help"] }); },
  });
  return (
    <Card>
      <CardHeader>
        <CardTitle>Help Requests</CardTitle>
        <CardDescription>Ask for advice or resources</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-2 sm:grid-cols-2">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
          <Input value={body} onChange={(e) => setBody(e.target.value)} placeholder="Describe what you need" />
        </div>
        <Button onClick={() => m.mutate()} disabled={!title.trim() || !body.trim()}>Request help</Button>
        <ul className="space-y-2">
          {data?.requests?.map((r) => (
            <li key={r.id} className="rounded-md border p-3">
              <div className="text-sm font-medium">{r.title}</div>
              <div className="text-sm text-muted-foreground">{r.body}</div>
              <div className="mt-1 text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function ChatRooms() {
  const userId = getUserId();
  const { data: rooms } = useQuery<{ rooms: Room[] }>({ queryKey: ["rooms"], queryFn: () => fetchJSON("/api/community/rooms") });
  const [roomId, setRoomId] = useState<number | null>(null);
  useEffect(() => {
    if (!roomId && rooms?.rooms?.[0]) setRoomId(rooms.rooms[0].id);
  }, [rooms, roomId]);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Chat Rooms</CardTitle>
        <CardDescription>Topic-based discussions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-3">
          <Select value={roomId ? String(roomId) : undefined} onValueChange={(v) => setRoomId(Number(v))}>
            <SelectTrigger className="w-64"><SelectValue placeholder="Select a room" /></SelectTrigger>
            <SelectContent>
              {rooms?.rooms?.map((r) => (
                <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {roomId ? <ChatRoom roomId={roomId} userId={userId} /> : <div className="text-sm text-muted-foreground">Select a room</div>}
      </CardContent>
    </Card>
  );
}

function ChatRoom({ roomId, userId }: { roomId: number; userId: string }) {
  const qc = useQueryClient();
  const [since, setSince] = useState<string | null>(null);
  const { data } = useQuery<{ messages: Message[] }>({
    queryKey: ["messages", roomId, since],
    queryFn: () => fetchJSON(`/api/community/rooms/${roomId}/messages${since ? `?since=${encodeURIComponent(since)}` : ""}`),
    refetchInterval: 3000,
  });
  const messages = data?.messages ?? [];
  useEffect(() => {
    if (messages.length) setSince(messages[messages.length - 1].createdAt);
  }, [messages.length]);
  const [text, setText] = useState("");
  const m = useMutation({
    mutationFn: async () => {
      await fetchJSON(`/api/community/rooms/${roomId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": userId },
        body: JSON.stringify({ body: text }),
      });
    },
    onSuccess: () => { setText(""); qc.invalidateQueries({ queryKey: ["messages", roomId] }); },
  });
  const bottomRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);
  return (
    <div className="rounded-md border p-3">
      <div className="h-64 overflow-y-auto space-y-2">
        {messages.map((m) => (
          <div key={m.id} className="text-sm">
            <span className="text-xs text-muted-foreground">{new Date(m.createdAt).toLocaleTimeString()} · </span>
            <span>{m.body}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="mt-2 flex gap-2">
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message" />
        <Button onClick={() => m.mutate()} disabled={!text.trim()}>Send</Button>
      </div>
    </div>
  );
}

function Leaderboard() {
  const { data } = useQuery<{ leaderboard: LeaderboardEntry[] }>({ queryKey: ["leaderboard"], queryFn: () => fetchJSON("/api/community/leaderboard") });
  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Leaderboard</CardTitle>
        <CardDescription>Stay motivated with friendly competition</CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="space-y-2">
          {data?.leaderboard?.map((e, i) => (
            <li key={e.userId} className="flex items-center justify-between rounded-md border p-2">
              <span className="text-sm">{i + 1}. {e.name || e.userId.slice(0, 6)} {e.role ? `· ${e.role}` : ""}</span>
              <span className="text-sm font-medium">{e.points} pts</span>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}

export default function Community() {
  const [tab, setTab] = useState<"feed" | "help" | "chat" | "leaderboard">("feed");
  const role = getUserRole();
  const [roleSel, setRoleSel] = useState<string | undefined>(role);
  useEffect(() => {
    if (roleSel) setUserRole(roleSel as any);
  }, [roleSel]);
  // On mount, ensure profile exists
  useEffect(() => {
    const userId = getUserId();
    fetch("/api/community/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role: roleSel })
    }).catch(() => {});
  }, [roleSel]);

  return (
    <section className="container py-12">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Community</h1>
            <p className="text-muted-foreground">Learn together, grow faster</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">I am a</span>
            <Select value={roleSel} onValueChange={setRoleSel}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Select role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="graduate">Recent Graduate</SelectItem>
                <SelectItem value="professional">Industry Professional</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {tab === "feed" ? (
          <>
            <PostComposer />
            <Feed />
          </>
        ) : null}
        {tab === "help" ? <HelpRequests /> : null}
        {tab === "chat" ? <ChatRooms /> : null}
        {tab === "leaderboard" ? <Leaderboard /> : null}

        <div className="flex justify-center gap-2">
          <Button variant={tab === "feed" ? "default" : "outline"} onClick={() => setTab("feed")}>Feed</Button>
          <Button variant={tab === "help" ? "default" : "outline"} onClick={() => setTab("help")}>Help</Button>
          <Button variant={tab === "chat" ? "default" : "outline"} onClick={() => setTab("chat")}>Chat</Button>
          <Button variant={tab === "leaderboard" ? "default" : "outline"} onClick={() => setTab("leaderboard")}>Leaderboard</Button>
        </div>
      </div>
    </section>
  );
}
