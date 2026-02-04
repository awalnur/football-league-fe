'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getLeagues, getTeamsByLeague, getTeamMatches, getGamePlayersByTeam, getLeagueStandings } from '@/lib/supabase';

// SVG Icon Components
const Icons = {
  football: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L10 14v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
    </svg>
  ),
  users: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  lock: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  gamepad: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
    </svg>
  ),
  shield: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  close: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  check: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  trophy: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 4h2a2 2 0 012 2v2a4 4 0 01-4 4h-1m-6 0H8a4 4 0 01-4-4V6a2 2 0 012-2h2m8 0V3a1 1 0 00-1-1H9a1 1 0 00-1 1v1m8 0H8m4 16v-4m-4 4h8m-4-8a4 4 0 01-4-4V4h8v4a4 4 0 01-4 4z" />
    </svg>
  ),
  chart: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  calendar: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  arrowLeft: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  ),
};

interface Team {
  id: string;
  name: string;
  short_name: string | null;
  logo_url: string | null;
  primary_color: string | null;
}

interface League {
  id: string;
  name: string;
  type: 'football' | 'efootball';
  season: string;
}

interface GamePlayer {
  id: string;
  real_name: string;
  gamertag: string;
  avatar_url: string | null;
  is_captain: boolean;
}

interface Match {
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
  result: 'W' | 'D' | 'L' | null;
  screenshot_url: string | null;
}

