'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getLeagues, getMatchesByLeague } from '@/lib/supabase';

interface Match {
  id: string;
  match_week: number;
  match_date: string | null;
  status: string;
  home_score: number | null;
  away_score: number | null;
  home_team: { id: string; name: string; logo_url: string | null };
  away_team: { id: string; name: string; logo_url: string | null };
}

interface League {
  id: string;
  name: string;
  type: 'football' | 'efootball';
  season: string;
}

export default function SchedulePage() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'football' | 'efootball'>('football');
  const [selectedWeek, setSelectedWeek] = useState<number | 'all'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeagues();
  }, []);

  useEffect(() => {
    if (selectedLeague) {
      loadMatches(selectedLeague);
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

  async function loadMatches(leagueId: string) {
    setLoading(true);
    const { data } = await getMatchesByLeague(leagueId);
    if (data) {
      setMatches(data as unknown as Match[]);
    } else {
      setMatches([]);
    }
    setLoading(false);
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
  const matchWeeks = [...new Set(matches.map(m => m.match_week))].sort((a, b) => a - b);

  const filteredMatches = selectedWeek === 'all'
    ? matches
    : matches.filter(m => m.match_week === selectedWeek);

  const groupedMatches = filteredMatches.reduce((acc, match) => {
    const week = match.match_week;
    if (!acc[week]) acc[week] = [];
    acc[week].push(match);
    return acc;
  }, {} as Record<number, Match[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.1%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM36 4V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="text-center sm:text-left">
              <Link href="/" className="mb-4 inline-flex items-center gap-2 text-sm text-blue-200 hover:text-white transition-colors">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Kembali ke Beranda
              </Link>
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">📅 Jadwal Pertandingan</h1>
              <p className="mt-2 max-w-xl text-lg text-blue-100">Lihat jadwal lengkap pertandingan liga</p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/standings" className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/30">
                <span>🏆</span><span>Klasemen</span>
              </Link>
              <Link href="/teams" className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/30">
                <span>👥</span><span>Tim</span>
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
          <div className="flex gap-4">
            <select value={selectedLeague} onChange={(e) => setSelectedLeague(e.target.value)} className="rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              {filteredLeagues.map((league) => (
                <option key={league.id} value={league.id}>{league.name}</option>
              ))}
            </select>
            <select value={selectedWeek} onChange={(e) => setSelectedWeek(e.target.value === 'all' ? 'all' : Number(e.target.value))} className="rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">Semua Pekan</option>
              {matchWeeks.map((week) => (
                <option key={week} value={week}>Pekan {week}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Schedule */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : matches.length === 0 ? (
          <div className="bg-zinc-800 rounded-2xl p-12 text-center border border-zinc-700">
            <span className="text-6xl block mb-4">📅</span>
            <h2 className="text-xl font-semibold text-white mb-2">Belum Ada Jadwal</h2>
            <p className="text-zinc-400">{leagues.length === 0 ? 'Belum ada liga yang dibuat' : 'Liga ini belum memiliki jadwal pertandingan.'}</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedMatches).sort(([a], [b]) => Number(a) - Number(b)).map(([week, weekMatches]) => (
              <div key={week} className="bg-zinc-800 rounded-2xl border border-zinc-700 overflow-hidden">
                <div className="bg-zinc-900/50 px-6 py-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">📆 Pekan {week}</h3>
                  <span className="text-sm text-zinc-400">{weekMatches.length} pertandingan</span>
                </div>
                <div className="divide-y divide-zinc-700">
                  {weekMatches.map((match) => (
                    <div key={match.id} className="p-4 hover:bg-zinc-700/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          {/* Home Team */}
                          <div className="flex items-center gap-3 flex-1 justify-end">
                            <span className="text-white font-medium text-right">{match.home_team?.name}</span>
                            <div className="w-10 h-10 rounded-lg bg-zinc-700 flex items-center justify-center">
                              {match.home_team?.logo_url ? <img src={match.home_team.logo_url} alt="" className="w-7 h-7 object-contain" /> : '🏠'}
                            </div>
                          </div>

                          {/* Score */}
                          <div className="min-w-[100px] text-center">
                            {match.status === 'completed' ? (
                              <div className="bg-green-600/20 border border-green-600/30 rounded-lg px-4 py-2">
                                <span className="text-xl font-bold text-white">{match.home_score} - {match.away_score}</span>
                              </div>
                            ) : (
                              <div className="bg-zinc-700 rounded-lg px-4 py-2">
                                <span className="text-sm text-zinc-300">
                                  {match.match_date ? new Date(match.match_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'TBD'}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Away Team */}
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-10 h-10 rounded-lg bg-zinc-700 flex items-center justify-center">
                              {match.away_team?.logo_url ? <img src={match.away_team.logo_url} alt="" className="w-7 h-7 object-contain" /> : '✈️'}
                            </div>
                            <span className="text-white font-medium">{match.away_team?.name}</span>
                          </div>
                        </div>

                        <span className={`ml-4 px-3 py-1 rounded-full text-xs font-medium ${
                          match.status === 'completed' ? 'bg-green-600/20 text-green-400' :
                          match.status === 'scheduled' ? 'bg-blue-600/20 text-blue-400' :
                          'bg-zinc-600/20 text-zinc-400'
                        }`}>
                          {match.status === 'completed' ? 'Selesai' : match.status === 'scheduled' ? 'Terjadwal' : match.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Stats */}
        {matches.length > 0 && (
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700 text-center">
              <p className="text-3xl font-bold text-white">{matches.length}</p>
              <p className="text-sm text-zinc-400">Total Pertandingan</p>
            </div>
            <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700 text-center">
              <p className="text-3xl font-bold text-green-400">{matches.filter(m => m.status === 'completed').length}</p>
              <p className="text-sm text-zinc-400">Selesai</p>
            </div>
            <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700 text-center">
              <p className="text-3xl font-bold text-blue-400">{matches.filter(m => m.status === 'scheduled').length}</p>
              <p className="text-sm text-zinc-400">Akan Datang</p>
            </div>
            <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700 text-center">
              <p className="text-3xl font-bold text-purple-400">{matchWeeks.length}</p>
              <p className="text-sm text-zinc-400">Total Pekan</p>
            </div>
          </div>
        )}
      </div>

      <footer className="mt-16 border-t border-zinc-800 py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-zinc-500">
          <p className="mb-4">© 2026 Football Leagues. Jadwal diperbarui secara real-time.</p>
          <Link href="/login" className="text-zinc-400 hover:text-white transition-colors">🔐 Admin Panel</Link>
        </div>
      </footer>
    </div>
  );
}
