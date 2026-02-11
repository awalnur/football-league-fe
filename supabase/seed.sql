-- ============================================
-- SEED DATA FOR FOOTBALL LEAGUES SYSTEM
-- Complete sample data for testing all features
-- ============================================

-- Note: Run this AFTER all migrations have been executed
-- This will populate the database with realistic test data

-- ============================================
-- 1. CREATE SAMPLE LEAGUES
-- ============================================

-- League Format: Indonesian Premier League (Top Tier)
INSERT INTO leagues (id, name, type, season, tournament_format, promotion_slots, relegation_slots, playoff_slots, status, description, start_date, end_date)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'Indonesian Premier League', 'football', '2025/2026', 'league', 0, 3, 1, 'ongoing', 'Top tier Indonesian football with 3 relegation slots and 1 playoff', '2025-08-01', '2026-05-31'),
    ('22222222-2222-2222-2222-222222222222', 'Indonesian Liga 2', 'football', '2025/2026', 'league', 2, 2, 1, 'ongoing', 'Second tier with promotion to Premier League', '2025-08-01', '2026-05-31'),
    ('33333333-3333-3333-3333-333333333333', 'Piala Indonesia 2025', 'football', '2025', 'cup', 0, 0, 0, 'ongoing', 'Annual knockout cup competition', '2025-03-01', '2025-12-31'),
    ('44444444-4444-4444-4444-444444444444', 'Champions Cup 2025', 'football', '2025', 'cup', 0, 0, 0, 'ongoing', 'Elite cup tournament with group stage', '2025-09-01', '2026-05-31'),
    ('55555555-5555-5555-5555-555555555555', 'eFootball Pro League', 'efootball', '2025', 'league', 3, 3, 0, 'ongoing', 'Top eFootball competition in Indonesia', '2025-01-15', '2025-12-15');

-- Set correct values for cup leagues
UPDATE leagues
SET has_group_stage = true, teams_per_group = 4, qualifiers_per_group = 2
WHERE id = '44444444-4444-4444-4444-444444444444';

UPDATE leagues
SET has_group_stage = false, teams_per_group = 0, qualifiers_per_group = 0
WHERE id = '33333333-3333-3333-3333-333333333333';

-- ============================================
-- 1B. SETUP LEAGUE HIERARCHY (Promotion/Relegation Links)
-- ============================================

-- Link Premier League <-> Liga 2
UPDATE leagues
SET child_league_id = '22222222-2222-2222-2222-222222222222'  -- Degradasi ke Liga 2
WHERE id = '11111111-1111-1111-1111-111111111111';  -- Premier League

UPDATE leagues
SET parent_league_id = '11111111-1111-1111-1111-111111111111'  -- Promosi ke Premier League
WHERE id = '22222222-2222-2222-2222-222222222222';  -- Liga 2

-- Note: You can create Liga 3 later and link it to Liga 2
-- For eFootball, you can create Challenger League and link to Pro League

-- ============================================
-- 2. CREATE TEAMS FOR PREMIER LEAGUE (18 teams)
-- ============================================

