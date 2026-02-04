 'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { getLeagues, getMatchesByLeague, supabase } from '@/lib/supabase';

// SVG Icon Components
const Icons = {
  football: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L10 14v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
    </svg>
  ),
  trophy: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 4h2a2 2 0 012 2v2a4 4 0 01-4 4h-1m-6 0H8a4 4 0 01-4-4V6a2 2 0 012-2h2m8 0V3a1 1 0 00-1-1H9a1 1 0 00-1 1v1m8 0H8m4 16v-4m-4 4h8m-4-8a4 4 0 01-4-4V4h8v4a4 4 0 01-4 4z" />
    </svg>
  ),
  calendar: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  users: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  clipboard: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  lock: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  gamepad: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
    </svg>
  ),
  chart: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  shield: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  arrowRight: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  ),
};

interface Stats {
  totalLeagues: number;
  totalTeams: number;
  totalMatches: number;
  completedMatches: number;
}

interface League {
  id: string;
  name: string;
  type: string;
  status: string;
  logo_url: string | null;
}

interface Screenshot {
  id: string;
  image_url: string;
  caption: string | null;
}

interface MatchDetail {
  screenshots: Screenshot[];
}

interface UpcomingMatch {
  id: string;
  match_date: string;
  match_week: number;
  status: string;
  home_score: number | null;
  away_score: number | null;
  home_team: {
    id: string;
    name: string;
    short_name: string | null;
    logo_url: string | null;
  };
  away_team: {
    id: string;
    name: string;
    short_name: string | null;
    logo_url: string | null;
  };
  league_id: string;
}

