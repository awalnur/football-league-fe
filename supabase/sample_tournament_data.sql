-- ============================================
-- SAMPLE DATA FOR TESTING NEW FEATURES
-- Tournament Format & Relegation System
-- ============================================

-- This file contains sample data to test the new features.
-- Run this AFTER running the main migration.

-- ============================================
-- 1. CREATE SAMPLE LEAGUES
-- ============================================

-- League Format: Divisi 1 with relegation
INSERT INTO leagues (name, type, season, tournament_format, promotion_slots, relegation_slots, playoff_slots, status, description)
VALUES (
    'Indonesian Super League - Divisi 1',
    'football',
    '2025/2026',
    'league',
    0,  -- No promotion (top tier)
    3,  -- 3 teams relegated
    1,  -- 1 team in playoff
    'ongoing',
    'Top tier Indonesian football league with relegation to Divisi 2'
) RETURNING id;

-- Store the league ID for later use
-- Let's say it returns: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

-- League Format: Divisi 2 with promotion and relegation
INSERT INTO leagues (name, type, season, tournament_format, promotion_slots, relegation_slots, playoff_slots, status, description)
VALUES (
    'Indonesian Super League - Divisi 2',
    'football',
    '2025/2026',
    'league',
    2,  -- 2 teams promoted
    3,  -- 3 teams relegated
    1,  -- 1 team in playoff
    'ongoing',
    'Second tier with promotion to Divisi 1 and relegation to Divisi 3'
) RETURNING id;

-- Cup Format: Champions Cup with group stage
INSERT INTO leagues (name, type, season, tournament_format, has_group_stage, teams_per_group, qualifiers_per_group, status, description)
VALUES (
    'Indonesian Champions Cup 2025',
    'football',
    '2025',
    'cup',
    true,   -- Has group stage
    4,      -- 4 teams per group
    2,      -- Top 2 qualify
    'ongoing',
    'Annual cup tournament with group stage and knockout rounds'
) RETURNING id;

-- eFootball League with zones
INSERT INTO leagues (name, type, season, tournament_format, promotion_slots, relegation_slots, status, description)
VALUES (
    'eFootball Pro League',
    'efootball',
    '2025',
    'league',
    3,  -- 3 teams promoted
    3,  -- 3 teams relegated
    'ongoing',
    'Competitive eFootball league with seasonal promotion/relegation'
) RETURNING id;

-- ============================================
-- 2. CREATE SAMPLE TEAMS
-- ============================================

-- Note: Replace 'LEAGUE_ID_HERE' with actual league IDs from above

-- For Divisi 1 (16 teams)
-- INSERT INTO teams (league_id, name, short_name) VALUES
-- ('DIVISI_1_ID', 'Persib Bandung', 'PERSIB'),
-- ('DIVISI_1_ID', 'Persija Jakarta', 'PERSIJA'),
-- ... (add 14 more teams)

-- ============================================
-- 3. CREATE LEAGUE ZONES
-- ============================================

-- For Divisi 1 (no promotion, 1 playoff, 3 relegation)
-- Assuming 16 teams total

-- Call the auto-create function (recommended)
-- SELECT auto_create_league_zones('DIVISI_1_ID');

-- Or create manually:
-- INSERT INTO league_zones (league_id, zone_type, position_start, position_end, color_code, label) VALUES
-- ('DIVISI_1_ID', 'playoff', 14, 14, '#3b82f6', 'Playoff Degradasi'),
-- ('DIVISI_1_ID', 'relegation', 15, 16, '#ef4444', 'Degradasi ke Divisi 2');

-- For Divisi 2 (2 promotion, 1 playoff, 3 relegation)
-- SELECT auto_create_league_zones('DIVISI_2_ID');

-- ============================================
-- 4. CREATE CUP GROUPS
-- ============================================

-- For Champions Cup (4 groups: A, B, C, D)
-- INSERT INTO cup_groups (league_id, group_name) VALUES
-- ('CHAMPIONS_CUP_ID', 'A'),
-- ('CHAMPIONS_CUP_ID', 'B'),
-- ('CHAMPIONS_CUP_ID', 'C'),
-- ('CHAMPIONS_CUP_ID', 'D');

-- ============================================
-- 5. ASSIGN TEAMS TO CUP GROUPS
-- ============================================

-- After creating teams for the cup tournament:
-- UPDATE teams SET cup_group_id = 'GROUP_A_ID' WHERE id IN ('TEAM_1_ID', 'TEAM_2_ID', 'TEAM_3_ID', 'TEAM_4_ID');
-- UPDATE teams SET cup_group_id = 'GROUP_B_ID' WHERE id IN ('TEAM_5_ID', 'TEAM_6_ID', 'TEAM_7_ID', 'TEAM_8_ID');
-- etc...

-- ============================================
-- 6. SAMPLE MATCHES FOR LEAGUE
-- ============================================

-- Use the existing generate_league_schedule function:
-- SELECT generate_league_schedule('DIVISI_1_ID', '2025-03-01'::date, 7, 2);

-- Then add some results:
-- UPDATE matches
-- SET status = 'completed', home_score = 3, away_score = 1
-- WHERE id = 'MATCH_ID_1';

-- ============================================
-- 7. SAMPLE MATCHES FOR CUP GROUP STAGE
-- ============================================

-- Create group stage matches manually:
-- INSERT INTO matches (league_id, home_team_id, away_team_id, match_week, cup_stage, match_date, status) VALUES
-- ('CHAMPIONS_CUP_ID', 'TEAM_1_ID', 'TEAM_2_ID', 1, 'group_stage', '2025-03-01 19:00:00', 'scheduled');

-- Add results:
-- UPDATE matches
-- SET status = 'completed', home_score = 2, away_score = 1
-- WHERE id = 'GROUP_MATCH_ID_1';
-- (This will auto-update cup_standings via trigger)

-- ============================================
-- 8. QUERY EXAMPLES
-- ============================================

-- View league standings with zones
-- SELECT
--     s.*,
--     t.name as team_name,
--     z.zone_type,
--     z.label as zone_label,
--     z.color_code
-- FROM standings s
-- JOIN teams t ON t.id = s.team_id
-- LEFT JOIN league_zones z ON z.league_id = s.league_id
--     AND (ROW_NUMBER() OVER (PARTITION BY s.league_id ORDER BY s.points DESC, s.goal_difference DESC))
--         BETWEEN z.position_start AND z.position_end
-- WHERE s.league_id = 'LEAGUE_ID'
-- ORDER BY s.points DESC, s.goal_difference DESC;

-- View cup group standings
-- SELECT
--     g.group_name,
--     cs.*,
--     t.name as team_name
-- FROM cup_standings cs
-- JOIN teams t ON t.id = cs.team_id
-- JOIN cup_groups g ON g.id = cs.cup_group_id
-- WHERE g.league_id = 'CUP_ID'
-- ORDER BY g.group_name, cs.points DESC, cs.goal_difference DESC;

-- ============================================
-- CLEANUP (if needed)
-- ============================================

-- To remove sample data:
-- DELETE FROM matches WHERE league_id IN (SELECT id FROM leagues WHERE name LIKE '%Sample%');
-- DELETE FROM teams WHERE league_id IN (SELECT id FROM leagues WHERE name LIKE '%Sample%');
-- DELETE FROM league_zones WHERE league_id IN (SELECT id FROM leagues WHERE name LIKE '%Sample%');
-- DELETE FROM cup_groups WHERE league_id IN (SELECT id FROM leagues WHERE name LIKE '%Sample%');
-- DELETE FROM leagues WHERE name LIKE '%Sample%';
