'use client';

import Image from 'next/image';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createLeague, uploadLeagueLogo } from '@/lib/supabase';

export default function NewLeaguePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    type: 'football' as 'football' | 'efootball',
    season: '2025/2026',
    description: '',
    start_date: '',
    end_date: '',
    tournament_format: 'league' as 'league' | 'cup' | 'league_cup',
    promotion_slots: 0,
    relegation_slots: 0,
    playoff_slots: 0,
    has_group_stage: false,
    teams_per_group: 4,
    qualifiers_per_group: 2,
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Create league first
      const { data: league, error: leagueError } = await createLeague(formData);

      if (leagueError) {
        throw new Error(leagueError.message);
      }

      // Upload logo if provided
      if (logoFile && league) {
        const { url } = await uploadLeagueLogo(logoFile, league.id);
        if (url) {
          // Update league with logo URL
          // This would need an update function, but for now we'll skip
        }
      }

      router.push('/admin/leagues');
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
          href="/admin/leagues"
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Buat Liga Baru</h1>
          <p className="text-gray-400">Tambahkan liga sepakbola atau eFootball</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-6 border border-gray-700 space-y-6">
        {error && (
          <div className="bg-red-600/20 border border-red-600/30 text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Logo Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Logo Liga</label>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-xl bg-gray-700 flex items-center justify-center overflow-hidden">
              {logoPreview ? (
                <Image src={logoPreview} alt="Preview" className="w-full h-full object-cover"  width={96} height={96} />
              ) : (
                <span className="text-4xl">🏆</span>
              )}
            </div>
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
                id="logo-upload"
              />
              <label
                htmlFor="logo-upload"
                className="inline-block px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg cursor-pointer transition-colors"
              >
                Pilih Logo
              </label>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG, atau SVG (Max 2MB)</p>
            </div>
          </div>
        </div>

        {/* League Name */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Nama Liga *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Contoh: Liga Indonesia Series A"
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* League Type */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Tipe Liga *</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'football' })}
              className={`p-4 rounded-lg border-2 transition-colors ${
                formData.type === 'football'
                  ? 'border-green-500 bg-green-600/20'
                  : 'border-gray-600 bg-gray-700 hover:border-gray-500'
              }`}
            >
              <span className="text-3xl block mb-2">⚽</span>
              <span className="text-white font-medium">Football</span>
              <p className="text-xs text-gray-400 mt-1">Liga sepakbola profesional</p>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'efootball' })}
              className={`p-4 rounded-lg border-2 transition-colors ${
                formData.type === 'efootball'
                  ? 'border-purple-500 bg-purple-600/20'
                  : 'border-gray-600 bg-gray-700 hover:border-gray-500'
              }`}
            >
              <span className="text-3xl block mb-2">🎮</span>
              <span className="text-white font-medium">eFootball</span>
              <p className="text-xs text-gray-400 mt-1">Kompetisi esports game</p>
            </button>
          </div>
        </div>

        {/* Season */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Musim *</label>
          <input
            type="text"
            required
            value={formData.season}
            onChange={(e) => setFormData({ ...formData, season: e.target.value })}
            placeholder="Contoh: 2025/2026"
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Deskripsi</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Deskripsi singkat tentang liga ini..."
            rows={3}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Tournament Format */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Format Turnamen *</label>
          <div className="grid grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, tournament_format: 'league' })}
              className={`p-4 rounded-lg border-2 transition-colors ${
                formData.tournament_format === 'league'
                  ? 'border-green-500 bg-green-600/20'
                  : 'border-gray-600 bg-gray-700 hover:border-gray-500'
              }`}
            >
              <span className="text-3xl block mb-2">🏆</span>
              <span className="text-white font-medium block">Liga</span>
              <p className="text-xs text-gray-400 mt-1">Round-robin</p>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, tournament_format: 'cup' })}
              className={`p-4 rounded-lg border-2 transition-colors ${
                formData.tournament_format === 'cup'
                  ? 'border-blue-500 bg-blue-600/20'
                  : 'border-gray-600 bg-gray-700 hover:border-gray-500'
              }`}
            >
              <span className="text-3xl block mb-2">🏅</span>
              <span className="text-white font-medium block">Piala</span>
              <p className="text-xs text-gray-400 mt-1">Knockout</p>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, tournament_format: 'league_cup' })}
              className={`p-4 rounded-lg border-2 transition-colors ${
                formData.tournament_format === 'league_cup'
                  ? 'border-purple-500 bg-purple-600/20'
                  : 'border-gray-600 bg-gray-700 hover:border-gray-500'
              }`}
            >
              <span className="text-3xl block mb-2">⚡</span>
              <span className="text-white font-medium block">Hybrid</span>
              <p className="text-xs text-gray-400 mt-1">Liga + Cup</p>
            </button>
          </div>
        </div>

        {/* League Format - Relegation Settings */}
        {formData.tournament_format === 'league' && (
          <div className="bg-gray-700/50 p-4 rounded-lg space-y-4 border border-gray-600">
            <h3 className="text-white font-medium flex items-center gap-2">
              <span>⬆️⬇️</span>
              Pengaturan Promosi & Degradasi
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Slot Promosi</label>
                <input
                  type="number"
                  min="0"
                  value={formData.promotion_slots}
                  onChange={(e) => setFormData({ ...formData, promotion_slots: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <p className="text-xs text-gray-500 mt-1">Tim promosi langsung</p>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Slot Playoff</label>
                <input
                  type="number"
                  min="0"
                  value={formData.playoff_slots}
                  onChange={(e) => setFormData({ ...formData, playoff_slots: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Tim masuk playoff</p>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Slot Degradasi</label>
                <input
                  type="number"
                  min="0"
                  value={formData.relegation_slots}
                  onChange={(e) => setFormData({ ...formData, relegation_slots: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <p className="text-xs text-gray-500 mt-1">Tim degradasi langsung</p>
              </div>
            </div>
          </div>
        )}

        {/* Cup Format - Group Stage Settings */}
        {(formData.tournament_format === 'cup' || formData.tournament_format === 'league_cup') && (
          <div className="bg-gray-700/50 p-4 rounded-lg space-y-4 border border-gray-600">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-medium flex items-center gap-2">
                <span>🎯</span>
                Pengaturan Format Cup
              </h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.has_group_stage}
                  onChange={(e) => setFormData({ ...formData, has_group_stage: e.target.checked })}
                  className="w-4 h-4 rounded bg-gray-600 border-gray-500 text-blue-500 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-300">Pakai Group Stage</span>
              </label>
            </div>

            {formData.has_group_stage && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Tim per Group</label>
                  <input
                    type="number"
                    min="2"
                    max="8"
                    value={formData.teams_per_group}
                    onChange={(e) => setFormData({ ...formData, teams_per_group: parseInt(e.target.value) || 4 })}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Tim Lolos per Group</label>
                  <input
                    type="number"
                    min="1"
                    max="4"
                    value={formData.qualifiers_per_group}
                    onChange={(e) => setFormData({ ...formData, qualifiers_per_group: parseInt(e.target.value) || 2 })}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tanggal Mulai</label>
            <input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tanggal Selesai</label>
            <input
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors"
          >
            {loading ? 'Menyimpan...' : 'Buat Liga'}
          </button>
          <Link
            href="/admin/leagues"
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
          >
            Batal
          </Link>
        </div>
      </form>
    </div>
  );
}