export default function Home() {
  const [stats, setStats] = useState<Stats>({
    totalLeagues: 0,
    totalTeams: 0,
    totalMatches: 0,
    completedMatches: 0,
  });
  const [recentLeagues, setRecentLeagues] = useState<League[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<UpcomingMatch[]>([]);
  const [activeMatchFilter, setActiveMatchFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);
  const [matchDetails, setMatchDetails] = useState<Record<string, MatchDetail>>({});
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const { data: leagues } = await getLeagues();
      if (leagues) {
        setRecentLeagues(leagues.slice(0, 4) as League[]);
        setStats(prev => ({ ...prev, totalLeagues: leagues.length }));
      }

      const { count: teamsCount } = await supabase
        .from('teams')
        .select('*', { count: 'exact', head: true });

      const { count: matchesCount } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true });

      const { count: completedCount } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

      setStats(prev => ({
        ...prev,
        totalTeams: teamsCount || 0,
        totalMatches: matchesCount || 0,
        completedMatches: completedCount || 0,
      }));

      if (leagues && leagues.length > 0) {
        const allMatches: UpcomingMatch[] = [];
        for (const league of leagues.slice(0, 4)) {
          const { data: matchesData } = await getMatchesByLeague(league.id);
          if (matchesData) {
            const matchesWithLeague = matchesData.map((m: UpcomingMatch) => ({
              ...m,
              league_id: league.id
            }));
            allMatches.push(...matchesWithLeague);
          }
        }
        allMatches.sort((a, b) => new Date(a.match_date || 0).getTime() - new Date(b.match_date || 0).getTime());
        setUpcomingMatches(allMatches.slice(0, 12));
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadMatchDetail(matchId: string) {
    if (matchDetails[matchId]) return;

    setLoadingDetail(true);

    const { data: screenshots } = await supabase
      .from('match_screenshots')
      .select('id, image_url, caption')
      .eq('match_id', matchId)
      .order('created_at', { ascending: false });

    setMatchDetails(prev => ({
      ...prev,
      [matchId]: {
        screenshots: (screenshots as Screenshot[]) || [],
      }
    }));

    setLoadingDetail(false);
  }

  async function toggleMatchDetail(matchId: string) {
    if (expandedMatch === matchId) {
      setExpandedMatch(null);
    } else {
      setExpandedMatch(matchId);
      await loadMatchDetail(matchId);
    }
  }

  const filteredMatches = upcomingMatches.filter(match =>
    activeMatchFilter === 'all' || match.status === activeMatchFilter
  );

  return (
    <div className="min-h-screen bg-geometric">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                {Icons.football}
              </div>
              <span className="font-bold text-white">Football Leagues</span>
            </div>
            <div className="hidden md:flex items-center gap-1">
              <Link href="/standings" className="px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">Klasemen</Link>
              <Link href="/schedule" className="px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">Jadwal</Link>
              <Link href="/teams" className="px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">Tim</Link>
              <Link href="/matches" className="px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">Riwayat</Link>
            </div>
            <Link href="/login" className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="hidden sm:inline">Admin</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Hero Compact */}
        <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 p-6 rounded-lg bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-white/20 backdrop-blur text-white">
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L10 14v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Football Leagues</h1>
              <p className="text-indigo-100 text-sm">Platform manajemen liga sepakbola & eFootball</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/standings" className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 4h2a2 2 0 012 2v2a4 4 0 01-4 4h-1m-6 0H8a4 4 0 01-4-4V6a2 2 0 012-2h2m8 0V3a1 1 0 00-1-1H9a1 1 0 00-1 1v1m8 0H8m4 16v-4m-4 4h8m-4-8a4 4 0 01-4-4V4h8v4a4 4 0 01-4 4z" />
              </svg>
              Klasemen
            </Link>
            <Link href="/schedule" className="flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/30 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Jadwal
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          <div className="rounded-lg bg-slate-900 border border-slate-800 p-4 text-center">
            <p className="text-2xl font-bold text-white">{loading ? '...' : stats.totalLeagues}</p>
            <p className="text-xs text-slate-500">Liga</p>
          </div>
          <div className="rounded-lg bg-slate-900 border border-slate-800 p-4 text-center">
            <p className="text-2xl font-bold text-white">{loading ? '...' : stats.totalTeams}</p>
            <p className="text-xs text-slate-500">Tim</p>
          </div>
          <div className="rounded-lg bg-slate-900 border border-slate-800 p-4 text-center">
            <p className="text-2xl font-bold text-white">{loading ? '...' : stats.totalMatches}</p>
            <p className="text-xs text-slate-500">Pertandingan</p>
          </div>
          <div className="rounded-lg bg-slate-900 border border-slate-800 p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400">{loading ? '...' : stats.completedMatches}</p>
            <p className="text-xs text-slate-500">Selesai</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Leagues & Quick Actions */}
          <div className="space-y-6">
            {/* Active Leagues */}
            <div className="rounded-lg bg-slate-900 border border-slate-800 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                <h2 className="font-semibold text-white">Liga Aktif</h2>
                <span className="text-xs text-slate-500">{recentLeagues.length} liga</span>
              </div>
              <div className="divide-y divide-slate-800">
                {loading ? (
                  <div className="p-4 text-center text-slate-500">Memuat...</div>
                ) : recentLeagues.length === 0 ? (
                  <div className="p-4 text-center text-slate-500">Belum ada liga</div>
                ) : (
                  recentLeagues.map((league) => (
                    <Link
                      key={league.id}
                      href={`/standings?league=${league.id}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800/50 transition-colors"
                    >
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        league.type === 'efootball' 
                          ? 'bg-purple-500/20 text-purple-400' 
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {league.logo_url ? (
                          <img src={league.logo_url} alt="" className="h-6 w-6 object-contain" />
                        ) : league.type === 'efootball' ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L10 14v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{league.name}</p>
                        <p className="text-xs text-slate-500">{league.type === 'efootball' ? 'eFootball' : 'Football'}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        league.status === 'ongoing' ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'
                      }`}>
                        {league.status === 'ongoing' ? 'Live' : 'Draft'}
                      </span>
                    </Link>
                  ))
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-lg bg-slate-900 border border-slate-800 p-4">
              <h2 className="font-semibold text-white mb-3">Menu Cepat</h2>
              <div className="grid grid-cols-2 gap-2">
                <Link href="/standings" className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-amber-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 4h2a2 2 0 012 2v2a4 4 0 01-4 4h-1m-6 0H8a4 4 0 01-4-4V6a2 2 0 012-2h2m8 0V3a1 1 0 00-1-1H9a1 1 0 00-1 1v1m8 0H8m4 16v-4m-4 4h8m-4-8a4 4 0 01-4-4V4h8v4a4 4 0 01-4 4z" />
                  </svg>
                  <span className="text-xs text-slate-300">Klasemen</span>
                </Link>
                <Link href="/schedule" className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-blue-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs text-slate-300">Jadwal</span>
                </Link>
                <Link href="/teams" className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-emerald-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span className="text-xs text-slate-300">Tim</span>
                </Link>
                <Link href="/matches" className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-rose-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  <span className="text-xs text-slate-300">Riwayat</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column - Matches */}
          <div className="lg:col-span-2">
            <div className="rounded-lg bg-slate-900 border border-slate-800 overflow-hidden">
              {/* Header with Filter */}
              <div className="px-4 py-3 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h2 className="font-semibold text-white">Pertandingan</h2>
                <div className="flex gap-1">
                  {['all', 'scheduled', 'completed'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setActiveMatchFilter(filter)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                        activeMatchFilter === filter
                          ? 'bg-orange-500 text-white'
                          : 'text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      {filter === 'all' ? 'Semua' : filter === 'scheduled' ? 'Akan Datang' : 'Selesai'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Matches List */}
              <div className="divide-y divide-slate-800 max-h-[500px] overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center text-slate-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
                    Memuat pertandingan...
                  </div>
                ) : filteredMatches.length === 0 ? (
                  <div className="p-8 text-center">
                    <svg className="w-12 h-12 mx-auto mb-2 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-slate-400">Belum ada pertandingan</p>
                  </div>
                ) : (
                  filteredMatches.slice(0, 10).map((match) => {
                    const matchDate = match.match_date ? new Date(match.match_date) : null;
                    const leagueName = recentLeagues.find(l => l.id === match.league_id)?.name || 'Liga';
                    const leagueType = recentLeagues.find(l => l.id === match.league_id)?.type || 'football';
                    const isExpanded = expandedMatch === match.id;
                    const detail = matchDetails[match.id];
                    const homeWin = match.status === 'completed' && (match.home_score ?? 0) > (match.away_score ?? 0);
                    const awayWin = match.status === 'completed' && (match.away_score ?? 0) > (match.home_score ?? 0);
                    const isDraw = match.status === 'completed' && match.home_score === match.away_score;

                    return (
                      <div key={match.id} className="overflow-hidden">
                        {/* Clickable Match Row */}
                        <button
                          onClick={() => toggleMatchDetail(match.id)}
                          className="w-full px-4 py-3 hover:bg-slate-800/30 transition-colors text-left"
                        >
                          {/* Date & League Row */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-500">
                                {matchDate ? matchDate.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' }) : 'TBD'}
                              </span>
                              <span className="text-xs text-slate-600">•</span>
                              <span className="text-xs font-medium text-orange-400">
                                {matchDate ? matchDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                              </span>
                            </div>
                            <span className="text-xs text-slate-500 truncate max-w-[120px]">{leagueName}</span>
                          </div>

                          {/* Match Row */}
                          <div className="flex items-center gap-3">
                            {/* Home Team */}
                            <div className="flex items-center gap-2 flex-1 justify-end">
                              <span className="text-sm font-medium text-white truncate text-right">
                                {match.home_team?.short_name || match.home_team?.name || 'Home'}
                              </span>
                              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                                {match.home_team?.logo_url ? (
                                  <img src={match.home_team.logo_url} alt="" className="w-5 h-5 object-contain" />
                                ) : (
                                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                  </svg>
                                )}
                              </div>
                            </div>

                            {/* Score */}
                            <div className={`px-3 py-1.5 rounded-lg min-w-[60px] text-center ${
                              match.status === 'completed' ? 'bg-slate-700' : 'bg-slate-800'
                            }`}>
                              {match.status === 'completed' ? (
                                <span className="text-base font-bold text-white">
                                  {match.home_score} - {match.away_score}
                                </span>
                              ) : (
                                <span className="text-xs text-slate-400">vs</span>
                              )}
                            </div>

                            {/* Away Team */}
                            <div className="flex items-center gap-2 flex-1">
                              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                                {match.away_team?.logo_url ? (
                                  <img src={match.away_team.logo_url} alt="" className="w-5 h-5 object-contain" />
                                ) : (
                                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                  </svg>
                                )}
                              </div>
                              <span className="text-sm font-medium text-white truncate">
                                {match.away_team?.short_name || match.away_team?.name || 'Away'}
                              </span>
                            </div>

                            {/* Status Badge & Chevron */}
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-0.5 rounded shrink-0 ${
                                match.status === 'completed' 
                                  ? 'bg-green-500/20 text-green-400' 
                                  : 'bg-orange-500/20 text-orange-400'
                              }`}>
                                {match.status === 'completed' ? 'FT' : 'Soon'}
                              </span>
                              <div className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </button>

                        {/* Expanded Detail */}
                        {isExpanded && (
                          <div className="border-t border-slate-800 bg-slate-800/30 p-4">
                            {loadingDetail && !detail ? (
                              <div className="flex items-center justify-center py-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {/* Match Detail Header */}
                                <div className="flex items-center justify-center gap-6">
                                  {/* Home Team */}
                                  <div className="flex flex-col items-center gap-2">
                                    <div className="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center">
                                      {match.home_team?.logo_url ? (
                                        <img src={match.home_team.logo_url} alt="" className="w-8 h-8 object-contain" />
                                      ) : (
                                        <span className="text-slate-400">{Icons.shield}</span>
                                      )}
                                    </div>
                                    <span className="text-xs text-white font-medium text-center max-w-[80px] truncate">{match.home_team?.name}</span>
                                  </div>

                                  {/* Score */}
                                  <div className="text-center">
                                    <div className={`text-2xl font-bold ${
                                      isDraw ? 'text-yellow-400' : 'text-white'
                                    }`}>
                                      {match.home_score ?? 0} - {match.away_score ?? 0}
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">
                                      {matchDate ? matchDate.toLocaleDateString('id-ID', {
                                        weekday: 'long',
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                      }) : '-'}
                                    </p>
                                    {/* Result Badge */}
                                    {match.status === 'completed' && (
                                      <div className="mt-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                          isDraw ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'
                                        }`}>
                                          {homeWin ? `🏆 ${match.home_team?.name} Menang` :
                                           awayWin ? `🏆 ${match.away_team?.name} Menang` :
                                           '🤝 Hasil Seri'}
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Away Team */}
                                  <div className="flex flex-col items-center gap-2">
                                    <div className="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center">
                                      {match.away_team?.logo_url ? (
                                        <img src={match.away_team.logo_url} alt="" className="w-8 h-8 object-contain" />
                                      ) : (
                                        <span className="text-slate-400">{Icons.shield}</span>
                                      )}
                                    </div>
                                    <span className="text-xs text-white font-medium text-center max-w-[80px] truncate">{match.away_team?.name}</span>
                                  </div>
                                </div>

                                {/* League Info */}
                                <div className="flex justify-center">
                                  <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <span className={`px-2 py-0.5 rounded ${leagueType === 'efootball' ? 'bg-purple-500/20 text-purple-400' : 'bg-green-500/20 text-green-400'}`}>
                                      {leagueType === 'efootball' ? 'eFootball' : 'Football'}
                                    </span>
                                    <span>{leagueName}</span>
                                    <span>•</span>
                                    <span>Pekan {match.match_week}</span>
                                  </div>
                                </div>

                                {/* Screenshots */}
                                {detail && detail.screenshots.length > 0 && (
                                  <div className="space-y-2">
                                    <p className="text-xs text-slate-400 flex items-center gap-1">
                                      <span className="text-purple-400">{Icons.gamepad}</span>
                                      Screenshot Hasil
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      {detail.screenshots.map(screenshot => (
                                        <div key={screenshot.id} className="bg-slate-700 rounded-lg overflow-hidden border border-slate-600">
                                          <img src={screenshot.image_url} alt={screenshot.caption || 'Match Screenshot'} className="w-full h-auto object-cover" />
                                          {screenshot.caption && (
                                            <div className="p-2 border-t border-slate-600">
                                              <p className="text-xs text-slate-400">{screenshot.caption}</p>
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* No Screenshots */}
                                {detail && detail.screenshots.length === 0 && match.status === 'completed' && (
                                  <div className="text-center py-2 text-slate-500 text-xs">
                                    Tidak ada screenshot untuk pertandingan ini
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-slate-800 bg-slate-800/30">
                <Link href="/matches" className="flex items-center justify-center gap-2 text-sm text-orange-400 hover:text-orange-300 font-medium transition-colors">
                  Lihat Semua Pertandingan
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid - Compact */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L10 14v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>, label: 'Football', desc: 'Liga Sepakbola', href: '/standings', color: 'text-emerald-400' },
            { icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>, label: 'eFootball', desc: 'Kompetisi Gaming', href: '/standings', color: 'text-purple-400' },
            { icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>, label: 'Statistik', desc: 'Data Lengkap', href: '/matches', color: 'text-amber-400' },
            { icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>, label: 'Jadwal', desc: 'Auto Generate', href: '/schedule', color: 'text-blue-400' },
            { icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>, label: 'Tim', desc: 'Kelola Tim', href: '/teams', color: 'text-rose-400' },
            { icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>, label: 'Admin', desc: 'Dashboard', href: '/login', color: 'text-cyan-400' },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="group rounded-lg bg-slate-900 border border-slate-800 p-4 hover:border-slate-700 transition-all text-center flex flex-col items-center"
            >
              <span className={`mb-1 ${item.color}`}>{item.icon}</span>
              <p className="text-sm font-medium text-white">{item.label}</p>
              <p className="text-xs text-slate-500">{item.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-8">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-white">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L10 14v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
              <span className="text-sm font-medium">Football Leagues</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <Link href="/standings" className="hover:text-white transition-colors">Klasemen</Link>
              <Link href="/schedule" className="hover:text-white transition-colors">Jadwal</Link>
              <Link href="/teams" className="hover:text-white transition-colors">Tim</Link>
              <Link href="/login" className="hover:text-white transition-colors">Admin</Link>
            </div>
            <p className="text-xs text-slate-600">© 2026 Football Leagues</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
