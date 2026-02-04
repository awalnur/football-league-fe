-- ============================================
-- SEED DATA & HELPER FUNCTIONS
-- ============================================

-- Function to add first admin (run this after creating your first user in Supabase Auth)
-- Call: SELECT make_user_admin('user-uuid-here');
CREATE OR REPLACE FUNCTION make_user_admin(p_user_id UUID)
RETURNS UUID AS $$
DECLARE
    admin_id UUID;
    user_email TEXT;
BEGIN
    -- Get user email from auth.users
    SELECT email INTO user_email FROM auth.users WHERE id = p_user_id;

    IF user_email IS NULL THEN
        RAISE EXCEPTION 'User not found with ID: %', p_user_id;
    END IF;

    -- Insert into admins table
    INSERT INTO admins (user_id, email)
    VALUES (p_user_id, user_email)
    ON CONFLICT (user_id) DO UPDATE SET email = user_email
    RETURNING id INTO admin_id;

    RETURN admin_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a new league with teams
CREATE OR REPLACE FUNCTION create_league_with_teams(
    p_name TEXT,
    p_type league_type,
    p_season TEXT,
    p_team_names TEXT[]
)
RETURNS UUID AS $$
DECLARE
    new_league_id UUID;
    admin_id UUID;
    team_name TEXT;
BEGIN
    -- Get current admin ID
    SELECT id INTO admin_id FROM admins WHERE user_id = auth.uid();

    IF admin_id IS NULL THEN
        RAISE EXCEPTION 'Only admins can create leagues';
    END IF;

    -- Create league
    INSERT INTO leagues (name, type, season, created_by)
    VALUES (p_name, p_type, p_season, admin_id)
    RETURNING id INTO new_league_id;

    -- Create teams
    FOREACH team_name IN ARRAY p_team_names LOOP
        INSERT INTO teams (league_id, name, created_by)
        VALUES (new_league_id, team_name, admin_id);
    END LOOP;

    RETURN new_league_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get league standings (sorted correctly)
