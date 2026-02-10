# Tournament Format & Relegation System

## Fitur Baru yang Ditambahkan

### 1. **Tournament Format**
Sekarang sistem mendukung 3 format turnamen:
- **League (Liga)**: Format round-robin tradisional
- **Cup (Piala)**: Format knockout/playoff
- **League Cup (Hybrid)**: Kombinasi group stage + knockout

### 2. **Relegation/Promotion System**
Untuk format Liga, Anda dapat mengatur:
- **Promotion Slots**: Jumlah tim yang promosi otomatis ke divisi lebih tinggi
- **Playoff Slots**: Jumlah tim yang masuk playoff promosi/degradasi
- **Relegation Slots**: Jumlah tim yang degradasi otomatis ke divisi lebih rendah

### 3. **Cup Tournament Features**
Untuk format Cup/Hybrid:
- **Group Stage**: Optional phase sebelum knockout
- **Teams per Group**: Berapa tim per group (2-8)
- **Qualifiers per Group**: Berapa tim yang lolos dari tiap group (1-4)
- **Cup Stages**: Group, R32, R16, Quarter-final, Semi-final, Final, Third Place
- **Two-Leg Ties**: Mendukung pertandingan 2 leg
- **Penalty Shootout**: Tracking skor penalti

## Perubahan Database

### New Enums
```sql
-- Format turnamen
tournament_format: 'league' | 'cup' | 'league_cup'

-- Stage cup
cup_stage: 'group_stage' | 'round_of_32' | 'round_of_16' | 'quarter_final' | 'semi_final' | 'final' | 'third_place'

-- Tipe zona di klasemen
zone_type: 'promotion' | 'safe' | 'playoff' | 'relegation'
```

### New Tables

#### `league_zones`
Mendefinisikan zona di klasemen (promosi, playoff, degradasi)
```typescript
{
  id: UUID,
  league_id: UUID,
  zone_type: ZoneType,
  position_start: number,  // Posisi mulai (misal: 1)
  position_end: number,    // Posisi akhir (misal: 3)
  color_code: string,      // Warna zona (#10b981)
  label: string            // Label zona ("Promosi ke Divisi 1")
}
```

#### `cup_groups`
Group untuk tournament cup
```typescript
{
  id: UUID,
  league_id: UUID,
  group_name: string  // "A", "B", "C", dst
}
```

#### `cup_standings`
Klasemen untuk group stage cup
```typescript
{
  id: UUID,
  cup_group_id: UUID,
  team_id: UUID,
  played: number,
  won: number,
  drawn: number,
  lost: number,
  goals_for: number,
  goals_against: number,
  goal_difference: number,
  points: number,
  qualified: boolean  // Lolos ke knockout?
}
```

### Modified Tables

#### `leagues` - Added Fields
```typescript
{
  tournament_format: TournamentFormat,
  promotion_slots: number,
  relegation_slots: number,
  playoff_slots: number,
  parent_league_id: UUID | null,  // Liga di atasnya
  has_group_stage: boolean,
  teams_per_group: number,
  qualifiers_per_group: number
}
```

#### `teams` - Added Fields
```typescript
{
  cup_group_id: UUID | null  // Group assignment untuk cup
}
```

#### `matches` - Added Fields
```typescript
{
  cup_stage: CupStage | null,
  leg_number: number,              // 1 atau 2
  is_extra_time: boolean,
  is_penalty: boolean,
  home_penalty_score: number | null,
  away_penalty_score: number | null,
  aggregate_winner_id: UUID | null  // Pemenang agregat
}
```

## New Functions

### `auto_create_league_zones(p_league_id)`
Otomatis membuat zona klasemen berdasarkan settings liga.

**Contoh:**
- Liga dengan `promotion_slots: 3, playoff_slots: 2, relegation_slots: 3`
- Akan membuat zona:
  - Posisi 1-3: Promosi (hijau)
  - Posisi 4-5: Playoff (biru)
  - Posisi N-2 sampai N: Degradasi (merah)

### Trigger Functions
- `init_cup_group_standings()`: Otomatis create standings saat tim diassign ke group
- `update_cup_standings_after_match()`: Update cup standings saat ada hasil match group stage

## Cara Menggunakan

