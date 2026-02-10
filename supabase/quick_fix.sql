-- ============================================
-- QUICK FIX SCRIPT
-- Use this if you encounter issues with seed.sql
-- ============================================

-- ============================================
-- 1. CLEAN UP (Optional - if you want to start fresh)
-- ============================================

-- Uncomment to delete all seed data:
/*
DELETE FROM matches WHERE league_id IN (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333',
    '44444444-4444-4444-4444-444444444444',
    '55555555-5555-5555-5555-555555555555'
);

DELETE FROM game_players WHERE team_id IN (
    SELECT id FROM teams WHERE league_id IN (
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222',
        '33333333-3333-3333-3333-333333333333',
        '44444444-4444-4444-4444-444444444444',
        '55555555-5555-5555-5555-555555555555'
    )
);

DELETE FROM cup_standings WHERE cup_group_id IN (
    SELECT id FROM cup_groups WHERE league_id IN (
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222',
        '33333333-3333-3333-3333-333333333333',
        '44444444-4444-4444-4444-444444444444',
        '55555555-5555-5555-5555-555555555555'
    )
);

DELETE FROM standings WHERE league_id IN (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333',
    '44444444-4444-4444-4444-444444444444',
    '55555555-5555-5555-5555-555555555555'
);

DELETE FROM teams WHERE league_id IN (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333',
    '44444444-4444-4444-4444-444444444444',
    '55555555-5555-5555-5555-555555555555'
);

DELETE FROM league_zones WHERE league_id IN (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333',
    '44444444-4444-4444-4444-444444444444',
    '55555555-5555-5555-5555-555555555555'
);

DELETE FROM cup_groups WHERE league_id IN (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333',
    '44444444-4444-4444-4444-444444444444',
    '55555555-5555-5555-5555-555555555555'
);

DELETE FROM leagues WHERE id IN (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333',
    '44444444-4444-4444-4444-444444444444',
    '55555555-5555-5555-5555-555555555555'
);
*/

-- ============================================
-- 2. VERIFY TABLE STRUCTURE
-- ============================================

-- Check if all required columns exist
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'leagues'
AND column_name IN (
    'tournament_format',
    'promotion_slots',
    'relegation_slots',
    'playoff_slots',
    'has_group_stage',
    'teams_per_group',
    'qualifiers_per_group'
)
ORDER BY column_name;

-- Expected output:
-- has_group_stage     | boolean | YES
-- playoff_slots       | integer | YES
-- promotion_slots     | integer | YES
-- qualifiers_per_group| integer | YES
-- relegation_slots    | integer | YES
-- teams_per_group     | integer | YES
-- tournament_format   | USER-DEFINED | NO

-- ============================================
-- 3. COMMON ISSUES & FIXES
-- ============================================

-- Issue: Type mismatch for boolean columns
-- Fix: Make sure boolean columns use true/false (not 0/1)
-- Example:
-- WRONG:  has_group_stage = 1
-- RIGHT:  has_group_stage = true

-- Issue: Type mismatch for integer columns
-- Fix: Make sure integer columns use numbers (not true/false)
-- Example:
-- WRONG:  promotion_slots = false
-- RIGHT:  promotion_slots = 0

-- Issue: Enum type values
-- Fix: Make sure tournament_format uses valid enum values
-- Valid values: 'league', 'cup', 'league_cup'
-- Example:
-- WRONG:  tournament_format = 'tournament'
-- RIGHT:  tournament_format = 'league'

-- ============================================
-- 4. MANUAL INSERT EXAMPLES (If needed)
-- ============================================

-- Example: Create a simple league
INSERT INTO leagues (
    name,
    type,
    season,
    tournament_format,
    promotion_slots,
    relegation_slots,
    playoff_slots,
    status
) VALUES (
    'Test League',
    'football',
    '2025/2026',
    'league',
    2,              -- INTEGER, not boolean
    3,              -- INTEGER, not boolean
    1,              -- INTEGER, not boolean
    'ongoing'
);

-- Example: Create a cup with group stage
INSERT INTO leagues (
    name,
    type,
    season,
    tournament_format,
    has_group_stage,
    teams_per_group,
    qualifiers_per_group,
    status
) VALUES (
    'Test Cup',
    'football',
    '2025',
    'cup',
    true,           -- BOOLEAN, not integer
    4,              -- INTEGER
    2,              -- INTEGER
    'ongoing'
);

-- ============================================
-- 5. VERIFICATION QUERIES
-- ============================================

-- Count leagues by format
SELECT
    tournament_format,
    COUNT(*) as count
FROM leagues
GROUP BY tournament_format;

-- Check leagues with zones
SELECT
    l.name,
    l.tournament_format,
    l.promotion_slots,
    l.playoff_slots,
    l.relegation_slots,
    COUNT(z.id) as zone_count
FROM leagues l
LEFT JOIN league_zones z ON z.league_id = l.id
GROUP BY l.id, l.name, l.tournament_format, l.promotion_slots, l.playoff_slots, l.relegation_slots
ORDER BY l.name;

-- Check cup groups
SELECT
    l.name as league_name,
    l.has_group_stage,
    COUNT(DISTINCT g.id) as group_count,
    COUNT(t.id) as team_count
FROM leagues l
LEFT JOIN cup_groups g ON g.league_id = l.id
LEFT JOIN teams t ON t.cup_group_id = g.id
WHERE l.tournament_format IN ('cup', 'league_cup')
GROUP BY l.id, l.name, l.has_group_stage
ORDER BY l.name;

-- ============================================
-- 6. TROUBLESHOOTING TIPS
-- ============================================

/*
ERROR: column "X" is of type integer but expression is of type boolean
FIX: Change false/true to 0/integer number in the INSERT statement

ERROR: column "X" is of type boolean but expression is of type integer
FIX: Change 0/1 to false/true in the INSERT statement

ERROR: invalid input value for enum
FIX: Make sure you use 'league', 'cup', or 'league_cup' for tournament_format

ERROR: foreign key violation
FIX: Make sure parent records exist before inserting child records
Order: leagues → teams → matches/game_players

ERROR: duplicate key value
FIX: Use different IDs or delete existing records first
*/

-- ============================================
-- 7. RESET SPECIFIC LEAGUE
-- ============================================

-- Example: Reset Premier League data
/*
DO $$
DECLARE
    league_uuid UUID := '11111111-1111-1111-1111-111111111111';
BEGIN
    -- Delete in correct order
    DELETE FROM matches WHERE league_id = league_uuid;
    DELETE FROM game_players WHERE team_id IN (SELECT id FROM teams WHERE league_id = league_uuid);
    DELETE FROM cup_standings WHERE team_id IN (SELECT id FROM teams WHERE league_id = league_uuid);
    DELETE FROM standings WHERE league_id = league_uuid;
    DELETE FROM teams WHERE league_id = league_uuid;
    DELETE FROM league_zones WHERE league_id = league_uuid;
    DELETE FROM cup_groups WHERE league_id = league_uuid;
    DELETE FROM leagues WHERE id = league_uuid;

    RAISE NOTICE 'League data cleared successfully';
END $$;
*/
