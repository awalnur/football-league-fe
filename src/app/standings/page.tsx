'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getLeagues, getLeagueStandings, getTeamMatches, getGamePlayersByTeam } from '@/lib/supabase';

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

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Standing | null>(null);
  const [teamMatches, setTeamMatches] = useState<TeamMatch[]>([]);
  const [teamGamers, setTeamGamers] = useState<GamePlayer[]>([]);
  const [loadingModal, setLoadingModal] = useState(false);

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

  async function loadStandings(leagueId: string) {
    setLoading(true);
    const { data } = await getLeagueStandings(leagueId);
    if (data) {
      setStandings(data as Standing[]);
    } else {
      setStandings([]);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadLeagues();
  }, []);

  useEffect(() => {
    if (selectedLeague) {
      loadStandings(selectedLeague);
    }
  }, [selectedLeague]);

  const handleTabChange = (tab: 'football' | 'efootball') => {
    setActiveTab(tab);
    const firstLeague = leagues.find(l => l.type === tab);
    if (firstLeague) {
      setSelectedLeague(firstLeague.id);
    }
  };

  const openTeamDetail = async (team: Standing) => {
    setSelectedTeam(team);
    setShowModal(true);
    setLoadingModal(true);
    setTeamMatches([]);
    setTeamGamers([]);

    const { data: matches } = await getTeamMatches(team.team_id);
    if (matches) {
      setTeamMatches(matches as TeamMatch[]);
    }

    if (currentLeague?.type === 'efootball') {
      const { data: gamers } = await getGamePlayersByTeam(team.team_id);
      if (gamers) {
        setTeamGamers(gamers as GamePlayer[]);
      }
    }

    setLoadingModal(false);
  };

  const currentLeague = leagues.find(l => l.id === selectedLeague);
  const filteredLeagues = leagues.filter(l => l.type === activeTab);

  const getFormBadges = (form: string | null) => {
    if (!form) return null;
    return form.split('').map((result, index) => (
      <span
        key={index}
        className={`inline-flex h-5 w-5 items-center justify-center rounded text-xs font-bold ${
          result === 'W' ? 'bg-green-500 text-white' :
          result === 'D' ? 'bg-yellow-500 text-white' :
          'bg-red-500 text-white'
        }`}
      >
        {result}
      </span>
    ));
  };

  const getPositionStyle = (position: number) => {
    if (position <= 4) return 'bg-green-500 text-white';
    if (position <= 6) return 'bg-blue-500 text-white';
    if (position >= standings.length - 2 && standings.length > 5) return 'bg-red-500 text-white';
    return 'bg-slate-700 text-slate-300';
  };

  return (
    <div className="min-h-screen bg-geometric">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L10 14v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                  </svg>
                </div>
                <span className="font-bold text-white">Football Leagues</span>
              </Link>
            </div>
            <div className="hidden md:flex items-center gap-1">
              <Link href="/standings" className="px-3 py-1.5 text-sm text-white bg-slate-800 rounded-lg">Klasemen</Link>
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
        {/* Header */}
        <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 4h2a2 2 0 012 2v2a4 4 0 01-4 4h-1m-6 0H8a4 4 0 01-4-4V6a2 2 0 012-2h2m8 0V3a1 1 0 00-1-1H9a1 1 0 00-1 1v1m8 0H8m4 16v-4m-4 4h8m-4-8a4 4 0 01-4-4V4h8v4a4 4 0 01-4 4z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Klasemen Liga</h1>
              <p className="text-sm text-slate-400">Pantau klasemen terkini liga sepakbola dan eFootball</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex rounded-lg bg-slate-900 border border-slate-800 p-1">
              <button
                onClick={() => handleTabChange('football')}
                className={`flex items-center gap-2 rounded px-4 py-2 text-sm font-medium transition-all ${
                  activeTab === 'football' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L10 14v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
                <span>Football</span>
              </button>
              <button
                onClick={() => handleTabChange('efootball')}
                className={`flex items-center gap-2 rounded px-4 py-2 text-sm font-medium transition-all ${
                  activeTab === 'efootball' ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
                <span>eFootball</span>
              </button>
            </div>
            <select
              value={selectedLeague}
              onChange={(e) => setSelectedLeague(e.target.value)}
              className="rounded-lg bg-slate-900 border border-slate-800 px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {filteredLeagues.map((league) => (
                <option key={league.id} value={league.id}>{league.name} - {league.season}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Current League Info */}
        {currentLeague && (
          <div className="mb-6 flex items-center justify-between p-4 rounded-lg bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center">
                {currentLeague.logo_url ? (
                  <img src={currentLeague.logo_url} alt="" className="w-8 h-8 object-contain" />
                ) : currentLeague.type === 'efootball' ? (
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L10 14v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                  </svg>
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{currentLeague.name}</h2>
                <p className="text-sm text-slate-400">Musim {currentLeague.season}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-500"></span>
              Live Updates
            </div>
          </div>
        )}

        {/* Standings Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
          </div>
        ) : standings.length === 0 ? (
          <div className="rounded-lg bg-slate-900 border border-slate-800 p-12 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2v-4m-4 4h8m-4-8a4 4 0 01-4-4V4h8v4a4 4 0 01-4 4z" />
            </svg>
            <h2 className="text-xl font-semibold text-white mb-2">Belum Ada Data Klasemen</h2>
            <p className="text-slate-400 mb-6">{leagues.length === 0 ? 'Belum ada liga yang dibuat' : 'Liga ini belum memiliki data klasemen.'}</p>
            <Link href="/login" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Login sebagai Admin
            </Link>
          </div>
        ) : (
          <div className="rounded-lg bg-slate-900 border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-800/50">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Pos</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Tim</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-400">Main</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-400">M</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-400">S</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-400">K</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-400">GM</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-400">GK</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-400">SG</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-400">Poin</th>
                    <th className="hidden px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-400 sm:table-cell">Form</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {standings.map((team) => (
                    <tr key={team.team_id} className="transition-colors hover:bg-slate-800/50">
                      <td className="px-4 py-3">
                        <span className={`inline-flex h-7 w-7 items-center justify-center rounded text-xs font-bold ${getPositionStyle(team.pos)}`}>{team.pos}</span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => openTeamDetail(team)}
                          className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
                        >
                          <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center group-hover:ring-2 group-hover:ring-emerald-500/50 transition-all">
                            {team.team_logo ? (
                              <img src={team.team_logo} alt="" className="h-6 w-6 object-contain" />
                            ) : (
                              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                              </svg>
                            )}
                          </div>
                          <span className="font-medium text-white group-hover:text-emerald-400 transition-colors">{team.team_name}</span>
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center text-slate-300">{team.played}</td>
                      <td className="px-4 py-3 text-center text-green-400 font-medium">{team.won}</td>
                      <td className="px-4 py-3 text-center text-yellow-400 font-medium">{team.drawn}</td>
                      <td className="px-4 py-3 text-center text-red-400 font-medium">{team.lost}</td>
                      <td className="px-4 py-3 text-center text-slate-300">{team.goals_for}</td>
                      <td className="px-4 py-3 text-center text-slate-300">{team.goals_against}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={team.goal_difference > 0 ? 'text-green-400' : team.goal_difference < 0 ? 'text-red-400' : 'text-slate-400'}>
                          {team.goal_difference > 0 ? '+' : ''}{team.goal_difference}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center"><span className="text-lg font-bold text-white">{team.points}</span></td>
                      <td className="hidden px-4 py-3 sm:table-cell"><div className="flex justify-center gap-1">{getFormBadges(team.form)}</div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-slate-800 bg-slate-800/30 px-4 py-3">
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-green-500"></span><span>Zona Juara</span></div>
                <div className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-blue-500"></span><span>Zona Kompetisi</span></div>
                <div className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-red-500"></span><span>Zona Degradasi</span></div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {standings.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-slate-900 border border-slate-800 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-400">Pemimpin Klasemen</p>
                  <p className="mt-1 text-lg font-bold text-white">{standings[0]?.team_name}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 4h2a2 2 0 012 2v2a4 4 0 01-4 4h-1m-6 0H8a4 4 0 01-4-4V6a2 2 0 012-2h2m8 0V3a1 1 0 00-1-1H9a1 1 0 00-1 1v1m8 0H8m4 16v-4m-4 4h8m-4-8a4 4 0 01-4-4V4h8v4a4 4 0 01-4 4z" />
                  </svg>
                </div>
              </div>
              <p className="mt-2 text-xs text-slate-500">{standings[0]?.points} poin dari {standings[0]?.played} pertandingan</p>
            </div>
            <div className="rounded-lg bg-slate-900 border border-slate-800 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-400">Gol Terbanyak</p>
                  <p className="mt-1 text-lg font-bold text-white">{[...standings].sort((a, b) => b.goals_for - a.goals_for)[0]?.team_name}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L10 14v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                  </svg>
                </div>
              </div>
              <p className="mt-2 text-xs text-slate-500">{[...standings].sort((a, b) => b.goals_for - a.goals_for)[0]?.goals_for} gol dicetak</p>
            </div>
            <div className="rounded-lg bg-slate-900 border border-slate-800 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-400">Pertahanan Terbaik</p>
                  <p className="mt-1 text-lg font-bold text-white">{[...standings].sort((a, b) => a.goals_against - b.goals_against)[0]?.team_name}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
              <p className="mt-2 text-xs text-slate-500">{[...standings].sort((a, b) => a.goals_against - b.goals_against)[0]?.goals_against} gol kemasukan</p>
            </div>
            <div className="rounded-lg bg-slate-900 border border-slate-800 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-400">Selisih Gol Terbaik</p>
                  <p className="mt-1 text-lg font-bold text-white">{[...standings].sort((a, b) => b.goal_difference - a.goal_difference)[0]?.team_name}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <p className="mt-2 text-xs text-slate-500">+{[...standings].sort((a, b) => b.goal_difference - a.goal_difference)[0]?.goal_difference} selisih gol</p>
            </div>
          </div>
        )}
      </div>

      {/* Team Detail Modal */}
      {showModal && selectedTeam && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-slate-900 rounded-lg border border-slate-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900 z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center">
                  {selectedTeam.team_logo ? (
                    <img src={selectedTeam.team_logo} alt={selectedTeam.team_name} className="w-8 h-8 object-contain" />
                  ) : (
                    <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedTeam.team_name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      selectedTeam.pos <= 4 ? 'bg-green-500/20 text-green-400' : 
                      selectedTeam.pos <= 6 ? 'bg-blue-500/20 text-blue-400' : 
                      'bg-slate-700 text-slate-400'
                    }`}>
                      #{selectedTeam.pos}
                    </span>
                    <span className="text-slate-400 text-sm">{selectedTeam.points} poin</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Team Stats */}
            <div className="p-4 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2v-4m-4 4h8m-4-8a4 4 0 01-4-4V4h8v4a4 4 0 01-4 4z" />
                </svg>
                Statistik
              </h3>
              <div className="grid grid-cols-4 gap-2">
                <div className="bg-slate-800 rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-white">{selectedTeam.played}</p>
                  <p className="text-xs text-slate-400">Main</p>
                </div>
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-green-400">{selectedTeam.won}</p>
                  <p className="text-xs text-slate-400">Menang</p>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-yellow-400">{selectedTeam.drawn}</p>
                  <p className="text-xs text-slate-400">Seri</p>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-red-400">{selectedTeam.lost}</p>
                  <p className="text-xs text-slate-400">Kalah</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2">
                <div className="bg-slate-800 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-white">{selectedTeam.goals_for}</p>
                  <p className="text-xs text-slate-400">Gol Memasukkan</p>
                </div>
                <div className="bg-slate-800 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-white">{selectedTeam.goals_against}</p>
                  <p className="text-xs text-slate-400">Gol Kemasukan</p>
                </div>
                <div className="bg-slate-800 rounded-lg p-3 text-center">
                  <p className={`text-lg font-bold ${selectedTeam.goal_difference > 0 ? 'text-green-400' : selectedTeam.goal_difference < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                    {selectedTeam.goal_difference > 0 ? '+' : ''}{selectedTeam.goal_difference}
                  </p>
                  <p className="text-xs text-slate-400">Selisih Gol</p>
                </div>
              </div>
              {selectedTeam.form && (
                <div className="mt-3">
                  <p className="text-xs text-slate-400 mb-2">Form 5 Laga Terakhir:</p>
                  <div className="flex gap-1">{getFormBadges(selectedTeam.form)}</div>
                </div>
              )}
            </div>

            {/* Gamers (for eFootball) */}
            {currentLeague?.type === 'efootball' && (
              <div className="p-4 border-b border-slate-800">
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                  Roster Tim
                </h3>
                {loadingModal ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                  </div>
                ) : teamGamers.length === 0 ? (
                  <p className="text-slate-400 text-center py-4 text-sm">Belum ada data gamer</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {teamGamers.map((gamer) => (
                      <div key={gamer.id} className="flex items-center gap-2 bg-slate-800 rounded-lg p-2">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
                          {gamer.avatar_url ? (
                            <img src={gamer.avatar_url} alt={gamer.real_name} className="w-full h-full object-cover" />
                          ) : (
                            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium flex items-center gap-1">
                            {gamer.real_name}
                            {gamer.is_captain && (
                              <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            )}
                          </p>
                          <p className="text-purple-400 text-xs">@{gamer.gamertag}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Match History */}
            <div className="p-4">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Riwayat Pertandingan
              </h3>
              {loadingModal ? (
                <div className="flex justify-center py-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
                </div>
              ) : teamMatches.length === 0 ? (
                <p className="text-slate-400 text-center py-6 text-sm">Belum ada riwayat pertandingan</p>
              ) : (
                <div className="space-y-2">
                  {teamMatches.slice(0, 10).map((match) => {
                    const isWin = match.result === 'W';
                    const isLoss = match.result === 'L';
                    const isDraw = match.result === 'D';

                    return (
                      <div
                        key={match.match_id}
                        className={`flex items-center justify-between rounded-lg p-2 ${
                          isWin ? 'bg-green-500/10 border border-green-500/20' :
                          isLoss ? 'bg-red-500/10 border border-red-500/20' :
                          isDraw ? 'bg-yellow-500/10 border border-yellow-500/20' :
                          'bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <span className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold ${
                            isWin ? 'bg-green-500 text-white' :
                            isLoss ? 'bg-red-500 text-white' :
                            isDraw ? 'bg-yellow-500 text-white' :
                            'bg-slate-700 text-slate-300'
                          }`}>
                            {match.result || '-'}
                          </span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 text-xs">
                              <span className={match.is_home ? 'text-white font-medium' : 'text-slate-400'}>{match.home_team_name}</span>
                              <span className={`font-bold ${
                                match.status === 'completed' 
                                  ? isWin ? 'text-green-400' : isLoss ? 'text-red-400' : 'text-white'
                                  : 'text-slate-400'
                              }`}>
                                {match.status === 'completed' ? `${match.home_score} - ${match.away_score}` : 'vs'}
                              </span>
                              <span className={!match.is_home ? 'text-white font-medium' : 'text-slate-400'}>{match.away_team_name}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 text-xs">{match.is_home ? 'H' : 'A'}</span>
                          <span className="text-slate-400 text-xs">
                            {match.match_date ? new Date(match.match_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '-'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
