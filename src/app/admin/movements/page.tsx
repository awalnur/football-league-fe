'use client';

import { useState, useEffect } from 'react';
import { getTeamMovements, getLeagues } from '@/lib/supabase';
import TeamMovementsTable from '@/components/TeamMovementsTable';
import { TeamMovementWithDetails, League } from '@/types/supabase';

export default function MovementsPage() {
  const [movements, setMovements] = useState<TeamMovementWithDetails[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSeason, setSelectedSeason] = useState<string>('all');
  const [selectedLeague, setSelectedLeague] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      // Load leagues for filter
      const { data: leaguesData } = await getLeagues();
      if (leaguesData) setLeagues(leaguesData);

      // Load movements
      const { data, error: err } = await getTeamMovements();
      if (err) throw new Error(err.message);
      setMovements(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load movements');
    } finally {
      setLoading(false);
    }
  };

  // Get unique seasons
  const seasons = Array.from(new Set(movements.map(m => m.season))).sort().reverse();

  // Filter movements
  const filteredMovements = movements.filter(m => {
    if (selectedSeason !== 'all' && m.season !== selectedSeason) return false;
    if (selectedLeague !== 'all' && m.from_league_id !== selectedLeague && m.to_league_id !== selectedLeague) return false;
    return true;
  });

  // Stats
  const stats = {
    total: movements.length,
    promotions: movements.filter(m => m.movement_type === 'promotion').length,
    relegations: movements.filter(m => m.movement_type === 'relegation').length,
    playoffs: movements.filter(m => m.movement_type === 'playoff_winner' || m.movement_type === 'playoff_loser').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Team Movements</h1>
          <p className="text-slate-400">Histori perpindahan tim antar liga</p>
        </div>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <p className="text-sm text-slate-400 mb-1">Total Movements</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-4">
          <p className="text-sm text-green-400 mb-1">Promotions</p>
          <p className="text-2xl font-bold text-green-400">{stats.promotions}</p>
        </div>
        <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-4">
          <p className="text-sm text-red-400 mb-1">Relegations</p>
          <p className="text-2xl font-bold text-red-400">{stats.relegations}</p>
        </div>
        <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
          <p className="text-sm text-blue-400 mb-1">Playoffs</p>
          <p className="text-2xl font-bold text-blue-400">{stats.playoffs}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
        <h3 className="text-white font-medium mb-3">Filter</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Musim</label>
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Semua Musim</option>
              {seasons.map(season => (
                <option key={season} value={season}>{season}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">Liga</label>
            <select
              value={selectedLeague}
              onChange={(e) => setSelectedLeague(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Semua Liga</option>
              {leagues.map(league => (
                <option key={league.id} value={league.id}>{league.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-6 text-center">
          <p className="text-red-400">{error}</p>
          <button
            onClick={loadData}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      ) : filteredMovements.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-12 text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          <p className="text-slate-400 mb-2">Belum ada riwayat perpindahan</p>
          <p className="text-sm text-slate-500">
            Movements akan muncul setelah season end atau manual movement
          </p>
        </div>
      ) : (
        <TeamMovementsTable movements={filteredMovements} showTeamColumn={true} />
      )}

      {/* Legend */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
        <h3 className="text-white font-medium mb-3">Keterangan</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-green-400">⬆️</span>
            <span className="text-slate-400">Promosi otomatis</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-red-400">⬇️</span>
            <span className="text-slate-400">Degradasi otomatis</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-400">🏆</span>
            <span className="text-slate-400">Playoff menang</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-orange-400">💔</span>
            <span className="text-slate-400">Playoff kalah</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">↔️</span>
            <span className="text-slate-400">Transfer manual</span>
          </div>
        </div>
      </div>
    </div>
  );
}
