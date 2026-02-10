'use client';

import { useState, useEffect, useCallback } from 'react';
import { getLeagues, getLeagueZones, autoCreateLeagueZones } from '@/lib/supabase';
import { League, LeagueZone } from '@/types/supabase';

export default function ZonesPage() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string>('');
  const [zones, setZones] = useState<LeagueZone[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadLeagues = useCallback(async () => {
    try {
      const { data } = await getLeagues();
      if (data) {
        // Filter only league format
        const leagueFormat = data.filter(l => l.tournament_format === 'league');
        setLeagues(leagueFormat);
        if (leagueFormat.length > 0) {
          setSelectedLeague(leagueFormat[0].id);
        }
      }
    } catch {
      setError('Failed to load leagues');
    }
  }, []);

  const loadZones = useCallback(async () => {
    if (!selectedLeague) return;

    setLoading(true);
    setError('');
    try {
      const { data, error: err } = await getLeagueZones(selectedLeague);
      if (err) throw new Error(err.message);
      setZones(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load zones');
    } finally {
      setLoading(false);
    }
  }, [selectedLeague]);

  useEffect(() => {
    loadLeagues();
  }, [loadLeagues]);

  useEffect(() => {
    if (selectedLeague) {
      loadZones();
    }
  }, [selectedLeague, loadZones]);

  const handleGenerateZones = async () => {
    if (!selectedLeague) return;

    setGenerating(true);
    setError('');
    setSuccess('');

    try {
      const { error: err } = await autoCreateLeagueZones(selectedLeague);
      if (err) throw new Error(err.message);

      setSuccess('Zones berhasil di-generate!');
      await loadZones();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate zones');
    } finally {
      setGenerating(false);
    }
  };

  const selectedLeagueData = leagues.find(l => l.id === selectedLeague);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">League Zones</h1>
          <p className="text-slate-400">Manage zona promosi, playoff, dan degradasi</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-white font-medium mb-1">Auto-Generate Zones</h3>
            <p className="text-sm text-slate-400">
              Zones akan otomatis dibuat berdasarkan pengaturan promotion_slots, playoff_slots, dan relegation_slots di liga.
              Anda perlu menambahkan tim terlebih dahulu agar zone positions dapat dihitung dengan benar.
            </p>
          </div>
        </div>
      </div>

      {/* League Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <label className="block text-sm font-medium text-slate-400 mb-2">Pilih Liga</label>
        <select
          value={selectedLeague}
          onChange={(e) => setSelectedLeague(e.target.value)}
          className="w-full md:w-1/2 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">-- Pilih Liga --</option>
          {leagues.map(league => (
            <option key={league.id} value={league.id}>
              {league.name} ({league.season})
            </option>
          ))}
        </select>

        {selectedLeagueData && (
          <div className="mt-4 p-4 bg-slate-800/50 rounded-lg">
            <h3 className="text-white font-medium mb-3">Pengaturan Liga</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-slate-400">Promosi Slots</p>
                <p className="text-green-400 font-bold text-lg">{selectedLeagueData.promotion_slots}</p>
              </div>
              <div>
                <p className="text-slate-400">Playoff Slots</p>
                <p className="text-blue-400 font-bold text-lg">{selectedLeagueData.playoff_slots}</p>
              </div>
              <div>
                <p className="text-slate-400">Relegation Slots</p>
                <p className="text-red-400 font-bold text-lg">{selectedLeagueData.relegation_slots}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedLeague && (
        <>
          {/* Generate Button */}
          <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-lg p-4">
            <div>
              <h3 className="text-white font-medium">Generate Zones</h3>
              <p className="text-sm text-slate-400">Buat zones otomatis berdasarkan league settings</p>
            </div>
            <button
              onClick={handleGenerateZones}
              disabled={generating}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
            >
              {generating ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Generate Zones
                </>
              )}
            </button>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-4 text-red-400">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-4 text-green-400">
              {success}
            </div>
          )}

          {/* Zones List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
            </div>
          ) : zones.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-12 text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-slate-400 mb-4">Belum ada zones untuk liga ini</p>
              <p className="text-sm text-slate-500 mb-4">Klik tombol &quot;Generate Zones&quot; untuk membuat zones otomatis</p>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-slate-800">
                <h3 className="text-white font-medium">Current Zones ({zones.length})</h3>
              </div>
              <div className="divide-y divide-slate-800">
                {zones.map((zone) => (
                  <div
                    key={zone.id}
                    className="p-4 hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: zone.color_code }}
                        />
                        <div>
                          <p className="text-white font-medium">{zone.label}</p>
                          <p className="text-sm text-slate-400">
                            {zone.zone_type === 'promotion' && '⬆️ Promosi'}
                            {zone.zone_type === 'playoff' && '🏆 Playoff'}
                            {zone.zone_type === 'relegation' && '⬇️ Degradasi'}
                            {zone.zone_type === 'safe' && '✅ Safe Zone'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-mono">
                          Posisi {zone.position_start}
                          {zone.position_end !== zone.position_start && ` - ${zone.position_end}`}
                        </p>
                        <p className="text-xs text-slate-500">
                          {zone.position_end - zone.position_start + 1} tim
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* No League Selected */}
      {!selectedLeague && leagues.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-12 text-center">
          <p className="text-slate-400">Pilih liga untuk melihat zones</p>
        </div>
      )}

      {/* No Leagues */}
      {leagues.length === 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-12 text-center">
          <p className="text-slate-400 mb-4">Belum ada liga dengan format league</p>
          <a
            href="/admin/leagues/new"
            className="inline-block px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
          >
            Buat Liga Baru
          </a>
        </div>
      )}
    </div>
  );
}
