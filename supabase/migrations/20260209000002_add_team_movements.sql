-- ============================================
-- ADD TEAM MOVEMENTS TRACKING
-- Track promotion/relegation history
-- Date: 2026-02-09
-- ============================================

-- ============================================
-- 1. CREATE TEAM MOVEMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS team_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    from_league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
    to_league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
    movement_type TEXT NOT NULL CHECK (movement_type IN ('promotion', 'relegation', 'playoff_winner', 'playoff_loser', 'transfer')),
    season TEXT NOT NULL,
    final_position INTEGER,  -- Posisi akhir di from_league
    notes TEXT,
    movement_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_team_movements_team ON team_movements(team_id);
CREATE INDEX idx_team_movements_from_league ON team_movements(from_league_id);
CREATE INDEX idx_team_movements_to_league ON team_movements(to_league_id);
CREATE INDEX idx_team_movements_season ON team_movements(season);

COMMENT ON TABLE team_movements IS 'Track team movements between leagues (promotion/relegation/transfers)';
COMMENT ON COLUMN team_movements.movement_type IS 'Type: promotion, relegation, playoff_winner, playoff_loser, transfer';
COMMENT ON COLUMN team_movements.final_position IS 'Final league position before movement';

-- ============================================
-- 2. ENABLE RLS
-- ============================================

ALTER TABLE team_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view team movements"
    ON team_movements FOR SELECT
    USING (true);

CREATE POLICY "Only admins can modify team movements"
    ON team_movements FOR ALL
    USING (is_admin());

-- ============================================
-- 3. ADD CHILD LEAGUE REFERENCE (Optional)
-- ============================================

-- Note: parent_league_id already exists from previous migration
-- Add child_league_id for easier bidirectional lookup

ALTER TABLE leagues
ADD COLUMN IF NOT EXISTS child_league_id UUID REFERENCES leagues(id) ON DELETE SET NULL;

COMMENT ON COLUMN leagues.child_league_id IS 'League below this one (for relegation target)';

-- ============================================
-- 4. FUNCTION: Get Teams Eligible for Promotion
-- ============================================

CREATE OR REPLACE FUNCTION get_promotion_eligible_teams(
    p_league_id UUID
)
RETURNS TABLE (
    team_id UUID,
    team_name TEXT,
    pos INTEGER,
    points INTEGER,
    movement_type TEXT
) AS $$
DECLARE
    v_promotion_slots INTEGER;
    v_playoff_slots INTEGER;
BEGIN
    -- Get league settings
    SELECT promotion_slots, playoff_slots
    INTO v_promotion_slots, v_playoff_slots
    FROM leagues
    WHERE id = p_league_id;

    -- Return top teams for promotion/playoff
    RETURN QUERY
    SELECT
        s.team_id,
        t.name as team_name,
        ROW_NUMBER() OVER (ORDER BY s.points DESC, s.goal_difference DESC, s.goals_for DESC)::INTEGER as pos,
        s.points,
        CASE
            WHEN ROW_NUMBER() OVER (ORDER BY s.points DESC, s.goal_difference DESC, s.goals_for DESC) <= v_promotion_slots
            THEN 'promotion'
            WHEN ROW_NUMBER() OVER (ORDER BY s.points DESC, s.goal_difference DESC, s.goals_for DESC) <= (v_promotion_slots + v_playoff_slots)
            THEN 'playoff'
            ELSE 'safe'
        END as movement_type
    FROM standings s
    JOIN teams t ON t.id = s.team_id
    WHERE s.league_id = p_league_id
    ORDER BY s.points DESC, s.goal_difference DESC, s.goals_for DESC
    LIMIT (v_promotion_slots + v_playoff_slots);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. FUNCTION: Get Teams Eligible for Relegation
-- ============================================

CREATE OR REPLACE FUNCTION get_relegation_eligible_teams(
    p_league_id UUID
)
RETURNS TABLE (
    team_id UUID,
    team_name TEXT,
    pos INTEGER,
    points INTEGER,
    movement_type TEXT
) AS $$
DECLARE
    v_relegation_slots INTEGER;
    v_playoff_slots INTEGER;
    v_total_teams INTEGER;