INSERT INTO teams (id, league_id, name, short_name, primary_color, secondary_color) VALUES
    ('a0000001-0001-0001-0001-000000000001', '11111111-1111-1111-1111-111111111111', 'Persib Bandung', 'PERSIB', '#0066CC', '#FFFFFF'),
    ('a0000001-0001-0001-0001-000000000002', '11111111-1111-1111-1111-111111111111', 'Persija Jakarta', 'PERSIJA', '#FF0000', '#FF8800'),
    ('a0000001-0001-0001-0001-000000000003', '11111111-1111-1111-1111-111111111111', 'Arema FC', 'AREMA', '#0000FF', '#FFFFFF'),
    ('a0000001-0001-0001-0001-000000000004', '11111111-1111-1111-1111-111111111111', 'Bali United', 'BALI', '#FF0000', '#000000'),
    ('a0000001-0001-0001-0001-000000000005', '11111111-1111-1111-1111-111111111111', 'PSM Makassar', 'PSM', '#FF0000', '#000000'),
    ('a0000001-0001-0001-0001-000000000006', '11111111-1111-1111-1111-111111111111', 'Madura United', 'MADURA', '#FF6600', '#000000'),
    ('a0000001-0001-0001-0001-000000000007', '11111111-1111-1111-1111-111111111111', 'Persebaya Surabaya', 'PERSEBAYA', '#00CC00', '#FFFFFF'),
    ('a0000001-0001-0001-0001-000000000008', '11111111-1111-1111-1111-111111111111', 'Borneo FC', 'BORNEO', '#FF0000', '#000000'),
    ('a0000001-0001-0001-0001-000000000009', '11111111-1111-1111-1111-111111111111', 'PSIS Semarang', 'PSIS', '#0066CC', '#FFFFFF'),
    ('a0000001-0001-0001-0001-000000000010', '11111111-1111-1111-1111-111111111111', 'PSS Sleman', 'PSS', '#FF6600', '#000000'),
    ('a0000001-0001-0001-0001-000000000011', '11111111-1111-1111-1111-111111111111', 'Persik Kediri', 'PERSIK', '#990000', '#FFCC00'),
    ('a0000001-0001-0001-0001-000000000012', '11111111-1111-1111-1111-111111111111', 'Persita Tangerang', 'PERSITA', '#660099', '#FFCC00'),
    ('a0000001-0001-0001-0001-000000000013', '11111111-1111-1111-1111-111111111111', 'Dewa United', 'DEWA', '#FF0000', '#FFCC00'),
    ('a0000001-0001-0001-0001-000000000014', '11111111-1111-1111-1111-111111111111', 'Persis Solo', 'PERSIS', '#FF0000', '#FFFFFF'),
    ('a0000001-0001-0001-0001-000000000015', '11111111-1111-1111-1111-111111111111', 'Barito Putera', 'BARITO', '#FF8800', '#000000'),
    ('a0000001-0001-0001-0001-000000000016', '11111111-1111-1111-1111-111111111111', 'Persikabo 1973', 'PERSIKABO', '#00CC00', '#000000'),
    ('a0000001-0001-0001-0001-000000000017', '11111111-1111-1111-1111-111111111111', 'Persipura Jayapura', 'PERSIPURA', '#000000', '#FF0000'),
    ('a0000001-0001-0001-0001-000000000018', '11111111-1111-1111-1111-111111111111', 'RANS Nusantara', 'RANS', '#000000', '#FFCC00');

-- ============================================
-- 3. CREATE TEAMS FOR LIGA 2 (16 teams)
-- ============================================

INSERT INTO teams (id, league_id, name, short_name, primary_color, secondary_color) VALUES
    ('a0000002-0002-0002-0002-000000000001', '22222222-2222-2222-2222-222222222222', 'Sriwijaya FC', 'SRIWIJAYA', '#FF0000', '#FFFFFF'),
    ('a0000002-0002-0002-0002-000000000002', '22222222-2222-2222-2222-222222222222', 'Persela Lamongan', 'PERSELA', '#00CC00', '#FFCC00'),
    ('a0000002-0002-0002-0002-000000000003', '22222222-2222-2222-2222-222222222222', 'PSIM Yogyakarta', 'PSIM', '#FF0000', '#FFFFFF'),
    ('a0000002-0002-0002-0002-000000000004', '22222222-2222-2222-2222-222222222222', 'Semen Padang', 'SEMEN PADANG', '#FF6600', '#000000'),
    ('a0000002-0002-0002-0002-000000000005', '22222222-2222-2222-2222-222222222222', 'Persiraja Banda Aceh', 'PERSIRAJA', '#FF0000', '#000000'),
    ('a0000002-0002-0002-0002-000000000006', '22222222-2222-2222-2222-222222222222', 'Persijap Jepara', 'PERSIJAP', '#0066CC', '#FFFFFF'),
    ('a0000002-0002-0002-0002-000000000007', '22222222-2222-2222-2222-222222222222', 'Persiba Balikpapan', 'PERSIBA', '#FFCC00', '#0066CC'),
    ('a0000002-0002-0002-0002-000000000008', '22222222-2222-2222-2222-222222222222', 'Persatu Tuban', 'PERSATU', '#00CC00', '#FFFFFF'),
    ('a0000002-0002-0002-0002-000000000009', '22222222-2222-2222-2222-222222222222', 'Persekat Tegal', 'PERSEKAT', '#0066CC', '#FFCC00'),
    ('a0000002-0002-0002-0002-000000000010', '22222222-2222-2222-2222-222222222222', 'Persekabpas Pasuruan', 'PERSEKABPAS', '#FF0000', '#FFFFFF'),
    ('a0000002-0002-0002-0002-000000000011', '22222222-2222-2222-2222-222222222222', 'Mitra Kukar', 'MITRA KUKAR', '#FFCC00', '#000000'),
    ('a0000002-0002-0002-0002-000000000012', '22222222-2222-2222-2222-222222222222', 'Martapura FC', 'MARTAPURA', '#00CC00', '#FFFFFF'),
    ('a0000002-0002-0002-0002-000000000013', '22222222-2222-2222-2222-222222222222', 'Persibat Batang', 'PERSIBAT', '#660099', '#FFCC00'),
    ('a0000002-0002-0002-0002-000000000014', '22222222-2222-2222-2222-222222222222', 'Persiku Kudus', 'PERSIKU', '#FF0000', '#FFFFFF'),
    ('a0000002-0002-0002-0002-000000000015', '22222222-2222-2222-2222-222222222222', 'Persinga Ngawi', 'PERSINGA', '#0066CC', '#FFFFFF'),
    ('a0000002-0002-0002-0002-000000000016', '22222222-2222-2222-2222-222222222222', 'Persedikab Kediri', 'PERSEDIKAB', '#00CC00', '#000000');

