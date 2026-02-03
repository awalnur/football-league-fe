'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getMatchById, recordMatchResult, uploadMatchScreenshot, getLeagueById } from '@/lib/supabase';

interface Match {
  id: string;
  match_week: number;
  match_date: string | null;
  status: string;
  home_score: number | null;
  away_score: number | null;
  home_team: { id: string; name: string; logo_url: string | null };
  away_team: { id: string; name: string; logo_url: string | null };
  league_id: string;
  screenshots?: { id: string; image_url: string; caption: string | null }[];
}

interface League {
  id: string;
  name: string;
  type: string;
}

export default function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [match, setMatch] = useState<Match | null>(null);
  const [league, setLeague] = useState<League | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [homeScore, setHomeScore] = useState<number>(0);
  const [awayScore, setAwayScore] = useState<number>(0);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string>('');
  const [screenshotCaption, setScreenshotCaption] = useState<string>('');

  useEffect(() => {
    loadMatch();
  }, [id]);

  async function loadMatch() {
    const { data, error } = await getMatchById(id);
    if (data) {
      const matchData = data as unknown as Match;
      setMatch(matchData);
      if (matchData.home_score !== null) setHomeScore(matchData.home_score);
      if (matchData.away_score !== null) setAwayScore(matchData.away_score);

      // Load league info
      const { data: leagueData } = await getLeagueById(matchData.league_id);
      if (leagueData) {
        setLeague(leagueData as League);
      }
    }
    setLoading(false);
  }

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshotFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      let screenshotUrl: string | undefined;

      // Upload screenshot if provided (for eFootball)
      if (screenshotFile && match) {
        const { url, error: uploadError } = await uploadMatchScreenshot(screenshotFile, match.id);
        if (uploadError) {
          throw new Error('Gagal upload screenshot');
        }
        screenshotUrl = url || undefined;
      }

      // Record match result
      const { error: resultError } = await recordMatchResult(
        id,
        homeScore,
        awayScore,
        screenshotUrl,
        screenshotCaption || undefined
      );

      if (resultError) {
        throw new Error(resultError.message);
      }

      router.push(`/admin/matches?success=true`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="bg-gray-800 rounded-xl p-12 text-center border border-gray-700">
        <span className="text-6xl block mb-4">❌</span>
        <h2 className="text-xl font-semibold text-white mb-2">Pertandingan Tidak Ditemukan</h2>
        <Link href="/admin/matches" className="text-green-400 hover:text-green-300">
          ← Kembali ke Daftar Pertandingan
        </Link>
      </div>
    );
  }

  const isEfootball = league?.type === 'efootball';
  const isCompleted = match.status === 'completed';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/matches"
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">
            {isCompleted ? 'Detail Pertandingan' : 'Input Hasil Pertandingan'}
          </h1>
          <p className="text-gray-400">
            {league?.name} • Pekan {match.match_week}
            {isEfootball && <span className="ml-2 text-purple-400">🎮</span>}
          </p>
        </div>
      </div>

      {/* Match Card */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        {/* Teams vs Teams */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1 text-center">
            <div className="w-20 h-20 rounded-xl bg-gray-700 flex items-center justify-center mx-auto mb-3">
              {match.home_team?.logo_url ? (
                <img src={match.home_team.logo_url} alt="" className="w-14 h-14 object-contain" />
              ) : (
                <span className="text-4xl">🏠</span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-white">{match.home_team?.name}</h3>
            <p className="text-sm text-gray-400">Home</p>
          </div>

          <div className="px-8">
            {isCompleted ? (
              <div className="text-center">
                <div className="text-4xl font-bold text-white">
                  {match.home_score} - {match.away_score}
                </div>
                <p className="text-sm text-green-400 mt-2">Selesai</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-500">VS</p>
                {match.match_date && (
                  <p className="text-sm text-gray-400 mt-1">
                    {new Date(match.match_date).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex-1 text-center">
            <div className="w-20 h-20 rounded-xl bg-gray-700 flex items-center justify-center mx-auto mb-3">
              {match.away_team?.logo_url ? (
                <img src={match.away_team.logo_url} alt="" className="w-14 h-14 object-contain" />
              ) : (
                <span className="text-4xl">✈️</span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-white">{match.away_team?.name}</h3>
            <p className="text-sm text-gray-400">Away</p>
          </div>
        </div>

        {/* Existing Screenshots */}
        {match.screenshots && match.screenshots.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-300 mb-3">Screenshot Hasil</h4>
            <div className="grid grid-cols-2 gap-4">
              {match.screenshots.map((ss) => (
                <div key={ss.id} className="relative group">
                  <img
                    src={ss.image_url}
                    alt={ss.caption || 'Screenshot'}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  {ss.caption && (
                    <p className="text-xs text-gray-400 mt-1">{ss.caption}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      {!isCompleted && (
        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-6 border border-gray-700 space-y-6">
          {error && (
            <div className="bg-red-600/20 border border-red-600/30 text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Score Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-4 text-center">Skor Akhir</label>
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-400 mb-2">{match.home_team?.name}</p>
                <input
                  type="number"
                  min="0"
                  max="99"
                  value={homeScore}
                  onChange={(e) => setHomeScore(parseInt(e.target.value) || 0)}
                  className="w-24 h-24 text-center text-4xl font-bold bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <span className="text-4xl text-gray-500 font-bold">-</span>
              <div className="text-center">
                <p className="text-sm text-gray-400 mb-2">{match.away_team?.name}</p>
                <input
                  type="number"
                  min="0"
                  max="99"
                  value={awayScore}
                  onChange={(e) => setAwayScore(parseInt(e.target.value) || 0)}
                  className="w-24 h-24 text-center text-4xl font-bold bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* Screenshot Upload (for eFootball) */}
          {isEfootball && (
            <div className="border-t border-gray-700 pt-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                📸 Screenshot Hasil Pertandingan
              </label>
              <p className="text-xs text-gray-500 mb-4">
                Upload screenshot dari game sebagai bukti hasil pertandingan
              </p>

              {screenshotPreview ? (
                <div className="relative">
                  <img
                    src={screenshotPreview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setScreenshotFile(null);
                      setScreenshotPreview('');
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-gray-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleScreenshotChange}
                    className="hidden"
                    id="screenshot-upload"
                  />
                  <label
                    htmlFor="screenshot-upload"
                    className="cursor-pointer"
                  >
                    <span className="text-4xl block mb-2">📷</span>
                    <p className="text-gray-400">Klik untuk upload screenshot</p>
                    <p className="text-xs text-gray-500 mt-1">PNG atau JPG (Max 5MB)</p>
                  </label>
                </div>
              )}

              {screenshotPreview && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Caption (opsional)</label>
                  <input
                    type="text"
                    value={screenshotCaption}
                    onChange={(e) => setScreenshotCaption(e.target.value)}
                    placeholder="Contoh: Hasil akhir pertandingan"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              )}
            </div>
          )}

          {/* Result Preview */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-2">Hasil yang akan disimpan:</p>
            <div className="flex items-center justify-center gap-4">
              <span className="text-white font-semibold">{match.home_team?.name}</span>
              <span className="text-2xl font-bold text-white">{homeScore} - {awayScore}</span>
              <span className="text-white font-semibold">{match.away_team?.name}</span>
            </div>
            <p className="text-center text-sm mt-2">
              {homeScore > awayScore ? (
                <span className="text-green-400">🏆 {match.home_team?.name} Menang</span>
              ) : awayScore > homeScore ? (
                <span className="text-green-400">🏆 {match.away_team?.name} Menang</span>
              ) : (
                <span className="text-yellow-400">🤝 Seri</span>
              )}
            </p>
          </div>

          {/* Info */}
          <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-4">
            <p className="text-sm text-blue-300">
              ℹ️ Setelah disimpan, klasemen liga akan otomatis diperbarui berdasarkan hasil ini.
            </p>
          </div>

          {/* Submit */}
          <div className="flex items-center gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Menyimpan...
                </>
              ) : (
                <>
                  <span>✓</span>
                  Simpan Hasil
                </>
              )}
            </button>
            <Link
              href="/admin/matches"
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
            >
              Batal
            </Link>
          </div>
        </form>
      )}

      {/* Edit button for completed matches */}
      {isCompleted && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <p className="text-gray-400 text-center mb-4">
            Pertandingan ini sudah selesai. Klasemen telah diperbarui.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href={`/standings?league=${match.league_id}`}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              Lihat Klasemen
            </Link>
            <Link
              href="/admin/matches"
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
            >
              Kembali
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
