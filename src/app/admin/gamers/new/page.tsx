'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getLeagues, getTeamsByLeague, createGamePlayer, uploadGamerAvatar } from '@/lib/supabase';

interface Team {
  id: string;
  name: string;
  league_id: string;
}

interface League {
  id: string;
  name: string;
  type: string;
}

export default function NewGamerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const teamParam = searchParams.get('team');

  const [leagues, setLeagues] = useState<League[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  const [formData, setFormData] = useState({
    team_id: teamParam || '',
    real_name: '',
    gamertag: '',
    phone: '',
    discord: '',
    is_captain: false,
  });

  useEffect(() => {
    loadLeagues();
  }, []);

  useEffect(() => {
    if (selectedLeague) {
      loadTeams(selectedLeague);
    }
  }, [selectedLeague]);

  async function loadLeagues() {
    const { data } = await getLeagues();
    if (data) {
      const efootballLeagues = data.filter((l: League) => l.type === 'efootball');
      setLeagues(efootballLeagues as League[]);
      if (efootballLeagues.length > 0) {
        setSelectedLeague(efootballLeagues[0].id);
      }
    }
  }

  async function loadTeams(leagueId: string) {
    const { data } = await getTeamsByLeague(leagueId);
    if (data) {
      setTeams(data as Team[]);
      if (teamParam && data.some((t: Team) => t.id === teamParam)) {
        setFormData(prev => ({ ...prev, team_id: teamParam }));
      }
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.team_id) {
        throw new Error('Pilih tim terlebih dahulu');
      }

      const { data: gamer, error: gamerError } = await createGamePlayer(formData);

      if (gamerError) {
        throw new Error(gamerError.message);
      }

      if (avatarFile && gamer) {
        await uploadGamerAvatar(avatarFile, gamer.id);
      }

      router.push(`/admin/gamers?team=${formData.team_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/gamers"
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Tambah Gamer Baru</h1>
          <p className="text-gray-400">Daftarkan pemain game ke tim eFootball</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-6 border border-gray-700 space-y-6">
        {error && (
          <div className="bg-red-600/20 border border-red-600/30 text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* League & Team Select */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Liga *</label>
            <select
              value={selectedLeague}
              onChange={(e) => {
                setSelectedLeague(e.target.value);
                setFormData({ ...formData, team_id: '' });
              }}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {leagues.map((league) => (
                <option key={league.id} value={league.id}>
                  🎮 {league.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tim *</label>
            <select
              required
              value={formData.team_id}
              onChange={(e) => setFormData({ ...formData, team_id: e.target.value })}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
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

        {/* Avatar Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Foto Gamer</label>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl">👤</span>
              )}
            </div>
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                id="avatar-upload"
              />
              <label
                htmlFor="avatar-upload"
                className="inline-block px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg cursor-pointer transition-colors"
              >
                Pilih Foto
              </label>
              <p className="text-xs text-gray-500 mt-1">PNG atau JPG (Max 2MB)</p>
            </div>
          </div>
        </div>

        {/* Real Name */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Nama Asli *</label>
          <input
            type="text"
            required
            value={formData.real_name}
            onChange={(e) => setFormData({ ...formData, real_name: e.target.value })}
            placeholder="Contoh: Ahmad Rizki"
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Gamertag */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Gamertag / ID Game *</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">@</span>
            <input
              type="text"
              required
              value={formData.gamertag}
              onChange={(e) => setFormData({ ...formData, gamertag: e.target.value })}
              placeholder="PSN ID, Xbox Gamertag, dll"
              className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Username yang digunakan di game</p>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">No. Telepon</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="08xxxxxxxxxx"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Discord</label>
            <input
              type="text"
              value={formData.discord}
              onChange={(e) => setFormData({ ...formData, discord: e.target.value })}
              placeholder="username#1234"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Is Captain */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="is_captain"
            checked={formData.is_captain}
            onChange={(e) => setFormData({ ...formData, is_captain: e.target.checked })}
            className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500"
          />
          <label htmlFor="is_captain" className="text-gray-300">
            👑 Jadikan sebagai Kapten Tim
          </label>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors"
          >
            {loading ? 'Menyimpan...' : 'Simpan Gamer'}
          </button>
          <Link
            href="/admin/gamers"
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
          >
            Batal
          </Link>
        </div>
      </form>
    </div>
  );
}