-- ============================================
-- 4. CREATE EFOOTBALL TEAMS (12 teams)
-- ============================================

INSERT INTO teams (id, league_id, name, short_name, primary_color, secondary_color) VALUES
    ('a0000005-0005-0005-0005-000000000001', '55555555-5555-5555-5555-555555555555', 'Jakarta Esports', 'JKT', '#FF0000', '#000000'),
    ('a0000005-0005-0005-0005-000000000002', '55555555-5555-5555-5555-555555555555', 'Bandung Gaming', 'BDG', '#0066CC', '#FFFFFF'),
    ('a0000005-0005-0005-0005-000000000003', '55555555-5555-5555-5555-555555555555', 'Surabaya Strikers', 'SBY', '#00CC00', '#FFFFFF'),
    ('a0000005-0005-0005-0005-000000000004', '55555555-5555-5555-5555-555555555555', 'Medan Masters', 'MDN', '#FFCC00', '#000000'),
    ('a0000005-0005-0005-0005-000000000005', '55555555-5555-5555-5555-555555555555', 'Bali Eagles', 'BALI', '#FF6600', '#FFFFFF'),
    ('a0000005-0005-0005-0005-000000000006', '55555555-5555-5555-5555-555555555555', 'Makassar Legends', 'MKS', '#990000', '#FFCC00'),
    ('a0000005-0005-0005-0005-000000000007', '55555555-5555-5555-5555-555555555555', 'Semarang Squad', 'SMG', '#660099', '#FFFFFF'),
    ('a0000005-0005-0005-0005-000000000008', '55555555-5555-5555-5555-555555555555', 'Yogya Dynasty', 'YOGYA', '#000000', '#FFCC00'),
    ('a0000005-0005-0005-0005-000000000009', '55555555-5555-5555-5555-555555555555', 'Palembang Phoenix', 'PLG', '#FF0000', '#FFCC00'),
    ('a0000005-0005-0005-0005-000000000010', '55555555-5555-5555-5555-555555555555', 'Malang United', 'MLG', '#0066CC', '#FFFFFF'),
    ('a0000005-0005-0005-0005-000000000011', '55555555-5555-5555-5555-555555555555', 'Balikpapan Boys', 'BPP', '#00CC00', '#000000'),
    ('a0000005-0005-0005-0005-000000000012', '55555555-5555-5555-5555-555555555555', 'Pontianak Pro', 'PTK', '#FF6600', '#000000');

-- ============================================
-- 5. CREATE CUP GROUPS FOR CHAMPIONS CUP
-- ============================================

INSERT INTO cup_groups (id, league_id, group_name) VALUES
    ('b0000001-0001-0001-0001-000000000001', '44444444-4444-4444-4444-444444444444', 'A'),
    ('b0000001-0001-0001-0001-000000000002', '44444444-4444-4444-4444-444444444444', 'B'),
    ('b0000001-0001-0001-0001-000000000003', '44444444-4444-4444-4444-444444444444', 'C'),
    ('b0000001-0001-0001-0001-000000000004', '44444444-4444-4444-4444-444444444444', 'D');

-- ============================================
-- 6. CREATE TEAMS FOR CHAMPIONS CUP (16 teams)
-- ============================================

