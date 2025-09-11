import { getPool } from "./pool";

export async function ensureCommunitySchema() {
  const p = getPool();
  await p.query(`
    CREATE TABLE IF NOT EXISTS profiles (
      user_id TEXT PRIMARY KEY,
      name TEXT,
      role TEXT,
      bio TEXT,
      skills TEXT[],
      goals TEXT[],
      avatar_url TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS posts (
      id BIGSERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      author_id TEXT REFERENCES profiles(user_id) ON DELETE SET NULL,
      content TEXT NOT NULL,
      image_url TEXT,
      link_url TEXT,
      visibility TEXT DEFAULT 'public'
    );

    CREATE TABLE IF NOT EXISTS post_likes (
      post_id BIGINT REFERENCES posts(id) ON DELETE CASCADE,
      user_id TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (post_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS comments (
      id BIGSERIAL PRIMARY KEY,
      post_id BIGINT REFERENCES posts(id) ON DELETE CASCADE,
      parent_id BIGINT,
      author_id TEXT REFERENCES profiles(user_id) ON DELETE SET NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS help_requests (
      id BIGSERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      author_id TEXT REFERENCES profiles(user_id) ON DELETE SET NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      tags TEXT[],
      status TEXT DEFAULT 'open'
    );

    CREATE TABLE IF NOT EXISTS help_replies (
      id BIGSERIAL PRIMARY KEY,
      request_id BIGINT REFERENCES help_requests(id) ON DELETE CASCADE,
      author_id TEXT REFERENCES profiles(user_id) ON DELETE SET NULL,
      body TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS rooms (
      id BIGSERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      topic TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS messages (
      id BIGSERIAL PRIMARY KEY,
      room_id BIGINT REFERENCES rooms(id) ON DELETE CASCADE,
      author_id TEXT REFERENCES profiles(user_id) ON DELETE SET NULL,
      body TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS badges (
      user_id TEXT REFERENCES profiles(user_id) ON DELETE CASCADE,
      badge TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS reports (
      id BIGSERIAL PRIMARY KEY,
      type TEXT NOT NULL,
      ref_id TEXT NOT NULL,
      reason TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
    CREATE INDEX IF NOT EXISTS idx_messages_room_id ON messages(room_id, created_at);
  `);
}