BEGIN
    -- Get league settings
    SELECT relegation_slots, playoff_slots
    INTO v_relegation_slots, v_playoff_slots
    FROM leagues
    WHERE id = p_league_id;

    -- Get total teams
    SELECT COUNT(*) INTO v_total_teams
    FROM standings
    WHERE league_id = p_league_id;

    -- Return bottom teams for relegation/playoff
    RETURN QUERY
    SELECT
        s.team_id,
        t.name as team_name,
        ROW_NUMBER() OVER (ORDER BY s.points DESC, s.goal_difference DESC, s.goals_for DESC)::INTEGER as pos,
        s.points,
        CASE
            WHEN ROW_NUMBER() OVER (ORDER BY s.points DESC, s.goal_difference DESC, s.goals_for DESC) >= (v_total_teams - v_relegation_slots + 1)
            THEN 'relegation'
            WHEN ROW_NUMBER() OVER (ORDER BY s.points DESC, s.goal_difference DESC, s.goals_for DESC) >= (v_total_teams - v_relegation_slots - v_playoff_slots + 1)
            THEN 'playoff'
            ELSE 'safe'
        END as movement_type
    FROM standings s
    JOIN teams t ON t.id = s.team_id
    WHERE s.league_id = p_league_id
    ORDER BY s.points ASC, s.goal_difference ASC, s.goals_for ASC
    LIMIT (v_relegation_slots + v_playoff_slots);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. FUNCTION: Execute Season End Movements
-- ============================================

CREATE OR REPLACE FUNCTION execute_season_end_movements(
    p_league_id UUID,
    p_season TEXT
)
RETURNS TABLE (
    team_name TEXT,
    movement_type TEXT,
    from_league TEXT,
    to_league TEXT
) AS $$
DECLARE
    v_parent_league_id UUID;
    v_child_league_id UUID;
    v_team RECORD;
    v_position INTEGER;
BEGIN
    -- Get parent and child leagues
    SELECT parent_league_id, child_league_id
    INTO v_parent_league_id, v_child_league_id
    FROM leagues
    WHERE id = p_league_id;

    -- Process promotions
    IF v_parent_league_id IS NOT NULL THEN
        FOR v_team IN
            SELECT * FROM get_promotion_eligible_teams(p_league_id)
            WHERE movement_type IN ('promotion', 'playoff')
        LOOP
            -- Record movement
            INSERT INTO team_movements (
                team_id, from_league_id, to_league_id,
                movement_type, season, final_position
            ) VALUES (
                v_team.team_id, p_league_id, v_parent_league_id,
                v_team.movement_type, p_season, v_team.pos
            );

            -- Move team to new league
            UPDATE teams
            SET league_id = v_parent_league_id
            WHERE id = v_team.team_id;

            RETURN QUERY
            SELECT
                v_team.team_name,
                v_team.movement_type,
                (SELECT name FROM leagues WHERE id = p_league_id),
                (SELECT name FROM leagues WHERE id = v_parent_league_id);
        END LOOP;
    END IF;

    -- Process relegations
    IF v_child_league_id IS NOT NULL THEN
        FOR v_team IN
            SELECT * FROM get_relegation_eligible_teams(p_league_id)
            WHERE movement_type IN ('relegation', 'playoff')
        LOOP
            -- Record movement
            INSERT INTO team_movements (
                team_id, from_league_id, to_league_id,
                movement_type, season, final_position
            ) VALUES (
                v_team.team_id, p_league_id, v_child_league_id,
                v_team.movement_type, p_season, v_team.pos
            );

            -- Move team to new league
            UPDATE teams
            SET league_id = v_child_league_id
            WHERE id = v_team.team_id;

            RETURN QUERY
            SELECT
                v_team.team_name,
                v_team.movement_type,
                (SELECT name FROM leagues WHERE id = p_league_id),
                (SELECT name FROM leagues WHERE id = v_child_league_id);
        END LOOP;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_promotion_eligible_teams IS 'Get teams eligible for promotion from a league';
COMMENT ON FUNCTION get_relegation_eligible_teams IS 'Get teams eligible for relegation from a league';
COMMENT ON FUNCTION execute_season_end_movements IS 'Execute all promotion/relegation movements at end of season';

-- ============================================
-- 7. VIEW: League Hierarchy
-- ============================================

CREATE OR REPLACE VIEW league_hierarchy AS
SELECT
    l.id,
    l.name,
    l.type,
    l.season,
    l.tournament_format,
    l.promotion_slots,
    l.relegation_slots,
    l.playoff_slots,
    parent.id as parent_league_id,
    parent.name as parent_league_name,
    child.id as child_league_id,
    child.name as child_league_name,
    (SELECT COUNT(*) FROM teams WHERE league_id = l.id) as team_count
FROM leagues l
LEFT JOIN leagues parent ON parent.id = l.parent_league_id
LEFT JOIN leagues child ON child.id = l.child_league_id
ORDER BY
    CASE l.type
        WHEN 'football' THEN 1
        WHEN 'efootball' THEN 2
        ELSE 3
    END,
    l.name;

COMMENT ON VIEW league_hierarchy IS 'View showing league relationships for promotion/relegation system';
