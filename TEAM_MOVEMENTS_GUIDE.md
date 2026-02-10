# 🔄 Team Movements & Promotion/Relegation System

## ✅ Fitur Baru yang Ditambahkan

### 1. **Hierarki Liga (League Hierarchy)**
- Link antar liga untuk promosi/degradasi
- Parent league (liga atas untuk promosi)
- Child league (liga bawah untuk degradasi)

### 2. **Team Movements Tracking**
- Histori perpindahan tim antar liga
- Track tipe movement (promosi, degradasi, playoff, transfer)
- Rekam posisi akhir dan musim

### 3. **Automated Season End**
- Fungsi otomatis untuk eksekusi promosi/degradasi
- Identifikasi tim eligible untuk naik/turun
- Update league assignment otomatis

---

## 📁 Files Baru

### Migration
- **`20260209000002_add_team_movements.sql`** - Migration untuk team movements

### Components
- **`TeamMovementsTable.tsx`** - Tabel riwayat perpindahan tim
- **`LeagueHierarchyView.tsx`** - Visualisasi hierarki liga

### Updates
- **`supabase.ts`** - 7 fungsi API baru
- **`supabase/types.ts`** - Interface TeamMovement & extended types
- **`seed.sql`** - Setup hierarki dan sample movements

---

## 🗄️ Database Schema

### Table: `team_movements`
```sql
{
  id: UUID,
  team_id: UUID,
  from_league_id: UUID,
  to_league_id: UUID,
  movement_type: 'promotion' | 'relegation' | 'playoff_winner' | 'playoff_loser' | 'transfer',
  season: TEXT,
  final_position: INTEGER,  -- Posisi akhir sebelum pindah
  notes: TEXT,
  movement_date: TIMESTAMP,
  created_at: TIMESTAMP
}
```

### Updated: `leagues` table
```sql
ALTER TABLE leagues
ADD COLUMN child_league_id UUID;  -- Liga di bawah untuk degradasi
```

### View: `league_hierarchy`
View yang menampilkan hierarki liga lengkap dengan parent/child relationships.

---

## 🔧 Database Functions

### 1. `get_promotion_eligible_teams(league_id)`
Mendapatkan tim yang eligible untuk promosi berdasarkan standings.

**Returns:**
```typescript
{
  team_id: UUID,
  team_name: TEXT,
  position: INTEGER,
  points: INTEGER,
  movement_type: 'promotion' | 'playoff' | 'safe'
}
```

### 2. `get_relegation_eligible_teams(league_id)`
Mendapatkan tim yang eligible untuk degradasi berdasarkan standings.

**Returns:**
```typescript
{
  team_id: UUID,
  team_name: TEXT,
  position: INTEGER,
  points: INTEGER,
  movement_type: 'relegation' | 'playoff' | 'safe'
}
```

### 3. `execute_season_end_movements(league_id, season)`
Eksekusi otomatis perpindahan tim di akhir musim.

**Actions:**
- Record movements ke `team_movements`
- Update `teams.league_id` ke liga baru
- Return summary of movements

**Returns:**
```typescript
{
  team_name: TEXT,
  movement_type: TEXT,
  from_league: TEXT,
  to_league: TEXT
}
```

---

## 💻 API Functions (TypeScript)

### Get Team Movements
```typescript
// Get all movements
const { data, error } = await getTeamMovements();

// Get movements for specific team
const { data, error } = await getTeamMovements(teamId);

// Get movements for specific season
const { data, error } = await getTeamMovements(undefined, '2024/2025');
```

### Get League Hierarchy
```typescript
const { data, error } = await getLeagueHierarchy();
// Returns all leagues with parent/child relationships
```

### Get Eligible Teams
```typescript
// For promotion
const { data, error } = await getPromotionEligibleTeams(leagueId);

// For relegation
const { data, error } = await getRelegationEligibleTeams(leagueId);
```

