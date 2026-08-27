-- DraperU India Founder Intelligence Platform — PostgreSQL / Supabase Schema
-- Run this script in the Supabase SQL editor to create the production database.

-- 1. Custom Types & Enums
CREATE TYPE startup_stage_enum AS ENUM ('Idea', 'MVP', 'Early Traction', 'Growth', 'Scaling');
CREATE TYPE funding_stage_enum AS ENUM ('Bootstrapped', 'Pre-Seed', 'Seed', 'Pre-Series A', 'Series A', 'Series B+', 'Growth');
CREATE TYPE draper_relationship_enum AS ENUM ('Community member', 'Event attendee', 'Founder program', 'Mentor', 'Investor', 'Partner', 'Alumni');
CREATE TYPE interaction_type_enum AS ENUM ('event_registration', 'event_attendance', 'call', 'email', 'meeting', 'investor_intro', 'program_application', 'note', 'milestone');
CREATE TYPE followup_status_enum AS ENUM ('overdue', 'today', 'this_week', 'upcoming', 'completed');
CREATE TYPE priority_level_enum AS ENUM ('critical', 'high', 'medium', 'low');

-- 2. Founders Table
CREATE TABLE IF NOT EXISTS founders (
    id VARCHAR(32) PRIMARY KEY, -- e.g. DRU-F-000124
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(64) NOT NULL,
    whatsapp VARCHAR(64),
    linkedin VARCHAR(512),
    twitter VARCHAR(255),
    location VARCHAR(255) NOT NULL,
    designation VARCHAR(255) NOT NULL DEFAULT 'Founder & CEO',
    avatar_url TEXT,
    bio TEXT,
    
    -- Startup embedded fields
    startup_name VARCHAR(255) NOT NULL,
    startup_website VARCHAR(512),
    startup_sector VARCHAR(128) NOT NULL,
    startup_sub_sector VARCHAR(128),
    startup_founded_year INT,
    startup_stage startup_stage_enum DEFAULT 'Early Traction',
    startup_team_size VARCHAR(64) DEFAULT '1-5',
    startup_business_model VARCHAR(64) DEFAULT 'B2B',
    startup_problem TEXT,
    startup_solution TEXT,
    startup_pitch_deck_url TEXT,

    -- Funding details
    funding_type VARCHAR(64) DEFAULT 'Funded',
    funding_stage funding_stage_enum DEFAULT 'Seed',
    amount_raised VARCHAR(64),
    currency VARCHAR(16) DEFAULT 'USD',
    investors TEXT[] DEFAULT '{}',
    currently_fundraising BOOLEAN DEFAULT false,
    target_amount VARCHAR(64),
    last_round_date VARCHAR(64),

    -- DraperU Relationship
    relationship draper_relationship_enum DEFAULT 'Community member',
    is_high_priority BOOLEAN DEFAULT false,
    tags TEXT[] DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. DraperU Events Table
CREATE TABLE IF NOT EXISTS events (
    id VARCHAR(64) PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    tagline VARCHAR(512),
    description TEXT,
    date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    venue VARCHAR(255) NOT NULL,
    city VARCHAR(128) NOT NULL,
    banner_url TEXT,
    category VARCHAR(64) NOT NULL,
    status VARCHAR(32) DEFAULT 'upcoming',
    capacity INT DEFAULT 100,
    allow_walkins BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Event Registrations Table
CREATE TABLE IF NOT EXISTS event_registrations (
    id VARCHAR(64) PRIMARY KEY,
    event_id VARCHAR(64) REFERENCES events(id) ON DELETE CASCADE,
    founder_id VARCHAR(32) REFERENCES founders(id) ON DELETE CASCADE,
    is_new_founder BOOLEAN DEFAULT false,
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    checked_in BOOLEAN DEFAULT false,
    checked_in_at TIMESTAMPTZ,
    source VARCHAR(64) DEFAULT 'QR Scan',
    notes TEXT,
    UNIQUE(event_id, founder_id)
);

-- 5. Interactions & Activity Timeline
CREATE TABLE IF NOT EXISTS interactions (
    id VARCHAR(64) PRIMARY KEY,
    founder_id VARCHAR(32) REFERENCES founders(id) ON DELETE CASCADE,
    type interaction_type_enum NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date TIMESTAMPTZ DEFAULT NOW(),
    created_by VARCHAR(255) NOT NULL DEFAULT 'System Automation',
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 6. Follow-up Tasks Table
CREATE TABLE IF NOT EXISTS follow_ups (
    id VARCHAR(64) PRIMARY KEY,
    founder_id VARCHAR(32) REFERENCES founders(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    assigned_to VARCHAR(255) NOT NULL DEFAULT 'Anshi',
    status followup_status_enum DEFAULT 'upcoming',
    priority priority_level_enum DEFAULT 'high',
    event_id VARCHAR(64) REFERENCES events(id) ON DELETE SET NULL,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Indexes for High-Velocity Searching
CREATE INDEX IF NOT EXISTS idx_founders_email ON founders(email);
CREATE INDEX IF NOT EXISTS idx_founders_phone ON founders(phone);
CREATE INDEX IF NOT EXISTS idx_founders_sector ON founders(startup_sector);
CREATE INDEX IF NOT EXISTS idx_founders_location ON founders(location);
CREATE INDEX IF NOT EXISTS idx_event_reg_event_id ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_reg_founder_id ON event_registrations(founder_id);
CREATE INDEX IF NOT EXISTS idx_interactions_founder ON interactions(founder_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_due ON follow_ups(due_date);

-- 8. Auto-ID generator Sequence & Function
CREATE SEQUENCE IF NOT EXISTS dru_founder_seq START WITH 135;

CREATE OR REPLACE FUNCTION generate_dru_founder_id() 
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.id IS NULL OR NEW.id = '' THEN
    NEW.id := 'DRU-F-' || LPAD(nextval('dru_founder_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_set_dru_founder_id
BEFORE INSERT ON founders
FOR EACH ROW
EXECUTE FUNCTION generate_dru_founder_id();
