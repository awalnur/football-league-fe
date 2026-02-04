-- ============================================
-- FOOTBALL LEAGUES DATABASE SCHEMA
-- Supports: Football & eFootball Leagues
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. ENUMS
-- ============================================

-- Tipe liga (sepakbola biasa atau eFootball)
CREATE TYPE league_type AS ENUM ('football', 'efootball');

-- Status liga
CREATE TYPE league_status AS ENUM ('upcoming', 'ongoing', 'completed');

-- Status pertandingan
CREATE TYPE match_status AS ENUM ('scheduled', 'live', 'completed', 'postponed', 'cancelled');

-- ============================================
-- 2. TABLES
-- ============================================

-- Tabel Admin Users (untuk RLS)
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    email TEXT NOT NULL,
    full_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel Liga
CREATE TABLE IF NOT EXISTS leagues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type league_type NOT NULL DEFAULT 'football',
    season TEXT NOT NULL, -- e.g., "2025/2026"
    status league_status NOT NULL DEFAULT 'upcoming',
    logo_url TEXT,
    description TEXT,
    start_date DATE,
    end_date DATE,
    created_by UUID REFERENCES admins(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel Tim
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    league_id UUID REFERENCES leagues(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    logo_url TEXT,
    short_name TEXT, -- e.g., "MU" for Manchester United
    primary_color TEXT, -- Warna utama tim (hex)
    secondary_color TEXT, -- Warna sekunder tim (hex)
    created_by UUID REFERENCES admins(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(league_id, name)
);

-- Tabel Game Players / Gamers (khusus eFootball - orang yang bermain game)
CREATE TABLE IF NOT EXISTS game_players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
    real_name TEXT NOT NULL, -- Nama asli pemain
    gamertag TEXT NOT NULL, -- Username/ID di game (PSN ID, Xbox Gamertag, dll)
    avatar_url TEXT,
    phone TEXT, -- Nomor telepon untuk koordinasi
    discord TEXT, -- Discord username
    is_captain BOOLEAN DEFAULT FALSE, -- Kapten tim eFootball
    created_by UUID REFERENCES admins(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(team_id, gamertag)
);

-- Tabel Jadwal Pertandingan
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    league_id UUID REFERENCES leagues(id) ON DELETE CASCADE NOT NULL,
    home_team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
    away_team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
    match_week INTEGER NOT NULL, -- Pekan ke-berapa
    match_date TIMESTAMPTZ,
    status match_status NOT NULL DEFAULT 'scheduled',
    home_score INTEGER,
    away_score INTEGER,
    venue TEXT,
    notes TEXT,
    created_by UUID REFERENCES admins(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT different_teams CHECK (home_team_id != away_team_id)
);

-- Tabel Screenshot Hasil (khusus eFootball)
CREATE TABLE IF NOT EXISTS match_screenshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    caption TEXT,
    uploaded_by UUID REFERENCES admins(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel Klasemen (akan dihitung otomatis via trigger/function)
CREATE TABLE IF NOT EXISTS standings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    league_id UUID REFERENCES leagues(id) ON DELETE CASCADE NOT NULL,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
    played INTEGER DEFAULT 0,
    won INTEGER DEFAULT 0,
    drawn INTEGER DEFAULT 0,
    lost INTEGER DEFAULT 0,
    goals_for INTEGER DEFAULT 0,
    goals_against INTEGER DEFAULT 0,
    goal_difference INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0,
    form TEXT, -- e.g., "WWDLW" (5 match terakhir)
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(league_id, team_id)
);

-- ============================================
-- 3. INDEXES
-- ============================================

CREATE INDEX idx_teams_league ON teams(league_id);
CREATE INDEX idx_game_players_team ON game_players(team_id);
CREATE INDEX idx_matches_league ON matches(league_id);
CREATE INDEX idx_matches_home_team ON matches(home_team_id);
CREATE INDEX idx_matches_away_team ON matches(away_team_id);
CREATE INDEX idx_matches_date ON matches(match_date);
CREATE INDEX idx_matches_week ON matches(match_week);
CREATE INDEX idx_standings_league ON standings(league_id);
CREATE INDEX idx_standings_team ON standings(team_id);
CREATE INDEX idx_standings_points ON standings(points DESC, goal_difference DESC);

-- ============================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_screenshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE standings ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admins WHERE user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admins table policies
CREATE POLICY "Admins can view all admins"
    ON admins FOR SELECT
    USING (is_admin());

CREATE POLICY "Only super admin can insert admins"
    ON admins FOR INSERT
    WITH CHECK (is_admin());

-- Leagues policies
CREATE POLICY "Anyone can view leagues"
    ON leagues FOR SELECT
    USING (true);

CREATE POLICY "Only admins can insert leagues"
    ON leagues FOR INSERT
    WITH CHECK (is_admin());

CREATE POLICY "Only admins can update leagues"
    ON leagues FOR UPDATE
    USING (is_admin());

CREATE POLICY "Only admins can delete leagues"
    ON leagues FOR DELETE
    USING (is_admin());

-- Teams policies
CREATE POLICY "Anyone can view teams"
    ON teams FOR SELECT
    USING (true);

CREATE POLICY "Only admins can insert teams"
    ON teams FOR INSERT
    WITH CHECK (is_admin());

CREATE POLICY "Only admins can update teams"
    ON teams FOR UPDATE
    USING (is_admin());

CREATE POLICY "Only admins can delete teams"
    ON teams FOR DELETE
    USING (is_admin());

-- Game Players policies (untuk gamer eFootball)
CREATE POLICY "Anyone can view game players"
    ON game_players FOR SELECT
    USING (true);

CREATE POLICY "Only admins can insert game players"
    ON game_players FOR INSERT
    WITH CHECK (is_admin());

CREATE POLICY "Only admins can update game players"
    ON game_players FOR UPDATE
    USING (is_admin());

CREATE POLICY "Only admins can delete game players"
    ON game_players FOR DELETE
    USING (is_admin());

-- Matches policies
CREATE POLICY "Anyone can view matches"
    ON matches FOR SELECT
    USING (true);

CREATE POLICY "Only admins can insert matches"
    ON matches FOR INSERT
    WITH CHECK (is_admin());

CREATE POLICY "Only admins can update matches"
    ON matches FOR UPDATE
    USING (is_admin());

CREATE POLICY "Only admins can delete matches"
    ON matches FOR DELETE
    USING (is_admin());

-- Match screenshots policies
CREATE POLICY "Anyone can view match screenshots"
    ON match_screenshots FOR SELECT
    USING (true);

CREATE POLICY "Only admins can insert match screenshots"
    ON match_screenshots FOR INSERT
    WITH CHECK (is_admin());

CREATE POLICY "Only admins can delete match screenshots"
    ON match_screenshots FOR DELETE
    USING (is_admin());

-- Standings policies
CREATE POLICY "Anyone can view standings"
    ON standings FOR SELECT
    USING (true);

CREATE POLICY "Only admins can modify standings"
    ON standings FOR ALL
    USING (is_admin());

-- ============================================
-- 5. TRIGGERS & FUNCTIONS
-- ============================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_leagues_updated_at
    BEFORE UPDATE ON leagues
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_teams_updated_at
    BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_game_players_updated_at
    BEFORE UPDATE ON game_players
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_matches_updated_at
    BEFORE UPDATE ON matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_standings_updated_at
    BEFORE UPDATE ON standings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 6. FUNCTION: Initialize standings for new team
-- ============================================

CREATE OR REPLACE FUNCTION init_team_standings()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO standings (league_id, team_id)
    VALUES (NEW.league_id, NEW.id)
    ON CONFLICT (league_id, team_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_team_created
    AFTER INSERT ON teams
    FOR EACH ROW EXECUTE FUNCTION init_team_standings();

-- ============================================
-- 7. FUNCTION: Update standings after match result
-- ============================================

CREATE OR REPLACE FUNCTION update_standings_after_match()
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
BEGIN
    -- Only process when match is completed and has scores
    IF NEW.status = 'completed' AND NEW.home_score IS NOT NULL AND NEW.away_score IS NOT NULL THEN

        -- Skip if already processed (check if old status was also completed with same scores)
        IF TG_OP = 'UPDATE' AND OLD.status = 'completed'
           AND OLD.home_score = NEW.home_score AND OLD.away_score = NEW.away_score THEN
            RETURN NEW;
        END IF;

        -- If updating from completed state, we need to reverse the old result first
        IF TG_OP = 'UPDATE' AND OLD.status = 'completed'
           AND OLD.home_score IS NOT NULL AND OLD.away_score IS NOT NULL THEN
            -- Reverse home team stats
            UPDATE standings SET
                played = played - 1,
                won = won - CASE WHEN OLD.home_score > OLD.away_score THEN 1 ELSE 0 END,
                drawn = drawn - CASE WHEN OLD.home_score = OLD.away_score THEN 1 ELSE 0 END,
                lost = lost - CASE WHEN OLD.home_score < OLD.away_score THEN 1 ELSE 0 END,
                goals_for = goals_for - OLD.home_score,
                goals_against = goals_against - OLD.away_score,
                goal_difference = goal_difference - (OLD.home_score - OLD.away_score),
                points = points - CASE
                    WHEN OLD.home_score > OLD.away_score THEN 3
                    WHEN OLD.home_score = OLD.away_score THEN 1
                    ELSE 0
                END
            WHERE team_id = OLD.home_team_id AND league_id = OLD.league_id;

            -- Reverse away team stats
            UPDATE standings SET
                played = played - 1,
                won = won - CASE WHEN OLD.away_score > OLD.home_score THEN 1 ELSE 0 END,
                drawn = drawn - CASE WHEN OLD.away_score = OLD.home_score THEN 1 ELSE 0 END,
                lost = lost - CASE WHEN OLD.away_score < OLD.home_score THEN 1 ELSE 0 END,
                goals_for = goals_for - OLD.away_score,
                goals_against = goals_against - OLD.home_score,
                goal_difference = goal_difference - (OLD.away_score - OLD.home_score),
                points = points - CASE
                    WHEN OLD.away_score > OLD.home_score THEN 3
                    WHEN OLD.away_score = OLD.home_score THEN 1
                    ELSE 0
                END
            WHERE team_id = OLD.away_team_id AND league_id = OLD.league_id;
        END IF;

        -- Calculate new results
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

        -- Update home team standings
        UPDATE standings SET
            played = played + 1,
            won = won + home_won,
            drawn = drawn + home_drawn,
            lost = lost + home_lost,
            goals_for = goals_for + NEW.home_score,
            goals_against = goals_against + NEW.away_score,
            goal_difference = goal_difference + (NEW.home_score - NEW.away_score),
            points = points + home_points
        WHERE team_id = NEW.home_team_id AND league_id = NEW.league_id;

        -- Update away team standings
        UPDATE standings SET
            played = played + 1,
            won = won + away_won,
            drawn = drawn + away_drawn,
            lost = lost + away_lost,
            goals_for = goals_for + NEW.away_score,
            goals_against = goals_against + NEW.home_score,
            goal_difference = goal_difference + (NEW.away_score - NEW.home_score),
            points = points + away_points
        WHERE team_id = NEW.away_team_id AND league_id = NEW.league_id;

    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_match_result
    AFTER INSERT OR UPDATE ON matches
    FOR EACH ROW EXECUTE FUNCTION update_standings_after_match();

-- ============================================
-- 8. FUNCTION: Generate random schedule when league starts
-- ============================================

CREATE OR REPLACE FUNCTION generate_league_schedule(
    p_league_id UUID,
    p_start_date DATE DEFAULT CURRENT_DATE,
    p_interval_days INTEGER DEFAULT 7,
    p_matches_per_day INTEGER DEFAULT 2
)
RETURNS INTEGER AS $$
DECLARE
    team_ids UUID[];
    num_teams INTEGER;
    num_matchdays INTEGER;
    matches_per_matchday INTEGER;
    current_matchday INTEGER;
    match_date TIMESTAMPTZ;
    home_idx INTEGER;
    away_idx INTEGER;
    temp_id UUID;
    i INTEGER;
    k INTEGER;
    total_matches INTEGER := 0;
    matchday_group INTEGER;
    matchday_in_group INTEGER;
    start_hour INTEGER;
BEGIN
    -- Validate interval days
    IF p_interval_days < 1 THEN
        p_interval_days := 1;
    END IF;

    -- Validate matches per day (minimum 1, maximum 4 matchdays per day)
    IF p_matches_per_day < 1 THEN
        p_matches_per_day := 1;
    END IF;
    IF p_matches_per_day > 4 THEN
        p_matches_per_day := 4;
    END IF;

    -- Get all team IDs for this league
    SELECT ARRAY_AGG(id ORDER BY RANDOM()) INTO team_ids
    FROM teams WHERE league_id = p_league_id;

    num_teams := COALESCE(array_length(team_ids, 1), 0);

    -- Minimum 2 teams required
    IF num_teams < 2 THEN
        RAISE EXCEPTION 'Need at least 2 teams to generate schedule. Found: %', num_teams;
    END IF;

    -- If odd number of teams, we need to handle bye weeks (not implemented - require even teams)
    IF num_teams % 2 = 1 THEN
        RAISE EXCEPTION 'Need even number of teams. Found: %', num_teams;
    END IF;

    -- Calculate matchdays (round robin = n-1 matchdays for first leg)
    num_matchdays := num_teams - 1;
    matches_per_matchday := num_teams / 2;

    -- Delete existing scheduled matches (not completed ones)
    DELETE FROM matches
    WHERE league_id = p_league_id AND status = 'scheduled';

    -- Round Robin Algorithm using circle method
    -- p_matches_per_day = how many matchdays to schedule per calendar day
    -- Example: p_matches_per_day = 2 means 2 matchdays per day, so each team plays twice per day

    FOR current_matchday IN 1..num_matchdays LOOP
        -- Calculate which calendar day this matchday falls on
        -- matchday_group: which group of matchdays (0, 1, 2, ...) - determines the calendar day
        -- matchday_in_group: position within the group (0 to p_matches_per_day-1) - determines the time slot
        matchday_group := (current_matchday - 1) / p_matches_per_day;
        matchday_in_group := (current_matchday - 1) % p_matches_per_day;

        -- Calculate start hour based on position in group
        -- First matchday of day: 19:00, Second: 20:00, Third: 21:00, Fourth: 22:00
        start_hour := 19 + matchday_in_group;

        -- Generate matches for this matchday
        FOR i IN 0..(matches_per_matchday - 1) LOOP
            home_idx := i + 1;
            away_idx := num_teams - i;

            -- Calculate match date for first leg
            -- All matches in same matchday happen at the same time (parallel matches)
            match_date := p_start_date
                + (matchday_group * p_interval_days * INTERVAL '1 day')
                + (start_hour * INTERVAL '1 hour');

            -- Insert first leg match
            INSERT INTO matches (league_id, home_team_id, away_team_id, match_week, match_date, status)
            VALUES (
                p_league_id,
                team_ids[home_idx],
                team_ids[away_idx],
                current_matchday,
                match_date,
                'scheduled'
            );
            total_matches := total_matches + 1;

            -- Insert second leg (return match) - after all first leg matchdays
            INSERT INTO matches (league_id, home_team_id, away_team_id, match_week, match_date, status)
            VALUES (
                p_league_id,
                team_ids[away_idx],
                team_ids[home_idx],
                current_matchday + num_matchdays, -- Second leg matchweek
                match_date + (CEIL(num_matchdays::DECIMAL / p_matches_per_day) * p_interval_days * INTERVAL '1 day'),
                'scheduled'
            );
            total_matches := total_matches + 1;
        END LOOP;

        -- Rotate teams (keep first team fixed, rotate others)
        -- Save the second element
        temp_id := team_ids[2];

        -- Shift elements left
        FOR k IN 2..(num_teams - 1) LOOP
            team_ids[k] := team_ids[k + 1];
        END LOOP;

        -- Put saved element at the end
        team_ids[num_teams] := temp_id;
    END LOOP;

    -- Update league status to ongoing
    UPDATE leagues SET status = 'ongoing' WHERE id = p_league_id;

    RETURN total_matches;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 9. FUNCTION: Update team form (last 5 matches)
-- ============================================

CREATE OR REPLACE FUNCTION update_team_form()
RETURNS TRIGGER AS $$
DECLARE
    home_form TEXT;
    away_form TEXT;
BEGIN
    IF NEW.status = 'completed' AND NEW.home_score IS NOT NULL AND NEW.away_score IS NOT NULL THEN
        -- Calculate home team form
        SELECT string_agg(
            CASE
                WHEN (m.home_team_id = NEW.home_team_id AND m.home_score > m.away_score) OR
                     (m.away_team_id = NEW.home_team_id AND m.away_score > m.home_score) THEN 'W'
                WHEN m.home_score = m.away_score THEN 'D'
                ELSE 'L'
            END, ''
            ORDER BY m.match_date DESC
        )
        INTO home_form
        FROM (
            SELECT home_team_id, away_team_id, home_score, away_score, match_date
            FROM matches
            WHERE (home_team_id = NEW.home_team_id OR away_team_id = NEW.home_team_id)
              AND status = 'completed'
              AND league_id = NEW.league_id
            ORDER BY match_date DESC
            LIMIT 5
        ) m;

        -- Calculate away team form
        SELECT string_agg(
            CASE
                WHEN (m.home_team_id = NEW.away_team_id AND m.home_score > m.away_score) OR
                     (m.away_team_id = NEW.away_team_id AND m.away_score > m.home_score) THEN 'W'
                WHEN m.home_score = m.away_score THEN 'D'
                ELSE 'L'
            END, ''
            ORDER BY m.match_date DESC
        )
        INTO away_form
        FROM (
            SELECT home_team_id, away_team_id, home_score, away_score, match_date
            FROM matches
            WHERE (home_team_id = NEW.away_team_id OR away_team_id = NEW.away_team_id)
              AND status = 'completed'
              AND league_id = NEW.league_id
            ORDER BY match_date DESC
            LIMIT 5
        ) m;

        -- Update standings with form
        UPDATE standings SET form = home_form WHERE team_id = NEW.home_team_id AND league_id = NEW.league_id;
        UPDATE standings SET form = away_form WHERE team_id = NEW.away_team_id AND league_id = NEW.league_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_match_update_form
    AFTER INSERT OR UPDATE ON matches
    FOR EACH ROW EXECUTE FUNCTION update_team_form();

-- ============================================
-- 10. STORAGE BUCKET FOR IMAGES
-- ============================================
-- Note: Run this in Supabase Dashboard SQL Editor or via API
-- Storage buckets need to be created separately

-- INSERT INTO storage.buckets (id, name, public) VALUES ('team-logos', 'team-logos', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('player-avatars', 'player-avatars', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('match-screenshots', 'match-screenshots', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('league-logos', 'league-logos', true);

COMMENT ON TABLE leagues IS 'Liga sepakbola atau eFootball';
COMMENT ON TABLE teams IS 'Tim yang berpartisipasi dalam liga';
COMMENT ON TABLE game_players IS 'Gamer/pemain game eFootball (orang yang bermain game, bukan pemain virtual)';
COMMENT ON TABLE matches IS 'Jadwal dan hasil pertandingan';
COMMENT ON TABLE match_screenshots IS 'Screenshot hasil pertandingan eFootball';
COMMENT ON TABLE standings IS 'Klasemen liga yang dihitung otomatis';
COMMENT ON FUNCTION generate_league_schedule IS 'Generate jadwal acak round-robin untuk liga';