INSERT INTO teams (id, league_id, name, short_name, primary_color, secondary_color, cup_group_id) VALUES
    ('a0000004-0004-0004-0004-000000000001', '44444444-4444-4444-4444-444444444444', 'Persib Bandung', 'PERSIB', '#0066CC', '#FFFFFF', 'b0000001-0001-0001-0001-000000000001'),
    ('a0000004-0004-0004-0004-000000000002', '44444444-4444-4444-4444-444444444444', 'Arema FC', 'AREMA', '#0000FF', '#FFFFFF', 'b0000001-0001-0001-0001-000000000001'),
    ('a0000004-0004-0004-0004-000000000003', '44444444-4444-4444-4444-444444444444', 'PSM Makassar', 'PSM', '#FF0000', '#000000', 'b0000001-0001-0001-0001-000000000001'),
    ('a0000004-0004-0004-0004-000000000004', '44444444-4444-4444-4444-444444444444', 'Bali United', 'BALI', '#FF0000', '#000000', 'b0000001-0001-0001-0001-000000000001'),
    ('a0000004-0004-0004-0004-000000000005', '44444444-4444-4444-4444-444444444444', 'Persija Jakarta', 'PERSIJA', '#FF0000', '#FF8800', 'b0000001-0001-0001-0001-000000000002'),
    ('a0000004-0004-0004-0004-000000000006', '44444444-4444-4444-4444-444444444444', 'Madura United', 'MADURA', '#FF6600', '#000000', 'b0000001-0001-0001-0001-000000000002'),
    ('a0000004-0004-0004-0004-000000000007', '44444444-4444-4444-4444-444444444444', 'Borneo FC', 'BORNEO', '#FF0000', '#000000', 'b0000001-0001-0001-0001-000000000002'),
    ('a0000004-0004-0004-0004-000000000008', '44444444-4444-4444-4444-444444444444', 'PSIS Semarang', 'PSIS', '#0066CC', '#FFFFFF', 'b0000001-0001-0001-0001-000000000002'),
    ('a0000004-0004-0004-0004-000000000009', '44444444-4444-4444-4444-444444444444', 'Persebaya Surabaya', 'PERSEBAYA', '#00CC00', '#FFFFFF', 'b0000001-0001-0001-0001-000000000003'),
    ('a0000004-0004-0004-0004-000000000010', '44444444-4444-4444-4444-444444444444', 'PSS Sleman', 'PSS', '#FF6600', '#000000', 'b0000001-0001-0001-0001-000000000003'),
    ('a0000004-0004-0004-0004-000000000011', '44444444-4444-4444-4444-444444444444', 'Persik Kediri', 'PERSIK', '#990000', '#FFCC00', 'b0000001-0001-0001-0001-000000000003'),
    ('a0000004-0004-0004-0004-000000000012', '44444444-4444-4444-4444-444444444444', 'Dewa United', 'DEWA', '#FF0000', '#FFCC00', 'b0000001-0001-0001-0001-000000000003'),
    ('a0000004-0004-0004-0004-000000000013', '44444444-4444-4444-4444-444444444444', 'Persita Tangerang', 'PERSITA', '#660099', '#FFCC00', 'b0000001-0001-0001-0001-000000000004'),
    ('a0000004-0004-0004-0004-000000000014', '44444444-4444-4444-4444-444444444444', 'Persis Solo', 'PERSIS', '#FF0000', '#FFFFFF', 'b0000001-0001-0001-0001-000000000004'),
    ('a0000004-0004-0004-0004-000000000015', '44444444-4444-4444-4444-444444444444', 'Barito Putera', 'BARITO', '#FF8800', '#000000', 'b0000001-0001-0001-0001-000000000004'),
    ('a0000004-0004-0004-0004-000000000016', '44444444-4444-4444-4444-444444444444', 'Persikabo 1973', 'PERSIKABO', '#00CC00', '#000000', 'b0000001-0001-0001-0001-000000000004');

-- ============================================
-- 7. CREATE SAMPLE GAMERS FOR EFOOTBALL
-- ============================================

INSERT INTO game_players (team_id, real_name, gamertag, phone, discord, is_captain) VALUES
    ('a0000005-0005-0005-0005-000000000001', 'Budi Santoso', 'BudiGaming_ID', '+6281234567890', 'BudiGaming#1234', true),
    ('a0000005-0005-0005-0005-000000000001', 'Ahmad Rizki', 'RizkiPro99', '+6281234567891', 'RizkiPro#5678', false),
    ('a0000005-0005-0005-0005-000000000002', 'Dedi Kurniawan', 'DediMaster', '+6281234567892', 'DediMaster#9012', true),
    ('a0000005-0005-0005-0005-000000000002', 'Eko Prasetyo', 'EkoPro_BDG', '+6281234567893', 'EkoPro#3456', false),
    ('a0000005-0005-0005-0005-000000000003', 'Fajar Hidayat', 'FajarLegend', '+6281234567894', 'FajarLegend#7890', true),
    ('a0000005-0005-0005-0005-000000000003', 'Gilang Ramadan', 'GilangSBY', '+6281234567895', 'GilangSBY#1234', false);

