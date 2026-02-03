'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getLeagues, getTeamsByLeague, supabase } from '@/lib/supabase';

interface Team {
  id: string;
  name: string;
  short_name: string | null;
  logo_url: string | null;
  primary_color: string | null;
  league_id: string;
}

interface League {
  id: string;
  name: string;
  type: string;
}

export default function TeamsPage() {
  const searchParams = useSearchParams();
  const leagueParam = searchParams.get('league');

  const [leagues, setLeagues] = useState<League[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string>(leagueParam || '');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadLeagues();
  }, []);

  useEffect(() => {
    if (selectedLeague) {
      loadTeams(selectedLeague);
    } else {
      setTeams([]);
      setLoading(false);
    }
  }, [selectedLeague]);

  async function loadLeagues() {
    const { data } = await getLeagues();
    if (data) {
      setLeagues(data as League[]);
      if (leagueParam && data.some(l => l.id === leagueParam)) {
        setSelectedLeague(leagueParam);
      } else if (data.length > 0 && !selectedLeague) {
        setSelectedLeague(data[0].id);
      }
    }
    if (!leagueParam) setLoading(false);
  }

  async function loadTeams(leagueId: string) {
    setLoading(true);
    const { data } = await getTeamsByLeague(leagueId);
    if (data) {
      setTeams(data as Team[]);
    }
    setLoading(false);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Yakin ingin menghapus tim "${name}"?`)) return;

    setDeleting(id);
    const { error } = await supabase.from('teams').delete().eq('id', id);
    if (!error) {
      setTeams(teams.filter(t => t.id !== id));
    }
    setDeleting(null);
  }

  const currentLeague = leagues.find(l => l.id === selectedLeague);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Manajemen Tim</h1>
            <p className="text-slate-400">Kelola tim dalam liga</p>
          </div>
        </div>
        <Link
          href={`/admin/teams/new${selectedLeague ? `?league=${selectedLeague}` : ''}`}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Tambah Tim
        </Link>
      </div>

      {/* League Selector */}
      <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
        <label className="block text-sm font-medium text-slate-300 mb-2">Pilih Liga</label>
        <select
          value={selectedLeague}
          onChange={(e) => setSelectedLeague(e.target.value)}
          className="w-full md:w-auto px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">-- Pilih Liga --</option>
          {leagues.map((league) => (
            <option key={league.id} value={league.id}>
              {league.type === 'efootball' ? '[eFootball]' : '[Football]'} {league.name}
            </option>
          ))}
        </select>
      </div>

      {/* Teams Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
        </div>
      ) : !selectedLeague ? (
        <div className="bg-slate-900 rounded-lg p-12 text-center border border-slate-800">
          <svg className="w-16 h-16 mx-auto mb-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7l4-4m0 0l4 4m-4-4v18" />
          </svg>
          <h2 className="text-xl font-semibold text-white mb-2">Pilih Liga</h2>
          <p className="text-slate-400">Pilih liga terlebih dahulu untuk melihat tim</p>
        </div>
      ) : teams.length === 0 ? (
        <div className="bg-slate-900 rounded-lg p-12 text-center border border-slate-800">
          <svg className="w-16 h-16 mx-auto mb-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <h2 className="text-xl font-semibold text-white mb-2">Belum Ada Tim</h2>
          <p className="text-slate-400 mb-6">Tambahkan tim untuk liga {currentLeague?.name}</p>
          <Link
            href={`/admin/teams/new?league=${selectedLeague}`}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Tambah Tim Pertama
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => (
            <div
              key={team.id}
              className="bg-slate-900 rounded-lg p-5 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-14 h-14 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: team.primary_color || '#1e293b' }}
                >
                  {team.logo_url ? (
                    <img src={team.logo_url} alt={team.name} className="w-10 h-10 object-contain" />
                  ) : (
                    <svg className="w-7 h-7 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-white truncate">{team.name}</h3>
                  {team.short_name && (
                    <p className="text-slate-400 text-sm">{team.short_name}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {currentLeague?.type === 'efootball' && (
                  <Link
                    href={`/admin/gamers?team=${team.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                    Gamers
                  </Link>
                )}
                <Link
                  href={`/admin/teams/${team.id}`}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(team.id, team.name)}
                  disabled={deleting === team.id}
                  className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  {deleting === team.id ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Stats */}
      {teams.length > 0 && (
        <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Total tim dalam liga ini:</span>
            <span className="text-white font-semibold">{teams.length} tim</span>
          </div>
          {teams.length >= 2 && teams.length % 2 === 0 && (
            <div className="flex items-center gap-2 mt-2 text-sm text-green-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Jumlah tim genap - siap untuk generate jadwal
            </div>
          )}
          {teams.length >= 2 && teams.length % 2 !== 0 && (
            <div className="flex items-center gap-2 mt-2 text-sm text-yellow-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Jumlah tim ganjil - tambah 1 tim lagi untuk generate jadwal
            </div>
          )}
        </div>
      )}
    </div>
  );
}
