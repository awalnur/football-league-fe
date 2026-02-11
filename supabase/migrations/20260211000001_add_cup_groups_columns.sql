-- ============================================
-- ADD ADDITIONAL CUP GROUPS COLUMNS
-- Date: 2026-02-11
-- ============================================

-- ============================================
-- 1. ALTER CUP_GROUPS TABLE
-- ============================================

-- Add qualifiers_count column to cup_groups
ALTER TABLE cup_groups
ADD COLUMN IF NOT EXISTS qualifiers_count INTEGER DEFAULT 2;

COMMENT ON COLUMN cup_groups.qualifiers_count IS 'Jumlah tim yang lolos dari grup ke babak knockout';

-- ============================================
-- 2. ALTER MATCHES TABLE
-- ============================================

-- Add cup_group_id column to link matches to specific groups
ALTER TABLE matches
ADD COLUMN IF NOT EXISTS cup_group_id UUID REFERENCES cup_groups(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_matches_cup_group ON matches(cup_group_id);

COMMENT ON COLUMN matches.cup_group_id IS 'Group assignment untuk pertandingan fase grup';

-- ============================================
-- 3. ALTER CUP_STANDINGS TABLE
-- ============================================

-- Add pos column for explicit ordering
ALTER TABLE cup_standings
ADD COLUMN IF NOT EXISTS pos INTEGER DEFAULT 0;

COMMENT ON COLUMN cup_standings.pos IS 'Posisi tim di grup (untuk ranking)';

-- ============================================
-- 4. ADD LEAGUES CHILD_LEAGUE_ID (if not exists)
-- ============================================

-- Add child_league_id for bidirectional hierarchy
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'leagues' AND column_name = 'child_league_id'
    ) THEN
        ALTER TABLE leagues
        ADD COLUMN child_league_id UUID REFERENCES leagues(id) ON DELETE SET NULL;

        COMMENT ON COLUMN leagues.child_league_id IS 'Liga di bawahnya (untuk sistem promosi/degradasi)';
    END IF;
END $$;

-- ============================================
-- 5. FUNCTION: Update Cup Standings after Match
-- ============================================

CREATE OR REPLACE FUNCTION update_cup_standings()
RETURNS TRIGGER AS $$
DECLARE
    v_cup_group_id UUID;
    v_home_team_id UUID;
    v_away_team_id UUID;
    v_home_score INTEGER;
    v_away_score INTEGER;
    v_home_points INTEGER;
    v_away_points INTEGER;
BEGIN
    -- Only process completed matches in group stage
    IF NEW.status = 'completed' AND NEW.cup_stage = 'group_stage' AND NEW.cup_group_id IS NOT NULL THEN
        v_cup_group_id := NEW.cup_group_id;
        v_home_team_id := NEW.home_team_id;
        v_away_team_id := NEW.away_team_id;
        v_home_score := COALESCE(NEW.home_score, 0);
        v_away_score := COALESCE(NEW.away_score, 0);

        -- Calculate points
        IF v_home_score > v_away_score THEN
            v_home_points := 3;
            v_away_points := 0;
        ELSIF v_home_score < v_away_score THEN
            v_home_points := 0;
            v_away_points := 3;
        ELSE
            v_home_points := 1;
            v_away_points := 1;
        END IF;

        -- Update or create home team cup standing
        INSERT INTO cup_standings (cup_group_id, team_id, played, won, drawn, lost, goals_for, goals_against, goal_difference, points)
        VALUES (
            v_cup_group_id,
            v_home_team_id,
            1,
            CASE WHEN v_home_score > v_away_score THEN 1 ELSE 0 END,
            CASE WHEN v_home_score = v_away_score THEN 1 ELSE 0 END,
            CASE WHEN v_home_score < v_away_score THEN 1 ELSE 0 END,
            v_home_score,
            v_away_score,
            v_home_score - v_away_score,
            v_home_points
        )
        ON CONFLICT (cup_group_id, team_id) DO UPDATE SET
            played = cup_standings.played + 1,
            won = cup_standings.won + CASE WHEN v_home_score > v_away_score THEN 1 ELSE 0 END,
            drawn = cup_standings.drawn + CASE WHEN v_home_score = v_away_score THEN 1 ELSE 0 END,
            lost = cup_standings.lost + CASE WHEN v_home_score < v_away_score THEN 1 ELSE 0 END,
            goals_for = cup_standings.goals_for + v_home_score,
            goals_against = cup_standings.goals_against + v_away_score,
            goal_difference = cup_standings.goals_for + v_home_score - (cup_standings.goals_against + v_away_score),
            points = cup_standings.points + v_home_points,
            updated_at = NOW();

        -- Update or create away team cup standing
        INSERT INTO cup_standings (cup_group_id, team_id, played, won, drawn, lost, goals_for, goals_against, goal_difference, points)
        VALUES (
            v_cup_group_id,
            v_away_team_id,
            1,
            CASE WHEN v_away_score > v_home_score THEN 1 ELSE 0 END,
            CASE WHEN v_home_score = v_away_score THEN 1 ELSE 0 END,
            CASE WHEN v_away_score < v_home_score THEN 1 ELSE 0 END,
            v_away_score,
            v_home_score,
            v_away_score - v_home_score,
            v_away_points
        )
        ON CONFLICT (cup_group_id, team_id) DO UPDATE SET
            played = cup_standings.played + 1,
            won = cup_standings.won + CASE WHEN v_away_score > v_home_score THEN 1 ELSE 0 END,
            drawn = cup_standings.drawn + CASE WHEN v_home_score = v_away_score THEN 1 ELSE 0 END,
            lost = cup_standings.lost + CASE WHEN v_away_score < v_home_score THEN 1 ELSE 0 END,
            goals_for = cup_standings.goals_for + v_away_score,
            goals_against = cup_standings.goals_against + v_home_score,
            goal_difference = cup_standings.goals_for + v_away_score - (cup_standings.goals_against + v_home_score),
            points = cup_standings.points + v_away_points,
            updated_at = NOW();

        -- Update poss in the group
        WITH ranked AS (
            SELECT
                id,
                ROW_NUMBER() OVER (
                    ORDER BY points DESC, goal_difference DESC, goals_for DESC
                ) as new_pos
            FROM cup_standings
            WHERE cup_group_id = v_cup_group_id
        )
        UPDATE cup_standings cs
        SET pos = r.new_pos
        FROM ranked r
        WHERE cs.id = r.id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for cup standings update