-- ============================================
-- 8. AUTO-CREATE LEAGUE ZONES
-- ============================================

-- Premier League zones
SELECT auto_create_league_zones('11111111-1111-1111-1111-111111111111');

-- Liga 2 zones
SELECT auto_create_league_zones('22222222-2222-2222-2222-222222222222');

-- eFootball zones
SELECT auto_create_league_zones('55555555-5555-5555-5555-555555555555');

-- ============================================
-- 9. CREATE SAMPLE STANDINGS (with some data)
-- ============================================

-- Update some standings manually for Premier League to show variety
UPDATE standings SET
    played = 10, won = 7, drawn = 2, lost = 1,
    goals_for = 21, goals_against = 8, goal_difference = 13, points = 23,
    form = 'WWDWW'
WHERE team_id = 'a0000001-0001-0001-0001-000000000001' AND league_id = '11111111-1111-1111-1111-111111111111';

UPDATE standings SET
    played = 10, won = 7, drawn = 1, lost = 2,
    goals_for = 18, goals_against = 9, goal_difference = 9, points = 22,
    form = 'WLWWW'
WHERE team_id = 'a0000001-0001-0001-0001-000000000002' AND league_id = '11111111-1111-1111-1111-111111111111';

UPDATE standings SET
    played = 10, won = 6, drawn = 3, lost = 1,
    goals_for = 17, goals_against = 8, goal_difference = 9, points = 21,
    form = 'DWDWW'
WHERE team_id = 'a0000001-0001-0001-0001-000000000003' AND league_id = '11111111-1111-1111-1111-111111111111';

UPDATE standings SET
    played = 10, won = 6, drawn = 2, lost = 2,
    goals_for = 19, goals_against = 11, goal_difference = 8, points = 20,
    form = 'WLWWD'
WHERE team_id = 'a0000001-0001-0001-0001-000000000004' AND league_id = '11111111-1111-1111-1111-111111111111';

UPDATE standings SET
    played = 10, won = 2, drawn = 3, lost = 5,
    goals_for = 9, goals_against = 16, goal_difference = -7, points = 9,
    form = 'LLDWL'
WHERE team_id = 'a0000001-0001-0001-0001-000000000017' AND league_id = '11111111-1111-1111-1111-111111111111';

UPDATE standings SET
    played = 10, won = 1, drawn = 2, lost = 7,
    goals_for = 7, goals_against = 20, goal_difference = -13, points = 5,
    form = 'LLLLD'
WHERE team_id = 'a0000001-0001-0001-0001-000000000018' AND league_id = '11111111-1111-1111-1111-111111111111';

-- Update cup standings for group A
UPDATE cup_standings SET
    played = 3, won = 3, drawn = 0, lost = 0,
    goals_for = 8, goals_against = 2, goal_difference = 6, points = 9,
    qualified = true
WHERE team_id = 'a0000004-0004-0004-0004-000000000001' AND cup_group_id = 'b0000001-0001-0001-0001-000000000001';

UPDATE cup_standings SET
    played = 3, won = 2, drawn = 0, lost = 1,
    goals_for = 6, goals_against = 4, goal_difference = 2, points = 6,
    qualified = true
WHERE team_id = 'a0000004-0004-0004-0004-000000000002' AND cup_group_id = 'b0000001-0001-0001-0001-000000000001';

UPDATE cup_standings SET
    played = 3, won = 1, drawn = 0, lost = 2,
    goals_for = 4, goals_against = 6, goal_difference = -2, points = 3,
    qualified = false
WHERE team_id = 'a0000004-0004-0004-0004-000000000003' AND cup_group_id = 'b0000001-0001-0001-0001-000000000001';

UPDATE cup_standings SET
    played = 3, won = 0, drawn = 0, lost = 3,
    goals_for = 2, goals_against = 8, goal_difference = -6, points = 0,
    qualified = false
WHERE team_id = 'a0000004-0004-0004-0004-000000000004' AND cup_group_id = 'b0000001-0001-0001-0001-000000000001';

