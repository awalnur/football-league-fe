'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLeague } from '@/context/LeagueContext';

export default function AddMatchPage() {
  const { leagues, getTeamsByLeague, addMatch, getLeagueById } = useLeague();

  const [formData, setFormData] = useState({
    leagueId: '',
    homeTeamId: 0,
    awayTeamId: 0,
    homeScore: 0,
    awayScore: 0,
    date: new Date().toISOString().split('T')[0],
    screenshot: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedLeague = getLeagueById(formData.leagueId);
  const teams = getTeamsByLeague(formData.leagueId);
  const isEfootball = selectedLeague?.type === 'efootball';

  const homeTeam = teams.find(t => t.id === formData.homeTeamId);
  const awayTeam = teams.find(t => t.id === formData.awayTeamId);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file maksimal 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, screenshot: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.leagueId || !formData.homeTeamId || !formData.awayTeamId) {
      alert('Mohon lengkapi semua field!');
      return;
    }

    if (formData.homeTeamId === formData.awayTeamId) {
      alert('Tim kandang dan tandang tidak boleh sama!');
      return;
    }

    if (isEfootball && !formData.screenshot) {
      alert('Screenshot hasil pertandingan wajib untuk eFootball!');
      return;
    }

    setIsSubmitting(true);

    try {
      addMatch({
        leagueId: formData.leagueId,
        homeTeamId: formData.homeTeamId,
        awayTeamId: formData.awayTeamId,
        homeScore: formData.homeScore,
        awayScore: formData.awayScore,
        date: formData.date,
        screenshot: formData.screenshot || undefined,
      });

      setSuccess(true);
      setFormData(prev => ({
        ...prev,
        homeTeamId: 0,
        awayTeamId: 0,
        homeScore: 0,
        awayScore: 0,
        screenshot: '',
      }));

      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error adding match:', error);
      alert('Gagal menambahkan hasil pertandingan!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/standings"
                className="mb-4 inline-flex items-center gap-2 text-sm text-blue-100 hover:text-white transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Kembali ke Klasemen
              </Link>
              <h1 className="text-3xl font-bold text-white">📝 Input Hasil Pertandingan</h1>
              <p className="mt-2 text-blue-100">Catat hasil pertandingan dan perbarui klasemen secara otomatis</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        {success && (
          <div className="mb-6 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 dark:bg-emerald-900/20 dark:border-emerald-800">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-medium text-emerald-800 dark:text-emerald-200">
                  Hasil pertandingan berhasil disimpan!
                </p>
                <p className="text-sm text-emerald-600 dark:text-emerald-400">
                  Klasemen telah diperbarui secara otomatis.
                </p>
              </div>
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
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
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
                    <span className="text-indigo-500">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Teams & Score */}
          {formData.leagueId && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
                2. Pilih Tim & Skor
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
                <div className="space-y-6">
                  {/* Match Display */}
                  <div className="flex items-center justify-center gap-4 sm:gap-8">
                    {/* Home Team */}
                    <div className="flex-1 text-center">
                      <select
                        value={formData.homeTeamId}
                        onChange={e => setFormData(prev => ({ ...prev, homeTeamId: Number(e.target.value) }))}
                        className="w-full mb-4 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                      >
                        <option value={0}>Pilih Tim Kandang</option>
                        {teams.filter(t => t.id !== formData.awayTeamId).map(team => (
                          <option key={team.id} value={team.id}>
                            {team.logo} {team.name}
                          </option>
                        ))}
                      </select>

                      {homeTeam && (
                        <div className="mb-4">
                          <span className="text-5xl">{homeTeam.logo}</span>
                          <p className="mt-2 font-semibold text-zinc-900 dark:text-white">{homeTeam.name}</p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">Kandang</p>
                        </div>
                      )}

                      <input
                        type="number"
                        min="0"
                        max="99"
                        value={formData.homeScore}
                        onChange={e => setFormData(prev => ({ ...prev, homeScore: Math.max(0, Number(e.target.value)) }))}
                        className="w-24 mx-auto rounded-xl border-2 border-zinc-300 bg-white px-4 py-4 text-center text-3xl font-bold text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                      />
                    </div>

                    {/* VS */}
                    <div className="flex flex-col items-center">
                      <span className="text-2xl font-bold text-zinc-400">VS</span>
                    </div>

                    {/* Away Team */}
                    <div className="flex-1 text-center">
                      <select
                        value={formData.awayTeamId}
                        onChange={e => setFormData(prev => ({ ...prev, awayTeamId: Number(e.target.value) }))}
                        className="w-full mb-4 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                      >
                        <option value={0}>Pilih Tim Tandang</option>
                        {teams.filter(t => t.id !== formData.homeTeamId).map(team => (
                          <option key={team.id} value={team.id}>
                            {team.logo} {team.name}
                          </option>
                        ))}
                      </select>

                      {awayTeam && (
                        <div className="mb-4">
                          <span className="text-5xl">{awayTeam.logo}</span>
                          <p className="mt-2 font-semibold text-zinc-900 dark:text-white">{awayTeam.name}</p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">Tandang</p>
                        </div>
                      )}

                      <input
                        type="number"
                        min="0"
                        max="99"
                        value={formData.awayScore}
                        onChange={e => setFormData(prev => ({ ...prev, awayScore: Math.max(0, Number(e.target.value)) }))}
                        className="w-24 mx-auto rounded-xl border-2 border-zinc-300 bg-white px-4 py-4 text-center text-3xl font-bold text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Date */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Tanggal Pertandingan
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Screenshot for eFootball */}
          {isEfootball && formData.leagueId && teams.length >= 2 && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
                3. Screenshot Hasil Pertandingan
                <span className="ml-2 text-sm font-normal text-red-500">* Wajib untuk eFootball</span>
              </h2>

              <div className="space-y-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all ${
                    formData.screenshot
                      ? 'border-indigo-300 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-900/20'
                      : 'border-zinc-300 hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-600'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                  {formData.screenshot ? (
                    <div className="space-y-4">
                      <div className="relative mx-auto aspect-video max-w-lg overflow-hidden rounded-lg">
                        <Image
                          src={formData.screenshot}
                          alt="Screenshot pertandingan"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <p className="text-sm text-indigo-600 dark:text-indigo-400">
                        Klik untuk mengganti gambar
                      </p>
                    </div>
                  ) : (
                    <div>
                      <span className="text-4xl">📸</span>
                      <p className="mt-2 font-medium text-zinc-700 dark:text-zinc-300">
                        Klik untuk upload screenshot
                      </p>
                      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        PNG, JPG hingga 5MB
                      </p>
                    </div>
                  )}
                </div>

                {formData.screenshot && (
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, screenshot: '' }))}
                    className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    🗑️ Hapus gambar
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Preview */}
          {homeTeam && awayTeam && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
                {isEfootball ? '4' : '3'}. Preview Hasil
              </h2>
              <div className="rounded-xl bg-gradient-to-r from-zinc-100 to-zinc-50 p-6 dark:from-zinc-800 dark:to-zinc-900">
                <div className="flex items-center justify-center gap-6">
                  <div className="text-center">
                    <span className="text-4xl">{homeTeam.logo}</span>
                    <p className="mt-1 font-semibold text-zinc-900 dark:text-white">{homeTeam.name}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-2 text-4xl font-bold">
                      <span className={formData.homeScore > formData.awayScore ? 'text-emerald-600' : formData.homeScore < formData.awayScore ? 'text-red-600' : 'text-zinc-600'}>
                        {formData.homeScore}
                      </span>
                      <span className="text-zinc-400">-</span>
                      <span className={formData.awayScore > formData.homeScore ? 'text-emerald-600' : formData.awayScore < formData.homeScore ? 'text-red-600' : 'text-zinc-600'}>
                        {formData.awayScore}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{formData.date}</p>
                  </div>
                  <div className="text-center">
                    <span className="text-4xl">{awayTeam.logo}</span>
                    <p className="mt-1 font-semibold text-zinc-900 dark:text-white">{awayTeam.name}</p>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${
                    formData.homeScore > formData.awayScore
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : formData.homeScore < formData.awayScore
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                  }`}>
                    {formData.homeScore > formData.awayScore
                      ? `🏆 ${homeTeam.name} Menang`
                      : formData.homeScore < formData.awayScore
                      ? `🏆 ${awayTeam.name} Menang`
                      : '🤝 Seri'}
                  </span>
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
              disabled={isSubmitting || !formData.homeTeamId || !formData.awayTeamId || (isEfootball && !formData.screenshot)}
              className="flex-1 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSubmitting ? 'Menyimpan...' : '✓ Simpan Hasil'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
