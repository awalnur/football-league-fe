-- ============================================
-- ADD TOURNAMENT FORMAT & RELEGATION SYSTEM
-- Date: 2026-02-09
-- ============================================

-- ============================================
-- 1. NEW ENUMS
-- ============================================

-- Tournament format (Liga round-robin atau Cup knockout)
CREATE TYPE tournament_format AS ENUM ('league', 'cup', 'league_cup');

-- Cup stages for knockout tournaments
CREATE TYPE cup_stage AS ENUM (
    'group_stage',
    'round_of_32',
    'round_of_16',
    'quarter_final',
    'semi_final',
    'final',
    'third_place'
);

-- Relegation zone types
CREATE TYPE zone_type AS ENUM (
    'promotion',      -- Tim promosi ke divisi lebih tinggi
    'safe',           -- Zona aman
    'playoff',        -- Playoff promosi/degradasi
    'relegation'      -- Degradasi ke divisi lebih rendah
);

-- ============================================
-- 2. ALTER LEAGUES TABLE
-- ============================================

-- Add tournament format column
ALTER TABLE leagues
ADD COLUMN tournament_format tournament_format NOT NULL DEFAULT 'league';

-- Add relegation settings
ALTER TABLE leagues
ADD COLUMN promotion_slots INTEGER DEFAULT 0,          -- Jumlah tim yang promosi langsung
ADD COLUMN relegation_slots INTEGER DEFAULT 0,         -- Jumlah tim yang degradasi langsung
ADD COLUMN playoff_slots INTEGER DEFAULT 0;            -- Jumlah tim playoff promosi/degradasi

-- Add cup specific settings
ALTER TABLE leagues
ADD COLUMN has_group_stage BOOLEAN DEFAULT false,     -- Apakah cup punya group stage
ADD COLUMN teams_per_group INTEGER DEFAULT 4,         -- Jumlah tim per group (jika ada group stage)
ADD COLUMN qualifiers_per_group INTEGER DEFAULT 2;    -- Jumlah tim yang lolos per group

-- Add parent/child league relationship for promotion/relegation
ALTER TABLE leagues
ADD COLUMN parent_league_id UUID REFERENCES leagues(id) ON DELETE SET NULL;  -- Liga di atasnya (untuk promosi)

COMMENT ON COLUMN leagues.tournament_format IS 'Format turnamen: league (round-robin), cup (knockout), league_cup (hybrid)';
COMMENT ON COLUMN leagues.promotion_slots IS 'Jumlah tim yang promosi otomatis ke parent league';
COMMENT ON COLUMN leagues.relegation_slots IS 'Jumlah tim yang degradasi otomatis';
COMMENT ON COLUMN leagues.playoff_slots IS 'Jumlah tim yang masuk playoff promosi/degradasi';
COMMENT ON COLUMN leagues.parent_league_id IS 'Liga di atasnya (untuk sistem promosi/degradasi)';

-- ============================================
-- 3. ALTER MATCHES TABLE
-- ============================================

-- Add cup stage information
ALTER TABLE matches
ADD COLUMN cup_stage cup_stage,                        -- Stage turnamen cup
ADD COLUMN leg_number INTEGER DEFAULT 1,               -- Leg pertandingan (1 atau 2 untuk two-leg ties)
ADD COLUMN is_extra_time BOOLEAN DEFAULT false,        -- Apakah ada extra time
ADD COLUMN is_penalty BOOLEAN DEFAULT false,           -- Apakah sampai adu penalti
ADD COLUMN home_penalty_score INTEGER,                 -- Skor penalti tim home
ADD COLUMN away_penalty_score INTEGER,                 -- Skor penalti tim away
ADD COLUMN aggregate_winner_id UUID REFERENCES teams(id);  -- Pemenang agregat (untuk two-leg ties)

COMMENT ON COLUMN matches.cup_stage IS 'Stage turnamen cup (group/knockout rounds)';
COMMENT ON COLUMN matches.leg_number IS 'Leg ke berapa (1 atau 2) untuk pertandingan dua leg';
COMMENT ON COLUMN matches.aggregate_winner_id IS 'Pemenang agregat untuk two-leg knockout ties';

-- ============================================
-- 4. NEW TABLE: LEAGUE ZONES
-- ============================================

-- Tabel untuk mendefinisikan zona di klasemen (promosi, playoff, degradasi)
CREATE TABLE IF NOT EXISTS league_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    league_id UUID REFERENCES leagues(id) ON DELETE CASCADE NOT NULL,
    zone_type zone_type NOT NULL,
    position_start INTEGER NOT NULL,    -- Posisi mulai zona (misal: 1 untuk juara)
    position_end INTEGER NOT NULL,      -- Posisi akhir zona (misal: 3 untuk top 3)
    color_code TEXT NOT NULL,           -- Warna zona di UI (hex code)
    label TEXT NOT NULL,                -- Label zona (misal: "Promosi ke Divisi 1")
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT valid_position_range CHECK (position_end >= position_start),
    CONSTRAINT valid_position CHECK (position_start > 0)
);