-- ============================================
-- 10. CREATE SAMPLE MATCHES
-- ============================================

-- Premier League - Week 1
INSERT INTO matches (league_id, home_team_id, away_team_id, match_week, match_date, status, home_score, away_score, venue) VALUES
    ('11111111-1111-1111-1111-111111111111', 'a0000001-0001-0001-0001-000000000001', 'a0000001-0001-0001-0001-000000000002', 1, '2025-08-10 19:00:00', 'completed', 2, 1, 'Stadion Gelora Bandung Lautan Api'),
    ('11111111-1111-1111-1111-111111111111', 'a0000001-0001-0001-0001-000000000003', 'a0000001-0001-0001-0001-000000000004', 1, '2025-08-10 19:00:00', 'completed', 1, 1, 'Stadion Kanjuruhan'),
    ('11111111-1111-1111-1111-111111111111', 'a0000001-0001-0001-0001-000000000005', 'a0000001-0001-0001-0001-000000000006', 1, '2025-08-11 15:30:00', 'completed', 3, 0, 'Stadion Mattoanging'),
    ('11111111-1111-1111-1111-111111111111', 'a0000001-0001-0001-0001-000000000007', 'a0000001-0001-0001-0001-000000000008', 1, '2025-08-11 19:00:00', 'completed', 2, 2, 'Stadion Gelora Bung Tomo');

-- Cup Group Stage matches
INSERT INTO matches (league_id, home_team_id, away_team_id, match_week, cup_stage, match_date, status, home_score, away_score) VALUES
    ('44444444-4444-4444-4444-444444444444', 'a0000004-0004-0004-0004-000000000001', 'a0000004-0004-0004-0004-000000000002', 1, 'group_stage', '2025-09-15 19:00:00', 'completed', 3, 1),
    ('44444444-4444-4444-4444-444444444444', 'a0000004-0004-0004-0004-000000000003', 'a0000004-0004-0004-0004-000000000004', 1, 'group_stage', '2025-09-15 19:00:00', 'completed', 1, 2),
    ('44444444-4444-4444-4444-444444444444', 'a0000004-0004-0004-0004-000000000001', 'a0000004-0004-0004-0004-000000000003', 2, 'group_stage', '2025-09-22 19:00:00', 'completed', 2, 0),
    ('44444444-4444-4444-4444-444444444444', 't0000004-0004-0004-0004-000000000002', 't0000004-0004-0004-0004-000000000004', 2, 'group_stage', '2025-09-22 19:00:00', 'completed', 3, 0);

-- ============================================
-- Champions Cup - Knockout Stage Matches
-- ============================================

-- ROUND OF 16 (8 matches)
INSERT INTO matches (league_id, home_team_id, away_team_id, match_week, cup_stage, match_date, status, home_score, away_score, venue) VALUES
    -- Match 1: Persib vs Arema (completed)
    ('44444444-4444-4444-4444-444444444444', 't0000004-0004-0004-0004-000000000001', 't0000004-0004-0004-0004-000000000003', 1, 'round_of_16', '2025-10-05 19:00:00', 'completed', 2, 1, 'Stadion GBLA'),
    -- Match 2: PSM vs Bali United (completed with penalties)
    ('44444444-4444-4444-4444-444444444444', 't0000004-0004-0004-0004-000000000002', 't0000004-0004-0004-0004-000000000004', 1, 'round_of_16', '2025-10-05 19:00:00', 'completed', 2, 2, 'Stadion Mattoanging'),
    -- Match 3: Persebaya vs Borneo (completed)
    ('44444444-4444-4444-4444-444444444444', 't0000004-0004-0004-0004-000000000005', 't0000004-0004-0004-0004-000000000006', 1, 'round_of_16', '2025-10-06 15:30:00', 'completed', 3, 1, 'Stadion GBT'),
    -- Match 4: PSIS vs Madura (completed with extra time)
    ('44444444-4444-4444-4444-444444444444', 't0000004-0004-0004-0004-000000000007', 't0000004-0004-0004-0004-000000000008', 1, 'round_of_16', '2025-10-06 19:00:00', 'completed', 2, 1, 'Stadion Jatidiri'),
    -- Match 5: PSS vs Persik (completed)
    ('44444444-4444-4444-4444-444444444444', 't0000004-0004-0004-0004-000000000009', 't0000004-0004-0004-0004-000000000010', 1, 'round_of_16', '2025-10-07 19:00:00', 'completed', 1, 0, 'Stadion Maguwoharjo'),
    -- Match 6: Persita vs Dewa United (completed)
    ('44444444-4444-4444-4444-444444444444', 't0000004-0004-0004-0004-000000000011', 't0000004-0004-0004-0004-000000000012', 1, 'round_of_16', '2025-10-07 19:00:00', 'completed', 2, 1, 'Stadion Indomilk Arena'),
    -- Match 7: Persis vs Barito (scheduled)
    ('44444444-4444-4444-4444-444444444444', 't0000004-0004-0004-0004-000000000013', 't0000004-0004-0004-0004-000000000014', 1, 'round_of_16', '2025-10-08 19:00:00', 'scheduled', NULL, NULL, 'Stadion Manahan'),
    -- Match 8: Persipura vs RANS (scheduled)
    ('44444444-4444-4444-4444-444444444444', 't0000004-0004-0004-0004-000000000015', 't0000004-0004-0004-0004-000000000016', 1, 'round_of_16', '2025-10-08 19:00:00', 'scheduled', NULL, NULL, 'Stadion Mandala');

