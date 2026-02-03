# Supabase Database Setup

## Struktur Database

Database ini mendukung dua jenis liga:
- **Football** - Liga sepakbola profesional
- **eFootball** - Kompetisi esports eFootball

## Tabel Utama

| Tabel | Deskripsi |
|-------|-----------|
| `admins` | User yang memiliki akses admin |
| `leagues` | Data liga (nama, tipe, musim, status) |
| `teams` | Tim yang terdaftar di liga |
| `game_players` | Gamer/pemain game eFootball (orang yang bermain, bukan pemain virtual) |
| `matches` | Jadwal dan hasil pertandingan |
| `match_screenshots` | Screenshot hasil pertandingan eFootball |
| `standings` | Klasemen liga (otomatis diperbarui) |

## Row Level Security (RLS)

Semua tabel dilindungi dengan RLS:
- ✅ **Semua orang** bisa melihat data (SELECT)
- 🔐 **Hanya admin** yang bisa menambah, mengubah, atau menghapus data

## Cara Setup

### 1. Install Supabase CLI

```bash
npm install -g supabase
```

### 2. Login ke Supabase

```bash
supabase login
```

### 3. Link ke Project

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

### 4. Jalankan Migrasi

```bash
supabase db push
```

### 5. Jalankan Seed Data (Sample Data)

Buka **Supabase Dashboard** → **SQL Editor** → Copy paste isi file `seed.sql`

Atau via CLI:
```bash
psql -h YOUR_SUPABASE_URL -U postgres -d postgres -f supabase/seed.sql
```

## Files

| File | Deskripsi |
|------|-----------|
| `migrations/20260203000001_create_leagues_schema.sql` | Schema utama (tables, views, RLS) |
| `migrations/20260203000002_storage_buckets.sql` | Storage buckets untuk upload gambar |
| `migrations/20260203000003_helper_functions.sql` | Helper functions (generate jadwal, dll) |
| `migrations/20240102000000_sample_data.sql` | Sample data (sekali jalan) |
| `seed.sql` | Seed data yang bisa dijalankan ulang (reset data) |

## Sample Data

Seed data berisi:

### Liga
- **Liga Indonesia Series A** (Football) - 8 tim
- **Super League Jakarta** (Football) - belum ada tim
- **eFootball Pro League** (eFootball) - 6 tim
- **Mobile Gaming Cup** (eFootball) - belum ada tim

### Tim Football
1. Persija Jakarta
2. Persib Bandung
3. Arema FC
4. Bali United
5. PSM Makassar
6. Persebaya Surabaya
7. PSIS Semarang
8. Madura United

### Tim eFootball
1. RRQ Esports (3 gamers)
2. EVOS Legends (3 gamers)
3. ONIC Esports (2 gamers)
4. Bigetron Alpha (2 gamers)
5. Aura Fire (1 gamer)
6. Geek Fam (1 gamer)

### Matches
- Pekan 12-14: Selesai (completed)
- Pekan 15-16: Terjadwal (scheduled)

## Reset Data

Untuk reset semua data sample, jalankan `seed.sql` yang akan:
1. Menghapus semua data existing
2. Insert data sample baru
3. Menampilkan summary data

```

Atau untuk development lokal:

```bash
supabase start
supabase db reset
```

## Cara Menambah Admin Pertama

Setelah user pertama signup, jalankan query ini di Supabase SQL Editor:

```sql
-- Ganti dengan UUID user Anda
SELECT make_user_admin('your-user-uuid-here');
```

Untuk mendapatkan UUID user, lihat di Authentication > Users di Supabase Dashboard.

## Fitur Otomatis

### 1. Klasemen Otomatis
Ketika hasil pertandingan dimasukkan, klasemen akan otomatis diperbarui melalui trigger database.

### 2. Form Tim
Form 5 pertandingan terakhir (W/D/L) otomatis dihitung setelah setiap pertandingan selesai.

### 3. Generate Jadwal Acak

Untuk memulai liga dan membuat jadwal otomatis:

```sql
-- Pastikan liga sudah punya minimal 2 tim (genap)
SELECT generate_league_schedule(
    'league-uuid-here',
    '2026-02-15'  -- Tanggal mulai (opsional, default: hari ini)
);
```

Jadwal akan dibuat dengan format Round Robin:
- Setiap tim bertemu semua tim lain (home & away)
- Pertandingan dijadwalkan setiap minggu
- Urutan pertandingan diacak

## Storage Buckets

| Bucket | Ukuran Max | Format | Deskripsi |
|--------|------------|--------|-----------|
| `team-logos` | 2MB | PNG, JPEG, WebP, SVG | Logo tim |
| `gamer-avatars` | 2MB | PNG, JPEG, WebP | Foto gamer eFootball |
| `match-screenshots` | 5MB | PNG, JPEG, WebP | Screenshot hasil pertandingan |
| `league-logos` | 2MB | PNG, JPEG, WebP, SVG | Logo liga |

## Helper Functions

### `get_league_standings(league_id)`
Mendapatkan klasemen liga yang sudah diurutkan.

### `get_team_matches(team_id, status?)`
Mendapatkan riwayat pertandingan tim.

### `get_upcoming_matches(league_id, limit?)`
Mendapatkan jadwal pertandingan mendatang.

### `record_match_result(match_id, home_score, away_score, screenshot_url?, caption?)`
Mencatat hasil pertandingan (dengan screenshot untuk eFootball).

## Environment Variables

Buat file `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Contoh Query

### Membuat Liga Baru dengan Tim

```sql
SELECT create_league_with_teams(
    'Liga Indonesia',
    'football',
    '2025/2026',
    ARRAY['Persija', 'Persib', 'Arema', 'Bali United', 'PSM', 'Persebaya']
);
```

### Mencatat Hasil Pertandingan eFootball dengan Screenshot

```sql
SELECT record_match_result(
    'match-uuid',
    3,  -- home score
    1,  -- away score
    'https://storage.supabase.co/match-screenshots/game1.png',
    'Final Score'
);
```
