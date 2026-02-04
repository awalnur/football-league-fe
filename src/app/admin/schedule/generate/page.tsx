'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getLeagues, getTeamsByLeague, generateSchedule } from '@/lib/supabase';

interface League {
  id: string;
  name: string;
  type: string;
  status: string;
}

interface Team {
  id: string;
  name: string;
}

export default function GenerateSchedulePage() {
  const searchParams = useSearchParams();
  const leagueParam = searchParams.get('league');

  const [leagues, setLeagues] = useState<League[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string>(leagueParam || '');
  const [startDate, setStartDate] = useState<string>('');
  const [intervalType, setIntervalType] = useState<'daily' | 'weekly' | 'custom'>('weekly');
  const [customDays, setCustomDays] = useState<number>(3);
  const [matchesPerDay, setMatchesPerDay] = useState<number>(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ matches: number } | null>(null);

  useEffect(() => {
    loadLeagues();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedLeague) {
      loadTeams(selectedLeague);
    } else {
      setTeams([]);
    }
  }, [selectedLeague]);

  async function loadLeagues() {
    const { data } = await getLeagues();
    if (data) {
      // Only show leagues that can have schedules generated
      const eligibleLeagues = data.filter((l: League) => l.status !== 'completed');
      setLeagues(eligibleLeagues as League[]);

      if (leagueParam && data.some((l: League) => l.id === leagueParam)) {
        setSelectedLeague(leagueParam);
      }
    }
  }

  async function loadTeams(leagueId: string) {
    const { data } = await getTeamsByLeague(leagueId);
    if (data) {
      setTeams(data as Team[]);
    }
  }

  const handleGenerate = async () => {
    if (!selectedLeague) {
      setError('Pilih liga terlebih dahulu');
      return;
    }

    if (teams.length < 2) {
      setError('Minimal 2 tim diperlukan untuk generate jadwal');
      return;
    }

    if (teams.length % 2 !== 0) {
      setError('Jumlah tim harus genap untuk generate jadwal round-robin');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(null);

    // Calculate interval days based on selection
    const intervalDays = intervalType === 'daily' ? 1 : intervalType === 'weekly' ? 7 : customDays;

    const { data, error: genError } = await generateSchedule(
      selectedLeague,
      startDate || undefined,
      intervalDays,
      matchesPerDay
    );

    if (genError) {
      setError(genError.message);
      setLoading(false);
      return;
    }

    setSuccess({ matches: data as number });
    setLoading(false);
  };

  const totalMatchWeeks = teams.length > 1 ? (teams.length - 1) * 2 : 0;
  const totalMatches = teams.length > 1 ? teams.length * (teams.length - 1) : 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/schedule"
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Generate Jadwal Otomatis</h1>
          <p className="text-gray-400">Buat jadwal pertandingan round-robin secara acak</p>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-600/20 border border-green-600/30 rounded-xl p-6 text-center">
          <span className="text-4xl block mb-3">🎉</span>
          <h2 className="text-xl font-semibold text-green-400 mb-2">Jadwal Berhasil Dibuat!</h2>
          <p className="text-gray-300 mb-4">{success.matches} pertandingan telah dijadwalkan</p>
          <Link
            href={`/admin/schedule?league=${selectedLeague}`}
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Lihat Jadwal →
          </Link>
        </div>
      )}

      {/* Form */}
      {!success && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 space-y-6">
          {error && (
            <div className="bg-red-600/20 border border-red-600/30 text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* League Select */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Pilih Liga *</label>
            <select
              value={selectedLeague}
              onChange={(e) => setSelectedLeague(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">-- Pilih Liga --</option>
              {leagues.map((league) => (
                <option key={league.id} value={league.id}>
                  {league.type === 'efootball' ? '🎮' : '⚽'} {league.name}
                </option>
              ))}
            </select>
          </div>

          {/* Teams Preview */}
          {selectedLeague && (
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-300 font-medium">Tim Terdaftar</span>
                <span className={`text-sm font-medium ${
                  teams.length >= 2 && teams.length % 2 === 0 ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  {teams.length} tim
                </span>
              </div>

              {teams.length === 0 ? (
                <p className="text-gray-400 text-sm">Belum ada tim terdaftar</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {teams.map((team) => (
                    <span key={team.id} className="px-3 py-1 bg-gray-600 text-gray-200 rounded-full text-sm">
                      {team.name}
                    </span>
                  ))}
                </div>
              )}

              {teams.length >= 2 && teams.length % 2 !== 0 && (
                <p className="text-yellow-400 text-sm mt-3">
                  ⚠️ Jumlah tim ganjil. Tambah 1 tim lagi untuk jadwal yang seimbang.
                </p>
              )}
            </div>
          )}

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tanggal Mulai</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Kosongkan untuk mulai dari hari ini.
            </p>
          </div>

          {/* Interval Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Interval Pertandingan</label>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <button
                type="button"
                onClick={() => setIntervalType('daily')}
                className={`p-4 rounded-lg border transition-all text-center ${
                  intervalType === 'daily'
                    ? 'bg-orange-600/20 border-orange-500 text-orange-400'
                    : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'
                }`}
              >
                <span className="text-2xl block mb-1">📅</span>
                <span className="font-medium">Harian</span>
                <p className="text-xs text-gray-400 mt-1">Setiap hari</p>
              </button>
              <button
                type="button"
                onClick={() => setIntervalType('weekly')}
                className={`p-4 rounded-lg border transition-all text-center ${
                  intervalType === 'weekly'
                    ? 'bg-orange-600/20 border-orange-500 text-orange-400'
                    : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'
                }`}
              >
                <span className="text-2xl block mb-1">📆</span>
                <span className="font-medium">Mingguan</span>
                <p className="text-xs text-gray-400 mt-1">Setiap 7 hari</p>
              </button>
              <button
                type="button"
                onClick={() => setIntervalType('custom')}
                className={`p-4 rounded-lg border transition-all text-center ${
                  intervalType === 'custom'
                    ? 'bg-orange-600/20 border-orange-500 text-orange-400'
                    : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'
                }`}
              >
                <span className="text-2xl block mb-1">⚙️</span>
                <span className="font-medium">Custom</span>
                <p className="text-xs text-gray-400 mt-1">Atur sendiri</p>
              </button>
            </div>

            {/* Custom Days Input */}
            {intervalType === 'custom' && (
              <div className="bg-gray-700/50 rounded-lg p-4 mt-3">
                <label className="block text-sm text-gray-300 mb-2">Setiap berapa hari?</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={customDays}
                    onChange={(e) => setCustomDays(Math.max(1, Math.min(30, parseInt(e.target.value) || 1)))}
                    className="w-24 px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white text-center focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <span className="text-gray-400">hari sekali</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Contoh: 3 = pertandingan setiap 3 hari sekali
                </p>
              </div>
            )}

            {/* Interval Info */}
            <div className="mt-3 p-3 bg-gray-700/30 rounded-lg">
              <p className="text-sm text-gray-300">
                <span className="text-orange-400 font-medium">Interval dipilih:</span>{' '}
                {intervalType === 'daily' && 'Setiap hari (1 hari)'}
                {intervalType === 'weekly' && 'Setiap minggu (7 hari)'}
                {intervalType === 'custom' && `Setiap ${customDays} hari`}
              </p>
            </div>
          </div>

          {/* Matches Per Day */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Pertandingan Per Hari</label>
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setMatchesPerDay(num)}
                  className={`p-3 rounded-lg border transition-all text-center ${
                    matchesPerDay === num
                      ? 'bg-orange-600/20 border-orange-500 text-orange-400'
                      : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <span className="text-xl font-bold block">{num}</span>
                  <span className="text-xs text-gray-400">match/hari</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Jumlah pertandingan yang dijadwalkan dalam satu hari. Pertandingan akan dijadwalkan mulai pukul 19:00 dengan interval 2 jam.
            </p>
          </div>

          {/* Schedule Preview */}
          {teams.length >= 2 && (
            <div className="bg-orange-600/10 border border-orange-600/30 rounded-lg p-4">
              <h3 className="text-orange-400 font-medium mb-3">📊 Preview Jadwal</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Format</p>
                  <p className="text-white font-medium">Round Robin (Home & Away)</p>
                </div>
                <div>
                  <p className="text-gray-400">Total Pekan</p>
                  <p className="text-white font-medium">{totalMatchWeeks} pekan</p>
                </div>
                <div>
                  <p className="text-gray-400">Total Pertandingan</p>
                  <p className="text-white font-medium">{totalMatches} match</p>
                </div>
                <div>
                  <p className="text-gray-400">Match per Tim</p>
                  <p className="text-white font-medium">{teams.length > 1 ? (teams.length - 1) * 2 : 0} match</p>
                </div>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-4">
            <h3 className="text-blue-400 font-medium mb-2">ℹ️ Cara Kerja</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Jadwal dibuat dengan algoritma Round Robin</li>
              <li>• Setiap tim bertemu semua tim lain (home & away)</li>
              <li>• Urutan pertandingan diacak secara otomatis</li>
              <li>• Pertandingan dijadwalkan setiap minggu</li>
              <li>• Status liga akan berubah menjadi &quot;Berlangsung&quot;</li>
            </ul>
          </div>

          {/* Warning for existing schedule */}
          <div className="bg-yellow-600/10 border border-yellow-600/30 rounded-lg p-4">
            <h3 className="text-yellow-400 font-medium mb-2">⚠️ Perhatian</h3>
            <p className="text-sm text-gray-300">
              Jika liga sudah memiliki jadwal, pertandingan yang belum dimulai akan dihapus dan diganti dengan jadwal baru.
              Pertandingan yang sudah selesai tidak akan terpengaruh.
            </p>
          </div>

          {/* Submit */}
          <div className="flex items-center gap-4 pt-4">
            <button
              onClick={handleGenerate}
              disabled={loading || teams.length < 2 || teams.length % 2 !== 0}
              className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Generating...
                </>
              ) : (
                <>
                  <span>🎲</span>
                  Generate Jadwal
                </>
              )}
            </button>
            <Link
              href="/admin/schedule"
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
            >
              Batal
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
