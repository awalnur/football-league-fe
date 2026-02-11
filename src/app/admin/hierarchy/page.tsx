'use client';

import { useState, useEffect } from 'react';
import { getLeagueHierarchy } from '@/lib/supabase';
import LeagueHierarchyView from '@/components/LeagueHierarchyView';
import { LeagueWithHierarchy } from '@/types/supabase';

export default function HierarchyPage() {
  const [leagues, setLeagues] = useState<LeagueWithHierarchy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadHierarchy();
  }, []);

  const loadHierarchy = async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error: err } = await getLeagueHierarchy();
      if (err) throw new Error(err.message);
      setLeagues(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load hierarchy');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">League Hierarchy</h1>
          <p className="text-slate-400">Visualisasi hierarki liga dengan sistem promosi & degradasi</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-white font-medium mb-1">Tentang Hierarchy</h3>
            <p className="text-sm text-slate-400">
              Halaman ini menampilkan semua liga dengan hubungan parent-child untuk sistem promosi/degradasi.
              Liga dengan <span className="text-green-400">parent_league</span> dapat promosikan tim ke liga atas,
              liga dengan <span className="text-red-400">child_league</span> dapat degradasikan tim ke liga bawah.
            </p>
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
            onClick={loadHierarchy}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      ) : leagues.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-12 text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <p className="text-slate-400 mb-4">Belum ada liga</p>
          <a
            href="/admin/leagues/new"
            className="inline-block px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
          >
            Buat Liga Baru
          </a>
        </div>
      ) : (
        <LeagueHierarchyView leagues={leagues} />
      )}
    </div>
  );
}
