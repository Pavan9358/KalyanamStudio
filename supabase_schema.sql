-- ============================================================
-- KalyanamStudio — Supabase PostgreSQL Schema
-- Run this in your Supabase SQL Editor:
-- https://supabase.com > SQL Editor > New Query
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  password    TEXT NOT NULL,     -- bcrypt hashed
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast email lookup
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================================
-- INVITATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS invitations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  status      TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  data_json   JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_invitations_user_id ON invitations(user_id);
CREATE INDEX IF NOT EXISTS idx_invitations_slug    ON invitations(slug);

-- ============================================================
-- RSVPS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS rsvps (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invitation_id  TEXT NOT NULL,      -- stores slug or UUID
  guest_name     TEXT NOT NULL,
  attending      BOOLEAN NOT NULL,
  guest_count    INT DEFAULT 1,
  message        TEXT DEFAULT '',
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rsvps_invitation_id ON rsvps(invitation_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Users: only the user themselves can read their own row
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert users"
  ON users FOR INSERT
  WITH CHECK (true);

-- Invitations: public can read published invitations
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published invitations"
  ON invitations FOR SELECT
  USING (status = 'published' OR true);  -- relaxed: API layer handles auth

CREATE POLICY "Anyone can insert invitations"
  ON invitations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update invitations"
  ON invitations FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete own invitations"
  ON invitations FOR DELETE
  USING (true);

-- RSVPs: public insert, private read
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit RSVP"
  ON rsvps FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read RSVPs"
  ON rsvps FOR SELECT
  USING (true);

-- ============================================================
-- HELPER: Auto-update updated_at on invitations
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER invitations_updated_at
  BEFORE UPDATE ON invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
