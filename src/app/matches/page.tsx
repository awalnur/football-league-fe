'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getLeagues, getMatchesByLeague, supabase } from '@/lib/supabase';

// SVG Icon Components
const Icons = {
  football: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L10 14v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
    </svg>
  ),
  clipboard: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  trophy: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 4h2a2 2 0 012 2v2a4 4 0 01-4 4h-1m-6 0H8a4 4 0 01-4-4V6a2 2 0 012-2h2m8 0V3a1 1 0 00-1-1H9a1 1 0 00-1 1v1m8 0H8m4 16v-4m-4 4h8m-4-8a4 4 0 01-4-4V4h8v4a4 4 0 01-4 4z" />
    </svg>
  ),
  calendar: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  users: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
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
  shield: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  chevronDown: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  ),
};

interface Screenshot {
  id: string;
  image_url: string;
  caption: string | null;
}

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

interface MatchDetail {
  screenshots: Screenshot[];
}

interface League {
  id: string;
  name: string;
  type: 'football' | 'efootball';
  season: string;
}

export default function MatchesPage() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'football' | 'efootball'>('football');
  const [filter, setFilter] = useState<'all' | 'completed' | 'upcoming'>('completed');
  const [loading, setLoading] = useState(true);
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);
  const [matchDetails, setMatchDetails] = useState<Record<string, MatchDetail>>({});
  const [loadingDetail, setLoadingDetail] = useState(false);

  async function loadLeagues() {
    const { data } = await getLeagues();
    if (data) {
      setLeagues(data as League[]);
      const firstLeague = data.find((l: League) => l.type === activeTab);
      if (firstLeague) {
        setSelectedLeague(firstLeague.id);
      } else if (data.length > 0) {
        setSelectedLeague(data[0].id);
        setActiveTab(data[0].type);
      }
    }
    setLoading(false);
  }

  async function loadMatches(leagueId: string) {
    setLoading(true);
    const { data } = await getMatchesByLeague(leagueId);
    if (data) {
      setMatches(data as unknown as Match[]);
    } else {
      setMatches([]);
    }
    setLoading(false);
  }

  async function loadMatchDetail(matchId: string) {
    if (matchDetails[matchId]) return; // Already loaded

    setLoadingDetail(true);

    // Load screenshots
    const { data: screenshots } = await supabase
      .from('match_screenshots')
      .select('id, image_url, caption')
      .eq('match_id', matchId)
      .order('created_at', { ascending: false });

    setMatchDetails(prev => ({
      ...prev,
      [matchId]: {
        screenshots: (screenshots as Screenshot[]) || [],
      }
    }));

    setLoadingDetail(false);
  }

  async function toggleMatchDetail(matchId: string) {
    if (expandedMatch === matchId) {
      setExpandedMatch(null);
    } else {
      setExpandedMatch(matchId);
      await loadMatchDetail(matchId);
    }
  }

  useEffect(() => {
    loadLeagues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedLeague) {
      loadMatches(selectedLeague);
      setExpandedMatch(null);
      setMatchDetails({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLeague]);

  const handleTabChange = (tab: 'football' | 'efootball') => {
    setActiveTab(tab);
    setExpandedMatch(null);
    const firstLeague = leagues.find(l => l.type === tab);
    if (firstLeague) {
      setSelectedLeague(firstLeague.id);
    }
  };

  const currentLeague = leagues.find(l => l.id === selectedLeague);
  const filteredLeagues = leagues.filter(l => l.type === activeTab);

  const filteredMatches = matches.filter(m => {
    if (filter === 'completed') return m.status === 'completed';
    if (filter === 'upcoming') return m.status === 'scheduled';
    return true;
  }).sort((a, b) => {
    if (!a.match_date) return 1;
    if (!b.match_date) return -1;
    return filter === 'upcoming'
      ? new Date(a.match_date).getTime() - new Date(b.match_date).getTime()
      : new Date(b.match_date).getTime() - new Date(a.match_date).getTime();
  });

  // Group matches by week
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
              <Link href="/schedule" className="px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">Jadwal</Link>
              <Link href="/teams" className="px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">Tim</Link>
              <Link href="/matches" className="px-3 py-1.5 text-sm text-white bg-slate-800 rounded-lg">Riwayat</Link>
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
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/20 text-orange-400">
              {Icons.clipboard}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Riwayat Pertandingan</h1>
              <p className="text-sm text-slate-400">Lihat hasil dan riwayat semua pertandingan</p>
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
            <select value={selectedLeague} onChange={(e) => setSelectedLeague(e.target.value)} className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500">
              {filteredLeagues.map((league) => (
                <option key={league.id} value={league.id}>{league.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Filter */}
        <div className="mb-6 flex gap-2">
          <button onClick={() => setFilter('completed')} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'completed' ? 'bg-green-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
            {Icons.check}
            <span>Hasil ({matches.filter(m => m.status === 'completed').length})</span>
          </button>
          <button onClick={() => setFilter('upcoming')} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'upcoming' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
            {Icons.calendar}
            <span>Akan Datang ({matches.filter(m => m.status === 'scheduled').length})</span>
          </button>
          <button onClick={() => setFilter('all')} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'all' ? 'bg-slate-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
            Semua ({matches.length})
          </button>
        </div>

        {/* Matches */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="bg-slate-800/50 rounded-lg p-10 text-center border border-slate-700">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-700/50 text-slate-400 mx-auto mb-4">
              {filter === 'completed' ? Icons.clipboard : filter === 'upcoming' ? Icons.calendar : Icons.football}
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">
              {filter === 'completed' ? 'Belum Ada Hasil Pertandingan' :
               filter === 'upcoming' ? 'Tidak Ada Pertandingan Mendatang' :
               'Belum Ada Pertandingan'}
            </h2>
            <p className="text-sm text-slate-400">{leagues.length === 0 ? 'Belum ada liga yang dibuat' : 'Liga ini belum memiliki pertandingan.'}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedMatches).sort(([a], [b]) => Number(b) - Number(a)).map(([week, weekMatches]) => {
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
                      <div className="flex h-7 w-7 items-center justify-center rounded bg-orange-500/20 text-orange-400">
                        {Icons.clipboard}
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
                      const isCompleted = match.status === 'completed';
                      const homeWin = isCompleted && match.home_score! > match.away_score!;
                      const awayWin = isCompleted && match.away_score! > match.home_score!;
                      const isDraw = isCompleted && match.home_score === match.away_score;
                      const isExpanded = expandedMatch === match.id;
                      const detail = matchDetails[match.id];

                      return (
                        <div key={match.id} className="overflow-hidden">
                          {/* Match Row - Clickable */}
                          <button
                            onClick={() => toggleMatchDetail(match.id)}
                            className="w-full p-3 hover:bg-slate-700/30 transition-colors text-left"
                          >
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
                                    <span className={`text-sm font-medium text-right truncate max-w-[100px] sm:max-w-[150px] ${homeWin ? 'text-green-400' : awayWin ? 'text-red-400' : 'text-white'}`}>
                                      {match.home_team?.name}
                                      {homeWin && <span className="ml-1">🏆</span>}
                                    </span>
                                    <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${homeWin ? 'bg-green-500/20' : awayWin ? 'bg-red-500/20' : 'bg-slate-700'}`}>
                                      {match.home_team?.logo_url ? <img src={match.home_team.logo_url} alt="" className="w-6 h-6 object-contain" /> : <span className="text-slate-400">{Icons.home}</span>}
                                    </div>
                                  </div>

                                  {/* Score */}
                                  <div className="min-w-[90px] text-center">
                                    {match.status === 'completed' ? (
                                      <div className={`rounded px-3 py-1.5 ${isDraw ? 'bg-yellow-600/20 border border-yellow-600/30' : 'bg-green-600/20 border border-green-600/30'}`}>
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
                                    <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${awayWin ? 'bg-green-500/20' : homeWin ? 'bg-red-500/20' : 'bg-slate-700'}`}>
                                      {match.away_team?.logo_url ? <img src={match.away_team.logo_url} alt="" className="w-6 h-6 object-contain" /> : <span className="text-slate-400">{Icons.plane}</span>}
                                    </div>
                                    <span className={`text-sm font-medium truncate max-w-[100px] sm:max-w-[150px] ${awayWin ? 'text-green-400' : homeWin ? 'text-red-400' : 'text-white'}`}>
                                      {awayWin && <span className="mr-1">🏆</span>}
                                      {match.away_team?.name}
                                    </span>
                                  </div>
                                </div>

                                {/* Status & Expand */}
                                <div className="flex items-center gap-2 ml-2">
                                  <span className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${
                                    match.status === 'completed' ? 'bg-green-600/20 text-green-400' :
                                    match.status === 'scheduled' ? 'bg-blue-600/20 text-blue-400' :
                                    'bg-slate-600/20 text-slate-400'
                                  }`}>
                                    {match.status === 'completed' ? Icons.check : Icons.clock}
                                    <span className="hidden sm:inline">{match.status === 'completed' ? 'Selesai' : 'Terjadwal'}</span>
                                  </span>
                                  <div className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                                    {Icons.chevronDown}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </button>

                          {/* Expanded Detail */}
                          {isExpanded && (
                            <div className="border-t border-slate-700 bg-slate-900/30 p-4">
                              {loadingDetail && !detail ? (
                                <div className="flex items-center justify-center py-4">
                                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  {/* Match Detail Header */}
                                  <div className="flex items-center justify-center gap-6">
                                    {/* Home Team */}
                                    <div className="flex flex-col items-center gap-2">
                                      <div className="w-14 h-14 rounded-lg bg-slate-700 flex items-center justify-center">
                                        {match.home_team?.logo_url ? (
                                          <img src={match.home_team.logo_url} alt="" className="w-10 h-10 object-contain" />
                                        ) : (
                                          <span className="text-slate-400">{Icons.shield}</span>
                                        )}
                                      </div>
                                      <span className="text-xs text-white font-medium text-center max-w-[100px] truncate">{match.home_team?.name}</span>
                                    </div>

                                    {/* Score */}
                                    <div className="text-center">
                                      <div className={`text-3xl font-bold ${
                                        isDraw ? 'text-yellow-400' : 'text-white'
                                      }`}>
                                        {match.home_score ?? 0} - {match.away_score ?? 0}
                                      </div>
                                      <p className="text-xs text-slate-400 mt-1">
                                        {matchDate ? matchDate.toLocaleDateString('id-ID', {
                                          weekday: 'long',
                                          day: 'numeric',
                                          month: 'long',
                                          year: 'numeric'
                                        }) : '-'}
                                      </p>
                                      {/* Result Badge */}
                                      <div className="mt-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                          homeWin ? 'bg-green-500/20 text-green-400' :
                                          awayWin ? 'bg-green-500/20 text-green-400' :
                                          isDraw ? 'bg-yellow-500/20 text-yellow-400' :
                                          'bg-slate-600 text-slate-300'
                                        }`}>
                                          {homeWin ? `🏆 ${match.home_team?.name} Menang` :
                                           awayWin ? `🏆 ${match.away_team?.name} Menang` :
                                           isDraw ? '🤝 Hasil Seri' : 'Belum Selesai'}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Away Team */}
                                    <div className="flex flex-col items-center gap-2">
                                      <div className="w-14 h-14 rounded-lg bg-slate-700 flex items-center justify-center">
                                        {match.away_team?.logo_url ? (
                                          <img src={match.away_team.logo_url} alt="" className="w-10 h-10 object-contain" />
                                        ) : (
                                          <span className="text-slate-400">{Icons.shield}</span>
                                        )}
                                      </div>
                                      <span className="text-xs text-white font-medium text-center max-w-[100px] truncate">{match.away_team?.name}</span>
                                    </div>
                                  </div>

                                  {/* League Info */}
                                  <div className="flex justify-center">
                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                      <span className={`px-2 py-0.5 rounded ${currentLeague?.type === 'efootball' ? 'bg-purple-500/20 text-purple-400' : 'bg-green-500/20 text-green-400'}`}>
                                        {currentLeague?.type === 'efootball' ? 'eFootball' : 'Football'}
                                      </span>
                                      <span>{currentLeague?.name}</span>
                                      <span>•</span>
                                      <span>Pekan {match.match_week}</span>
                                    </div>
                                  </div>

                                  {/* Screenshots */}
                                  {detail && detail.screenshots.length > 0 && (
                                    <div className="space-y-2">
                                      <p className="text-xs text-slate-400 flex items-center gap-1">
                                        <span className="text-purple-400">{Icons.gamepad}</span>
                                        Screenshot Hasil Pertandingan
                                      </p>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {detail.screenshots.map(screenshot => (
                                          <div key={screenshot.id} className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
                                            <img src={screenshot.image_url} alt={screenshot.caption || 'Match Screenshot'} className="w-full h-auto object-cover" />
                                            {screenshot.caption && (
                                              <div className="p-2 border-t border-slate-700">
                                                <p className="text-xs text-slate-400">{screenshot.caption}</p>
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* No Screenshots Message */}
                                  {detail && detail.screenshots.length === 0 && (
                                    <div className="text-center py-4 text-slate-500 text-sm">
                                      Tidak ada screenshot untuk pertandingan ini
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
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
              <p className="text-2xl font-bold text-yellow-400">
                {matches.filter(m => m.status === 'completed' && m.home_score === m.away_score).length}
              </p>
              <p className="text-xs text-slate-400">Hasil Seri</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 text-center">
              <p className="text-2xl font-bold text-purple-400">
                {matches.filter(m => m.status === 'completed').reduce((acc, m) => acc + (m.home_score || 0) + (m.away_score || 0), 0)}
              </p>
              <p className="text-xs text-slate-400">Total Gol</p>
            </div>
          </div>
        )}
      </div>

      <footer className="mt-12 border-t border-slate-800 py-6">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-slate-500">
          <p className="mb-3">© 2026 Football Leagues. Riwayat diperbarui secara real-time.</p>
          <Link href="/login" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors">
            {Icons.lock}
            <span>Admin Panel</span>
          </Link>
        </div>
      </footer>
    </div>
  );
}