DROP TRIGGER IF EXISTS trg_update_cup_standings ON matches;
CREATE TRIGGER trg_update_cup_standings
    AFTER INSERT OR UPDATE OF status, home_score, away_score ON matches
    FOR EACH ROW
    EXECUTE FUNCTION update_cup_standings();

-- ============================================
-- 6. FUNCTION: Mark Qualified Teams in Group
-- ============================================

CREATE OR REPLACE FUNCTION mark_qualified_teams(
    p_league_id UUID
)
RETURNS TABLE (
    group_name TEXT,
    team_id UUID,
    team_name TEXT,
    pos INTEGER,
    points INTEGER,
    qualified BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    WITH group_rankings AS (
        SELECT
            cg.group_name,
            cs.team_id,
            t.name as team_name,
            cs.pos,
            cs.points,
            cg.qualifiers_count,
            ROW_NUMBER() OVER (
                PARTITION BY cg.id
                ORDER BY cs.points DESC, cs.goal_difference DESC, cs.goals_for DESC
            ) as rank_in_group
        FROM cup_standings cs
        JOIN cup_groups cg ON cs.cup_group_id = cg.id
        JOIN teams t ON cs.team_id = t.id
        WHERE cg.league_id = p_league_id
    )
    SELECT
        gr.group_name,
        gr.team_id,
        gr.team_name,
        gr.pos,
        gr.points,
        (gr.rank_in_group <= gr.qualifiers_count) as qualified
    FROM group_rankings gr
    ORDER BY gr.group_name, gr.rank_in_group;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. FUNCTION: Initialize Cup Standings for Group
-- ============================================

CREATE OR REPLACE FUNCTION initialize_cup_standings(
    p_cup_group_id UUID
)
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER := 0;
    v_team RECORD;
BEGIN
    -- Get all teams in the group
    FOR v_team IN
        SELECT id FROM teams WHERE cup_group_id = p_cup_group_id
    LOOP
        -- Insert standing if not exists
        INSERT INTO cup_standings (cup_group_id, team_id, pos, played, won, drawn, lost, goals_for, goals_against, goal_difference, points, qualified)
        VALUES (p_cup_group_id, v_team.id, v_count + 1, 0, 0, 0, 0, 0, 0, 0, 0, false)
        ON CONFLICT (cup_group_id, team_id) DO NOTHING;

        v_count := v_count + 1;
    END LOOP;

    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 8. VIEW: League Hierarchy
-- ============================================

-- Drop existing view first to avoid column conflict
DROP VIEW IF EXISTS league_hierarchy;

CREATE VIEW league_hierarchy AS
SELECT
    l.id,
    l.name,
    l.type,
    l.season,
    l.status,
    l.tournament_format,
    l.promotion_slots,
    l.relegation_slots,
    l.playoff_slots,
    l.parent_league_id,
    l.child_league_id,
    pl.name as parent_league_name,
    cl.name as child_league_name,
    l.has_group_stage,
    l.teams_per_group,
    l.qualifiers_per_group,
    (SELECT COUNT(*) FROM teams WHERE league_id = l.id) as team_count
FROM leagues l
LEFT JOIN leagues pl ON l.parent_league_id = pl.id
LEFT JOIN leagues cl ON l.child_league_id = cl.id;

COMMENT ON VIEW league_hierarchy IS 'View untuk melihat hierarki liga dengan parent dan child leagues';

