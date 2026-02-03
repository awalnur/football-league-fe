'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getLeagues, getMatchesByLeague, getTeamsByLeague } from '@/lib/supabase';

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
  type: string;
  status: string;
}

export default function SchedulePage() {
  const searchParams = useSearchParams();
  const leagueParam = searchParams.get('league');

  const [leagues, setLeagues] = useState<League[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string>(leagueParam || '');
  const [selectedWeek, setSelectedWeek] = useState<number | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [teamsCount, setTeamsCount] = useState(0);

  useEffect(() => {
    loadLeagues();
  }, []);

  useEffect(() => {
    if (selectedLeague) {
      loadSchedule(selectedLeague);
      loadTeamsCount(selectedLeague);
    } else {
      setMatches([]);
      setLoading(false);
    }
  }, [selectedLeague]);

  async function loadLeagues() {
    const { data } = await getLeagues();
    if (data) {
      setLeagues(data as League[]);
      if (leagueParam && data.some((l: League) => l.id === leagueParam)) {
        setSelectedLeague(leagueParam);
      } else if (data.length > 0 && !selectedLeague) {
        setSelectedLeague(data[0].id);
      }
    }
    if (!leagueParam) setLoading(false);
  }

  async function loadSchedule(leagueId: string) {
    setLoading(true);
    const { data } = await getMatchesByLeague(leagueId);
    if (data) {
      setMatches(data as unknown as Match[]);
    }
    setLoading(false);
  }

  async function loadTeamsCount(leagueId: string) {
    const { data } = await getTeamsByLeague(leagueId);
    if (data) {
      setTeamsCount(data.length);
    }
  }

  const currentLeague = leagues.find(l => l.id === selectedLeague);

  // Group matches by week
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 bg-green-600/20 text-green-400 rounded text-xs">Selesai</span>;
      case 'scheduled':
        return <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs">Terjadwal</span>;
      case 'live':
        return <span className="px-2 py-1 bg-red-600/20 text-red-400 rounded text-xs animate-pulse">🔴 Live</span>;
      default:
        return <span className="px-2 py-1 bg-gray-600/20 text-gray-400 rounded text-xs">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Jadwal Pertandingan</h1>
          <p className="text-gray-400">Kelola jadwal dan lihat fixture liga</p>
        </div>
        <Link
          href="/admin/schedule/generate"
          className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <span>🎲</span>
          Generate Jadwal
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Liga</label>
            <select
              value={selectedLeague}
              onChange={(e) => setSelectedLeague(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">-- Pilih Liga --</option>
              {leagues.map((league) => (
                <option key={league.id} value={league.id}>
                  {league.type === 'efootball' ? '🎮' : '⚽'} {league.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Pekan</label>
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={matchWeeks.length === 0}
            >
              <option value="all">Semua Pekan</option>
              {matchWeeks.map((week) => (
                <option key={week} value={week}>
                  Pekan {week}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            {currentLeague && (
              <div className="w-full px-4 py-2 bg-gray-700/50 rounded-lg text-sm">
                <span className="text-gray-400">Status: </span>
                <span className={`font-medium ${
                  currentLeague.status === 'ongoing' ? 'text-green-400' :
                  currentLeague.status === 'upcoming' ? 'text-blue-400' : 'text-gray-400'
                }`}>
                  {currentLeague.status === 'ongoing' ? 'Berlangsung' :
                   currentLeague.status === 'upcoming' ? 'Akan Datang' : 'Selesai'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Schedule Content */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      ) : !selectedLeague ? (
        <div className="bg-gray-800 rounded-xl p-12 text-center border border-gray-700">
          <span className="text-6xl block mb-4">👆</span>
          <h2 className="text-xl font-semibold text-white mb-2">Pilih Liga</h2>
          <p className="text-gray-400">Pilih liga untuk melihat jadwal pertandingan</p>
        </div>
      ) : matches.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-12 text-center border border-gray-700">
          <span className="text-6xl block mb-4">📅</span>
          <h2 className="text-xl font-semibold text-white mb-2">Belum Ada Jadwal</h2>
          <p className="text-gray-400 mb-2">Liga {currentLeague?.name} belum memiliki jadwal pertandingan</p>

          {teamsCount >= 2 && teamsCount % 2 === 0 ? (
            <>
              <p className="text-green-400 text-sm mb-6">
                ✓ {teamsCount} tim terdaftar - siap generate jadwal
              </p>
              <Link
                href={`/admin/schedule/generate?league=${selectedLeague}`}
                className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                <span>🎲</span>
                Generate Jadwal Otomatis
              </Link>
            </>
          ) : teamsCount >= 2 ? (
            <p className="text-yellow-400 text-sm">
              ⚠️ {teamsCount} tim terdaftar (ganjil) - tambah 1 tim lagi untuk generate jadwal
            </p>
          ) : (
            <p className="text-red-400 text-sm">
              ❌ Minimal 2 tim diperlukan untuk generate jadwal ({teamsCount} tim saat ini)
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <p className="text-2xl font-bold text-white">{matches.length}</p>
              <p className="text-sm text-gray-400">Total Pertandingan</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <p className="text-2xl font-bold text-green-400">{matches.filter(m => m.status === 'completed').length}</p>
              <p className="text-sm text-gray-400">Selesai</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <p className="text-2xl font-bold text-blue-400">{matches.filter(m => m.status === 'scheduled').length}</p>
              <p className="text-sm text-gray-400">Terjadwal</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <p className="text-2xl font-bold text-purple-400">{matchWeeks.length}</p>
              <p className="text-sm text-gray-400">Total Pekan</p>
            </div>
          </div>

          {/* Matches by Week */}
          {Object.entries(groupedMatches)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([week, weekMatches]) => (
            <div key={week} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <div className="bg-gray-700/50 px-6 py-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Pekan {week}</h3>
                <span className="text-sm text-gray-400">
                  {weekMatches.filter(m => m.status === 'completed').length}/{weekMatches.length} selesai
                </span>
              </div>
              <div className="divide-y divide-gray-700">
                {weekMatches.map((match) => (
                  <div key={match.id} className="p-4 hover:bg-gray-700/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        {/* Home Team */}
                        <div className="flex items-center gap-2 flex-1 justify-end">
                          <span className="text-white font-medium text-right">{match.home_team?.name}</span>
                          <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-sm">
                            {match.home_team?.logo_url ? (
                              <img src={match.home_team.logo_url} alt="" className="w-6 h-6 object-contain" />
                            ) : '🏠'}
                          </div>
                        </div>

                        {/* Score or Date */}
                        <div className="flex items-center justify-center min-w-[80px]">
                          {match.status === 'completed' ? (
                            <span className="text-xl font-bold text-white">
                              {match.home_score} - {match.away_score}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400 bg-gray-600 px-3 py-1 rounded-full">
                              {match.match_date
                                ? new Date(match.match_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
                                : 'TBD'}
                            </span>
                          )}
                        </div>

                        {/* Away Team */}
                        <div className="flex items-center gap-2 flex-1">
                          <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-sm">
                            {match.away_team?.logo_url ? (
                              <img src={match.away_team.logo_url} alt="" className="w-6 h-6 object-contain" />
                            ) : '✈️'}
                          </div>
                          <span className="text-white font-medium">{match.away_team?.name}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 ml-4">
                        {getStatusBadge(match.status)}
                        {match.status !== 'completed' && (
                          <Link
                            href={`/admin/matches/${match.id}`}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
                          >
                            Input Hasil
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
