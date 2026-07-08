-- Migration: 002_create_combat_logs.sql
-- Creates the combat_logs table and leaderboard view

-- ── Combat Logs ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS combat_logs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    challenger_id   UUID        NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    opponent_id     UUID        NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    winner_id       UUID        NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    mode            VARCHAR(20) NOT NULL DEFAULT 'quick'
                        CHECK (mode IN ('quick','ranked','story')),
    total_rounds    INT         NOT NULL DEFAULT 0,
    rounds          JSONB       NOT NULL DEFAULT '[]',  -- full RoundLog array
    duration_ms     NUMERIC(10,3) NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_combat_logs_challenger ON combat_logs(challenger_id);
CREATE INDEX IF NOT EXISTS idx_combat_logs_opponent   ON combat_logs(opponent_id);
CREATE INDEX IF NOT EXISTS idx_combat_logs_winner     ON combat_logs(winner_id);
CREATE INDEX IF NOT EXISTS idx_combat_logs_created_at ON combat_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_combat_logs_mode       ON combat_logs(mode);

-- ── Leaderboard View ──────────────────────────────────────────────────────────
-- Pre-computes win rate and total battles per character.
-- Query this view instead of aggregating combat_logs every time.
CREATE OR REPLACE VIEW leaderboard AS
SELECT
    c.id,
    c.name,
    c.series,
    c.tier,
    c.image_url,
    -- power total (weighted — mirrors Go PowerTotal() method)
    (c.strength + c.speed + c.defense + c.intelligence +
     c.endurance + c.aura + c.critical_rate * 10 + c.evasion_rate * 5) AS power_total,

    COUNT(cl.id)                                         AS total_battles,
    COUNT(CASE WHEN cl.winner_id = c.id THEN 1 END)     AS total_wins,

    ROUND(
        COUNT(CASE WHEN cl.winner_id = c.id THEN 1 END)::NUMERIC
        / NULLIF(COUNT(cl.id), 0) * 100, 2
    )                                                    AS win_rate

FROM characters c
LEFT JOIN combat_logs cl
    ON cl.challenger_id = c.id OR cl.opponent_id = c.id
GROUP BY c.id
ORDER BY power_total DESC, win_rate DESC;