-- Update Match 2 with penalty shootout details
UPDATE matches
SET is_penalty = true, home_penalty_score = 4, away_penalty_score = 5, aggregate_winner_id = 't0000004-0004-0004-0004-000000000004'
WHERE league_id = '44444444-4444-4444-4444-444444444444'
  AND home_team_id = 't0000004-0004-0004-0004-000000000002'
  AND cup_stage = 'round_of_16';

-- Update Match 4 with extra time
UPDATE matches
SET is_extra_time = true
WHERE league_id = '44444444-4444-4444-4444-444444444444'
  AND home_team_id = 't0000004-0004-0004-0004-000000000007'
  AND cup_stage = 'round_of_16';

-- QUARTER FINALS (4 matches)
INSERT INTO matches (league_id, home_team_id, away_team_id, match_week, cup_stage, match_date, status, home_score, away_score, venue) VALUES
    -- QF1: Persib vs Bali United (winner of R16 Match 1 vs winner of R16 Match 2) - completed
    ('44444444-4444-4444-4444-444444444444', 't0000004-0004-0004-0004-000000000001', 't0000004-0004-0004-0004-000000000004', 1, 'quarter_final', '2025-10-20 19:00:00', 'completed', 3, 2, 'Stadion GBLA'),
    -- QF2: Persebaya vs PSIS (winner of R16 Match 3 vs winner of R16 Match 4) - completed with penalties
    ('44444444-4444-4444-4444-444444444444', 't0000004-0004-0004-0004-000000000005', 't0000004-0004-0004-0004-000000000007', 1, 'quarter_final', '2025-10-20 19:00:00', 'completed', 1, 1, 'Stadion GBT'),
    -- QF3: PSS vs Persita (winner of R16 Match 5 vs winner of R16 Match 6) - completed
    ('44444444-4444-4444-4444-444444444444', 't0000004-0004-0004-0004-000000000009', 't0000004-0004-0004-0004-000000000011', 1, 'quarter_final', '2025-10-21 19:00:00', 'completed', 2, 0, 'Stadion Maguwoharjo'),
    -- QF4: TBD vs TBD (winner of R16 Match 7 vs winner of R16 Match 8) - scheduled
    ('44444444-4444-4444-4444-444444444444', 't0000004-0004-0004-0004-000000000013', 't0000004-0004-0004-0004-000000000015', 1, 'quarter_final', '2025-10-21 19:00:00', 'scheduled', NULL, NULL, 'Stadion Manahan');

-- Update QF2 with penalty shootout
UPDATE matches
SET is_penalty = true, home_penalty_score = 5, away_penalty_score = 3, aggregate_winner_id = 't0000004-0004-0004-0004-000000000005'
WHERE league_id = '44444444-4444-4444-4444-444444444444'
  AND home_team_id = 't0000004-0004-0004-0004-000000000005'
  AND cup_stage = 'quarter_final';

