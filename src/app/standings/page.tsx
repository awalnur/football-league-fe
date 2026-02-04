'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getLeagues, getLeagueStandings, getTeamMatches, getGamePlayersByTeam } from '@/lib/supabase';

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
  gamepad: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
    </svg>
  ),
  lock: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  shield: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  chart: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  close: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  crown: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  ),
  arrowUp: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
    </svg>
  ),
  arrowDown: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
    </svg>
  ),
  user: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  clipboard: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  pulse: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  fire: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
    </svg>
  ),
  medal: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15l-2 5 2-1 2 1-2-5m0 0a6 6 0 100-12 6 6 0 000 12z" />
    </svg>
  ),
  star: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  ),
  target: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  ),
};

interface League {
  id: string;
  name: string;
  type: 'football' | 'efootball';
  season: string;
  logo_url: string | null;
  status: string;
}

interface Standing {
  pos: number;
  team_id: string;
  team_name: string;
  team_logo: string | null;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
  form: string | null;
}

interface TeamMatch {
  match_id: string;
  match_date: string;
  match_week: number;
  home_team_id: string;
  home_team_name: string;
  home_team_logo: string | null;
  away_team_id: string;
  away_team_name: string;
  away_team_logo: string | null;
  home_score: number | null;
  away_score: number | null;
  status: string;
  is_home: boolean;
  result: string | null;
}

interface GamePlayer {
  id: string;
  real_name: string;
  gamertag: string;
  avatar_url: string | null;
  is_captain: boolean;
}