CREATE OR REPLACE FUNCTION get_league_standings(p_league_id UUID)
RETURNS TABLE (
    pos INTEGER,
    team_id UUID,
    team_name TEXT,
    team_logo TEXT,
    played INTEGER,
    won INTEGER,
    drawn INTEGER,
    lost INTEGER,
    goals_for INTEGER,
    goals_against INTEGER,
    goal_difference INTEGER,
    points INTEGER,
    form TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ROW_NUMBER() OVER (ORDER BY s.points DESC, s.goal_difference DESC, s.goals_for DESC, t.name)::INTEGER as pos,
        t.id as team_id,
        t.name as team_name,
        t.logo_url as team_logo,
        s.played,
        s.won,
        s.drawn,
        s.lost,
        s.goals_for,
        s.goals_against,
        s.goal_difference,
        s.points,
        s.form
    FROM standings s
    JOIN teams t ON t.id = s.team_id
    WHERE s.league_id = p_league_id
    ORDER BY s.points DESC, s.goal_difference DESC, s.goals_for DESC, t.name;
END;
$$ LANGUAGE plpgsql;

-- Function to get team match history
CREATE OR REPLACE FUNCTION get_team_matches(
    p_team_id UUID,
    p_status match_status DEFAULT NULL
)
RETURNS TABLE (
    match_id UUID,
    match_date TIMESTAMPTZ,
    match_week INTEGER,
    home_team_id UUID,
    home_team_name TEXT,
    home_team_logo TEXT,
    away_team_id UUID,
    away_team_name TEXT,
    away_team_logo TEXT,
    home_score INTEGER,
    away_score INTEGER,
    status match_status,
    is_home BOOLEAN,
    result CHAR(1),
    screenshot_url TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        m.id as match_id,
        m.match_date,
        m.match_week,
        ht.id as home_team_id,
        ht.name as home_team_name,
        ht.logo_url as home_team_logo,
        at.id as away_team_id,
        at.name as away_team_name,
        at.logo_url as away_team_logo,
        COALESCE(m.home_score, 0) as home_score,
        COALESCE(m.away_score, 0) as away_score,
        m.status,
        (m.home_team_id = p_team_id) as is_home,
        CASE
            WHEN m.status != 'completed' THEN NULL::CHAR(1)
            WHEN m.home_score IS NULL OR m.away_score IS NULL THEN NULL::CHAR(1)
            WHEN m.home_team_id = p_team_id AND m.home_score > m.away_score THEN 'W'::CHAR(1)
            WHEN m.away_team_id = p_team_id AND m.away_score > m.home_score THEN 'W'::CHAR(1)
            WHEN m.home_score = m.away_score THEN 'D'::CHAR(1)
            ELSE 'L'::CHAR(1)
        END as result,
        (SELECT ms.image_url FROM match_screenshots ms WHERE ms.match_id = m.id ORDER BY ms.created_at DESC LIMIT 1) as screenshot_url
    FROM matches m
    JOIN teams ht ON ht.id = m.home_team_id
    JOIN teams at ON at.id = m.away_team_id
    WHERE (m.home_team_id = p_team_id OR m.away_team_id = p_team_id)
      AND (p_status IS NULL OR m.status = p_status)
    ORDER BY m.match_date DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get upcoming matches for a league
CREATE OR REPLACE FUNCTION get_upcoming_matches(
    p_league_id UUID,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    match_id UUID,
    match_date TIMESTAMPTZ,
    match_week INTEGER,
    home_team_id UUID,
    home_team_name TEXT,
    home_team_logo TEXT,
    away_team_id UUID,
    away_team_name TEXT,
    away_team_logo TEXT,
    venue TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        m.id as match_id,
        m.match_date,
        m.match_week,
        ht.id as home_team_id,
        ht.name as home_team_name,
        ht.logo_url as home_team_logo,
        at.id as away_team_id,
        at.name as away_team_name,
        at.logo_url as away_team_logo,
        m.venue
    FROM matches m
    JOIN teams ht ON ht.id = m.home_team_id
    JOIN teams at ON at.id = m.away_team_id
    WHERE m.league_id = p_league_id
      AND m.status = 'scheduled'
      AND m.match_date >= NOW()
    ORDER BY m.match_date ASC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to record match result with screenshot (for eFootball)
CREATE OR REPLACE FUNCTION record_match_result(
    p_match_id UUID,
    p_home_score INTEGER,
    p_away_score INTEGER,
    p_screenshot_url TEXT DEFAULT NULL,
    p_screenshot_caption TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    admin_id UUID;
BEGIN
    -- Get current admin ID
    SELECT id INTO admin_id FROM admins WHERE user_id = auth.uid();

    IF admin_id IS NULL THEN
        RAISE EXCEPTION 'Only admins can record match results';
    END IF;

    -- Update match
    UPDATE matches
    SET home_score = p_home_score,
        away_score = p_away_score,
        status = 'completed'
    WHERE id = p_match_id;

    -- Add screenshot if provided (for eFootball)
    IF p_screenshot_url IS NOT NULL THEN
        INSERT INTO match_screenshots (match_id, image_url, caption, uploaded_by)
        VALUES (p_match_id, p_screenshot_url, p_screenshot_caption, admin_id);
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SAMPLE DATA (commented out - uncomment to use)
-- ============================================

-- /*
-- Insert sample league
INSERT INTO leagues (id, name, type, season, status) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Premier League', 'football', '2025/2026', 'upcoming'),
    ('22222222-2222-2222-2222-222222222222', 'eFootball Pro League', 'efootball', '2025/2026', 'upcoming');

-- Insert sample teams for Premier League
INSERT INTO teams (league_id, name, short_name, primary_color, secondary_color) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Manchester United', 'MU', '#DA291C', '#FFE500'),
    ('11111111-1111-1111-1111-111111111111', 'Liverpool', 'LIV', '#C8102E', '#00B2A9'),
    ('11111111-1111-1111-1111-111111111111', 'Arsenal', 'ARS', '#EF0107', '#FFFFFF'),
    ('11111111-1111-1111-1111-111111111111', 'Chelsea', 'CHE', '#034694', '#FFFFFF'),
    ('11111111-1111-1111-1111-111111111111', 'Manchester City', 'MCI', '#6CABDD', '#FFFFFF'),
    ('11111111-1111-1111-1111-111111111111', 'Tottenham Hotspur', 'TOT', '#132257', '#FFFFFF');

-- Insert sample teams for eFootball
INSERT INTO teams (league_id, name, short_name) VALUES
    ('22222222-2222-2222-2222-222222222222', 'Team Alpha', 'ALP'),
    ('22222222-2222-2222-2222-222222222222', 'Team Beta', 'BET'),
    ('22222222-2222-2222-2222-222222222222', 'Team Gamma', 'GAM'),
    ('22222222-2222-2222-2222-222222222222', 'Team Delta', 'DEL');