### 1. Membuat Liga dengan Relegation
```typescript
await createLeague({
  name: "Divisi 1",
  type: "football",
  season: "2025/2026",
  tournament_format: "league",
  promotion_slots: 2,      // 2 tim promosi
  playoff_slots: 1,        // 1 tim playoff
  relegation_slots: 3      // 3 tim degradasi
});

// Setelah create, panggil untuk auto-create zones
await autoCreateLeagueZones(leagueId);
```

### 2. Membuat Cup Tournament dengan Group Stage
```typescript
await createLeague({
  name: "Champions Cup",
  type: "football",
  season: "2025/2026",
  tournament_format: "cup",
  has_group_stage: true,
  teams_per_group: 4,
  qualifiers_per_group: 2  // 2 tim lolos per group
});

// Buat groups
const groupA = await createCupGroup(leagueId, "A");
const groupB = await createCupGroup(leagueId, "B");

// Assign teams ke groups
await assignTeamToGroup(team1Id, groupA.id);
await assignTeamToGroup(team2Id, groupA.id);
```

### 3. Menampilkan Standings dengan Zones
```typescript
import StandingsTableWithZones from '@/components/StandingsTableWithZones';

// Fetch standings with zones
const { data: standings } = await getStandingsWithZones(leagueId);

// Render
<StandingsTableWithZones 
  standings={standings}
  zones={zones}
  leagueType="football"
/>
```

### 4. Menampilkan Cup Group Standings
```typescript
import CupGroupStandings from '@/components/CupGroupStandings';

// Fetch cup groups with standings
const { data: groups } = await getCupGroupsWithStandings(leagueId);

// Render
<CupGroupStandings 
  groups={groups}
  leagueType="football"
/>
```

## Migration

Untuk menerapkan perubahan ke database Supabase:

1. Copy migration file ke Supabase:
```bash
# Via Supabase CLI
supabase db push

# Atau manual via Supabase Dashboard > SQL Editor
# Copy isi file: supabase/migrations/20260209000001_add_tournament_format_and_relegation.sql
```

## Visualisasi Zones di UI

Zona akan ditampilkan dengan warna di klasemen:
- **Promosi** (Hijau #10b981): Top positions
- **Playoff** (Biru #3b82f6): Middle positions
- **Degradasi** (Merah #ef4444): Bottom positions

Setiap baris standing akan memiliki:
- Border kiri dengan warna zona
- Background gradient dengan warna zona
- Label zona di bawah nama tim

## Contoh Use Case

### Piramida Liga dengan Promosi/Degradasi
```
Divisi 1 (parent_league_id: null)
├── promotion_slots: 0
├── relegation_slots: 3
└── Tim terakhir degradasi ke Divisi 2

Divisi 2 (parent_league_id: divisi1_id)
├── promotion_slots: 2
├── playoff_slots: 1
├── relegation_slots: 3
├── Top 2 promosi ke Divisi 1
└── Bottom 3 degradasi ke Divisi 3
```

### Cup Tournament (Champions League Style)
```
Group Stage (8 groups, 4 teams each)
├── teams_per_group: 4
├── qualifiers_per_group: 2
└── Top 2 per group → Round of 16

Knockout Stage
├── Round of 16 (2 legs)
├── Quarter-finals (2 legs)
├── Semi-finals (2 legs)
└── Final (1 leg)
```

## API Functions yang Tersedia

### League Zones
- `getLeagueZones(leagueId)`: Get all zones
- `autoCreateLeagueZones(leagueId)`: Auto-create zones

### Cup Groups
- `getCupGroups(leagueId)`: Get all groups
- `createCupGroup(leagueId, groupName)`: Create a group
- `assignTeamToGroup(teamId, groupId)`: Assign team to group

### Cup Standings
- `getCupStandings(groupId)`: Get standings for a group
- `getCupGroupsWithStandings(leagueId)`: Get all groups with standings

### Enhanced Standings
- `getStandingsWithZones(leagueId)`: Get league standings with zone info

## UI Components Baru

1. **StandingsTableWithZones**: Klasemen dengan visual zona
2. **CupGroupStandings**: Display multiple groups dengan standings

## Notes

- Liga existing akan otomatis default ke `tournament_format: 'league'`
- Zones harus dibuat manual atau via `auto_create_league_zones()`
- Cup standings hanya untuk group stage, knockout menggunakan matches biasa
- Penalty shootout hanya di-track untuk statistik, pemenang ditentukan via `aggregate_winner_id`
