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

export default function MatchesPage() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'football' | 'efootball'>('football');
  const [filter, setFilter] = useState<'all' | 'completed' | 'upcoming'>('completed');
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    loadLeagues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedLeague) {
      loadMatches(selectedLeague);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLeague]);

  const handleTabChange = (tab: 'football' | 'efootball') => {
    setActiveTab(tab);
    const firstLeague = leagues.find(l => l.type === tab);
    if (firstLeague) {
      setSelectedLeague(firstLeague.id);
    }
  };

  const currentLeague = leagues.find(l => l.id === selectedLeague);
  const filteredLeagues = leagues.filter(l => l.type === activeTab);

  const filteredMatches = matches.filter(m => {
    if (filter === 'completed') return m.status === 'completed';
    if (filter === 'upcoming') return m.status === 'scheduled';
    return true;
  }).sort((a, b) => {
    if (!a.match_date) return 1;
    if (!b.match_date) return -1;
    return filter === 'upcoming'
      ? new Date(a.match_date).getTime() - new Date(b.match_date).getTime()
      : new Date(b.match_date).getTime() - new Date(a.match_date).getTime();
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-orange-600 via-red-600 to-pink-600">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.1%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="text-center sm:text-left">
              <Link href="/" className="mb-4 inline-flex items-center gap-2 text-sm text-orange-200 hover:text-white transition-colors">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Kembali ke Beranda
              </Link>
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">📋 Riwayat Pertandingan</h1>
              <p className="mt-2 max-w-xl text-lg text-orange-100">Lihat hasil dan riwayat semua pertandingan</p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/standings" className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/30">
                <span>🏆</span><span>Klasemen</span>
              </Link>
              <Link href="/schedule" className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/30">
                <span>📅</span><span>Jadwal</span>
              </Link>
              <Link href="/teams" className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/30">
                <span>👥</span><span>Tim</span>
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
        <div className="mb-8 flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex rounded-xl bg-zinc-800 p-1">
              <button onClick={() => handleTabChange('football')} className={`flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium transition-all ${activeTab === 'football' ? 'bg-green-600 text-white shadow-lg' : 'text-zinc-400 hover:text-white'}`}>
                <span>⚽</span><span>Football</span>
              </button>
              <button onClick={() => handleTabChange('efootball')} className={`flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium transition-all ${activeTab === 'efootball' ? 'bg-purple-600 text-white shadow-lg' : 'text-zinc-400 hover:text-white'}`}>
                <span>🎮</span><span>eFootball</span>
              </button>
            </div>
            <select value={selectedLeague} onChange={(e) => setSelectedLeague(e.target.value)} className="rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500">
              {filteredLeagues.map((league) => (
                <option key={league.id} value={league.id}>{league.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            <button onClick={() => setFilter('completed')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'completed' ? 'bg-green-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}>
              ✓ Hasil ({matches.filter(m => m.status === 'completed').length})
            </button>
            <button onClick={() => setFilter('upcoming')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'upcoming' ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}>
              📅 Akan Datang ({matches.filter(m => m.status === 'scheduled').length})
            </button>
            <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'all' ? 'bg-zinc-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}>
              Semua ({matches.length})
            </button>
          </div>
        </div>

        {/* Matches */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="bg-zinc-800 rounded-2xl p-12 text-center border border-zinc-700">
            <span className="text-6xl block mb-4">{filter === 'completed' ? '📋' : filter === 'upcoming' ? '📅' : '⚽'}</span>
            <h2 className="text-xl font-semibold text-white mb-2">
              {filter === 'completed' ? 'Belum Ada Hasil Pertandingan' :
               filter === 'upcoming' ? 'Tidak Ada Pertandingan Mendatang' :
               'Belum Ada Pertandingan'}
            </h2>
            <p className="text-zinc-400">{leagues.length === 0 ? 'Belum ada liga yang dibuat' : 'Liga ini belum memiliki pertandingan.'}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMatches.map((match) => {
              const isCompleted = match.status === 'completed';
              const homeWin = isCompleted && match.home_score! > match.away_score!;
              const awayWin = isCompleted && match.away_score! > match.home_score!;
              const isDraw = isCompleted && match.home_score === match.away_score;

              return (
              <div key={match.id} className="bg-zinc-800 rounded-2xl p-6 border border-zinc-700 hover:border-zinc-600 transition-colors overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="bg-zinc-700 text-zinc-300 px-3 py-1 rounded-full text-sm">Pekan {match.match_week}</span>
                    {currentLeague?.type === 'efootball' && <span className="text-purple-400">🎮</span>}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    match.status === 'completed' ? 'bg-green-600/20 text-green-400' :
                    match.status === 'scheduled' ? 'bg-blue-600/20 text-blue-400' :
                    'bg-zinc-600/20 text-zinc-400'
                  }`}>
                    {match.status === 'completed' ? '✓ Selesai' : match.status === 'scheduled' ? '📅 Terjadwal' : match.status}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  {/* Home Team */}
                  <div className={`flex items-center gap-4 flex-1 p-4 rounded-xl transition-colors ${
                    homeWin ? 'bg-green-500/10 border border-green-500/20' : 
                    awayWin ? 'bg-red-500/10 border border-red-500/20' : 
                    isDraw ? 'bg-yellow-500/10 border border-yellow-500/20' : ''
                  }`}>
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                      homeWin ? 'bg-green-500/20' : awayWin ? 'bg-red-500/20' : 'bg-zinc-700'
                    }`}>
                      {match.home_team?.logo_url ? (
                        <img src={match.home_team.logo_url} alt="" className="w-12 h-12 object-contain" />
                      ) : (
                        <span className="text-2xl">🏠</span>
                      )}
                    </div>
                    <div>
                      <p className={`text-lg font-semibold ${homeWin ? 'text-green-400' : awayWin ? 'text-red-400' : 'text-white'}`}>
                        {match.home_team?.name}
                        {homeWin && <span className="ml-2">🏆</span>}
                      </p>
                      <p className="text-sm text-zinc-400">Home</p>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-center px-4 sm:px-8">
                    {match.status === 'completed' ? (
                      <div className={`rounded-xl px-4 sm:px-6 py-4 ${
                        isDraw ? 'bg-yellow-600/20 border border-yellow-500/30' : 'bg-zinc-700'
                      }`}>
                        <p className="text-3xl sm:text-4xl font-bold text-white">
                          <span className={homeWin ? 'text-green-400' : awayWin ? 'text-red-400' : ''}>{match.home_score}</span>
                          <span className="text-zinc-500 mx-2">-</span>
                          <span className={awayWin ? 'text-green-400' : homeWin ? 'text-red-400' : ''}>{match.away_score}</span>
                        </p>
                        <p className="text-xs text-zinc-400 mt-1">Final</p>
                      </div>
                    ) : (
                      <div className="bg-blue-600/20 border border-blue-600/30 rounded-xl px-4 sm:px-6 py-4">
                        <p className="text-2xl font-bold text-blue-400">VS</p>
                        <p className="text-xs text-zinc-400 mt-1">
                          {match.match_date ? new Date(match.match_date).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'TBD'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Away Team */}
                  <div className={`flex items-center gap-4 flex-1 justify-end p-4 rounded-xl transition-colors ${
                    awayWin ? 'bg-green-500/10 border border-green-500/20' : 
                    homeWin ? 'bg-red-500/10 border border-red-500/20' : 
                    isDraw ? 'bg-yellow-500/10 border border-yellow-500/20' : ''
                  }`}>
                    <div className="text-right">
                      <p className={`text-lg font-semibold ${awayWin ? 'text-green-400' : homeWin ? 'text-red-400' : 'text-white'}`}>
                        {awayWin && <span className="mr-2">🏆</span>}
                        {match.away_team?.name}
                      </p>
                      <p className="text-sm text-zinc-400">Away</p>
                    </div>
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                      awayWin ? 'bg-green-500/20' : homeWin ? 'bg-red-500/20' : 'bg-zinc-700'
                    }`}>
                      {match.away_team?.logo_url ? (
                        <img src={match.away_team.logo_url} alt="" className="w-12 h-12 object-contain" />
                      ) : (
                        <span className="text-2xl">✈️</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Match Result Summary */}
                {match.status === 'completed' && (
                  <div className={`mt-4 pt-4 border-t flex items-center justify-center gap-4 text-sm ${
                    isDraw ? 'border-yellow-500/30' : homeWin || awayWin ? 'border-zinc-700' : 'border-zinc-700'
                  }`}>
                    {homeWin ? (
                      <span className="text-green-400 font-medium">🏆 {match.home_team?.name} Menang</span>
                    ) : awayWin ? (
                      <span className="text-green-400 font-medium">🏆 {match.away_team?.name} Menang</span>
                    ) : (
                      <span className="text-yellow-400 font-medium">🤝 Hasil Seri</span>
                    )}
                  </div>
                )}
              </div>
              );
            })}
          </div>
        )}

        {/* Stats Summary */}
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
              <p className="text-3xl font-bold text-yellow-400">
                {matches.filter(m => m.status === 'completed' && m.home_score === m.away_score).length}
              </p>
              <p className="text-sm text-zinc-400">Hasil Seri</p>
            </div>
            <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700 text-center">
              <p className="text-3xl font-bold text-purple-400">
                {matches.filter(m => m.status === 'completed').reduce((acc, m) => acc + (m.home_score || 0) + (m.away_score || 0), 0)}
              </p>
              <p className="text-sm text-zinc-400">Total Gol</p>
            </div>
          </div>
        )}
      </div>

      <footer className="mt-16 border-t border-zinc-800 py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-zinc-500">
          <p className="mb-4">© 2026 Football Leagues. Data diperbarui secara real-time.</p>
          <Link href="/login" className="text-zinc-400 hover:text-white transition-colors">🔐 Admin Panel</Link>
        </div>
      </footer>
    </div>
  );
}
