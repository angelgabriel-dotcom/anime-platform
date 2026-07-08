-- Migration: 001_create_characters.sql
-- Creates the characters and special_abilities tables

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Characters ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS characters (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name             VARCHAR(100)  NOT NULL,
    series           VARCHAR(100)  NOT NULL,
    image_url        TEXT          NOT NULL DEFAULT '',
    tier             VARCHAR(10)   NOT NULL CHECK (tier IN ('GOD','S','A','B','C')),
    lore             TEXT          NOT NULL DEFAULT '',
    tags             TEXT[]        NOT NULL DEFAULT '{}',

    -- Power attributes (0–10000 scale)
    strength         INT NOT NULL DEFAULT 0 CHECK (strength    BETWEEN 0 AND 10000),
    speed            INT NOT NULL DEFAULT 0 CHECK (speed       BETWEEN 0 AND 10000),
    defense          INT NOT NULL DEFAULT 0 CHECK (defense     BETWEEN 0 AND 10000),
    intelligence     INT NOT NULL DEFAULT 0 CHECK (intelligence BETWEEN 0 AND 10000),
    endurance        INT NOT NULL DEFAULT 0 CHECK (endurance   BETWEEN 0 AND 10000),
    aura             INT NOT NULL DEFAULT 0 CHECK (aura        BETWEEN 0 AND 10000),
    critical_rate    INT NOT NULL DEFAULT 0 CHECK (critical_rate BETWEEN 0 AND 100),
    evasion_rate     INT NOT NULL DEFAULT 0 CHECK (evasion_rate  BETWEEN 0 AND 100),

    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Special Abilities ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS special_abilities (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_id    UUID         NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    description     TEXT         NOT NULL DEFAULT '',
    mana_cost       INT          NOT NULL DEFAULT 0,
    stamina_cost    INT          NOT NULL DEFAULT 0,
    damage_multi    NUMERIC(5,2) NOT NULL DEFAULT 1.0,
    cooldown_turns  INT          NOT NULL DEFAULT 0,
    ability_type    VARCHAR(20)  NOT NULL DEFAULT 'attack'
                        CHECK (ability_type IN ('attack','buff','debuff','heal','passive'))
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_characters_series ON characters(series);
CREATE INDEX IF NOT EXISTS idx_characters_tier   ON characters(tier);
CREATE INDEX IF NOT EXISTS idx_abilities_char_id ON special_abilities(character_id);

-- ── Auto-update updated_at ────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_characters_updated_at
    BEFORE UPDATE ON characters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