CREATE INDEX idx_league_zones_league ON league_zones(league_id);

-- Enable RLS
ALTER TABLE league_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view league zones"
    ON league_zones FOR SELECT
    USING (true);

CREATE POLICY "Only admins can modify league zones"
    ON league_zones FOR ALL
    USING (is_admin());

COMMENT ON TABLE league_zones IS 'Definisi zona di klasemen (promosi, safe, playoff, relegation)';

-- ============================================
-- 5. NEW TABLE: CUP GROUPS
-- ============================================

-- Tabel untuk group stage di tournament cup
CREATE TABLE IF NOT EXISTS cup_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    league_id UUID REFERENCES leagues(id) ON DELETE CASCADE NOT NULL,
    group_name TEXT NOT NULL,           -- Nama group (A, B, C, D, dll)
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(league_id, group_name)
);

CREATE INDEX idx_cup_groups_league ON cup_groups(league_id);

-- Enable RLS
ALTER TABLE cup_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view cup groups"
    ON cup_groups FOR SELECT
    USING (true);

CREATE POLICY "Only admins can modify cup groups"
    ON cup_groups FOR ALL
    USING (is_admin());

-- ============================================
-- 6. ALTER TEAMS TABLE
-- ============================================

-- Add group assignment for cup tournaments
ALTER TABLE teams
ADD COLUMN cup_group_id UUID REFERENCES cup_groups(id) ON DELETE SET NULL;

COMMENT ON COLUMN teams.cup_group_id IS 'Group assignment untuk tournament cup dengan group stage';

-- ============================================
-- 7. NEW TABLE: CUP STANDINGS (for group stage)
-- ============================================

-- Klasemen khusus untuk group stage cup (mirip standings tapi per group)
CREATE TABLE IF NOT EXISTS cup_standings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cup_group_id UUID REFERENCES cup_groups(id) ON DELETE CASCADE NOT NULL,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
    played INTEGER DEFAULT 0,
    won INTEGER DEFAULT 0,
    drawn INTEGER DEFAULT 0,
    lost INTEGER DEFAULT 0,
    goals_for INTEGER DEFAULT 0,
    goals_against INTEGER DEFAULT 0,
    goal_difference INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0,
    qualified BOOLEAN DEFAULT false,    -- Apakah lolos ke knockout stage
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(cup_group_id, team_id)
);

CREATE INDEX idx_cup_standings_group ON cup_standings(cup_group_id);
CREATE INDEX idx_cup_standings_team ON cup_standings(team_id);
CREATE INDEX idx_cup_standings_points ON cup_standings(points DESC, goal_difference DESC);

-- Enable RLS
ALTER TABLE cup_standings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view cup standings"
    ON cup_standings FOR SELECT
    USING (true);

CREATE POLICY "Only admins can modify cup standings"
    ON cup_standings FOR ALL
    USING (is_admin());

-- ============================================
-- 8. FUNCTION: Auto-create league zones based on settings
-- ============================================

CREATE OR REPLACE FUNCTION auto_create_league_zones(
    p_league_id UUID
)
RETURNS VOID AS $$
DECLARE
    v_promotion_slots INTEGER;
    v_relegation_slots INTEGER;
    v_playoff_slots INTEGER;
    v_total_teams INTEGER;
    current_position INTEGER := 1;
BEGIN
    -- Get league settings
    SELECT promotion_slots, relegation_slots, playoff_slots
    INTO v_promotion_slots, v_relegation_slots, v_playoff_slots
    FROM leagues
    WHERE id = p_league_id;

    -- Get total teams
    SELECT COUNT(*) INTO v_total_teams
    FROM teams
    WHERE league_id = p_league_id;

    -- Delete existing zones
    DELETE FROM league_zones WHERE league_id = p_league_id;

    -- Create promotion zone
    IF v_promotion_slots > 0 THEN
        INSERT INTO league_zones (league_id, zone_type, position_start, position_end, color_code, label)
        VALUES (
            p_league_id,
            'promotion',
            current_position,
            current_position + v_promotion_slots - 1,
            '#10b981',  -- emerald-500
            'Promosi'
        );
        current_position := current_position + v_promotion_slots;
    END IF;

    -- Create playoff zone
    IF v_playoff_slots > 0 THEN
        INSERT INTO league_zones (league_id, zone_type, position_start, position_end, color_code, label)
        VALUES (
            p_league_id,
            'playoff',
            current_position,
            current_position + v_playoff_slots - 1,
            '#3b82f6',  -- blue-500
            'Playoff Promosi'
        );
        current_position := current_position + v_playoff_slots;
    END IF;

    -- Create relegation zone
    IF v_relegation_slots > 0 AND v_total_teams > 0 THEN
        INSERT INTO league_zones (league_id, zone_type, position_start, position_end, color_code, label)
        VALUES (
            p_league_id,
            'relegation',
            v_total_teams - v_relegation_slots + 1,
            v_total_teams,
            '#ef4444',  -- red-500
            'Degradasi'
        );
    END IF;

    -- Safe zone is everything in between (implicitly)

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION auto_create_league_zones IS 'Otomatis membuat zona klasemen berdasarkan pengaturan liga';

