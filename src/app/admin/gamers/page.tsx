'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getLeagues, getTeamsByLeague, getGamePlayersByTeam, supabase } from '@/lib/supabase';

interface GamePlayer {
  id: string;
  real_name: string;
  gamertag: string;
  avatar_url: string | null;
  phone: string | null;
  discord: string | null;
  is_captain: boolean;
  team_id: string;
}

interface Team {
  id: string;
  name: string;
  logo_url: string | null;
  league_id: string;
}

interface League {
  id: string;
  name: string;
  type: string;
}

export default function GamersPage() {
  const searchParams = useSearchParams();
  const teamParam = searchParams.get('team');

  const [leagues, setLeagues] = useState<League[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [gamers, setGamers] = useState<GamePlayer[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState<string>(teamParam || '');
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
      setSelectedTeam('');
    }
  }, [selectedLeague]);

  useEffect(() => {
    if (selectedTeam) {
      loadGamers(selectedTeam);
    } else {
      setGamers([]);
    }
  }, [selectedTeam]);

  async function loadLeagues() {
    const { data } = await getLeagues();
    if (data) {
      // Only eFootball leagues
      const efootballLeagues = data.filter((l: League) => l.type === 'efootball');
      setLeagues(efootballLeagues as League[]);

      if (efootballLeagues.length > 0) {
        setSelectedLeague(efootballLeagues[0].id);
      }
    }
    setLoading(false);
  }

  async function loadTeams(leagueId: string) {
    const { data } = await getTeamsByLeague(leagueId);
    if (data) {
      setTeams(data as Team[]);
      if (teamParam && data.some((t: Team) => t.id === teamParam)) {
        setSelectedTeam(teamParam);
      }
    }
  }

  async function loadGamers(teamId: string) {
    setLoading(true);
    const { data } = await getGamePlayersByTeam(teamId);
    if (data) {
      setGamers(data as GamePlayer[]);
    }
    setLoading(false);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Yakin ingin menghapus gamer "${name}"?`)) return;

    setDeleting(id);
    const { error } = await supabase.from('game_players').delete().eq('id', id);
    if (!error) {
      setGamers(gamers.filter(g => g.id !== id));
    }
    setDeleting(null);
  }

  async function toggleCaptain(id: string, currentStatus: boolean) {
    const { error } = await supabase
      .from('game_players')
      .update({ is_captain: !currentStatus })
      .eq('id', id);

    if (!error) {
      setGamers(gamers.map(g =>
        g.id === id ? { ...g, is_captain: !currentStatus } : g
      ));
    }
  }

  const currentTeam = teams.find(t => t.id === selectedTeam);

  if (leagues.length === 0 && !loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Manajemen Gamers</h1>
          <p className="text-gray-400">Kelola gamer untuk liga eFootball</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-12 text-center border border-gray-700">
          <span className="text-6xl block mb-4">🎮</span>
          <h2 className="text-xl font-semibold text-white mb-2">Tidak Ada Liga eFootball</h2>
          <p className="text-gray-400 mb-6">Buat liga eFootball terlebih dahulu untuk menambahkan gamers</p>
          <Link
            href="/admin/leagues/new"
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <span>➕</span>
            Buat Liga eFootball
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Manajemen Gamers</h1>
          <p className="text-gray-400">Kelola gamer (pemain game) untuk tim eFootball</p>
        </div>
        {selectedTeam && (
          <Link
            href={`/admin/gamers/new?team=${selectedTeam}`}
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <span>➕</span>
            Tambah Gamer
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Liga eFootball</label>
            <select
              value={selectedLeague}
              onChange={(e) => setSelectedLeague(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {leagues.map((league) => (
                <option key={league.id} value={league.id}>
                  🎮 {league.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tim</label>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={teams.length === 0}
            >
              <option value="">-- Pilih Tim --</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Gamers List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      ) : !selectedTeam ? (
        <div className="bg-gray-800 rounded-xl p-12 text-center border border-gray-700">
          <span className="text-6xl block mb-4">👆</span>
          <h2 className="text-xl font-semibold text-white mb-2">Pilih Tim</h2>
          <p className="text-gray-400">Pilih tim untuk melihat daftar gamer</p>
        </div>
      ) : gamers.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-12 text-center border border-gray-700">
          <span className="text-6xl block mb-4">🎮</span>
          <h2 className="text-xl font-semibold text-white mb-2">Belum Ada Gamer</h2>
          <p className="text-gray-400 mb-6">Tambahkan gamer untuk tim {currentTeam?.name}</p>
          <Link
            href={`/admin/gamers/new?team=${selectedTeam}`}
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <span>➕</span>
            Tambah Gamer Pertama
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Team Header */}
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-gray-700 flex items-center justify-center">
              {currentTeam?.logo_url ? (
                <img src={currentTeam.logo_url} alt="" className="w-8 h-8 object-contain" />
              ) : (
                '🛡️'
              )}
            </div>
            <div>
              <h3 className="text-white font-semibold">{currentTeam?.name}</h3>
              <p className="text-gray-400 text-sm">{gamers.length} gamer terdaftar</p>
            </div>
          </div>

          {/* Gamers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gamers.map((gamer) => (
              <div
                key={gamer.id}
                className={`bg-gray-800 rounded-xl p-6 border transition-colors ${
                  gamer.is_captain ? 'border-yellow-500/50' : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center text-2xl overflow-hidden">
                    {gamer.avatar_url ? (
                      <img src={gamer.avatar_url} alt={gamer.real_name} className="w-full h-full object-cover" />
                    ) : (
                      '👤'
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-white">{gamer.real_name}</h3>
                      {gamer.is_captain && (
                        <span className="px-2 py-0.5 bg-yellow-600/20 text-yellow-400 rounded text-xs">
                          👑 Kapten
                        </span>
                      )}
                    </div>
                    <p className="text-purple-400 font-mono">@{gamer.gamertag}</p>

                    <div className="mt-2 space-y-1 text-sm text-gray-400">
                      {gamer.discord && (
                        <p className="flex items-center gap-2">
                          <span>💬</span> {gamer.discord}
                        </p>
                      )}
                      {gamer.phone && (
                        <p className="flex items-center gap-2">
                          <span>📱</span> {gamer.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-700">
                  <button
                    onClick={() => toggleCaptain(gamer.id, gamer.is_captain)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                      gamer.is_captain 
                        ? 'bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600/30'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {gamer.is_captain ? '👑 Hapus Kapten' : '👑 Jadikan Kapten'}
                  </button>
                  <Link
                    href={`/admin/gamers/${gamer.id}`}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                  >
                    ✏️
                  </Link>
                  <button
                    onClick={() => handleDelete(gamer.id, gamer.real_name)}
                    disabled={deleting === gamer.id}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
                  >
                    {deleting === gamer.id ? '...' : '🗑️'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