-- SEMI FINALS (2 matches)
INSERT INTO matches (league_id, home_team_id, away_team_id, match_week, cup_stage, match_date, status, home_score, away_score, venue) VALUES
    -- SF1: Persib vs Persebaya (winner QF1 vs winner QF2) - completed
    ('44444444-4444-4444-4444-444444444444', 't0000004-0004-0004-0004-000000000001', 't0000004-0004-0004-0004-000000000005', 1, 'semi_final', '2025-11-03 19:00:00', 'completed', 2, 1, 'Stadion GBLA'),
    -- SF2: PSS vs TBD (winner QF3 vs winner QF4) - scheduled
    ('44444444-4444-4444-4444-444444444444', 't0000004-0004-0004-0004-000000000009', 't0000004-0004-0004-0004-000000000013', 1, 'semi_final', '2025-11-03 19:00:00', 'scheduled', NULL, NULL, 'Stadion Maguwoharjo');

-- THIRD PLACE MATCH (1 match)
INSERT INTO matches (league_id, home_team_id, away_team_id, match_week, cup_stage, match_date, status, home_score, away_score, venue) VALUES
    -- 3rd Place: Persebaya vs TBD (loser SF1 vs loser SF2) - scheduled
    ('44444444-4444-4444-4444-444444444444', 't0000004-0004-0004-0004-000000000005', 't0000004-0004-0004-0004-000000000009', 1, 'third_place', '2025-11-17 15:30:00', 'scheduled', NULL, NULL, 'Stadion Utama GBK');

-- FINAL (1 match)
INSERT INTO matches (league_id, home_team_id, away_team_id, match_week, cup_stage, match_date, status, home_score, away_score, venue) VALUES
    -- Final: Persib vs TBD (winner SF1 vs winner SF2) - scheduled
    ('44444444-4444-4444-4444-444444444444', 't0000004-0004-0004-0004-000000000001', 't0000004-0004-0004-0004-000000000013', 1, 'final', '2025-11-17 19:00:00', 'scheduled', NULL, NULL, 'Stadion Utama GBK');

-- Upcoming matches
INSERT INTO matches (league_id, home_team_id, away_team_id, match_week, match_date, status, venue) VALUES
    ('11111111-1111-1111-1111-111111111111', 't0000001-0001-0001-0001-000000000009', 't0000001-0001-0001-0001-000000000010', 2, '2025-08-17 15:30:00', 'scheduled', 'Stadion Jatidiri'),
    ('11111111-1111-1111-1111-111111111111', 't0000001-0001-0001-0001-000000000011', 't0000001-0001-0001-0001-000000000012', 2, '2025-08-17 19:00:00', 'scheduled', 'Stadion Brawijaya');

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- ============================================
-- 11. CREATE SAMPLE TEAM MOVEMENTS (Historical Data)
-- ============================================

-- Sample: Teams that were promoted from Liga 2 to Premier League in 2024/2025 season
INSERT INTO team_movements (team_id, from_league_id, to_league_id, movement_type, season, final_position, notes) VALUES
    -- Persipura was promoted from Liga 2 (finished 1st)
    ('t0000001-0001-0001-0001-000000000017', '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'promotion', '2024/2025', 1, 'Champions of Liga 2, promoted to Premier League'),
    -- RANS was promoted from Liga 2 (finished 2nd)
    ('t0000001-0001-0001-0001-000000000018', '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'promotion', '2024/2025', 2, 'Runner-up of Liga 2, automatic promotion'),
    -- Sriwijaya won playoff from Liga 2
    ('t0000002-0002-0002-0002-000000000001', '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'playoff_winner', '2023/2024', 3, 'Won promotion playoff');

-- ============================================
-- 12. VERIFICATION QUERIES
-- ============================================

-- Check total leagues
-- SELECT COUNT(*) as total_leagues FROM leagues;

-- Check teams per league
-- SELECT l.name, COUNT(t.id) as team_count
-- FROM leagues l
-- LEFT JOIN teams t ON t.league_id = l.id
-- GROUP BY l.name;

-- Check zones created
-- SELECT l.name, COUNT(z.id) as zone_count
-- FROM leagues l
-- LEFT JOIN league_zones z ON z.league_id = l.id
-- GROUP BY l.name;

-- Check cup groups
-- SELECT l.name, COUNT(g.id) as group_count
-- FROM leagues l
-- LEFT JOIN cup_groups g ON g.league_id = l.id
-- GROUP BY l.name;

-- ============================================
-- NOTES
-- ============================================
-- This seed data includes:
-- ✅ 5 leagues (2 regular leagues, 2 cups, 1 efootball)
-- ✅ 62 teams total
-- ✅ Auto-generated zones for league formats
-- ✅ 4 cup groups with teams assigned
-- ✅ Sample matches with results
-- ✅ Sample standings data
-- ✅ Sample gamers for efootball
--
-- Ready to test all features!
-- ============================================
