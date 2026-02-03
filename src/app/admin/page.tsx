'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getLeagues, getMatchesByLeague } from '@/lib/supabase';

interface Stats {
  totalLeagues: number;
  activeLeagues: number;
  totalMatches: number;
  completedMatches: number;
  upcomingMatches: number;
}

interface RecentMatch {
  id: string;
  home_team: { name: string; logo_url: string | null };
  away_team: { name: string; logo_url: string | null };
  home_score: number | null;
  away_score: number | null;
  status: string;
  match_date: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalLeagues: 0,
    activeLeagues: 0,
    totalMatches: 0,
    completedMatches: 0,
    upcomingMatches: 0,
  });
  const [recentMatches, setRecentMatches] = useState<RecentMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const { data: leagues } = await getLeagues();

        if (leagues) {
          const activeLeagues = leagues.filter(l => l.status === 'ongoing');

          let allMatches: RecentMatch[] = [];
          for (const league of leagues) {
            const { data: matches } = await getMatchesByLeague(league.id);
            if (matches) {
              allMatches = [...allMatches, ...matches as unknown as RecentMatch[]];
            }
          }

          const completed = allMatches.filter(m => m.status === 'completed');
          const upcoming = allMatches.filter(m => m.status === 'scheduled');

          setStats({
            totalLeagues: leagues.length,
            activeLeagues: activeLeagues.length,
            totalMatches: allMatches.length,
            completedMatches: completed.length,
            upcomingMatches: upcoming.length,
          });

          const sorted = allMatches
            .filter(m => m.match_date)
            .sort((a, b) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime())
            .slice(0, 5);
          setRecentMatches(sorted);
        }
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const statCards = [
    {
      title: 'Total Liga',
      value: stats.totalLeagues,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 4h2a2 2 0 012 2v2a4 4 0 01-4 4h-1m-6 0H8a4 4 0 01-4-4V6a2 2 0 012-2h2m8 0V3a1 1 0 00-1-1H9a1 1 0 00-1 1v1m8 0H8m4 16v-4m-4 4h8m-4-8a4 4 0 01-4-4V4h8v4a4 4 0 01-4 4z" />
        </svg>
      ),
      color: 'bg-blue-500/20 text-blue-400',
      href: '/admin/leagues'
    },
    {
      title: 'Liga Aktif',
      value: stats.activeLeagues,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: 'bg-green-500/20 text-green-400',
      href: '/admin/leagues'
    },
    {
      title: 'Total Pertandingan',
      value: stats.totalMatches,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L10 14v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
        </svg>
      ),
      color: 'bg-purple-500/20 text-purple-400',
      href: '/admin/matches'
    },
    {
      title: 'Selesai',
      value: stats.completedMatches,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-emerald-500/20 text-emerald-400',
      href: '/admin/matches'
    },
    {
      title: 'Akan Datang',
      value: stats.upcomingMatches,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'bg-orange-500/20 text-orange-400',
      href: '/admin/schedule'
    },
  ];

  const quickActions = [
    {
      title: 'Tambah Liga Baru',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      href: '/admin/leagues/new',
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      title: 'Tambah Tim',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
      href: '/admin/teams/new',
      color: 'bg-emerald-600 hover:bg-emerald-700'
    },
    {
      title: 'Input Hasil',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      href: '/admin/matches',
      color: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      title: 'Generate Jadwal',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      href: '/admin/schedule/generate',
      color: 'bg-orange-600 hover:bg-orange-700'
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400">Selamat datang di Admin Panel Liga</p>
        </div>
        <div className="text-sm text-slate-500">
          {new Date().toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((stat) => (
          <Link
            key={stat.title}
            href={stat.href}
            className="bg-slate-900 rounded-lg p-4 border border-slate-800 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`${stat.color} w-10 h-10 rounded-lg flex items-center justify-center`}>
                {stat.icon}
              </span>
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-sm text-slate-400">{stat.title}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
        <h2 className="text-lg font-semibold text-white mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className={`${action.color} text-white rounded-lg p-4 text-center transition-colors flex flex-col items-center gap-2`}
            >
              {action.icon}
              <span className="text-sm font-medium">{action.title}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Matches */}
      <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Pertandingan Terbaru</h2>
          <Link href="/admin/matches" className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
            Lihat Semua
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {recentMatches.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <svg className="w-12 h-12 mx-auto mb-2 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p>Belum ada pertandingan</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentMatches.map((match) => (
              <div
                key={match.id}
                className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center gap-2 flex-1 justify-end">
                    <span className="text-white text-sm font-medium text-right truncate">{match.home_team?.name || 'TBD'}</span>
                    <div className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center shrink-0">
                      {match.home_team?.logo_url ? (
                        <img src={match.home_team.logo_url} alt="" className="w-5 h-5 object-contain" />
                      ) : (
                        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      )}
                    </div>
                  </div>

                  <div className="px-3">
                    {match.status === 'completed' ? (
                      <span className="text-lg font-bold text-white">
                        {match.home_score} - {match.away_score}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded">
                        {match.match_date ? new Date(match.match_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : 'TBD'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center shrink-0">
                      {match.away_team?.logo_url ? (
                        <img src={match.away_team.logo_url} alt="" className="w-5 h-5 object-contain" />
                      ) : (
                        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      )}
                    </div>
                    <span className="text-white text-sm font-medium truncate">{match.away_team?.name || 'TBD'}</span>
                  </div>
                </div>

                <span className={`
                  ml-3 px-2 py-1 rounded text-xs font-medium
                  ${match.status === 'completed' ? 'bg-green-500/20 text-green-400' : 
                    match.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400' : 
                    'bg-slate-700 text-slate-400'}
                `}>
                  {match.status === 'completed' ? 'FT' :
                   match.status === 'scheduled' ? 'Soon' : match.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Getting Started Guide */}
      <div className="bg-gradient-to-r from-emerald-600/10 to-blue-600/10 rounded-lg p-6 border border-emerald-600/20">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <h2 className="text-lg font-semibold text-white">Panduan Memulai</h2>
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="flex items-start gap-3">
            <span className="bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
            <div>
              <p className="text-white font-medium text-sm">Buat Liga</p>
              <p className="text-xs text-slate-400">Tambahkan liga baru (Football/eFootball)</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
            <div>
              <p className="text-white font-medium text-sm">Tambah Tim</p>
              <p className="text-xs text-slate-400">Daftarkan tim dan logo mereka</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span>
            <div>
              <p className="text-white font-medium text-sm">Generate Jadwal</p>
              <p className="text-xs text-slate-400">Jadwal otomatis terbuat acak</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">4</span>
            <div>
              <p className="text-white font-medium text-sm">Input Hasil</p>
              <p className="text-xs text-slate-400">Klasemen update otomatis</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