### Execute Season End
```typescript
const { data, error } = await executeSeasonEndMovements(
  leagueId, 
  '2025/2026'
);
// Returns array of movements executed
```

### Record Manual Movement
```typescript
const { data, error } = await recordTeamMovement(
  teamId,
  fromLeagueId,
  toLeagueId,
  'promotion',
  '2025/2026',
  1,  // final position
  'Champions, automatically promoted'
);
```

### Get League with Hierarchy
```typescript
const { data, error } = await getLeagueWithHierarchy(leagueId);
// Returns league with parent_league and child_league populated
```

---

## 🎨 UI Components

### 1. TeamMovementsTable
Display team movement history with icons and colors.

**Usage:**
```tsx
import TeamMovementsTable from '@/components/TeamMovementsTable';

const { data: movements } = await getTeamMovements(teamId);

<TeamMovementsTable 
  movements={movements}
  showTeamColumn={false}  // Hide team column if showing single team
/>
```

**Features:**
- ⬆️ Green for promotion
- ⬇️ Red for relegation
- 🏆 Blue for playoff winner
- 💔 Orange for playoff loser
- Responsive design
- Shows final position
- Notes section

### 2. LeagueHierarchyView
Display all leagues with their hierarchy relationships.

**Usage:**
```tsx
import LeagueHierarchyView from '@/components/LeagueHierarchyView';

const { data: leagues } = await getLeagueHierarchy();

<LeagueHierarchyView leagues={leagues} />
```

**Features:**
- Grouped by type (Football, eFootball, Cup)
- Shows parent/child links
- Stats per league
- Color-coded zones
- Direct links to standings

---

## 📋 Setup Guide

### Step 1: Run Migration
```bash
# In Supabase SQL Editor
# Execute: 20260209000002_add_team_movements.sql
```

### Step 2: Setup League Hierarchy
```sql
-- Link Premier League -> Liga 2
UPDATE leagues
SET child_league_id = 'LIGA_2_ID'
WHERE id = 'PREMIER_LEAGUE_ID';

UPDATE leagues
SET parent_league_id = 'PREMIER_LEAGUE_ID'
WHERE id = 'LIGA_2_ID';
```

### Step 3: Run Seed (Already Included)
```bash
# seed.sql already includes:
# - Hierarchy setup
# - Sample team movements
```

### Step 4: Test Functions
```sql
-- Get promotion eligible teams
SELECT * FROM get_promotion_eligible_teams('LEAGUE_ID');

-- Get relegation eligible teams
SELECT * FROM get_relegation_eligible_teams('LEAGUE_ID');

-- View hierarchy
SELECT * FROM league_hierarchy;
```

---

## 🎯 Use Cases

### 1. End of Season Process
```typescript
// At end of season
const result = await executeSeasonEndMovements(
  leagueId,
  '2025/2026'
);

console.log('Teams moved:', result.data);
// Automatically:
// - Promotes top teams to parent league
// - Relegates bottom teams to child league
// - Records all movements
// - Updates team assignments
```

### 2. View Team History
```typescript
// Show team's movement history
const { data: movements } = await getTeamMovements(teamId);

<TeamMovementsTable 
  movements={movements}
  showTeamColumn={false}
/>

// Shows:
// - 2023/2024: Promoted from Liga 2 (Position 1)
// - 2024/2025: Relegated from Premier (Position 18)
// - etc.
```

### 3. League Overview
```typescript
// Show all leagues with hierarchy
const { data: leagues } = await getLeagueHierarchy();

<LeagueHierarchyView leagues={leagues} />

// Displays:
// Premier League
//   ⬇️ Degradasi ke: Liga 2
// 
// Liga 2
//   ⬆️ Promosi ke: Premier League
//   ⬇️ Degradasi ke: Liga 3
```

### 4. Manual Movement
```typescript
// Manual transfer/movement
await recordTeamMovement(
  teamId,
  currentLeagueId,
  newLeagueId,
  'transfer',
  '2025/2026',
  null,
  'Club relocated to different competition'
);
```

