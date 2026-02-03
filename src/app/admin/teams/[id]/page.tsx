'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getLeagues, supabase, uploadTeamLogo } from '@/lib/supabase';

interface League {
  id: string;
  name: string;
  type: string;
}

interface Team {
  id: string;
  name: string;
  short_name: string | null;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  league_id: string;
}

export default function EditTeamPage() {
  const router = useRouter();
  const params = useParams();
  const teamId = params.id as string;

  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(false);

  const [formData, setFormData] = useState({
    league_id: '',
    name: '',
    short_name: '',
    primary_color: '#22c55e',
    secondary_color: '#ffffff',
  });

  const [originalLogoUrl, setOriginalLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [teamId]);

  async function loadData() {
    setLoading(true);
    try {
      // Load leagues
      const { data: leaguesData } = await getLeagues();
      if (leaguesData) {
        setLeagues(leaguesData as League[]);
      }

      // Load team
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single();

      if (teamError) throw teamError;

      if (team) {
        setFormData({
          league_id: team.league_id || '',
          name: team.name || '',
          short_name: team.short_name || '',
          primary_color: team.primary_color || '#22c55e',
          secondary_color: team.secondary_color || '#ffffff',
        });
        setOriginalLogoUrl(team.logo_url);
        if (team.logo_url) {
          setLogoPreview(team.logo_url);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data tim');
    } finally {
      setLoading(false);
    }
  }

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

  const handleRestoreLogo = () => {
    if (originalLogoUrl) {
      setLogoFile(null);
      setLogoPreview(originalLogoUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      if (!formData.league_id) {
        throw new Error('Pilih liga terlebih dahulu');
      }

      if (!formData.name.trim()) {
        throw new Error('Nama tim wajib diisi');
      }

      // Update team data
      const updateData: Record<string, string | null> = {
        league_id: formData.league_id,
        name: formData.name,
        short_name: formData.short_name || null,
        primary_color: formData.primary_color,
        secondary_color: formData.secondary_color,
      };

      // Handle logo changes
      if (logoFile) {
        // Upload new logo
        setUploadProgress(true);
        const { url: logoUrl, error: uploadError } = await uploadTeamLogo(logoFile, teamId);
        if (uploadError) {
          throw new Error('Gagal mengupload logo: ' + uploadError.message);
        }
        if (logoUrl) {
          updateData.logo_url = logoUrl;
        }
        setUploadProgress(false);
      } else if (!logoPreview && originalLogoUrl) {
        // Logo removed
        updateData.logo_url = null;
      }

      const { error: updateError } = await supabase
        .from('teams')
        .update(updateData)
        .eq('id', teamId);

      if (updateError) throw updateError;

      setSuccess('Tim berhasil diperbarui!');
      setOriginalLogoUrl(updateData.logo_url || null);

      // Redirect after short delay
      setTimeout(() => {
        router.push(`/admin/teams?league=${formData.league_id}`);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setSaving(false);
      setUploadProgress(false);
    }
  };

  const selectedLeague = leagues.find(l => l.id === formData.league_id);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/admin/teams?league=${formData.league_id}`}
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Edit Tim</h1>
            <p className="text-sm text-slate-400">Perbarui informasi tim</p>
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

        {success && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg flex items-center gap-2">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {success}
          </div>
        )}

        {/* League Select */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Liga *</label>
          <select
            required
            value={formData.league_id}
            onChange={(e) => setFormData({ ...formData, league_id: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <div className="flex flex-wrap gap-2">
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
                  {logoPreview ? 'Ganti Logo' : 'Upload Logo'}
                </label>
                {!logoPreview && originalLogoUrl && (
                  <button
                    type="button"
                    onClick={handleRestoreLogo}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Kembalikan Logo
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-2">Format: PNG, JPG, SVG, WebP</p>
              <p className="text-xs text-slate-500">Ukuran maksimal: 2MB</p>
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
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
          />
          <p className="text-xs text-slate-500 mt-1">Maksimal 5 karakter</p>
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
            <div>
              <p className="text-purple-300 text-sm">
                Ini adalah liga eFootball. Anda juga bisa mengelola gamer tim ini melalui menu Gamers.
              </p>
              <Link href={`/admin/gamers?team=${teamId}`} className="text-purple-400 hover:text-purple-300 text-sm mt-1 inline-flex items-center gap-1">
                Kelola Gamers
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                {uploadProgress ? 'Mengupload Logo...' : 'Menyimpan...'}
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Simpan Perubahan
              </>
            )}
          </button>
          <Link
            href={`/admin/teams?league=${formData.league_id}`}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
          >
            Batal
          </Link>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="bg-slate-900 rounded-lg p-6 border border-red-500/20">
        <h3 className="text-lg font-semibold text-red-400 mb-2">Zona Berbahaya</h3>
        <p className="text-slate-400 text-sm mb-4">
          Menghapus tim akan menghapus semua data terkait termasuk jadwal dan hasil pertandingan.
        </p>
        <button
          type="button"
          onClick={async () => {
            if (!confirm(`Yakin ingin menghapus tim "${formData.name}"? Tindakan ini tidak dapat dibatalkan.`)) return;

            const { error } = await supabase.from('teams').delete().eq('id', teamId);
            if (!error) {
              router.push(`/admin/teams?league=${formData.league_id}`);
            } else {
              setError('Gagal menghapus tim: ' + error.message);
            }
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Hapus Tim
        </button>
      </div>
    </div>
  );
}
