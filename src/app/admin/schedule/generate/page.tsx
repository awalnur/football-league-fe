'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getLeagues, getTeamsByLeague, generateScheduleAdvanced } from '@/lib/supabase';

interface League {
  id: string;
  name: string;
  type: string;
  status: string;
  tournament_format?: string;
}

interface Team {
  id: string;
  name: string;
}

type CompetitionFormat = 'round_robin' | 'single_round' | 'knockout' | 'group_knockout';

export default function GenerateSchedulePage() {
  const searchParams = useSearchParams();
  const leagueParam = searchParams.get('league');

  const [leagues, setLeagues] = useState<League[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string>(leagueParam || '');
  const [competitionFormat, setCompetitionFormat] = useState<CompetitionFormat>('round_robin');
  const [startDate, setStartDate] = useState<string>('');
  const [intervalType, setIntervalType] = useState<'daily' | 'weekly' | 'custom'>('weekly');
  const [customDays, setCustomDays] = useState<number>(3);
  const [matchesPerDay, setMatchesPerDay] = useState<number>(2);
  const [groupCount, setGroupCount] = useState<number>(4);
  const [teamsPerGroup, setTeamsPerGroup] = useState<number>(4);
  const [qualifiersPerGroup, setQualifiersPerGroup] = useState<number>(2);
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

    // Validation based on format
    if (competitionFormat === 'round_robin' || competitionFormat === 'single_round') {
      if (teams.length % 2 !== 0) {
        setError('Jumlah tim harus genap untuk format liga');
        return;
      }
    }

    if (competitionFormat === 'knockout') {
      const validKnockoutSizes = [2, 4, 8, 16, 32, 64];
      if (!validKnockoutSizes.includes(teams.length)) {
        setError('Jumlah tim untuk knockout harus 2, 4, 8, 16, 32, atau 64');
        return;
      }
    }

    if (competitionFormat === 'group_knockout') {
      const totalGroupTeams = groupCount * teamsPerGroup;
      if (teams.length < totalGroupTeams) {
        setError(`Butuh minimal ${totalGroupTeams} tim untuk ${groupCount} grup dengan ${teamsPerGroup} tim per grup`);
        return;
      }
    }

    setLoading(true);
    setError('');
    setSuccess(null);

    // Calculate interval days based on selection
    const intervalDays = intervalType === 'daily' ? 1 : intervalType === 'weekly' ? 7 : customDays;

    const { data, error: genError } = await generateScheduleAdvanced(
      selectedLeague,
      competitionFormat,
      {
        startDate: startDate || undefined,
        intervalDays,
        matchesPerDay,
        groupCount,
        teamsPerGroup,
        qualifiersPerGroup
      }
    );

    if (genError) {
      setError(genError.message || 'Terjadi kesalahan saat generate jadwal');
      setLoading(false);
      return;
    }

    // Handle different response types
    if (typeof data === 'number') {
      setSuccess({ matches: data });
    } else if (data && typeof data === 'object' && 'totalMatches' in data) {
      setSuccess({ matches: data.totalMatches });
    } else {
      setSuccess({ matches: 0 });
    }

    setLoading(false);
  };

  // Calculate match statistics based on format
  const getMatchStats = () => {
    const n = teams.length;
    if (n < 2) return { totalMatchWeeks: 0, totalMatches: 0, matchesPerTeam: 0 };

    switch (competitionFormat) {
      case 'round_robin':
        return {
          totalMatchWeeks: (n - 1) * 2,
          totalMatches: n * (n - 1),
          matchesPerTeam: (n - 1) * 2
        };
      case 'single_round':
        return {
          totalMatchWeeks: n - 1,
          totalMatches: (n * (n - 1)) / 2,
          matchesPerTeam: n - 1
        };
      case 'knockout':
        const rounds = Math.log2(n);
        return {
          totalMatchWeeks: Math.ceil(rounds),
          totalMatches: n - 1,
          matchesPerTeam: rounds // max matches for winner
        };
      case 'group_knockout':
        const groupMatches = groupCount * (teamsPerGroup * (teamsPerGroup - 1) / 2);
        const qualifiedTeams = groupCount * qualifiersPerGroup;
        const knockoutMatches = qualifiedTeams > 1 ? qualifiedTeams - 1 : 0;
        return {
          totalMatchWeeks: (teamsPerGroup - 1) + Math.ceil(Math.log2(qualifiedTeams)),
          totalMatches: groupMatches + knockoutMatches,
          matchesPerTeam: teamsPerGroup - 1 // minimum in group stage
        };
      default:
        return { totalMatchWeeks: 0, totalMatches: 0, matchesPerTeam: 0 };
    }
  };

  const stats = getMatchStats();

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
          <p className="text-gray-400">Buat jadwal pertandingan dengan berbagai format kompetisi</p>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-600/20 border border-green-600/30 rounded-xl p-6 text-center">
          <span className="text-4xl block mb-3">🎉</span>
          <h2 className="text-xl font-semibold text-green-400 mb-2">Jadwal Berhasil Dibuat!</h2>
          <p className="text-gray-300 mb-2">{success.matches} pertandingan telah dijadwalkan</p>

          {competitionFormat === 'group_knockout' && (
            <div className="bg-gray-800/50 rounded-lg p-3 mb-4 text-left max-w-md mx-auto">
              <p className="text-sm text-gray-300 mb-1">
                <span className="text-yellow-400">📋 Fase Grup:</span> {groupCount} grup × {teamsPerGroup} tim
              </p>
              <p className="text-sm text-gray-300 mb-1">
                <span className="text-green-400">✅ Lolos Knockout:</span> {groupCount * qualifiersPerGroup} tim (top {qualifiersPerGroup} per grup)
              </p>
              <p className="text-xs text-gray-400 mt-2">
                💡 Babak knockout akan otomatis terbentuk setelah fase grup selesai
              </p>
            </div>
          )}

          {competitionFormat === 'knockout' && (
            <div className="bg-gray-800/50 rounded-lg p-3 mb-4 text-left max-w-md mx-auto">
              <p className="text-sm text-gray-300">
                <span className="text-purple-400">🏆 Format:</span> Single Elimination
              </p>
              <p className="text-sm text-gray-300 mt-1">
                <span className="text-orange-400">📊 Babak:</span> {
                  teams.length >= 32 ? 'R32 → ' : ''
                }{
                  teams.length >= 16 ? 'R16 → ' : ''
                }{
                  teams.length >= 8 ? 'QF → ' : ''
                }{
                  teams.length >= 4 ? 'SF → ' : ''
                }Final
              </p>
            </div>
          )}

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

          {/* Competition Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Format Kompetisi *</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCompetitionFormat('round_robin')}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  competitionFormat === 'round_robin'
                    ? 'bg-orange-600/20 border-orange-500 ring-2 ring-orange-500/30'
                    : 'bg-gray-700/50 border-gray-600 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🔄</span>
                  <span className={`font-semibold ${competitionFormat === 'round_robin' ? 'text-orange-400' : 'text-white'}`}>
                    Round Robin
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  Setiap tim bertemu 2x (Home & Away). Format liga standar seperti Premier League.
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">Home & Away</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setCompetitionFormat('single_round')}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  competitionFormat === 'single_round'
                    ? 'bg-orange-600/20 border-orange-500 ring-2 ring-orange-500/30'
                    : 'bg-gray-700/50 border-gray-600 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">1️⃣</span>
                  <span className={`font-semibold ${competitionFormat === 'single_round' ? 'text-orange-400' : 'text-white'}`}>
                    Single Round
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  Setiap tim bertemu 1x saja. Cocok untuk turnamen singkat atau fase grup.
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">Sekali Tanding</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setCompetitionFormat('knockout')}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  competitionFormat === 'knockout'
                    ? 'bg-orange-600/20 border-orange-500 ring-2 ring-orange-500/30'
                    : 'bg-gray-700/50 border-gray-600 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🏆</span>
                  <span className={`font-semibold ${competitionFormat === 'knockout' ? 'text-orange-400' : 'text-white'}`}>
                    Knockout
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  Sistem gugur langsung. Kalah = Tersingkir. Format piala klasik.
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded">Eliminasi</span>
                  <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded">2/4/8/16/32 Tim</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setCompetitionFormat('group_knockout')}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  competitionFormat === 'group_knockout'
                    ? 'bg-orange-600/20 border-orange-500 ring-2 ring-orange-500/30'
                    : 'bg-gray-700/50 border-gray-600 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🌍</span>
                  <span className={`font-semibold ${competitionFormat === 'group_knockout' ? 'text-orange-400' : 'text-white'}`}>
                    Grup + Knockout
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  Fase grup lalu babak gugur. Format World Cup / Champions League.
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded">Fase Grup</span>
                  <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded">Knockout</span>
                </div>
              </button>
            </div>
          </div>

          {/* Group Settings - Only for group_knockout format */}
          {competitionFormat === 'group_knockout' && (
            <div className="bg-gray-700/50 rounded-xl p-4 space-y-4">
              <h3 className="text-white font-medium flex items-center gap-2">
                <span>⚙️</span> Pengaturan Grup
              </h3>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Jumlah Grup</label>
                  <select
                    value={groupCount}
                    onChange={(e) => setGroupCount(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {[2, 4, 6, 8].map((n) => (
                      <option key={n} value={n}>{n} Grup</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Tim per Grup</label>
                  <select
                    value={teamsPerGroup}
                    onChange={(e) => setTeamsPerGroup(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {[3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>{n} Tim</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Lolos per Grup</label>
                  <select
                    value={qualifiersPerGroup}
                    onChange={(e) => setQualifiersPerGroup(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {[1, 2, 3, 4].filter(n => n < teamsPerGroup).map((n) => (
                      <option key={n} value={n}>{n} Tim</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-3">
                <p className="text-sm text-gray-300">
                  <span className="text-orange-400 font-medium">Konfigurasi:</span>{' '}
                  {groupCount} grup × {teamsPerGroup} tim = <span className="text-white font-bold">{groupCount * teamsPerGroup} tim total</span>
                </p>
                <p className="text-sm text-gray-300 mt-1">
                  <span className="text-green-400 font-medium">Lolos ke Knockout:</span>{' '}
                  {groupCount} grup × {qualifiersPerGroup} tim = <span className="text-white font-bold">{groupCount * qualifiersPerGroup} tim</span>
                </p>
              </div>
            </div>
          )}

          {/* Teams Preview */}
          {selectedLeague && (
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-300 font-medium">Tim Terdaftar</span>
                <span className={`text-sm font-medium ${
                  teams.length >= 2 ? 'text-green-400' : 'text-yellow-400'
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

              {/* Format-specific warnings */}
              {(competitionFormat === 'round_robin' || competitionFormat === 'single_round') && teams.length >= 2 && teams.length % 2 !== 0 && (
                <p className="text-yellow-400 text-sm mt-3">
                  ⚠️ Jumlah tim ganjil. Tambah 1 tim lagi untuk jadwal yang seimbang.
                </p>
              )}

              {competitionFormat === 'knockout' && teams.length >= 2 && ![2, 4, 8, 16, 32, 64].includes(teams.length) && (
                <p className="text-yellow-400 text-sm mt-3">
                  ⚠️ Format knockout memerlukan 2, 4, 8, 16, 32, atau 64 tim. Saat ini: {teams.length} tim.
                </p>
              )}

              {competitionFormat === 'group_knockout' && teams.length < groupCount * teamsPerGroup && (
                <p className="text-yellow-400 text-sm mt-3">
                  ⚠️ Butuh minimal {groupCount * teamsPerGroup} tim untuk konfigurasi grup ini. Saat ini: {teams.length} tim.
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
              Kosongkan untuk mulai dari hari ini. Pertandingan pertama dimulai pukul 19:00 WIB.
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
            <label className="block text-sm font-medium text-gray-300 mb-2">Berapa Kali Tim Tanding Per Hari?</label>
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
                  <span className="text-xl font-bold block">{num}x</span>
                  <span className="text-xs text-gray-400">per hari</span>
                </button>
              ))}
            </div>
            <div className="mt-3 p-3 bg-gray-700/30 rounded-lg">
              <p className="text-sm text-gray-300">
                <span className="text-orange-400 font-medium">Artinya:</span>{' '}
                Setiap tim akan bertanding <span className="text-white font-bold">{matchesPerDay}x dalam satu hari</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {matchesPerDay === 1 && 'Jadwal: Pekan 1 (19:00 WIB), Pekan 2 (hari berikutnya 19:00 WIB), dst.'}
                {matchesPerDay === 2 && 'Jadwal: Pekan 1 (19:00 WIB), Pekan 2 (20:00 WIB), Pekan 3 (hari berikutnya 19:00 WIB), dst.'}
                {matchesPerDay === 3 && 'Jadwal: Pekan 1 (19:00 WIB), Pekan 2 (20:00 WIB), Pekan 3 (21:00 WIB), Pekan 4 (hari berikutnya), dst.'}
                {matchesPerDay === 4 && 'Jadwal: Pekan 1-4 dalam satu hari (19:00, 20:00, 21:00, 22:00 WIB), dst.'}
              </p>
              <p className="text-xs text-blue-400 mt-2 flex items-center gap-1">
                <span>🕐</span> Zona Waktu: WIB (Waktu Indonesia Barat / UTC+7)
              </p>
            </div>
          </div>

          {/* Schedule Preview */}
          {teams.length >= 2 && (
            <div className="bg-orange-600/10 border border-orange-600/30 rounded-lg p-4">
              <h3 className="text-orange-400 font-medium mb-3">📊 Preview Jadwal</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Format</p>
                  <p className="text-white font-medium">
                    {competitionFormat === 'round_robin' && 'Round Robin (Home & Away)'}
                    {competitionFormat === 'single_round' && 'Single Round (Sekali Tanding)'}
                    {competitionFormat === 'knockout' && 'Knockout (Sistem Gugur)'}
                    {competitionFormat === 'group_knockout' && `Grup (${groupCount}×${teamsPerGroup}) + Knockout`}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Total Pekan/Babak</p>
                  <p className="text-white font-medium">{stats.totalMatchWeeks} {competitionFormat === 'knockout' ? 'babak' : 'pekan'}</p>
                </div>
                <div>
                  <p className="text-gray-400">Total Pertandingan</p>
                  <p className="text-white font-medium">{stats.totalMatches} match</p>
                </div>
                <div>
                  <p className="text-gray-400">Match per Tim {competitionFormat === 'knockout' ? '(max)' : ''}</p>
                  <p className="text-white font-medium">{stats.matchesPerTeam} match</p>
                </div>
              </div>

              {/* Format-specific warnings */}
              {competitionFormat === 'knockout' && (
                <div className="mt-3 p-2 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                  <p className="text-xs text-purple-300">
                    💡 Format Knockout memerlukan jumlah tim: 2, 4, 8, 16, 32, atau 64 tim
                  </p>
                </div>
              )}

              {competitionFormat === 'group_knockout' && (
                <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-xs text-yellow-300">
                    💡 Tim akan dibagi ke {groupCount} grup secara acak, kemudian {groupCount * qualifiersPerGroup} tim teratas lolos ke babak knockout
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Info */}
          <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-4">
            <h3 className="text-blue-400 font-medium mb-2">ℹ️ Cara Kerja - {
              competitionFormat === 'round_robin' ? 'Round Robin' :
              competitionFormat === 'single_round' ? 'Single Round' :
              competitionFormat === 'knockout' ? 'Knockout' : 'Grup + Knockout'
            }</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              {competitionFormat === 'round_robin' && (
                <>
                  <li>• Setiap tim bertemu semua tim lain 2x (home & away)</li>
                  <li>• Total {teams.length > 1 ? (teams.length - 1) * 2 : 0} pekan pertandingan</li>
                  <li>• Poin: Menang = 3, Seri = 1, Kalah = 0</li>
                  <li>• Urutan pertandingan diacak secara otomatis</li>
                </>
              )}
              {competitionFormat === 'single_round' && (
                <>
                  <li>• Setiap tim bertemu semua tim lain 1x saja</li>
                  <li>• Cocok untuk fase grup atau turnamen singkat</li>
                  <li>• Poin: Menang = 3, Seri = 1, Kalah = 0</li>
                  <li>• Lokasi pertandingan ditentukan secara acak</li>
                </>
              )}
              {competitionFormat === 'knockout' && (
                <>
                  <li>• Sistem gugur langsung (kalah = tersingkir)</li>
                  <li>• Bracket dibuat secara acak</li>
                  <li>• Babak: {teams.length >= 32 ? 'R32 → ' : ''}{teams.length >= 16 ? 'R16 → ' : ''}{teams.length >= 8 ? 'QF → ' : ''}{teams.length >= 4 ? 'SF → ' : ''}Final</li>
                  <li>• Seri di waktu normal → Extra Time → Penalti</li>
                </>
              )}
              {competitionFormat === 'group_knockout' && (
                <>
                  <li>• Fase Grup: {groupCount} grup, masing-masing {teamsPerGroup} tim</li>
                  <li>• Setiap grup bermain single round robin</li>
                  <li>• {qualifiersPerGroup} tim teratas per grup lolos ke knockout</li>
                  <li>• Fase Knockout: {groupCount * qualifiersPerGroup} tim, sistem gugur</li>
                </>
              )}
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
              disabled={
                loading ||
                teams.length < 2 ||
                (competitionFormat === 'round_robin' && teams.length % 2 !== 0) ||
                (competitionFormat === 'single_round' && teams.length % 2 !== 0) ||
                (competitionFormat === 'knockout' && ![2, 4, 8, 16, 32, 64].includes(teams.length)) ||
                (competitionFormat === 'group_knockout' && teams.length < groupCount * teamsPerGroup)
              }
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
                  Generate Jadwal {
                    competitionFormat === 'round_robin' ? 'Liga' :
                    competitionFormat === 'single_round' ? 'Single Round' :
                    competitionFormat === 'knockout' ? 'Knockout' : 'Turnamen'
                  }
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