-- ============================================
-- 9. FUNCTION: Initialize cup group standings
-- ============================================

CREATE OR REPLACE FUNCTION init_cup_group_standings()
RETURNS TRIGGER AS $$
BEGIN
    -- When a team is assigned to a cup group, create standings entry
    IF NEW.cup_group_id IS NOT NULL THEN
        INSERT INTO cup_standings (cup_group_id, team_id)
        VALUES (NEW.cup_group_id, NEW.id)
        ON CONFLICT (cup_group_id, team_id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_team_cup_group_assigned
    AFTER INSERT OR UPDATE OF cup_group_id ON teams
    FOR EACH ROW EXECUTE FUNCTION init_cup_group_standings();

-- ============================================
-- 10. FUNCTION: Update cup standings after group stage match
-- ============================================

CREATE OR REPLACE FUNCTION update_cup_standings_after_match()
RETURNS TRIGGER AS $$
DECLARE
    home_points INTEGER;
    away_points INTEGER;
    home_won INTEGER := 0;
    home_drawn INTEGER := 0;
    home_lost INTEGER := 0;
    away_won INTEGER := 0;
    away_drawn INTEGER := 0;
    away_lost INTEGER := 0;
    home_group_id UUID;
    away_group_id UUID;
BEGIN
    -- Only process group stage matches
    IF NEW.status = 'completed'
       AND NEW.cup_stage = 'group_stage'
       AND NEW.home_score IS NOT NULL
       AND NEW.away_score IS NOT NULL THEN

        -- Get group IDs for both teams
        SELECT cup_group_id INTO home_group_id FROM teams WHERE id = NEW.home_team_id;
        SELECT cup_group_id INTO away_group_id FROM teams WHERE id = NEW.away_team_id;

        -- Skip if teams are not in groups
        IF home_group_id IS NULL OR away_group_id IS NULL THEN
            RETURN NEW;
        END IF;

        -- Calculate results
        IF NEW.home_score > NEW.away_score THEN
            home_points := 3;
            away_points := 0;
            home_won := 1;
            away_lost := 1;
        ELSIF NEW.home_score < NEW.away_score THEN
            home_points := 0;
            away_points := 3;
            home_lost := 1;
            away_won := 1;
        ELSE
            home_points := 1;
            away_points := 1;
            home_drawn := 1;
            away_drawn := 1;
        END IF;

        -- Update home team cup standings
        UPDATE cup_standings SET
            played = played + 1,
            won = won + home_won,
            drawn = drawn + home_drawn,
            lost = lost + home_lost,
            goals_for = goals_for + NEW.home_score,
            goals_against = goals_against + NEW.away_score,
            goal_difference = goal_difference + (NEW.home_score - NEW.away_score),
            points = points + home_points
        WHERE team_id = NEW.home_team_id AND cup_group_id = home_group_id;

        -- Update away team cup standings
        UPDATE cup_standings SET
            played = played + 1,
            won = won + away_won,
            drawn = drawn + away_drawn,
            lost = lost + away_lost,
            goals_for = goals_for + NEW.away_score,
            goals_against = goals_against + NEW.home_score,
            goal_difference = goal_difference + (NEW.away_score - NEW.home_score),
            points = points + away_points
        WHERE team_id = NEW.away_team_id AND cup_group_id = away_group_id;

    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_cup_match_result
    AFTER INSERT OR UPDATE ON matches
    FOR EACH ROW EXECUTE FUNCTION update_cup_standings_after_match();

-- ============================================
-- 11. FUNCTION: Generate cup schedule
-- ============================================

CREATE OR REPLACE FUNCTION generate_cup_schedule(
    p_league_id UUID,
    p_start_date DATE DEFAULT CURRENT_DATE,
    p_has_group_stage BOOLEAN DEFAULT false
)
RETURNS INTEGER AS $$
DECLARE
    v_total_matches INTEGER := 0;
    -- Add implementation later
BEGIN
    -- This will be implemented based on specific requirements
    -- For now, admins can manually create cup matches
    RAISE NOTICE 'Cup schedule generation to be implemented';
    RETURN 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION generate_cup_schedule IS 'Generate jadwal untuk tournament cup (group stage + knockout)';

-- ============================================
-- 12. SAMPLE DATA: Add zones to existing leagues
-- ============================================

-- Example: Create zones for a league
-- CALL after creating a league with promotion/relegation settings

COMMENT ON TYPE tournament_format IS 'Format turnamen: league (liga biasa), cup (piala knockout), league_cup (hybrid)';
COMMENT ON TYPE cup_stage IS 'Stage dalam tournament cup';
COMMENT ON TYPE zone_type IS 'Tipe zona di klasemen (promosi, aman, playoff, degradasi)';
