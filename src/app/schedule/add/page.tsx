'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLeague } from '@/context/LeagueContext';

export default function AddSchedulePage() {
  const { leagues, getTeamsByLeague, addSchedule, getLeagueById } = useLeague();

  const [formData, setFormData] = useState({
    leagueId: '',
    homeTeamId: 0,
    awayTeamId: 0,
    date: '',
    time: '15:00',
    venue: '',
    matchweek: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const selectedLeague = getLeagueById(formData.leagueId);
  const teams = getTeamsByLeague(formData.leagueId);

  const homeTeam = teams.find(t => t.id === formData.homeTeamId);
  const awayTeam = teams.find(t => t.id === formData.awayTeamId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.leagueId || !formData.homeTeamId || !formData.awayTeamId || !formData.date) {
      alert('Mohon lengkapi semua field wajib!');
      return;
    }

    if (formData.homeTeamId === formData.awayTeamId) {
      alert('Tim kandang dan tandang tidak boleh sama!');
      return;
    }

    setIsSubmitting(true);

    try {
      addSchedule({
        leagueId: formData.leagueId,
        homeTeamId: formData.homeTeamId,
        awayTeamId: formData.awayTeamId,
        date: formData.date,
        time: formData.time,
        venue: formData.venue || undefined,
        matchweek: formData.matchweek ? parseInt(formData.matchweek) : undefined,
      });

      setSuccess(true);
      setFormData(prev => ({
        ...prev,
        homeTeamId: 0,
        awayTeamId: 0,
        venue: '',
        matchweek: '',
      }));

      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error adding schedule:', error);
      alert('Gagal menambahkan jadwal!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div>
            <Link
              href="/schedule"
              className="mb-4 inline-flex items-center gap-2 text-sm text-orange-100 hover:text-white transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Kembali ke Jadwal
            </Link>
            <h1 className="text-3xl font-bold text-white">➕ Tambah Jadwal Pertandingan</h1>
            <p className="mt-2 text-orange-100">Buat jadwal pertandingan baru</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        {success && (
          <div className="mb-6 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 dark:bg-emerald-900/20 dark:border-emerald-800">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <p className="font-medium text-emerald-800 dark:text-emerald-200">
                Jadwal berhasil ditambahkan!
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
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {leagues.map(league => (
                <button
                  key={league.id}
                  type="button"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    leagueId: league.id,
                    homeTeamId: 0,
                    awayTeamId: 0,
                  }))}
                  className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                    formData.leagueId === league.id
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                      : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600'
                  }`}
                >
                  <span className="text-2xl">{league.logo}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-zinc-900 dark:text-white truncate">{league.name}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {league.type === 'efootball' ? '🎮 eFootball' : '⚽ Sepakbola'}
                    </p>
                  </div>
                  {formData.leagueId === league.id && (
                    <span className="text-orange-500">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Teams Selection */}
          {formData.leagueId && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
                2. Pilih Tim
              </h2>

              {teams.length < 2 ? (
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 dark:bg-amber-900/20 dark:border-amber-800">
                  <p className="text-amber-800 dark:text-amber-200">
                    ⚠️ Liga ini membutuhkan minimal 2 tim.
                    <Link href="/teams/add" className="ml-2 underline font-medium">
                      Tambah tim sekarang →
                    </Link>
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-4 sm:gap-8">
                  {/* Home Team */}
                  <div className="flex-1 text-center">
                    <label className="mb-2 block text-sm font-medium text-zinc-500 dark:text-zinc-400">
                      Tim Kandang
                    </label>
                    <select
                      value={formData.homeTeamId}
                      onChange={e => setFormData(prev => ({ ...prev, homeTeamId: Number(e.target.value) }))}
                      className="w-full mb-4 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    >
                      <option value={0}>Pilih Tim</option>
                      {teams.filter(t => t.id !== formData.awayTeamId).map(team => (
                        <option key={team.id} value={team.id}>
                          {team.logo} {team.name}
                        </option>
                      ))}
                    </select>

                    {homeTeam && (
                      <div>
                        <span className="text-5xl">{homeTeam.logo}</span>
                        <p className="mt-2 font-semibold text-zinc-900 dark:text-white">{homeTeam.name}</p>
                      </div>
                    )}
                  </div>

                  {/* VS */}
                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-bold text-zinc-400">VS</span>
                  </div>

                  {/* Away Team */}
                  <div className="flex-1 text-center">
                    <label className="mb-2 block text-sm font-medium text-zinc-500 dark:text-zinc-400">
                      Tim Tandang
                    </label>
                    <select
                      value={formData.awayTeamId}
                      onChange={e => setFormData(prev => ({ ...prev, awayTeamId: Number(e.target.value) }))}
                      className="w-full mb-4 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    >
                      <option value={0}>Pilih Tim</option>
                      {teams.filter(t => t.id !== formData.homeTeamId).map(team => (
                        <option key={team.id} value={team.id}>
                          {team.logo} {team.name}
                        </option>
                      ))}
                    </select>

                    {awayTeam && (
                      <div>
                        <span className="text-5xl">{awayTeam.logo}</span>
                        <p className="mt-2 font-semibold text-zinc-900 dark:text-white">{awayTeam.name}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Date & Time */}
          {formData.leagueId && teams.length >= 2 && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
                3. Waktu & Lokasi
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Tanggal <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Waktu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={e => setFormData(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Venue / Stadion
                  </label>
                  <input
                    type="text"
                    value={formData.venue}
                    onChange={e => setFormData(prev => ({ ...prev, venue: e.target.value }))}
                    placeholder="Contoh: Stadion Utama"
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Pekan ke-
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.matchweek}
                    onChange={e => setFormData(prev => ({ ...prev, matchweek: e.target.value }))}
                    placeholder="1"
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Preview */}
          {homeTeam && awayTeam && formData.date && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
                4. Preview
              </h2>
              <div className="rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 p-6 dark:from-orange-900/20 dark:to-amber-900/20">
                <div className="flex items-center justify-between mb-4 text-sm text-zinc-500 dark:text-zinc-400">
                  <div className="flex items-center gap-2">
                    <span>{selectedLeague?.logo}</span>
                    <span>{selectedLeague?.name}</span>
                    {formData.matchweek && (
                      <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs dark:bg-orange-900/30">
                        Pekan {formData.matchweek}
                      </span>
                    )}
                  </div>
                  <span>{new Date(formData.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} • {formData.time}</span>
                </div>

                <div className="flex items-center justify-center gap-6">
                  <div className="text-center">
                    <span className="text-4xl">{homeTeam.logo}</span>
                    <p className="mt-1 font-semibold text-zinc-900 dark:text-white">{homeTeam.name}</p>
                  </div>
                  <span className="text-2xl font-bold text-zinc-400">VS</span>
                  <div className="text-center">
                    <span className="text-4xl">{awayTeam.logo}</span>
                    <p className="mt-1 font-semibold text-zinc-900 dark:text-white">{awayTeam.name}</p>
                  </div>
                </div>

                {formData.venue && (
                  <p className="mt-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
                    📍 {formData.venue}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4">
            <Link
              href="/schedule"
              className="flex-1 rounded-xl border border-zinc-300 bg-white px-6 py-4 text-center font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || !formData.homeTeamId || !formData.awayTeamId || !formData.date}
              className="flex-1 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4 font-semibold text-white shadow-lg shadow-orange-500/30 transition-all hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSubmitting ? 'Menyimpan...' : '✓ Simpan Jadwal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
