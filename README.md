# ⚽ Football Leagues Management System

A comprehensive football league management system built with Next.js and Supabase. Supports both traditional **Football** leagues and **eFootball** (esports) competitions.

## 🌟 Features

### Core Features
- ⚽ **Multi-Sport Support**: Football & eFootball leagues
- 📊 **Real-time Standings**: Auto-calculated league tables
- 📅 **Match Scheduling**: Auto-generate round-robin schedules
- 🎯 **Match Results**: Record and track match outcomes
- 📸 **Screenshot Management**: Upload proof for eFootball matches
- 👥 **Team Management**: Create and manage teams
- 🎮 **Gamer Profiles**: Track eFootball players (PSN, Xbox, Discord)
- 🔐 **Admin Dashboard**: Secure admin panel for league management

### 🆕 Tournament Format Features (NEW!)
- 🏆 **Multiple Formats**: League, Cup, and Hybrid tournaments
- ⬆️⬇️ **Promotion/Relegation**: Visual zones with color coding
- 🎯 **Cup Tournaments**: Group stage + knockout rounds
- 📍 **Zone System**: Auto-generated promotion/playoff/relegation zones
- 🏅 **Cup Groups**: Manage group stage standings
- 🎨 **Visual Indicators**: Color-coded league positions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Supabase account
- npm/yarn/pnpm/bun

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd football-leagues-fe
```

2. Install dependencies:
```bash
npm install
```

3. Setup environment variables:
```bash
cp .env.example .env.local
```
Edit `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

4. Run migrations in Supabase:
- Open Supabase Dashboard > SQL Editor
- Execute `supabase/migrations/20260203000001_create_leagues_schema.sql`
- Execute `supabase/migrations/20260209000001_add_tournament_format_and_relegation.sql`

5. Start development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## 📚 Documentation

- **[Tournament Format Guide](TOURNAMENT_FORMAT_GUIDE.md)** - Complete guide for new tournament features
- **[Implementation Summary](IMPLEMENTATION_SUMMARY.md)** - Technical implementation details  
- **[Quick Start Checklist](QUICK_START_CHECKLIST.md)** - Step-by-step deployment guide

## 🎯 Tournament Formats

### 1. League Format (Round-Robin)
Traditional league system with optional promotion/relegation:
- Auto-generated round-robin schedule
- Automatic standings calculation
- Visual zones for promotion/playoff/relegation
- Configurable tier structure

### 2. Cup Format (Knockout)
Tournament-style competitions:
- Optional group stage
- Knockout rounds (R32, R16, QF, SF, Final)
- Two-leg matches support
- Penalty shootout tracking

### 3. Hybrid Format
Best of both worlds:
- Combine league and cup features
- Flexible tournament structure

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (for images/screenshots)
- **ORM**: Supabase Client

## 📁 Project Structure

```
football-leagues-fe/
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── admin/        # Admin dashboard
│   │   ├── standings/    # Standings pages
│   │   ├── matches/      # Match pages
│   │   └── teams/        # Team pages
│   ├── components/       # Reusable React components
│   ├── context/          # React context providers
│   ├── lib/              # Utility functions (Supabase client)
│   └── types/            # TypeScript type definitions
├── supabase/
│   ├── migrations/       # Database migrations
│   └── sample_*.sql      # Sample data for testing
└── public/               # Static assets
```

## 💡 Usage Examples

### Create a League with Relegation

```typescript
import { createLeague, autoCreateLeagueZones } from '@/lib/supabase';

// Create league
const { data: league } = await createLeague({
  name: "Premier Division",
  type: "football",
  season: "2025/2026",
  tournament_format: "league",
  promotion_slots: 2,    // Top 2 promoted
  playoff_slots: 1,      // 3rd place playoff
  relegation_slots: 3    // Bottom 3 relegated
});

// Auto-generate zones
await autoCreateLeagueZones(league.id);
```

### Create a Cup Tournament

```typescript
import { createLeague, createCupGroup, assignTeamToGroup } from '@/lib/supabase';

// Create cup
const { data: cup } = await createLeague({
  name: "Champions Cup",
  type: "football",
  season: "2025",
  tournament_format: "cup",
  has_group_stage: true,
  teams_per_group: 4,
  qualifiers_per_group: 2
});

// Create groups
const groupA = await createCupGroup(cup.id, "A");
const groupB = await createCupGroup(cup.id, "B");

// Assign teams
await assignTeamToGroup(team1.id, groupA.id);
```

### Display Standings with Zones

```typescript
import StandingsTableWithZones from '@/components/StandingsTableWithZones';

const { data: standings } = await getStandingsWithZones(leagueId);

<StandingsTableWithZones 
  standings={standings}
  leagueType="football"
/>
```

## 🎨 UI Components

### Core Components
- `StandingsTable` - Basic league standings table
- `StandingsTableWithZones` - Enhanced with promotion/relegation zones
- `CupGroupStandings` - Cup group stage tables
- `LeagueSelector` - League dropdown selector

### Admin Components
- League creation form with tournament format selector
- Team management interface
- Match result input forms
- Gamer profile management

## 🔒 Authentication

Admin features require authentication:
1. Create an admin user in Supabase Auth
2. Add user to `admins` table
3. Login via `/login`

## 🧪 Testing

Sample data available in `supabase/sample_tournament_data.sql` for testing tournament features.

## 📱 Responsive Design

Fully responsive design works on:
- 📱 Mobile (320px+)
- 📱 Tablet (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large screens (1440px+)

## 🌍 Localization

Currently supports:
- 🇮🇩 Indonesian (primary)
- 🇬🇧 English (partial)

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

[Your License Here]

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org)
- [Supabase](https://supabase.com)
- [Tailwind CSS](https://tailwindcss.com)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
