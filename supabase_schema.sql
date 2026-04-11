-- ============================================================
-- KalyanamStudio — Idempotent Supabase PostgreSQL Schema
-- Updated: Added DROP POLICY IF EXISTS to prevent "Already Exists" errors.
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  password    TEXT NOT NULL,     -- bcrypt hashed
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS rsvps (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invitation_id  TEXT NOT NULL,      -- stores slug or UUID
  guest_name     TEXT NOT NULL,
  attending      BOOLEAN NOT NULL,
  guest_count    INT DEFAULT 1,
  message        TEXT DEFAULT '',
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_invitations_user_id ON invitations(user_id);
CREATE INDEX IF NOT EXISTS idx_invitations_slug    ON invitations(slug);
CREATE INDEX IF NOT EXISTS idx_rsvps_invitation_id ON rsvps(invitation_id);

-- ============================================================
-- 3. ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies before creating to avoid "Already Exists" errors
DO $$ 
BEGIN
    -- Users Table Policies
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can read own data' AND tablename = 'users') THEN
        DROP POLICY "Users can read own data" ON users;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can insert users' AND tablename = 'users') THEN
        DROP POLICY "Anyone can insert users" ON users;
    END IF;
    
    -- Invitations Table Policies
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can read published invitations' AND tablename = 'invitations') THEN
        DROP POLICY "Public can read published invitations" ON invitations;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can insert invitations' AND tablename = 'invitations') THEN
        DROP POLICY "Anyone can insert invitations" ON invitations;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can update invitations' AND tablename = 'invitations') THEN
        DROP POLICY "Anyone can update invitations" ON invitations;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can delete own invitations' AND tablename = 'invitations') THEN
        DROP POLICY "Anyone can delete own invitations" ON invitations;
    END IF;
    
    -- RSVPs Table Policies
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can submit RSVP' AND tablename = 'rsvps') THEN
        DROP POLICY "Anyone can submit RSVP" ON rsvps;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can read RSVPs' AND tablename = 'rsvps') THEN
        DROP POLICY "Anyone can read RSVPs" ON rsvps;
    END IF;
END $$;

-- Re-create Policies
CREATE POLICY "Users can read own data" ON users FOR SELECT USING (true);
CREATE POLICY "Anyone can insert users" ON users FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can read published invitations" ON invitations FOR SELECT USING (true);
CREATE POLICY "Anyone can insert invitations" ON invitations FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update invitations" ON invitations FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete own invitations" ON invitations FOR DELETE USING (true);

CREATE POLICY "Anyone can submit RSVP" ON rsvps FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read RSVPs" ON rsvps FOR SELECT USING (true);

-- ============================================================
-- 4. TRIGGERS (Auto-update updated_at)
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS invitations_updated_at ON invitations;
CREATE TRIGGER invitations_updated_at
  BEFORE UPDATE ON invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- SCHEMA UPDATED SUCCESSFULLY
-- ============================================================
