'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getLeagues, supabase } from '@/lib/supabase';

interface League {
  id: string;
  name: string;
  type: 'football' | 'efootball';
  season: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  logo_url: string | null;
  created_at: string;
}

export default function LeaguesPage() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function loadLeagues() {
    const { data } = await getLeagues();
    if (data) {
      setLeagues(data as League[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadLeagues();
  }, []);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Yakin ingin menghapus liga "${name}"? Semua data tim dan pertandingan akan ikut terhapus.`)) {
      return;
    }

    setDeleting(id);
    const { error } = await supabase.from('leagues').delete().eq('id', id);
    if (!error) {
      setLeagues(leagues.filter(l => l.id !== id));
    }
    setDeleting(null);
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded-full text-xs">Akan Datang</span>;
      case 'ongoing':
        return <span className="px-2 py-1 bg-green-600/20 text-green-400 rounded-full text-xs">Berlangsung</span>;
      case 'completed':
        return <span className="px-2 py-1 bg-gray-600/20 text-gray-400 rounded-full text-xs">Selesai</span>;
      default:
        return null;
    }
  };

  const getTypeBadge = (type: string) => {
    return type === 'efootball'
      ? <span className="px-2 py-1 bg-purple-600/20 text-purple-400 rounded-full text-xs">🎮 eFootball</span>
      : <span className="px-2 py-1 bg-emerald-600/20 text-emerald-400 rounded-full text-xs">⚽ Football</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Manajemen Liga</h1>
          <p className="text-gray-400">Kelola semua liga football dan eFootball</p>
        </div>
        <Link
          href="/admin/leagues/new"
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <span>➕</span>
          Tambah Liga
        </Link>
      </div>

      {/* Leagues List */}
      {leagues.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-12 text-center border border-gray-700">
          <span className="text-6xl block mb-4">🏆</span>
          <h2 className="text-xl font-semibold text-white mb-2">Belum Ada Liga</h2>
          <p className="text-gray-400 mb-6">Mulai dengan membuat liga pertama Anda</p>
          <Link
            href="/admin/leagues/new"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <span>➕</span>
            Buat Liga Pertama
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {leagues.map((league) => (
            <div
              key={league.id}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Logo & Info */}
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-16 h-16 rounded-xl bg-gray-700 flex items-center justify-center text-3xl">
                    {league.logo_url ? (
                      <img src={league.logo_url} alt={league.name} className="w-full h-full rounded-xl object-cover" />
                    ) : (
                      league.type === 'efootball' ? '🎮' : '🏆'
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{league.name}</h3>
                    <p className="text-gray-400 text-sm">Musim {league.season}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {getTypeBadge(league.type)}
                      {getStatusBadge(league.status)}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/teams?league=${league.id}`}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition-colors"
                  >
                    👥 Tim
                  </Link>
                  <Link
                    href={`/admin/schedule?league=${league.id}`}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition-colors"
                  >
                    📅 Jadwal
                  </Link>
                  <Link
                    href={`/admin/leagues/${league.id}`}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                  >
                    ✏️ Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(league.id, league.name)}
                    disabled={deleting === league.id}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
                  >
                    {deleting === league.id ? '...' : '🗑️'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
