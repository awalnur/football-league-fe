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
  league_id: string;
}

interface League {
  id: string;
  name: string;
  type: string;
}

export default function MatchesPage() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string>('');
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'completed'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeagues();
  }, []);

  useEffect(() => {
    if (selectedLeague) {
      loadMatches(selectedLeague);
    } else {
      setMatches([]);
      setLoading(false);
    }
  }, [selectedLeague]);

  async function loadLeagues() {
    const { data } = await getLeagues();
    if (data) {
      setLeagues(data as League[]);
      if (data.length > 0) {
        setSelectedLeague(data[0].id);
      }
    }
    setLoading(false);
  }

  async function loadMatches(leagueId: string) {
    setLoading(true);
    const { data } = await getMatchesByLeague(leagueId);
    if (data) {
      setMatches(data as unknown as Match[]);
    }
    setLoading(false);
  }

  const currentLeague = leagues.find(l => l.id === selectedLeague);

  const filteredMatches = matches.filter(m => {
    if (filter === 'scheduled') return m.status === 'scheduled';
    if (filter === 'completed') return m.status === 'completed';
    return true;
  }).sort((a, b) => {
    // Sort by status (scheduled first) then by date
    if (a.status === 'scheduled' && b.status !== 'scheduled') return -1;
    if (a.status !== 'scheduled' && b.status === 'scheduled') return 1;
    if (!a.match_date) return 1;
    if (!b.match_date) return -1;
    return new Date(a.match_date).getTime() - new Date(b.match_date).getTime();
  });

  const pendingCount = matches.filter(m => m.status === 'scheduled').length;
  const completedCount = matches.filter(m => m.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Pertandingan</h1>
          <p className="text-gray-400">Input hasil dan kelola pertandingan</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <label className="block text-sm font-medium text-gray-300 mb-2">Filter</label>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'all' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Semua ({matches.length})
              </button>
              <button
                onClick={() => setFilter('scheduled')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'scheduled' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Pending ({pendingCount})
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'completed' 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Selesai ({completedCount})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Matches List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      ) : !selectedLeague ? (
        <div className="bg-gray-800 rounded-xl p-12 text-center border border-gray-700">
          <span className="text-6xl block mb-4">👆</span>
          <h2 className="text-xl font-semibold text-white mb-2">Pilih Liga</h2>
          <p className="text-gray-400">Pilih liga untuk melihat pertandingan</p>
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-12 text-center border border-gray-700">
          <span className="text-6xl block mb-4">⚽</span>
          <h2 className="text-xl font-semibold text-white mb-2">
            {filter === 'all' ? 'Belum Ada Pertandingan' :
             filter === 'scheduled' ? 'Tidak Ada Pertandingan Pending' :
             'Belum Ada Pertandingan Selesai'}
          </h2>
          <p className="text-gray-400">
            {filter === 'all'
              ? 'Generate jadwal terlebih dahulu untuk memulai liga'
              : filter === 'scheduled'
                ? 'Semua pertandingan sudah selesai atau belum ada jadwal'
                : 'Belum ada pertandingan yang selesai dimainkan'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMatches.map((match) => (
            <div
              key={match.id}
              className={`bg-gray-800 rounded-xl p-4 border transition-colors ${
                match.status === 'scheduled' 
                  ? 'border-blue-600/30 hover:border-blue-600/50' 
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Match Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                    <span className="bg-gray-700 px-2 py-0.5 rounded">Pekan {match.match_week}</span>
                    {match.match_date && (
                      <span>
                        {new Date(match.match_date).toLocaleDateString('id-ID', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    )}
                    {currentLeague?.type === 'efootball' && (
                      <span className="text-purple-400">🎮</span>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Home Team */}
                    <div className="flex items-center gap-3 flex-1 justify-end">
                      <span className="text-white font-semibold text-right">{match.home_team?.name}</span>
                      <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center">
                        {match.home_team?.logo_url ? (
                          <img src={match.home_team.logo_url} alt="" className="w-7 h-7 object-contain" />
                        ) : '🏠'}
                      </div>
                    </div>

                    {/* Score */}
                    <div className="min-w-[100px] text-center">
                      {match.status === 'completed' ? (
                        <div className="bg-gray-700 rounded-lg px-4 py-2">
                          <span className="text-2xl font-bold text-white">
                            {match.home_score} - {match.away_score}
                          </span>
                        </div>
                      ) : (
                        <div className="bg-blue-600/20 border border-blue-600/30 rounded-lg px-4 py-2">
                          <span className="text-blue-400 font-medium">VS</span>
                        </div>
                      )}
                    </div>

                    {/* Away Team */}
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center">
                        {match.away_team?.logo_url ? (
                          <img src={match.away_team.logo_url} alt="" className="w-7 h-7 object-contain" />
                        ) : '✈️'}
                      </div>
                      <span className="text-white font-semibold">{match.away_team?.name}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 md:ml-4">
                  {match.status === 'completed' ? (
                    <>
                      <span className="px-3 py-2 bg-green-600/20 text-green-400 rounded-lg text-sm">
                        ✓ Selesai
                      </span>
                      <Link
                        href={`/admin/matches/${match.id}`}
                        className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition-colors"
                      >
                        Detail
                      </Link>
                    </>
                  ) : (
                    <Link
                      href={`/admin/matches/${match.id}`}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      <span>📝</span>
                      Input Hasil
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Stats */}
      {matches.length > 0 && (
        <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-xl p-6 border border-green-600/30">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold mb-1">Progress Liga</h3>
              <p className="text-gray-400 text-sm">
                {completedCount} dari {matches.length} pertandingan selesai
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-white">
                {Math.round((completedCount / matches.length) * 100)}%
              </p>
            </div>
          </div>
          <div className="mt-4 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-500"
              style={{ width: `${(completedCount / matches.length) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
