'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getLeagues, getMatchesByLeague } from '@/lib/supabase';

// SVG Icon Components
const Icons = {
  football: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L10 14v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
    </svg>
  ),
  calendar: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  trophy: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 4h2a2 2 0 012 2v2a4 4 0 01-4 4h-1m-6 0H8a4 4 0 01-4-4V6a2 2 0 012-2h2m8 0V3a1 1 0 00-1-1H9a1 1 0 00-1 1v1m8 0H8m4 16v-4m-4 4h8m-4-8a4 4 0 01-4-4V4h8v4a4 4 0 01-4 4z" />
    </svg>
  ),
  users: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  clipboard: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  lock: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  gamepad: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
    </svg>
  ),
  arrowLeft: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  ),
  check: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  clock: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  home: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  plane: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  ),
};

interface Match {
  id: string;
  match_week: number;
  match_date: string | null;
  status: string;
  home_score: number | null;
  away_score: number | null;
  home_team: { id: string; name: string; logo_url: string | null };
  away_team: { id: string; name: string; logo_url: string | null };
}

interface League {
  id: string;
  name: string;
  type: 'football' | 'efootball';
  season: string;
}

export default function SchedulePage() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'football' | 'efootball'>('football');
  const [selectedWeek, setSelectedWeek] = useState<number | 'all'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);

      // Load leagues first
      const { data: leaguesData } = await getLeagues();
      if (!isMounted) return;

      if (leaguesData) {
        setLeagues(leaguesData as League[]);
        const firstLeague = leaguesData.find((l: League) => l.type === activeTab);
        let leagueToLoad = '';

        if (firstLeague) {
          leagueToLoad = firstLeague.id;
          setSelectedLeague(firstLeague.id);
        } else if (leaguesData.length > 0) {
          leagueToLoad = leaguesData[0].id;
          setSelectedLeague(leaguesData[0].id);
          setActiveTab(leaguesData[0].type);
        }

        // Load matches for the selected league
        if (leagueToLoad) {
          const { data: matchesData } = await getMatchesByLeague(leagueToLoad);
          if (isMounted && matchesData) {
            setMatches(matchesData as unknown as Match[]);
          }
        }
      }

      if (isMounted) setLoading(false);
    }

    loadData();
    return () => { isMounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadMatchesForLeague() {
      if (!selectedLeague) return;

      setLoading(true);
      const { data } = await getMatchesByLeague(selectedLeague);
      if (isMounted) {
        if (data) {
          setMatches(data as unknown as Match[]);
        } else {
          setMatches([]);
        }
        setLoading(false);
      }
    }

    // Only load if selectedLeague is set and leagues are already loaded
    if (selectedLeague && leagues.length > 0) {
      loadMatchesForLeague();
    }

    return () => { isMounted = false; };
  }, [selectedLeague, leagues.length]);

  const handleTabChange = (tab: 'football' | 'efootball') => {
    setActiveTab(tab);
    const firstLeague = leagues.find(l => l.type === tab);
    if (firstLeague) {
      setSelectedLeague(firstLeague.id);
    }
  };

  const filteredLeagues = leagues.filter(l => l.type === activeTab);
  const matchWeeks = [...new Set(matches.map(m => m.match_week))].sort((a, b) => a - b);

  const filteredMatches = selectedWeek === 'all'
    ? matches
    : matches.filter(m => m.match_week === selectedWeek);

  const groupedMatches = filteredMatches.reduce((acc, match) => {
    const week = match.match_week;
    if (!acc[week]) acc[week] = [];
    acc[week].push(match);
    return acc;
  }, {} as Record<number, Match[]>);

  return (
    <div className="min-h-screen bg-geometric">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                  {Icons.football}
                </div>
                <span className="font-bold text-white">Football Leagues</span>
              </Link>
            </div>
            <div className="hidden md:flex items-center gap-1">
              <Link href="/standings" className="px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">Klasemen</Link>
              <Link href="/schedule" className="px-3 py-1.5 text-sm text-white bg-slate-800 rounded-lg">Jadwal</Link>
              <Link href="/teams" className="px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">Tim</Link>
              <Link href="/matches" className="px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">Riwayat</Link>
            </div>
            <Link href="/login" className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 transition-colors">
              {Icons.lock}
              <span className="hidden sm:inline">Admin</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
              {Icons.calendar}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Jadwal Pertandingan</h1>
              <p className="text-sm text-slate-400">Lihat jadwal lengkap pertandingan liga</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex rounded-lg bg-slate-800 p-1">
            <button onClick={() => handleTabChange('football')} className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${activeTab === 'football' ? 'bg-green-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>
              {Icons.football}
              <span>Football</span>
            </button>
            <button onClick={() => handleTabChange('efootball')} className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${activeTab === 'efootball' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>
              {Icons.gamepad}
              <span>eFootball</span>
            </button>
          </div>
          <div className="flex gap-3">
            <select value={selectedLeague} onChange={(e) => setSelectedLeague(e.target.value)} className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              {filteredLeagues.map((league) => (
                <option key={league.id} value={league.id}>{league.name}</option>
              ))}
            </select>
            <select value={selectedWeek} onChange={(e) => setSelectedWeek(e.target.value === 'all' ? 'all' : Number(e.target.value))} className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">Semua Pekan</option>
              {matchWeeks.map((week) => (
                <option key={week} value={week}>Pekan {week}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Schedule */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        ) : matches.length === 0 ? (
          <div className="bg-slate-800/50 rounded-lg p-10 text-center border border-slate-700">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-700/50 text-slate-400 mx-auto mb-4">
              {Icons.calendar}
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">Belum Ada Jadwal</h2>
            <p className="text-sm text-slate-400">{leagues.length === 0 ? 'Belum ada liga yang dibuat' : 'Liga ini belum memiliki jadwal pertandingan.'}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedMatches).sort(([a], [b]) => Number(a) - Number(b)).map(([week, weekMatches]) => {
              // Get date range for this week
              const matchDates = weekMatches
                .filter(m => m.match_date)
                .map(m => new Date(m.match_date!))
                .sort((a, b) => a.getTime() - b.getTime());

              const dateRangeText = matchDates.length > 0
                ? matchDates.length === 1
                  ? matchDates[0].toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                  : `${matchDates[0].toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - ${matchDates[matchDates.length - 1].toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`
                : null;

              return (
              <div key={week} className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
                <div className="bg-slate-900/50 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded bg-blue-500/20 text-blue-400">
                      {Icons.calendar}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">Pekan {week}</h3>
                      {dateRangeText && (
                        <p className="text-xs text-slate-400">{dateRangeText}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded">{weekMatches.length} pertandingan</span>
                </div>
                <div className="divide-y divide-slate-700/50">
                  {weekMatches.map((match) => {
                    const matchDate = match.match_date ? new Date(match.match_date) : null;
                    return (
                    <div key={match.id} className="p-3 hover:bg-slate-700/30 transition-colors">
                      <div className="flex items-center gap-3">
                        {/* Date Column */}
                        <div className="hidden sm:flex flex-col items-center justify-center min-w-[60px] text-center">
                          {matchDate ? (
                            <>
                              <span className="text-xs text-slate-400 uppercase">{matchDate.toLocaleDateString('id-ID', { weekday: 'short' })}</span>
                              <span className="text-lg font-bold text-white">{matchDate.getDate()}</span>
                              <span className="text-xs text-slate-400">{matchDate.toLocaleDateString('id-ID', { month: 'short' })}</span>
                            </>
                          ) : (
                            <span className="text-xs text-slate-500">TBD</span>
                          )}
                        </div>

                        <div className="hidden sm:block w-px h-10 bg-slate-700"></div>

                        <div className="flex items-center justify-between flex-1">
                          <div className="flex items-center gap-3 flex-1">
                            {/* Home Team */}
                            <div className="flex items-center gap-2 flex-1 justify-end">
                              <span className="text-sm text-white font-medium text-right truncate max-w-[100px] sm:max-w-[150px]">{match.home_team?.name}</span>
                              <div className="w-8 h-8 rounded bg-slate-700 flex items-center justify-center flex-shrink-0">
                                {match.home_team?.logo_url ? <img src={match.home_team.logo_url} alt="" className="w-6 h-6 object-contain" /> : <span className="text-slate-400">{Icons.home}</span>}
                              </div>
                            </div>

                            {/* Score */}
                            <div className="min-w-[90px] text-center">
                              {match.status === 'completed' ? (
                                <div className="bg-green-600/20 border border-green-600/30 rounded px-3 py-1.5">
                                  <span className="text-lg font-bold text-white">{match.home_score} - {match.away_score}</span>
                                </div>
                              ) : (
                                <div className="bg-slate-700/50 rounded px-3 py-1.5">
                                  <span className="text-xs text-slate-300">
                                    {matchDate ? matchDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : 'TBD'}
                                  </span>
                                  <span className="sm:hidden block text-xs text-slate-400 mt-0.5">
                                    {matchDate ? matchDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : ''}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Away Team */}
                            <div className="flex items-center gap-2 flex-1">
                              <div className="w-8 h-8 rounded bg-slate-700 flex items-center justify-center flex-shrink-0">
                                {match.away_team?.logo_url ? <img src={match.away_team.logo_url} alt="" className="w-6 h-6 object-contain" /> : <span className="text-slate-400">{Icons.plane}</span>}
                              </div>
                              <span className="text-sm text-white font-medium truncate max-w-[100px] sm:max-w-[150px]">{match.away_team?.name}</span>
                            </div>
                          </div>

                          <span className={`ml-3 px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${
                            match.status === 'completed' ? 'bg-green-600/20 text-green-400' :
                            match.status === 'scheduled' ? 'bg-blue-600/20 text-blue-400' :
                            'bg-slate-600/20 text-slate-400'
                          }`}>
                            {match.status === 'completed' ? Icons.check : Icons.clock}
                            <span className="hidden sm:inline">{match.status === 'completed' ? 'Selesai' : match.status === 'scheduled' ? 'Terjadwal' : match.status}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
              );
            })}
          </div>
        )}

        {/* Quick Stats */}
        {matches.length > 0 && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 text-center">
              <p className="text-2xl font-bold text-white">{matches.length}</p>
              <p className="text-xs text-slate-400">Total Pertandingan</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 text-center">
              <p className="text-2xl font-bold text-green-400">{matches.filter(m => m.status === 'completed').length}</p>
              <p className="text-xs text-slate-400">Selesai</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 text-center">
              <p className="text-2xl font-bold text-blue-400">{matches.filter(m => m.status === 'scheduled').length}</p>
              <p className="text-xs text-slate-400">Akan Datang</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 text-center">
              <p className="text-2xl font-bold text-purple-400">{matchWeeks.length}</p>
              <p className="text-xs text-slate-400">Total Pekan</p>
            </div>
          </div>
        )}
      </div>

      <footer className="mt-12 border-t border-slate-800 py-6">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-slate-500">
          <p className="mb-3">© 2026 Football Leagues. Jadwal diperbarui secara real-time.</p>
          <Link href="/login" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors">
            {Icons.lock}
            <span>Admin Panel</span>
          </Link>
        </div>
      </footer>
    </div>
  );
}
