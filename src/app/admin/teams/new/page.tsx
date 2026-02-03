'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getLeagues, createTeam, uploadTeamLogo } from '@/lib/supabase';

interface League {
  id: string;
  name: string;
  type: string;
}

export default function NewTeamPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const leagueParam = searchParams.get('league');

  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(false);

  const [formData, setFormData] = useState({
    league_id: leagueParam || '',
    name: '',
    short_name: '',
    primary_color: '#22c55e',
    secondary_color: '#ffffff',
  });

  useEffect(() => {
    async function loadLeagues() {
      const { data } = await getLeagues();
      if (data) {
        setLeagues(data as League[]);
        if (leagueParam && data.some(l => l.id === leagueParam)) {
          setFormData(prev => ({ ...prev, league_id: leagueParam }));
        }
      }
    }
    loadLeagues();
  }, [leagueParam]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError('Ukuran file maksimal 2MB');
        return;
      }
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('File harus berupa gambar');
        return;
      }
      setError('');
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.league_id) {
        throw new Error('Pilih liga terlebih dahulu');
      }

      if (!formData.name.trim()) {
        throw new Error('Nama tim wajib diisi');
      }

      const { data: team, error: teamError } = await createTeam(formData);

      if (teamError) {
        throw new Error(teamError.message);
      }

      if (logoFile && team) {
        setUploadProgress(true);
        await uploadTeamLogo(logoFile, team.id);
        setUploadProgress(false);
      }

      router.push(`/admin/teams?league=${formData.league_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
      setUploadProgress(false);
    }
  };

  const selectedLeague = leagues.find(l => l.id === formData.league_id);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/teams"
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Tambah Tim Baru</h1>
            <p className="text-sm text-slate-400">Daftarkan tim ke dalam liga</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-slate-900 rounded-lg p-6 border border-slate-800 space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg flex items-center gap-2">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* League Select */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Liga *</label>
          <select
            required
            value={formData.league_id}
            onChange={(e) => setFormData({ ...formData, league_id: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="">-- Pilih Liga --</option>
            {leagues.map((league) => (
              <option key={league.id} value={league.id}>
                {league.type === 'efootball' ? '[eFootball]' : '[Football]'} {league.name}
              </option>
            ))}
          </select>
        </div>

        {/* Logo Upload */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Logo Tim</label>
          <div className="flex items-start gap-4">
            <div
              className="w-24 h-24 rounded-lg flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-700 relative"
              style={{ backgroundColor: logoPreview ? formData.primary_color : 'transparent' }}
            >
              {logoPreview ? (
                <>
                  <img src={logoPreview} alt="Preview" className="w-16 h-16 object-contain" />
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </>
              ) : (
                <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <input
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                onChange={handleLogoChange}
                className="hidden"
                id="logo-upload"
              />
              <label
                htmlFor="logo-upload"
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload Logo
              </label>
              <p className="text-xs text-slate-500 mt-2">Format: PNG, JPG, SVG, WebP</p>
              <p className="text-xs text-slate-500">Ukuran maksimal: 2MB</p>
              <p className="text-xs text-slate-500">Rekomendasi: Background transparan</p>
            </div>
          </div>
        </div>

        {/* Team Name */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Nama Tim *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Contoh: Manchester United"
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        {/* Short Name */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Nama Singkat</label>
          <input
            type="text"
            value={formData.short_name}
            onChange={(e) => setFormData({ ...formData, short_name: e.target.value.toUpperCase() })}
            placeholder="Contoh: MU"
            maxLength={5}
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent uppercase"
          />
          <p className="text-xs text-slate-500 mt-1">Maksimal 5 karakter, akan ditampilkan di tabel klasemen</p>
        </div>

        {/* Colors */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Warna Utama</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={formData.primary_color}
                onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
              />
              <input
                type="text"
                value={formData.primary_color}
                onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white uppercase text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Warna Sekunder</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={formData.secondary_color}
                onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
              />
              <input
                type="text"
                value={formData.secondary_color}
                onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white uppercase text-sm"
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <p className="text-xs text-slate-400 mb-3 font-medium">PREVIEW</p>
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: formData.primary_color }}
            >
              {logoPreview ? (
                <img src={logoPreview} alt="" className="w-10 h-10 object-contain" />
              ) : (
                <svg className="w-7 h-7 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              )}
            </div>
            <div>
              <p className="text-white font-semibold">{formData.name || 'Nama Tim'}</p>
              <p className="text-slate-400 text-sm">{formData.short_name || 'ABC'}</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="w-6 h-6 rounded" style={{ backgroundColor: formData.primary_color }} title="Warna Utama"></div>
              <div className="w-6 h-6 rounded border border-slate-600" style={{ backgroundColor: formData.secondary_color }} title="Warna Sekunder"></div>
            </div>
          </div>
        </div>

        {/* Info for eFootball */}
        {selectedLeague?.type === 'efootball' && (
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
            <p className="text-purple-300 text-sm">
              Ini adalah liga eFootball. Setelah membuat tim, Anda bisa menambahkan gamer (pemain game) ke tim ini melalui menu Gamers.
            </p>
          </div>
        )}

        {/* Submit */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                {uploadProgress ? 'Mengupload Logo...' : 'Menyimpan...'}
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Simpan Tim
              </>
            )}
          </button>
          <Link
            href="/admin/teams"
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
          >
            Batal
          </Link>
        </div>
      </form>
    </div>
  );
}
