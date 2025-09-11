import type { Request, Response } from "express";
import { getPool } from "../services/pool";
import { ensureCommunitySchema } from "../services/community-schema";

function getUserId(req: Request): string | null {
  const h = (req.headers["x-user-id"] as string) || null;
  const q = (req.query["userId"] as string) || null;
  const b = (req.body && (req.body.userId as string)) || null;
  return h || q || b || null;
}

export async function handleUpsertProfile(req: Request, res: Response) {
  try {
    await ensureCommunitySchema();
    const p = getPool();
    const { userId, name, role, bio, skills, goals, avatarUrl } =
      req.body || {};
    if (!userId) return res.status(400).json({ error: "userId required" });
    await p.query(
      `INSERT INTO profiles(user_id, name, role, bio, skills, goals, avatar_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (user_id)
       DO UPDATE SET name=EXCLUDED.name, role=EXCLUDED.role, bio=EXCLUDED.bio, skills=EXCLUDED.skills, goals=EXCLUDED.goals, avatar_url=EXCLUDED.avatar_url`,
      [
        userId,
        name ?? null,
        role ?? null,
        bio ?? null,
        skills ?? null,
        goals ?? null,
        avatarUrl ?? null,
      ],
    );
    const r = await p.query(
      `SELECT user_id as "userId", name, role, bio, skills, goals, avatar_url as "avatarUrl", created_at as "createdAt" FROM profiles WHERE user_id=$1`,
      [userId],
    );
    res.json({ profile: r.rows[0] || null });
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
}

export async function handleGetProfile(req: Request, res: Response) {
  try {
    await ensureCommunitySchema();
    const p = getPool();
    const { id } = req.params;
    const r = await p.query(
      `SELECT user_id as "userId", name, role, bio, skills, goals, avatar_url as "avatarUrl", created_at as "createdAt" FROM profiles WHERE user_id=$1`,
      [id],
    );
    res.json({ profile: r.rows[0] || null });
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
}

export async function handleCreatePost(req: Request, res: Response) {
  try {
    await ensureCommunitySchema();
    const p = getPool();
    const userId = getUserId(req);
    const { content, imageUrl, linkUrl, visibility } = req.body || {};
    if (!content || String(content).trim().length === 0)
      return res.status(400).json({ error: "content required" });
    const r = await p.query(
      `INSERT INTO posts(author_id, content, image_url, link_url, visibility)
       VALUES ($1,$2,$3,$4,$5) RETURNING id`,
      [
        userId,
        content,
        imageUrl ?? null,
        linkUrl ?? null,
        visibility ?? "public",
      ],
    );
    res.json({ id: r.rows[0].id });
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
}

export async function handleFeed(req: Request, res: Response) {
  try {
    await ensureCommunitySchema();
    const p = getPool();
    const limit = Math.min(parseInt(String(req.query.limit || 20)), 50) || 20;
    const r = await p.query(
      `SELECT 
        po.id,
        po.created_at as "createdAt",
        po.author_id as "authorId",
        po.content,
        po.image_url as "imageUrl",
        po.link_url as "linkUrl",
        po.visibility,
        COALESCE(pl.cnt,0) as "likeCount",
        COALESCE(cm.cnt,0) as "commentCount",
        pr.user_id as "author.userId",
        pr.name as "author.name",
        pr.role as "author.role",
        pr.avatar_url as "author.avatarUrl"
      FROM posts po
      LEFT JOIN (
        SELECT post_id, COUNT(*) cnt FROM post_likes GROUP BY post_id
      ) pl ON pl.post_id=po.id
      LEFT JOIN (
        SELECT post_id, COUNT(*) cnt FROM comments GROUP BY post_id
      ) cm ON cm.post_id=po.id
      LEFT JOIN profiles pr ON pr.user_id=po.author_id
      ORDER BY po.created_at DESC
      LIMIT $1`,
      [limit],
    );
    const rows = r.rows.map((row) => {
      const author = row["author.userId"]
        ? {
            userId: row["author.userId"],
            name: row["author.name"],
            role: row["author.role"],
            avatarUrl: row["author.avatarUrl"],
          }
        : null;
      delete row["author.userId"];
      delete row["author.name"];
      delete row["author.role"];
      delete row["author.avatarUrl"];
      return { ...row, author };
    });
    res.json({ posts: rows });
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
}

export async function handleToggleLike(req: Request, res: Response) {
  try {
    await ensureCommunitySchema();
    const p = getPool();
    const userId = getUserId(req);
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    if (!userId) return res.status(400).json({ error: "userId required" });
    const ex = await p.query(
      `SELECT 1 FROM post_likes WHERE post_id=$1 AND user_id=$2`,
      [id, userId],
    );
    if (ex.rowCount) {
      await p.query(`DELETE FROM post_likes WHERE post_id=$1 AND user_id=$2`, [
        id,
        userId,
      ]);
      return res.json({ liked: false });
    } else {
      await p.query(`INSERT INTO post_likes(post_id, user_id) VALUES ($1,$2)`, [
        id,
        userId,
      ]);
      return res.json({ liked: true });
    }
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
}

export async function handleComments(req: Request, res: Response) {
  try {
    await ensureCommunitySchema();
    const p = getPool();
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    const r = await p.query(
      `SELECT c.id, c.post_id as "postId", c.parent_id as "parentId", c.created_at as "createdAt", c.author_id as "authorId", c.content,
              pr.user_id as "author.userId", pr.name as "author.name", pr.role as "author.role", pr.avatar_url as "author.avatarUrl"
       FROM comments c
       LEFT JOIN profiles pr ON pr.user_id=c.author_id
       WHERE c.post_id=$1
       ORDER BY c.created_at ASC`,
      [id],
    );
    const rows = r.rows.map((row) => {
      const author = row["author.userId"]
        ? {
            userId: row["author.userId"],
            name: row["author.name"],
            role: row["author.role"],
            avatarUrl: row["author.avatarUrl"],
          }
        : null;
      delete row["author.userId"];
      delete row["author.name"];
      delete row["author.role"];
      delete row["author.avatarUrl"];
      return { ...row, author };
    });
    res.json({ comments: rows });
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
}

export async function handleCreateComment(req: Request, res: Response) {
  try {
    await ensureCommunitySchema();
    const p = getPool();
    const id = Number(req.params.id);
    const userId = getUserId(req);
    const { content, parentId } = req.body || {};
    if (!id) return res.status(400).json({ error: "invalid id" });
    if (!content) return res.status(400).json({ error: "content required" });
    await p.query(
      `INSERT INTO comments(post_id, parent_id, author_id, content) VALUES ($1,$2,$3,$4)`,
      [id, parentId ?? null, userId, content],
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
}

export async function handleHelpList(req: Request, res: Response) {
  try {
    await ensureCommunitySchema();
    const p = getPool();
    const r = await p.query(
      `SELECT id, created_at as "createdAt", author_id as "authorId", title, body, tags, status FROM help_requests ORDER BY created_at DESC LIMIT 50`,
    );
    res.json({ requests: r.rows });
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
}

export async function handleHelpCreate(req: Request, res: Response) {
  try {
    await ensureCommunitySchema();
    const p = getPool();
    const userId = getUserId(req);
    const { title, body, tags } = req.body || {};
    if (!title || !body)
      return res.status(400).json({ error: "title and body required" });
    const r = await p.query(
      `INSERT INTO help_requests(author_id, title, body, tags) VALUES ($1,$2,$3,$4) RETURNING id`,
      [userId, title, body, tags ?? null],
    );
    res.json({ id: r.rows[0].id });
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
}

export async function handleHelpReply(req: Request, res: Response) {
  try {
    await ensureCommunitySchema();
    const p = getPool();
    const userId = getUserId(req);
    const id = Number(req.params.id);
    const { body } = req.body || {};
    if (!id) return res.status(400).json({ error: "invalid id" });
    if (!body) return res.status(400).json({ error: "body required" });
    await p.query(
      `INSERT INTO help_replies(request_id, author_id, body) VALUES ($1,$2,$3)`,
      [id, userId, body],
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
}

export async function handleRooms(req: Request, res: Response) {
  try {
    await ensureCommunitySchema();
    const p = getPool();
    await p.query(
      `INSERT INTO rooms(name, topic)
       SELECT x.name, x.topic FROM (VALUES
         ('Python learners', 'Beginner to advanced Python discussions'),
         ('Product Management advice', 'Strategy, roadmapping, stakeholder mgmt')
       ) as x(name, topic)
       ON CONFLICT DO NOTHING`,
    );
    const r = await p.query(
      `SELECT id, name, topic, created_at as "createdAt" FROM rooms ORDER BY id ASC LIMIT 50`,
    );
    res.json({ rooms: r.rows });
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
}

export async function handleCreateRoom(req: Request, res: Response) {
  try {
    await ensureCommunitySchema();
    const p = getPool();
    const { name, topic } = req.body || {};
    if (!name) return res.status(400).json({ error: "name required" });
    const r = await p.query(
      `INSERT INTO rooms(name, topic) VALUES ($1,$2) RETURNING id`,
      [name, topic ?? null],
    );
    res.json({ id: r.rows[0].id });
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
}

export async function handleMessages(req: Request, res: Response) {
  try {
    await ensureCommunitySchema();
    const p = getPool();
    const roomId = Number(req.params.id);
    if (!roomId) return res.status(400).json({ error: "invalid room" });
    const since = req.query.since ? new Date(String(req.query.since)) : null;
    const r = await p.query(
      `SELECT id, room_id as "roomId", created_at as "createdAt", author_id as "authorId", body
       FROM messages
       WHERE room_id=$1 AND ($2::timestamptz IS NULL OR created_at > $2)
       ORDER BY created_at ASC
       LIMIT 200`,
      [roomId, since],
    );
    res.json({ messages: r.rows });
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
}

export async function handleCreateMessage(req: Request, res: Response) {
  try {
    await ensureCommunitySchema();
    const p = getPool();
    const roomId = Number(req.params.id);
    const userId = getUserId(req);
    const { body } = req.body || {};
    if (!roomId) return res.status(400).json({ error: "invalid room" });
    if (!body) return res.status(400).json({ error: "body required" });
    await p.query(
      `INSERT INTO messages(room_id, author_id, body) VALUES ($1,$2,$3)`,
      [roomId, userId, body],
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
}

export async function handleLeaderboard(req: Request, res: Response) {
  try {
    await ensureCommunitySchema();
    const p = getPool();
    const r = await p.query(
      `WITH recent_posts AS (
         SELECT author_id, COUNT(*) c FROM posts WHERE created_at > NOW() - INTERVAL '7 days' GROUP BY author_id
       ), recent_comments AS (
         SELECT author_id, COUNT(*) c FROM comments WHERE created_at > NOW() - INTERVAL '7 days' GROUP BY author_id
       ), recent_help AS (
         SELECT author_id, COUNT(*) c FROM help_replies WHERE created_at > NOW() - INTERVAL '7 days' GROUP BY author_id
       )
       SELECT 
         COALESCE(pr.user_id, 'anonymous') as "userId",
         pr.name,
         pr.role,
         COALESCE(rp.c,0)*5 + COALESCE(rc.c,0)*2 + COALESCE(rh.c,0)*3 as points
       FROM profiles pr
       LEFT JOIN recent_posts rp ON rp.author_id=pr.user_id
       LEFT JOIN recent_comments rc ON rc.author_id=pr.user_id
       LEFT JOIN recent_help rh ON rh.author_id=pr.user_id
       ORDER BY points DESC NULLS LAST
       LIMIT 20`,
    );
    res.json({ leaderboard: r.rows });
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
}

export async function handleReport(req: Request, res: Response) {
  try {
    await ensureCommunitySchema();
    const p = getPool();
    const { type, refId, reason } = req.body || {};
    if (!type || !refId)
      return res.status(400).json({ error: "type and refId required" });
    await p.query(
      `INSERT INTO reports(type, ref_id, reason) VALUES ($1,$2,$3)`,
      [type, refId, reason ?? null],
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
}