interface TeamStats {
  pos: number;
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

export default function TeamsPage() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamMatches, setTeamMatches] = useState<Match[]>([]);
  const [teamGamers, setTeamGamers] = useState<GamePlayer[]>([]);
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null);
  const [activeTab, setActiveTab] = useState<'football' | 'efootball'>('football');
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);

  useEffect(() => {
    loadLeagues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedLeague) {
      loadTeams(selectedLeague);
      // Reset selected team when league changes
      setSelectedTeam(null);
      setTeamMatches([]);
      setTeamGamers([]);
      setTeamStats(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLeague]);

  async function loadLeagues() {
    const { data } = await getLeagues();
    if (data) {
      setLeagues(data as League[]);
      const firstLeague = data.find((l: League) => l.type === activeTab);
      if (firstLeague) {
        setSelectedLeague(firstLeague.id);
      } else if (data.length > 0) {
        setSelectedLeague(data[0].id);
        setActiveTab(data[0].type);
      }
    }
    setLoading(false);
  }

  async function loadTeams(leagueId: string) {
    setLoading(true);
    const { data } = await getTeamsByLeague(leagueId);
    if (data) {
      setTeams(data as Team[]);
    } else {
      setTeams([]);
    }
    setLoading(false);
  }

  async function selectTeam(team: Team) {
    setSelectedTeam(team);
    setLoadingDetail(true);

    // Load matches
    const { data: matches } = await getTeamMatches(team.id);
    if (matches) {
      setTeamMatches(matches as Match[]);
    } else {
      setTeamMatches([]);
    }

    // Load standings to get team stats
    const { data: standings } = await getLeagueStandings(selectedLeague);
    if (standings) {
      const stats = standings.find((s: TeamStats & { team_id: string }) => s.team_id === team.id);
      if (stats) {
        setTeamStats(stats as TeamStats);
      } else {
        setTeamStats(null);
      }
    }

    // Load gamers for eFootball
    const currentLeague = leagues.find(l => l.id === selectedLeague);
    if (currentLeague?.type === 'efootball') {
      const { data: gamers } = await getGamePlayersByTeam(team.id);
      if (gamers) {
        setTeamGamers(gamers as GamePlayer[]);
      } else {
        setTeamGamers([]);
      }
    } else {
      setTeamGamers([]);
    }

    setLoadingDetail(false);
  }

  const handleTabChange = (tab: 'football' | 'efootball') => {
    setActiveTab(tab);
    setSelectedTeam(null);
    const firstLeague = leagues.find(l => l.type === tab);
    if (firstLeague) {
      setSelectedLeague(firstLeague.id);
    }
  };

  const currentLeague = leagues.find(l => l.id === selectedLeague);
  const filteredLeagues = leagues.filter(l => l.type === activeTab);

  // Calculate performance stats
  const wins = teamMatches.filter(m => m.result === 'W').length;
  const draws = teamMatches.filter(m => m.result === 'D').length;
  const losses = teamMatches.filter(m => m.result === 'L').length;
  const completedMatches = teamMatches.filter(m => m.status === 'completed');
  const winRate = completedMatches.length > 0 ? Math.round((wins / completedMatches.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-geometric">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                  {Icons.football}
                </div>
                <span className="font-bold text-white">Football Leagues</span>
              </Link>
            </div>
            <div className="hidden md:flex items-center gap-1">
              <Link href="/standings" className="px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">Klasemen</Link>
              <Link href="/schedule" className="px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">Jadwal</Link>
              <Link href="/teams" className="px-3 py-1.5 text-sm text-white bg-slate-800 rounded-lg">Tim</Link>
              <Link href="/matches" className="px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">Riwayat</Link>
            </div>
            <Link href="/login" className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 transition-colors">
              {Icons.lock}
              <span className="hidden sm:inline">Admin</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
              {Icons.users}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Daftar Tim</h1>
              <p className="text-sm text-slate-400">Lihat semua tim dan riwayat pertandingan mereka</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex rounded-lg bg-slate-800 p-1">
            <button onClick={() => handleTabChange('football')} className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${activeTab === 'football' ? 'bg-green-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>
              {Icons.football}
              <span>Football</span>
            </button>
            <button onClick={() => handleTabChange('efootball')} className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${activeTab === 'efootball' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>
              {Icons.gamepad}
              <span>eFootball</span>
            </button>
          </div>
          <select value={selectedLeague} onChange={(e) => setSelectedLeague(e.target.value)} className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
            {filteredLeagues.map((league) => (
              <option key={league.id} value={league.id}>{league.name} - {league.season}</option>
            ))}
          </select>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Teams Grid */}
          <div className={`${selectedTeam ? 'lg:w-1/3' : 'w-full'} transition-all duration-300`}>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
              </div>
            ) : teams.length === 0 ? (
              <div className="bg-slate-800/50 rounded-lg p-10 text-center border border-slate-700">
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-700/50 text-slate-400 mx-auto mb-4">
                  {Icons.users}
                </div>
                <h2 className="text-lg font-semibold text-white mb-2">Belum Ada Tim</h2>
                <p className="text-sm text-slate-400">{leagues.length === 0 ? 'Belum ada liga yang dibuat' : 'Liga ini belum memiliki tim terdaftar.'}</p>
              </div>
            ) : (
              <div className={`grid ${selectedTeam ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'} gap-3`}>
                {teams.map((team) => (
                  <button
                    key={team.id}
                    onClick={() => selectTeam(team)}
                    className={`bg-slate-800/50 rounded-lg p-4 border transition-all text-center group ${
                      selectedTeam?.id === team.id 
                        ? 'border-emerald-500 ring-2 ring-emerald-500/20' 
                        : 'border-slate-700 hover:border-emerald-500/50'
                    }`}
                  >
                    <div
                      className="w-16 h-16 rounded-lg mx-auto mb-2 flex items-center justify-center group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: team.primary_color || '#374151' }}
                    >
                      {team.logo_url ? (
                        <img src={team.logo_url} alt={team.name} className="w-12 h-12 object-contain" />
                      ) : (
                        <span className="text-slate-300">{Icons.shield}</span>
                      )}
                    </div>
                    <h3 className="text-white font-semibold text-xs truncate">{team.name}</h3>
                    {selectedTeam?.id === team.id && (
                      <span className="inline-block mt-1 text-emerald-400 text-xs">● Dipilih</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Team Detail Panel */}
          {selectedTeam && (
            <div className="lg:w-2/3 space-y-4">
              {/* Team Header Card */}
              <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-20 h-20 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: selectedTeam.primary_color || '#374151' }}
                    >
                      {selectedTeam.logo_url ? (
                        <img src={selectedTeam.logo_url} alt={selectedTeam.name} className="w-14 h-14 object-contain" />
                      ) : (
                        <span className="text-slate-300 text-3xl">{Icons.shield}</span>
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">{selectedTeam.name}</h2>
                      {selectedTeam.short_name && <p className="text-slate-400 text-sm">{selectedTeam.short_name}</p>}
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded ${currentLeague?.type === 'efootball' ? 'bg-purple-500/20 text-purple-400' : 'bg-green-500/20 text-green-400'}`}>
                          {currentLeague?.type === 'efootball' ? 'eFootball' : 'Football'}
                        </span>
                        <span className="text-xs text-slate-500">{currentLeague?.name}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setSelectedTeam(null)} className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white">
                    {Icons.close}
                  </button>
                </div>

                {/* League Position Badge */}
                {teamStats && (
                  <div className="flex items-center gap-2 p-3 bg-slate-900/50 rounded-lg">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg ${
                      teamStats.pos === 1 ? 'bg-amber-500/20 text-amber-400' :
                      teamStats.pos === 2 ? 'bg-slate-400/20 text-slate-300' :
                      teamStats.pos === 3 ? 'bg-orange-500/20 text-orange-400' :
                      'bg-slate-700 text-slate-300'
                    }`}>
                      #{teamStats.pos}
                    </div>
                    <div>
                      <p className="text-white font-medium">Posisi Klasemen</p>
                      <p className="text-xs text-slate-400">{teamStats.points} poin • {currentLeague?.season}</p>
                    </div>
                  </div>
                )}
              </div>

              {loadingDetail ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                </div>
              ) : (
                <>
                  {/* Performance Stats */}
                  <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-5">
                    <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                      <span className="text-emerald-400">{Icons.chart}</span>
                      Statistik & Performa
                    </h3>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                      <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-white">{teamStats?.played || completedMatches.length}</p>
                        <p className="text-xs text-slate-400">Main</p>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-green-400">{teamStats?.won || wins}</p>
                        <p className="text-xs text-slate-400">Menang</p>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-yellow-400">{teamStats?.drawn || draws}</p>
                        <p className="text-xs text-slate-400">Seri</p>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-red-400">{teamStats?.lost || losses}</p>
                        <p className="text-xs text-slate-400">Kalah</p>
                      </div>
                    </div>

                    {teamStats && (
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                          <p className="text-lg font-bold text-blue-400">{teamStats.goals_for}</p>
                          <p className="text-xs text-slate-400">Gol Cetak</p>
                        </div>
                        <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                          <p className="text-lg font-bold text-orange-400">{teamStats.goals_against}</p>
                          <p className="text-xs text-slate-400">Gol Masuk</p>
                        </div>
                        <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                          <p className={`text-lg font-bold ${teamStats.goal_difference >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {teamStats.goal_difference > 0 ? '+' : ''}{teamStats.goal_difference}
                          </p>
                          <p className="text-xs text-slate-400">Selisih Gol</p>
                        </div>
                      </div>
                    )}

                    {/* Win Rate Bar */}
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-400">Win Rate</span>
                        <span className="text-sm font-bold text-white">{winRate}%</span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-500"
                          style={{ width: `${winRate}%` }}
                        />
                      </div>
                    </div>

                    {/* Form */}
                    {teamStats?.form && (
                      <div className="mt-4">
                        <p className="text-xs text-slate-400 mb-2">5 Pertandingan Terakhir</p>
                        <div className="flex gap-1">
                          {teamStats.form.split('').slice(-5).map((result, idx) => (
                            <span key={idx} className={`w-7 h-7 rounded flex items-center justify-center text-xs font-bold ${
                              result === 'W' ? 'bg-green-500 text-white' :
                              result === 'D' ? 'bg-yellow-500 text-white' :
                              'bg-red-500 text-white'
                            }`}>
                              {result}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Gamers (for eFootball) */}
                  {currentLeague?.type === 'efootball' && teamGamers.length > 0 && (
                    <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-5">
                      <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                        <span className="text-purple-400">{Icons.gamepad}</span>
                        Roster Tim
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {teamGamers.map((gamer) => (
                          <div key={gamer.id} className="flex items-center gap-2 bg-slate-900/50 rounded-lg p-2">
                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden text-sm">
                              {gamer.avatar_url ? (
                                <img src={gamer.avatar_url} alt={gamer.real_name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-slate-400">👤</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-medium flex items-center gap-1 truncate">
                                {gamer.real_name}
                                {gamer.is_captain && <span className="text-yellow-400 text-xs">👑</span>}
                              </p>
                              <p className="text-purple-400 text-xs truncate">@{gamer.gamertag}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Match History */}
                  <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-5">
                    <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <span className="text-emerald-400">{Icons.calendar}</span>
                      Riwayat Pertandingan
                      <span className="text-xs text-slate-500 ml-auto">Klik untuk detail</span>
                    </h3>
                    {teamMatches.length === 0 ? (
                      <p className="text-slate-400 text-center py-6 text-sm">Belum ada riwayat pertandingan</p>
                    ) : (
                      <div className="space-y-2 max-h-[500px] overflow-y-auto">
                        {teamMatches.slice(0, 15).map((match) => {
                          const isHome = match.home_team_id === selectedTeam.id;
                          const opponent = isHome ? match.away_team_name : match.home_team_name;
                          const isExpanded = expandedMatch === match.match_id;
                          const score = match.status === 'completed'
                            ? isHome
                              ? `${match.home_score} - ${match.away_score}`
                              : `${match.away_score} - ${match.home_score}`
                            : 'vs';

                          return (
                            <div key={match.match_id} className="bg-slate-900/50 rounded-lg overflow-hidden">
                              {/* Match Row - Clickable */}
                              <button
                                onClick={() => setExpandedMatch(isExpanded ? null : match.match_id)}
                                className="w-full flex items-center gap-3 p-3 hover:bg-slate-800/50 transition-colors"
                              >
                                {/* Result Indicator */}
                                <div className={`w-1 h-10 rounded-full ${
                                  match.result === 'W' ? 'bg-green-500' :
                                  match.result === 'D' ? 'bg-yellow-500' :
                                  match.result === 'L' ? 'bg-red-500' :
                                  'bg-slate-600'
                                }`} />

                                <div className="flex-1 min-w-0 text-left">
                                  <div className="flex items-center gap-2">
                                    <span className={`text-xs px-1.5 py-0.5 rounded ${isHome ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                      {isHome ? 'H' : 'A'}
                                    </span>
                                    <span className="text-white text-sm font-medium truncate">vs {opponent}</span>
                                    {match.screenshot_url && (
                                      <span className="text-xs text-purple-400">📷</span>
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-400 mt-0.5">Pekan {match.match_week}</p>
                                </div>

                                <div className="text-right">
                                  <div className={`px-2 py-1 rounded text-center ${
                                    match.status === 'completed' 
                                      ? match.result === 'W' ? 'bg-green-600/20' :
                                        match.result === 'D' ? 'bg-yellow-600/20' :
                                        match.result === 'L' ? 'bg-red-600/20' : 'bg-slate-600'
                                      : 'bg-slate-700'
                                  }`}>
                                    <span className="text-white text-sm font-bold">{score}</span>
                                  </div>
                                  <p className="text-xs text-slate-500 mt-0.5">
                                    {match.match_date ? new Date(match.match_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '-'}
                                  </p>
                                </div>

                                {/* Expand Indicator */}
                                <div className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                  </svg>
                                </div>
                              </button>

                              {/* Expanded Detail */}
                              {isExpanded && (
                                <div className="border-t border-slate-700 p-4 space-y-4">
                                  {/* Match Detail Header */}
                                  <div className="flex items-center justify-center gap-4">
                                    {/* Home Team */}
                                    <div className="flex flex-col items-center gap-2">
                                      <div className="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center">
                                        {match.home_team_logo ? (
                                          <img src={match.home_team_logo} alt="" className="w-8 h-8 object-contain" />
                                        ) : (
                                          <span className="text-slate-400">{Icons.shield}</span>
                                        )}
                                      </div>
                                      <span className="text-xs text-white font-medium text-center max-w-[80px] truncate">{match.home_team_name}</span>
                                    </div>

                                    {/* Score */}
                                    <div className="text-center px-4">
                                      <div className={`text-2xl font-bold ${
                                        match.result === 'W' ? 'text-green-400' :
                                        match.result === 'L' ? 'text-red-400' :
                                        match.result === 'D' ? 'text-yellow-400' :
                                        'text-white'
                                      }`}>
                                        {match.home_score} - {match.away_score}
                                      </div>
                                      <p className="text-xs text-slate-400 mt-1">
                                        {match.match_date ? new Date(match.match_date).toLocaleDateString('id-ID', {
                                          weekday: 'long',
                                          day: 'numeric',
                                          month: 'long',
                                          year: 'numeric'
                                        }) : '-'}
                                      </p>
                                    </div>

                                    {/* Away Team */}
                                    <div className="flex flex-col items-center gap-2">
                                      <div className="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center">
                                        {match.away_team_logo ? (
                                          <img src={match.away_team_logo} alt="" className="w-8 h-8 object-contain" />
                                        ) : (
                                          <span className="text-slate-400">{Icons.shield}</span>
                                        )}
                                      </div>
                                      <span className="text-xs text-white font-medium text-center max-w-[80px] truncate">{match.away_team_name}</span>
                                    </div>
                                  </div>

                                  {/* Result Badge */}
                                  <div className="flex justify-center">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                      match.result === 'W' ? 'bg-green-500/20 text-green-400' :
                                      match.result === 'D' ? 'bg-yellow-500/20 text-yellow-400' :
                                      match.result === 'L' ? 'bg-red-500/20 text-red-400' :
                                      'bg-slate-600 text-slate-300'
                                    }`}>
                                      {match.result === 'W' ? '🏆 Menang' :
                                       match.result === 'D' ? '🤝 Seri' :
                                       match.result === 'L' ? '❌ Kalah' : 'Belum Selesai'}
                                    </span>
                                  </div>

                                  {/* Screenshot */}
                                  {match.screenshot_url && (
                                    <div className="space-y-2">
                                      <p className="text-xs text-slate-400 flex items-center gap-1">
                                        <span className="text-purple-400">{Icons.gamepad}</span>
                                        Screenshot Hasil
                                      </p>
                                      <div className="relative rounded-lg overflow-hidden border border-slate-700">
                                        <img
                                          src={match.screenshot_url}
                                          alt="Match Screenshot"
                                          className="w-full h-auto object-cover"
                                        />
                                      </div>
                                    </div>
                                  )}

                                  {/* Gamers Info for eFootball */}
                                  {currentLeague?.type === 'efootball' && teamGamers.length > 0 && (
                                    <div className="space-y-2">
                                      <p className="text-xs text-slate-400 flex items-center gap-1">
                                        <span className="text-purple-400">{Icons.users}</span>
                                        Pemain {selectedTeam.name}
                                      </p>
                                      <div className="flex flex-wrap gap-2">
                                        {teamGamers.map((gamer) => (
                                          <div key={gamer.id} className="flex items-center gap-1.5 bg-slate-800 rounded-full px-2 py-1">
                                            <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
                                              {gamer.avatar_url ? (
                                                <img src={gamer.avatar_url} alt="" className="w-full h-full object-cover" />
                                              ) : (
                                                <span className="text-xs text-slate-400">👤</span>
                                              )}
                                            </div>
                                            <span className="text-xs text-white">{gamer.gamertag}</span>
                                            {gamer.is_captain && <span className="text-xs">👑</span>}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <footer className="mt-12 border-t border-slate-800 py-6">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-slate-500">
          <p className="mb-3">© 2026 Football Leagues. Data diperbarui secara real-time.</p>
          <Link href="/login" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors">
            {Icons.lock}
            <span>Admin Panel</span>
          </Link>
        </div>
      </footer>
    </div>
  );
}
