'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLeague } from '@/context/LeagueContext';

const TEAM_LOGOS = ['⚽', '🔴', '🔵', '🟢', '🟡', '🟠', '🟣', '⚫', '⚪', '🟤', '🦁', '🦅', '🐺', '🐉', '⭐', '🏆', '🎮', '👑', '💎', '🔥'];

export default function AddTeamPage() {
  const { leagues, addTeam } = useLeague();

  const [formData, setFormData] = useState({
    name: '',
    logo: '⚽',
    leagueId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.leagueId) {
      alert('Mohon lengkapi semua field!');
      return;
    }

    setIsSubmitting(true);

    try {
      addTeam({
        name: formData.name,
        logo: formData.logo,
        leagueId: formData.leagueId,
      });

      setSuccess(true);
      setFormData({ name: '', logo: '⚽', leagueId: formData.leagueId });

      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error adding team:', error);
      alert('Gagal menambahkan tim!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedLeague = leagues.find(l => l.id === formData.leagueId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/standings"
                className="mb-4 inline-flex items-center gap-2 text-sm text-emerald-100 hover:text-white transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Kembali ke Klasemen
              </Link>
              <h1 className="text-3xl font-bold text-white">➕ Tambah Tim Baru</h1>
              <p className="mt-2 text-emerald-100">Daftarkan tim baru ke dalam liga</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        {success && (
          <div className="mb-6 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 dark:bg-emerald-900/20 dark:border-emerald-800">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <p className="font-medium text-emerald-800 dark:text-emerald-200">
                Tim berhasil ditambahkan!
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* League Selection */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
              1. Pilih Liga
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {leagues.map(league => (
                <button
                  key={league.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, leagueId: league.id }))}
                  className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                    formData.leagueId === league.id
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                      : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600'
                  }`}
                >
                  <span className="text-3xl">{league.logo}</span>
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-white">{league.name}</p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {league.type === 'efootball' ? '🎮 eFootball' : '⚽ Sepakbola'}
                    </p>
                  </div>
                  {formData.leagueId === league.id && (
                    <span className="ml-auto text-emerald-500">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Team Details */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
              2. Detail Tim
            </h2>

            {/* Team Name */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Nama Tim
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Contoh: FC Barcelona"
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-500"
              />
            </div>

            {/* Team Logo */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Logo Tim
              </label>
              <div className="grid grid-cols-10 gap-2">
                {TEAM_LOGOS.map(logo => (
                  <button
                    key={logo}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, logo }))}
                    className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl transition-all ${
                      formData.logo === logo
                        ? 'bg-emerald-100 ring-2 ring-emerald-500 dark:bg-emerald-900/30'
                        : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {logo}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          {formData.name && formData.leagueId && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
                3. Preview
              </h2>
              <div className="flex items-center gap-4 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800">
                <span className="text-4xl">{formData.logo}</span>
                <div>
                  <p className="text-xl font-bold text-zinc-900 dark:text-white">{formData.name}</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {selectedLeague?.logo} {selectedLeague?.name}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4">
            <Link
              href="/standings"
              className="flex-1 rounded-xl border border-zinc-300 bg-white px-6 py-4 text-center font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || !formData.name || !formData.leagueId}
              className="flex-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSubmitting ? 'Menyimpan...' : '✓ Simpan Tim'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
