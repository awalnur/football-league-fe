'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getLeagues, getTeamsByLeague, getTeamMatches, getGamePlayersByTeam } from '@/lib/supabase';

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
  result: string | null;
}

export default function TeamsPage() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamMatches, setTeamMatches] = useState<Match[]>([]);
  const [teamGamers, setTeamGamers] = useState<GamePlayer[]>([]);
  const [activeTab, setActiveTab] = useState<'football' | 'efootball'>('football');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadLeagues();
  }, []);

  useEffect(() => {
    if (selectedLeague) {
      loadTeams(selectedLeague);
    }
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

  async function openTeamDetail(team: Team) {
    setSelectedTeam(team);
    setShowModal(true);

    // Load matches
    const { data: matches } = await getTeamMatches(team.id);
    if (matches) {
      setTeamMatches(matches as Match[]);
    }

    // Load gamers for eFootball
    const currentLeague = leagues.find(l => l.id === selectedLeague);
    if (currentLeague?.type === 'efootball') {
      const { data: gamers } = await getGamePlayersByTeam(team.id);
      if (gamers) {
        setTeamGamers(gamers as GamePlayer[]);
      }
    } else {
      setTeamGamers([]);
    }
  }

  const handleTabChange = (tab: 'football' | 'efootball') => {
    setActiveTab(tab);
    const firstLeague = leagues.find(l => l.type === tab);
    if (firstLeague) {
      setSelectedLeague(firstLeague.id);
    }
  };

  const currentLeague = leagues.find(l => l.id === selectedLeague);
  const filteredLeagues = leagues.filter(l => l.type === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.1%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM36 6V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="text-center sm:text-left">
              <Link href="/" className="mb-4 inline-flex items-center gap-2 text-sm text-emerald-200 hover:text-white transition-colors">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Kembali ke Beranda
              </Link>
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">👥 Daftar Tim</h1>
              <p className="mt-2 max-w-xl text-lg text-emerald-100">Lihat semua tim dan riwayat pertandingan mereka</p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/standings" className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/30">
                <span>🏆</span><span>Klasemen</span>
              </Link>
              <Link href="/schedule" className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/30">
                <span>📅</span><span>Jadwal</span>
              </Link>
              <Link href="/matches" className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/30">
                <span>📋</span><span>Riwayat</span>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="h-12 w-full text-zinc-900" viewBox="0 0 1440 48" fill="currentColor" preserveAspectRatio="none">
            <path d="M0,48 L1440,48 L1440,0 C1140,32 720,48 360,32 C180,24 60,12 0,0 L0,48 Z" />
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex rounded-xl bg-zinc-800 p-1">
            <button onClick={() => handleTabChange('football')} className={`flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium transition-all ${activeTab === 'football' ? 'bg-green-600 text-white shadow-lg' : 'text-zinc-400 hover:text-white'}`}>
              <span>⚽</span><span>Football</span>
            </button>
            <button onClick={() => handleTabChange('efootball')} className={`flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium transition-all ${activeTab === 'efootball' ? 'bg-purple-600 text-white shadow-lg' : 'text-zinc-400 hover:text-white'}`}>
              <span>🎮</span><span>eFootball</span>
            </button>
          </div>
          <select value={selectedLeague} onChange={(e) => setSelectedLeague(e.target.value)} className="rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
            {filteredLeagues.map((league) => (
              <option key={league.id} value={league.id}>{league.name} - {league.season}</option>
            ))}
          </select>
        </div>

        {/* Teams Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          </div>
        ) : teams.length === 0 ? (
          <div className="bg-zinc-800 rounded-2xl p-12 text-center border border-zinc-700">
            <span className="text-6xl block mb-4">👥</span>
            <h2 className="text-xl font-semibold text-white mb-2">Belum Ada Tim</h2>
            <p className="text-zinc-400">{leagues.length === 0 ? 'Belum ada liga yang dibuat' : 'Liga ini belum memiliki tim terdaftar.'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {teams.map((team) => (
              <button
                key={team.id}
                onClick={() => openTeamDetail(team)}
                className="bg-zinc-800 rounded-2xl p-6 border border-zinc-700 hover:border-emerald-500/50 transition-all text-center group"
              >
                <div
                  className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: team.primary_color || '#374151' }}
                >
                  {team.logo_url ? (
                    <img src={team.logo_url} alt={team.name} className="w-14 h-14 object-contain" />
                  ) : (
                    '🛡️'
                  )}
                </div>
                <h3 className="text-white font-semibold truncate">{team.name}</h3>
                {team.short_name && <p className="text-zinc-400 text-sm">{team.short_name}</p>}
                <p className="text-emerald-400 text-xs mt-2">Klik untuk detail →</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Team Detail Modal */}
      {showModal && selectedTeam && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-zinc-800 rounded-2xl border border-zinc-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="p-6 border-b border-zinc-700 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl"
                  style={{ backgroundColor: selectedTeam.primary_color || '#374151' }}
                >
                  {selectedTeam.logo_url ? (
                    <img src={selectedTeam.logo_url} alt={selectedTeam.name} className="w-12 h-12 object-contain" />
                  ) : (
                    '🛡️'
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedTeam.name}</h2>
                  {selectedTeam.short_name && <p className="text-zinc-400">{selectedTeam.short_name}</p>}
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-zinc-700 rounded-lg transition-colors">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Gamers (for eFootball) */}
            {currentLeague?.type === 'efootball' && teamGamers.length > 0 && (
              <div className="p-6 border-b border-zinc-700">
                <h3 className="text-lg font-semibold text-white mb-4">🎮 Roster Tim</h3>
                <div className="grid grid-cols-2 gap-3">
                  {teamGamers.map((gamer) => (
                    <div key={gamer.id} className="flex items-center gap-3 bg-zinc-700/50 rounded-lg p-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-600 flex items-center justify-center overflow-hidden">
                        {gamer.avatar_url ? (
                          <img src={gamer.avatar_url} alt={gamer.real_name} className="w-full h-full object-cover" />
                        ) : (
                          '👤'
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium flex items-center gap-1">
                          {gamer.real_name}
                          {gamer.is_captain && <span className="text-yellow-400">👑</span>}
                        </p>
                        <p className="text-purple-400 text-sm">@{gamer.gamertag}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Match History */}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">📋 Riwayat Pertandingan</h3>
              {teamMatches.length === 0 ? (
                <p className="text-zinc-400 text-center py-8">Belum ada riwayat pertandingan</p>
              ) : (
                <div className="space-y-3">
                  {teamMatches.slice(0, 10).map((match) => (
                    <div key={match.match_id} className="flex items-center justify-between bg-zinc-700/50 rounded-lg p-3">
                      <div className="flex items-center gap-4">
                        <span className="text-white font-medium">{match.home_team_name}</span>
                        <div className={`px-3 py-1 rounded ${match.status === 'completed' ? 'bg-green-600/20' : 'bg-zinc-600'}`}>
                          {match.status === 'completed' ? (
                            <span className="text-white font-bold">{match.home_score} - {match.away_score}</span>
                          ) : (
                            <span className="text-zinc-300 text-sm">vs</span>
                          )}
                        </div>
                        <span className="text-white font-medium">{match.away_team_name}</span>
                      </div>
                      <span className="text-zinc-400 text-sm">
                        {match.match_date ? new Date(match.match_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '-'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <footer className="mt-16 border-t border-zinc-800 py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-zinc-500">
          <p className="mb-4">© 2026 Football Leagues. Data diperbarui secara real-time.</p>
          <Link href="/login" className="text-zinc-400 hover:text-white transition-colors">🔐 Admin Panel</Link>
        </div>
      </footer>
    </div>
  );
}