export default function StandingsPage() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [standings, setStandings] = useState<Standing[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'football' | 'efootball'>('football');
  const [loading, setLoading] = useState(true);


  const currentLeague = leagues.find(l => l.id === selectedLeague);
  const filteredLeagues = leagues.filter(l => l.type === activeTab);

  // Calculate stats
  const totalGoals = standings.reduce((sum, t) => sum + t.goals_for, 0);
  const totalMatches = standings.reduce((sum, t) => sum + t.played, 0) / 2;
  const maxPoints = standings.length > 0 ? standings[0].points : 0;

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      const { data } = await getLeagues();
      if (!isMounted) return;

      if (data) {
        setLeagues(data as League[]);
        const firstLeague = data.find((l: League) => l.type === activeTab);
        let leagueToLoad = '';

        if (firstLeague) {
          leagueToLoad = firstLeague.id;
          setSelectedLeague(firstLeague.id);
        } else if (data.length > 0) {
          leagueToLoad = data[0].id;
          setSelectedLeague(data[0].id);
          setActiveTab(data[0].type);
        }

        if (leagueToLoad) {
          const { data: standingsData } = await getLeagueStandings(leagueToLoad);
          if (isMounted && standingsData) {
            setStandings(standingsData as Standing[]);
          }
        }
      }

      if (isMounted) setLoading(false);
    }

    loadData();
    return () => { isMounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadStandingsForLeague() {
      if (!selectedLeague) return;

      setLoading(true);
      const { data } = await getLeagueStandings(selectedLeague);
      if (isMounted) {
        if (data) {
          setStandings(data as Standing[]);
        } else {
          setStandings([]);
        }
        setLoading(false);
      }
    }

    if (selectedLeague && leagues.length > 0) {
      loadStandingsForLeague();
    }

    return () => { isMounted = false; };
  }, [selectedLeague, leagues.length]);

  const handleTabChange = (tab: 'football' | 'efootball') => {
    setActiveTab(tab);
    const firstLeague = leagues.find(l => l.type === tab);
    if (firstLeague) {
      setSelectedLeague(firstLeague.id);
    }
  };


  const getFormBadges = (form: string | null) => {
    if (!form) return null;
    return form.split('').map((result, index) => (
      <span
        key={index}
        className={`inline-flex h-6 w-6 items-center justify-center rounded text-xs font-bold shadow-sm transition-transform hover:scale-110 ${
          result === 'W' ? 'bg-gradient-to-br from-green-400 to-green-600 text-white' :
          result === 'D' ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' :
          'bg-gradient-to-br from-red-400 to-red-600 text-white'
        }`}
      >
        {result}
      </span>
    ));
  };

  const getPositionBadge = (position: number) => {
    if (position === 1) return 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-amber-500/30';
    if (position === 2) return 'bg-gradient-to-br from-slate-300 to-slate-500 text-white shadow-slate-400/30';
    if (position === 3) return 'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-orange-500/30';
    if (position <= 4) return 'bg-gradient-to-br from-green-500 to-green-700 text-white';
    if (position <= 6) return 'bg-gradient-to-br from-blue-500 to-blue-700 text-white';
    if (position >= standings.length - 2 && standings.length > 5) return 'bg-gradient-to-br from-red-500 to-red-700 text-white';
    return 'bg-slate-700/80 text-slate-300';
  };

  const getRowStyle = (position: number) => {
    if (position === 1) return 'bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-l-2 border-amber-500';
    if (position === 2) return 'bg-gradient-to-r from-slate-400/10 via-slate-400/5 to-transparent border-l-2 border-slate-400';
    if (position === 3) return 'bg-gradient-to-r from-orange-500/10 via-orange-500/5 to-transparent border-l-2 border-orange-500';
    if (position <= 4) return 'border-l-2 border-green-500/50';
    if (position <= 6) return 'border-l-2 border-blue-500/50';
    if (position >= standings.length - 2 && standings.length > 5) return 'border-l-2 border-red-500/50';
    return 'border-l-2 border-transparent';
  };

  const getWinRate = (team: Standing) => {
    if (team.played === 0) return 0;
    return Math.round((team.won / team.played) * 100);
  };
  return (
    <div className="min-h-screen bg-geometric relative">
      {/* Modal */}
      {/*<TeamModal />*/}

      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-20 -left-32 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -right-32 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-amber-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-blue-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50"></div>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-slate-800/50 bg-slate-950/90 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25 transition-transform group-hover:scale-105">
                  {Icons.football}
                </div>
                <span className="font-bold text-white">Football Leagues</span>
              </Link>
            </div>
            <div className="hidden md:flex items-center gap-1">
              <Link href="/standings" className="px-3 py-1.5 text-sm text-white bg-slate-800/80 backdrop-blur-sm rounded font-medium">Klasemen</Link>
              <Link href="/schedule" className="px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800/80 rounded transition-colors">Jadwal</Link>
              <Link href="/teams" className="px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800/80 rounded transition-colors">Tim</Link>
              <Link href="/matches" className="px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800/80 rounded transition-colors">Riwayat</Link>
            </div>
            <div className="flex items-center gap-2">
              {/* Mobile Navigation */}
              <div className="flex md:hidden items-center gap-1 mr-2">
                <Link href="/standings" className="p-2 text-amber-400 bg-slate-800 rounded">
                  {Icons.trophy}
                </Link>
                <Link href="/schedule" className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </Link>
                <Link href="/teams" className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </Link>
              </div>
              <Link href="/login" className="flex items-center gap-1.5 rounded bg-slate-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 transition-colors">
                {Icons.lock}
                <span className="hidden sm:inline">Admin</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-xl shadow-amber-500/30">
                  {Icons.trophy}
                </div>
                <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">Klasemen Liga</h1>
                <p className="text-sm text-slate-400 mt-0.5">Pantau klasemen terkini dan statistik tim</p>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex rounded bg-slate-800/70 border border-slate-700/50 p-1 backdrop-blur-sm">
                <button
                  onClick={() => handleTabChange('football')}
                  className={`flex items-center gap-2 rounded px-4 py-2 text-sm font-medium transition-all ${
                    activeTab === 'football' 
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  {Icons.football}
                  <span>Football</span>
                </button>
                <button
                  onClick={() => handleTabChange('efootball')}
                  className={`flex items-center gap-2 rounded px-4 py-2 text-sm font-medium transition-all ${
                    activeTab === 'efootball' 
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  {Icons.gamepad}
                  <span>eFootball</span>
                </button>
              </div>
              <select
                value={selectedLeague}
                onChange={(e) => setSelectedLeague(e.target.value)}
                className="rounded bg-slate-800/70 border border-slate-700/50 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 backdrop-blur-sm"
              >
                {filteredLeagues.map((league) => (
                  <option key={league.id} value={league.id}>{league.name} - {league.season}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* League Info Card */}
        {currentLeague && (
          <div className="mb-6 rounded-lg bg-gradient-to-r from-slate-800/80 via-slate-800/60 to-slate-800/40 border border-slate-700/50 backdrop-blur-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-lg bg-slate-900/80 border border-slate-700/50 flex items-center justify-center">
                  {currentLeague.logo_url ? (
                    <img src={currentLeague.logo_url} alt="" className="w-10 h-10 object-contain" />
                  ) : currentLeague.type === 'efootball' ? (
                    <span className="text-purple-400">{Icons.gamepad}</span>
                  ) : (
                    <span className="text-emerald-400">{Icons.football}</span>
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{currentLeague.name}</h2>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-slate-400">Musim {currentLeague.season}</span>
                    <span className="px-2 py-0.5 rounded text-xs font-bold shadow bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {currentLeague.status === 'active' ? 'Aktif' : 'Selesai'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{standings.length}</p>
                  <p className="text-xs text-slate-500">Tim</p>
                </div>
                <div className="h-8 w-px bg-slate-700"></div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{Math.round(totalMatches)}</p>
                  <p className="text-xs text-slate-500">Pertandingan</p>
                </div>
                <div className="h-8 w-px bg-slate-700"></div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-400">{totalGoals}</p>
                  <p className="text-xs text-slate-500">Total Gol</p>
                </div>
              </div>
            </div>
            {/* Progress bar */}
            <div className="h-1 bg-slate-900/50">
              <div className="h-full bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500" style={{ width: '60%' }}></div>
            </div>
          </div>
        )}

        {/* Main Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-slate-700"></div>
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-500 absolute top-0"></div>
            </div>
            <p className="text-slate-400 text-sm mt-4">Memuat klasemen...</p>
          </div>
        ) : standings.length === 0 ? (
          <div className="rounded-lg bg-slate-800/50 border border-slate-700/50 p-12 text-center backdrop-blur-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-700/50 text-slate-400 mx-auto mb-4">
              {Icons.chart}
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Belum Ada Data Klasemen</h2>
            <p className="text-sm text-slate-400 mb-6 max-w-sm mx-auto">
              {leagues.length === 0 ? 'Belum ada liga yang dibuat' : 'Liga ini belum memiliki data klasemen. Mulai tambahkan tim dan pertandingan.'}
            </p>
            <Link href="/login" className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-2.5 rounded font-medium transition-all shadow-lg shadow-emerald-500/25">
              {Icons.lock}
              Login sebagai Admin
            </Link>
          </div>
        ) : (
          <>
            {/* Top 3 Teams Podium - Desktop */}
            {standings.length >= 3 && (
              <div className="hidden lg:grid grid-cols-3 gap-4 mb-6">
                {/* 2nd Place */}
                <div className="rounded-lg bg-gradient-to-br from-slate-400/10 to-slate-500/5 border border-slate-400/20 p-5 transform hover:scale-[1.02] transition-all cursor-pointer group" >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded bg-gradient-to-br from-slate-300 to-slate-500 flex items-center justify-center text-white font-bold shadow-lg">2</span>
                      <span className="text-slate-400 text-sm">2nd Place</span>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-slate-800/80 flex items-center justify-center border border-slate-600/30 group-hover:border-slate-400/50 transition-colors">
                      {standings[1].team_logo ? (
                        <img src={standings[1].team_logo} alt="" className="w-9 h-9 object-contain" />
                      ) : <span className="text-slate-500">{Icons.shield}</span>}
                    </div>
                  </div>
                  <p className="text-lg font-bold text-white mb-1 truncate">{standings[1].team_name}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-slate-300">{standings[1].points}</span>
                    <span className="text-sm text-slate-500">{standings[1].played} laga</span>
                  </div>
                  <div className="mt-3 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-slate-400 to-slate-500 rounded-full" style={{ width: `${maxPoints > 0 ? (standings[1].points / maxPoints) * 100 : 0}%` }}></div>
                  </div>
                </div>

                {/* 1st Place */}
                <div className="rounded-lg bg-gradient-to-br from-amber-500/15 to-amber-600/5 border border-amber-500/30 p-5 ring-1 ring-amber-500/20 transform hover:scale-[1.02] transition-all cursor-pointer group relative" >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold rounded-full shadow-lg shadow-amber-500/30 flex items-center gap-1">
                      {Icons.crown}
                      LEADER
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-3 mt-2">
                    <div className="flex items-center gap-2">
                      <span className="w-10 h-10 rounded bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-amber-500/30">1</span>
                      <span className="text-amber-400 text-sm font-medium">Champion</span>
                    </div>
                    <div className="w-14 h-14 rounded-lg bg-slate-800/80 flex items-center justify-center border border-amber-500/30 group-hover:border-amber-400/50 transition-colors">
                      {standings[0].team_logo ? (
                        <img src={standings[0].team_logo} alt="" className="w-11 h-11 object-contain" />
                      ) : <span className="text-amber-500">{Icons.shield}</span>}
                    </div>
                  </div>
                  <p className="text-xl font-bold text-amber-100 mb-1 truncate">{standings[0].team_name}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-amber-400">{standings[0].points}</span>
                    <div className="text-right">
                      <p className="text-sm text-amber-400/80">{standings[0].won}W {standings[0].drawn}D {standings[0].lost}L</p>
                      <p className="text-xs text-slate-500">{standings[0].played} laga</p>
                    </div>
                  </div>
                  <div className="mt-3 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full w-full"></div>
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="rounded-lg bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 p-5 transform hover:scale-[1.02] transition-all cursor-pointer group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold shadow-lg">3</span>
                      <span className="text-orange-400/80 text-sm">3rd Place</span>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-slate-800/80 flex items-center justify-center border border-orange-500/20 group-hover:border-orange-400/50 transition-colors">
                      {standings[2].team_logo ? (
                        <img src={standings[2].team_logo} alt="" className="w-9 h-9 object-contain" />
                      ) : <span className="text-orange-500">{Icons.shield}</span>}
                    </div>
                  </div>
                  <p className="text-lg font-bold text-white mb-1 truncate">{standings[2].team_name}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-orange-400">{standings[2].points}</span>
                    <span className="text-sm text-slate-500">{standings[2].played} laga</span>
                  </div>
                  <div className="mt-3 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full" style={{ width: `${maxPoints > 0 ? (standings[2].points / maxPoints) * 100 : 0}%` }}></div>
                  </div>
                </div>
              </div>
            )}

            {/* Standings Table */}
            <div className="rounded-lg bg-slate-800/50 border border-slate-700/50 overflow-hidden backdrop-blur-sm">
              {/* Table Header */}
              <div className="px-4 py-3 bg-slate-900/60 border-b border-slate-700/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">{Icons.chart}</span>
                  <h3 className="font-semibold text-white text-sm">Tabel Klasemen</h3>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                  Update Realtime
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700/50 bg-slate-900/40">
                      <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 w-16">#</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Tim</th>
                      <th className="px-2 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 hidden sm:table-cell w-12">P</th>
                      <th className="px-2 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 w-10">M</th>
                      <th className="px-2 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 w-10">S</th>
                      <th className="px-2 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 w-10">K</th>
                      <th className="px-2 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 hidden md:table-cell w-12">GM</th>
                      <th className="px-2 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 hidden md:table-cell w-12">GK</th>
                      <th className="px-2 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 hidden sm:table-cell w-12">SG</th>
                      <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 w-16">Pts</th>
                      <th className="hidden lg:table-cell px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 w-36">Form</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/30">
                    {standings.map((team, index) => {
                      const animationDelay = index * 50;

                      return (
                        <tr
                          key={team.team_id}
                          className={`transition-all duration-200 hover:bg-slate-700/30 ${getRowStyle(team.pos)} cursor-pointer group`}
                          style={{ animationDelay: `${animationDelay}ms` }}
                          // onClick={() => openTeamDetail(team)}
                        >
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-1">
                              {team.pos <= 3 && (
                                <span className={`${
                                  team.pos === 1 ? 'text-amber-400' : 
                                  team.pos === 2 ? 'text-slate-300' : 
                                  'text-orange-400'
                                }`}>
                                  {Icons.crown}
                                </span>
                              )}
                              <span className={`inline-flex h-7 w-7 items-center justify-center rounded text-xs font-bold shadow-md ${getPositionBadge(team.pos)}`}>
                                {team.pos}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded bg-slate-700/60 flex items-center justify-center group-hover:ring-2 group-hover:ring-emerald-500/40 transition-all border border-slate-600/30">
                                {team.team_logo ? (
                                  <img src={team.team_logo} alt="" className="h-7 w-7 object-contain" />
                                ) : (
                                  <span className="text-slate-500">{Icons.shield}</span>
                                )}
                              </div>
                              <div>
                                <span className={`font-semibold group-hover:text-emerald-400 transition-colors text-sm ${
                                  team.pos === 1 ? 'text-amber-200' : 'text-white'
                                }`}>{team.team_name}</span>
                                <div className="flex items-center gap-1 mt-0.5 lg:hidden">
                                  <span className="text-xs text-slate-500">{team.played}P</span>
                                  {team.form && (
                                    <div className="flex gap-0.5 ml-1">
                                      {team.form.slice(-3).split('').map((r, i) => (
                                        <span key={i} className={`h-1.5 w-1.5 rounded-full ${
                                          r === 'W' ? 'bg-green-500' : r === 'D' ? 'bg-yellow-500' : 'bg-red-500'
                                        }`}></span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-2 py-3 text-center text-sm text-slate-400 hidden sm:table-cell font-medium">{team.played}</td>
                          <td className="px-2 py-3 text-center">
                            <span className="text-sm text-green-400 font-semibold">{team.won}</span>
                          </td>
                          <td className="px-2 py-3 text-center">
                            <span className="text-sm text-yellow-400 font-semibold">{team.drawn}</span>
                          </td>
                          <td className="px-2 py-3 text-center">
                            <span className="text-sm text-red-400 font-semibold">{team.lost}</span>
                          </td>
                          <td className="px-2 py-3 text-center text-sm text-slate-300 hidden md:table-cell">{team.goals_for}</td>
                          <td className="px-2 py-3 text-center text-sm text-slate-400 hidden md:table-cell">{team.goals_against}</td>
                          <td className="px-2 py-3 text-center hidden sm:table-cell">
                            <span className={`text-sm font-semibold px-1.5 py-0.5 rounded ${
                              team.goal_difference > 0 
                                ? 'text-green-400 bg-green-500/10' 
                                : team.goal_difference < 0 
                                  ? 'text-red-400 bg-red-500/10' 
                                  : 'text-slate-400'
                            }`}>
                              {team.goal_difference > 0 ? '+' : ''}{team.goal_difference}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center">
                            <span className={`text-lg font-bold ${team.pos === 1 ? 'text-amber-300' : 'text-white'}`}>
                              {team.points}
                            </span>
                          </td>
                          <td className="hidden lg:table-cell px-3 py-3">
                            <div className="flex justify-center gap-1">{getFormBadges(team.form)}</div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Table Footer - Legend */}
              <div className="border-t border-slate-700/50 bg-slate-900/40 px-4 py-3">
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-1 rounded-full bg-gradient-to-b from-amber-400 to-amber-600"></span>
                    <span className="text-slate-400">Juara</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-1 rounded-full bg-gradient-to-b from-green-400 to-green-600"></span>
                    <span className="text-slate-400">Liga Super</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-1 rounded-full bg-gradient-to-b from-blue-400 to-blue-600"></span>
                    <span className="text-slate-400">Liga Liga</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-1 rounded-full bg-gradient-to-b from-red-400 to-red-600"></span>
                    <span className="text-slate-400">Degradasi</span>
                  </div>
                  <div className="ml-auto text-slate-500">
                    P: Pertandingan • M: Menang • S: Seri • K: Kalah • SG: Selisih Gol
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <div className="rounded-lg bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 p-4 backdrop-blur-sm group hover:border-amber-500/40 transition-all cursor-pointer" >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-amber-400/80">Pemimpin Klasemen</p>
                    <p className="mt-1 text-sm font-bold text-white truncate group-hover:text-amber-200 transition-colors">{standings[0]?.team_name}</p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-500/30 to-amber-600/20 flex items-center justify-center text-amber-400 ml-2 shrink-0">
                    {Icons.trophy}
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full w-full"></div>
                  </div>
                  <span className="text-xs text-amber-400 font-semibold">{standings[0]?.points}pts</span>
                </div>
              </div>

              <div className="rounded-lg bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 p-4 backdrop-blur-sm group hover:border-emerald-500/40 transition-all cursor-pointer" onClick={() => {
                const topScorer = [...standings].sort((a, b) => b.goals_for - a.goals_for)[0];
                // if (topScorer) openTeamDetail(topScorer);
              }}>
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-emerald-400/80">Gol Terbanyak</p>
                    <p className="mt-1 text-sm font-bold text-white truncate group-hover:text-emerald-200 transition-colors">{[...standings].sort((a, b) => b.goals_for - a.goals_for)[0]?.team_name}</p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500/30 to-emerald-600/20 flex items-center justify-center text-emerald-400 ml-2 shrink-0">
                    {Icons.target}
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xl font-bold text-emerald-400">{[...standings].sort((a, b) => b.goals_for - a.goals_for)[0]?.goals_for}</span>
                  <span className="text-xs text-slate-500">gol dicetak</span>
                </div>
              </div>

              <div className="rounded-lg bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 p-4 backdrop-blur-sm group hover:border-blue-500/40 transition-all cursor-pointer" onClick={() => {
                const bestDefense = [...standings].sort((a, b) => a.goals_against - b.goals_against)[0];
                // if (bestDefense) openTeamDetail(bestDefense);
              }}>
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-blue-400/80">Pertahanan Terbaik</p>
                    <p className="mt-1 text-sm font-bold text-white truncate group-hover:text-blue-200 transition-colors">{[...standings].sort((a, b) => a.goals_against - b.goals_against)[0]?.team_name}</p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500/30 to-blue-600/20 flex items-center justify-center text-blue-400 ml-2 shrink-0">
                    {Icons.shield}
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xl font-bold text-blue-400">{[...standings].sort((a, b) => a.goals_against - b.goals_against)[0]?.goals_against}</span>
                  <span className="text-xs text-slate-500">gol kemasukan</span>
                </div>
              </div>

              <div className="rounded-lg bg-gradient-to-br from-rose-500/10 to-transparent border border-rose-500/20 p-4 backdrop-blur-sm group hover:border-rose-500/40 transition-all cursor-pointer" onClick={() => {
                const bestGD = [...standings].sort((a, b) => b.goal_difference - a.goal_difference)[0];
                // if (bestGD) openTeamDetail(bestGD);
              }}>
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-rose-400/80">Selisih Gol Terbaik</p>
                    <p className="mt-1 text-sm font-bold text-white truncate group-hover:text-rose-200 transition-colors">{[...standings].sort((a, b) => b.goal_difference - a.goal_difference)[0]?.team_name}</p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-rose-500/30 to-rose-600/20 flex items-center justify-center text-rose-400 ml-2 shrink-0">
                    {Icons.pulse}
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xl font-bold text-rose-400">+{[...standings].sort((a, b) => b.goal_difference - a.goal_difference)[0]?.goal_difference}</span>
                  <span className="text-xs text-slate-500">selisih gol</span>
                </div>
              </div>
            </div>

            {/* Win Rate Chart */}
            <div className="mt-6 rounded-lg bg-slate-800/50 border border-slate-700/50 p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">{Icons.chart}</span>
                  <h3 className="font-semibold text-white text-sm">Persentase Kemenangan</h3>
                </div>
                <span className="text-xs text-slate-500">Top 5 Tim</span>
              </div>
              <div className="space-y-3">
                {standings.slice(0, 5).map((team, index) => {
                  const winRate = getWinRate(team);
                  return (
                    <div key={team.team_id} className="flex items-center gap-3 group cursor-pointer"
                         // onClick={() => openTeamDetail(team)}
                    >
                      <div className="w-6 text-center">
                        <span className={`text-sm font-bold ${index === 0 ? 'text-amber-400' : index === 1 ? 'text-slate-300' : index === 2 ? 'text-orange-400' : 'text-slate-500'}`}>{index + 1}</span>
                      </div>
                      <div className="w-6 h-6 rounded bg-slate-700/50 flex items-center justify-center shrink-0">
                        {team.team_logo ? (
                          <img src={team.team_logo} alt="" className="w-5 h-5 object-contain" />
                        ) : (
                          <span className="text-slate-500 text-xs">{Icons.shield}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-white font-medium truncate group-hover:text-emerald-400 transition-colors">{team.team_name}</span>
                          <span className="text-sm font-bold text-emerald-400 ml-2">{winRate}%</span>
                        </div>
                        <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden flex">
                          <div className={`bg-green-500 h-full transition-all duration-500`} style={{ width: `${winRate}%` }}></div>
                          <div className={`bg-yellow-500 h-full transition-all duration-500`} style={{ width: `${winRate}%` }}></div>
                          <div className={`bg-red-500 h-full transition-all duration-500`} style={{ width: `${winRate}%` }}></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 mt-12 relative z-10">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-white">
              <div className="h-8 w-8 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                {Icons.football}
              </div>
              <span className="font-bold">Football Leagues</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <Link href="/standings" className="hover:text-white transition-colors">Klasemen</Link>
              <Link href="/schedule" className="hover:text-white transition-colors">Jadwal</Link>
              <Link href="/teams" className="hover:text-white transition-colors">Tim</Link>
              <Link href="/login" className="hover:text-white transition-colors">Admin</Link>
            </div>
            <p className="text-sm text-slate-600">© 2026 Football Leagues. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
