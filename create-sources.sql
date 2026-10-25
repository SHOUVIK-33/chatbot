/*
# Create sources and messages tables (single-tenant, no auth)

## What this migration does

This creates the data layer for a NotebookLM-style AI assistant where a user
uploads PDF/TXT documents and pastes notes, then chats with an AI grounded in
those sources. There is no sign-in screen, so the app operates as a single
shared workspace and the anon-key frontend reads and writes as `anon`.

## New tables

1. `sources`
   - `id` (uuid, primary key)
   - `name` (text, not null) — display name (filename or "Note N")
   - `kind` (text, not null) — one of 'pdf', 'txt', 'note'
   - `page` (integer, nullable) — page number for PDF page chunks, null otherwise
   - `content` (text, not null) — extracted/chunked text for retrieval
   - `created_at` (timestamptz, default now())

2. `messages`
   - `id` (uuid, primary key)
   - `role` (text, not null) — one of 'user', 'assistant'
   - `content` (text, not null) — message text
   - `citations` (jsonb, nullable) — array of {id, name, page} for assistant messages
   - `created_at` (timestamptz, default now())

## Security

- RLS enabled on both tables.
- CRUD granted to `anon` and `authenticated` (no-auth app: data is intentionally shared).
- Permissive `USING (true)` / `WITH CHECK (true)` policies are acceptable here
  because the workspace is intentionally public/shared and there are no user
  accounts. This is documented as the intended design, not a shortcut.
- `service_role` granted CRUD on both tables for the chat edge function, which
  reads `sources` and inserts `messages` on the server using the service key.
*/

CREATE TABLE IF NOT EXISTS sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('pdf', 'txt', 'note')),
  page integer,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE sources ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON sources TO anon, authenticated, service_role;

DROP POLICY IF EXISTS "anon_select_sources" ON sources;
CREATE POLICY "anon_select_sources" ON sources FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_sources" ON sources;
CREATE POLICY "anon_insert_sources" ON sources FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_sources" ON sources;
CREATE POLICY "anon_update_sources" ON sources FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_sources" ON sources;
CREATE POLICY "anon_delete_sources" ON sources FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  citations jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON messages TO anon, authenticated, service_role;

DROP POLICY IF EXISTS "anon_select_messages" ON messages;
CREATE POLICY "anon_select_messages" ON messages FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_messages" ON messages;
CREATE POLICY "anon_insert_messages" ON messages FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_messages" ON messages;
CREATE POLICY "anon_update_messages" ON messages FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_messages" ON messages;
CREATE POLICY "anon_delete_messages" ON messages FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS sources_created_at_idx ON sources (created_at);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON messages (created_at);