---

## 🔍 Example Queries

### View All Movements
```sql
SELECT 
  tm.*,
  t.name as team_name,
  fl.name as from_league,
  tl.name as to_league
FROM team_movements tm
JOIN teams t ON t.id = tm.team_id
JOIN leagues fl ON fl.id = tm.from_league_id
JOIN leagues tl ON tl.id = tm.to_league_id
ORDER BY tm.movement_date DESC;
```

### Count Movements by Type
```sql
SELECT 
  movement_type,
  COUNT(*) as count
FROM team_movements
GROUP BY movement_type;
```

### Teams Promoted in Last Season
```sql
SELECT 
  t.name,
  tm.final_position,
  fl.name as from_league,
  tl.name as to_league
FROM team_movements tm
JOIN teams t ON t.id = tm.team_id
JOIN leagues fl ON fl.id = tm.from_league_id
JOIN leagues tl ON tl.id = tm.to_league_id
WHERE tm.movement_type = 'promotion'
  AND tm.season = '2024/2025'
ORDER BY tm.final_position;
```

### League with Most Activity
```sql
SELECT 
  l.name,
  COUNT(DISTINCT tm.id) as total_movements
FROM leagues l
LEFT JOIN team_movements tm ON l.id = tm.from_league_id OR l.id = tm.to_league_id
GROUP BY l.id, l.name
ORDER BY total_movements DESC;
```

---

## 🎨 Movement Type Icons

| Type | Icon | Color | Description |
|------|------|-------|-------------|
| `promotion` | ⬆️ | Green | Automatic promotion |
| `relegation` | ⬇️ | Red | Automatic relegation |
| `playoff_winner` | 🏆 | Blue | Won playoff for promotion |
| `playoff_loser` | 💔 | Orange | Lost playoff, relegated |
| `transfer` | ↔️ | Gray | Manual transfer/move |

---

## 📊 Seed Data Includes

### League Hierarchy Setup
```
Indonesian Premier League (Top Tier)
  ↓ (3 relegation, 1 playoff)
Indonesian Liga 2
  ↑ (2 promotion, 1 playoff)
```

### Sample Movements
- Persipura: Promoted from Liga 2 (2024/2025, Position 1)
- RANS: Promoted from Liga 2 (2024/2025, Position 2)
- Sriwijaya: Playoff winner (2023/2024, Position 3)

---

## ✨ Benefits

### For Admins
- ✅ Track team movements automatically
- ✅ Visualize league hierarchy
- ✅ Execute season end with one function
- ✅ Historical data for analysis

### For Users
- ✅ See promotion/relegation zones in standings
- ✅ View team history
- ✅ Understand league structure
- ✅ Follow team journey across leagues

### For System
- ✅ Automated calculations
- ✅ Audit trail of movements
- ✅ Flexible hierarchy support
- ✅ Multi-tier league systems

---

## 🚀 Next Steps (Optional)

### Phase 2 Features
- [ ] Playoff match generator
- [ ] Automatic zone highlighting in real-time
- [ ] Movement predictions based on current standings
- [ ] Email notifications for movements
- [ ] Movement reversal/undo functionality

### Phase 3 Features
- [ ] Multi-season trend analysis
- [ ] Team stability scoring
- [ ] League competitiveness metrics
- [ ] Comparison tool (team vs team movements)

---

## 📝 Summary

**What's New:**
- ✅ Team movements tracking table
- ✅ League hierarchy with parent/child links
- ✅ 3 database functions for automation
- ✅ 7 API functions in TypeScript
- ✅ 2 new UI components
- ✅ Complete seed data with examples

**Status:** PRODUCTION READY ✅

**Migration Required:** Yes (20260209000002)

**Backward Compatible:** Yes

---

**Created:** February 9, 2026
**Version:** 1.0.0
**Author:** GitHub Copilot
