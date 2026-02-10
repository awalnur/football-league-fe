'use client';

import Image from 'next/image';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getLeagueById, getStandingsWithZones, getMatchesByLeague, getCupGroupsWithStandings, supabase } from '@/lib/supabase';
import { League, StandingWithTeam, LeagueZone, CupGroupWithStandings, MatchWithTeams } from '@/types/supabase';
import StandingsTableWithZones from '@/components/StandingsTableWithZones';
import EnhancedCupGroupStandings from '@/components/EnhancedCupGroupStandings';
import TournamentBracket from '@/components/TournamentBracket';

type Screenshot = {
  id: string;
  image_url: string;
  caption: string | null;
};

type Match = {
  id: string;
  match_date: string;
  match_week?: number;
  status: string;
  home_score?: number;
  away_score?: number;
  home_team: {
    name: string;
    logo_url?: string;
  };
  away_team: {
    name: string;
    logo_url?: string;
  };
  cup_stage?: string;
};

export default function LeagueDetailPage() {
  const params = useParams();
  const leagueId = params.id as string;

  const [league, setLeague] = useState<League | null>(null);
  const [standings, setStandings] = useState<StandingWithTeam[]>([]);
  const [zones, setZones] = useState<LeagueZone[]>([]);
  const [cupGroups, setCupGroups] = useState<CupGroupWithStandings[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [knockoutMatches, setKnockoutMatches] = useState<MatchWithTeams[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'standings' | 'matches' | 'bracket'>('overview');
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);
  const [matchDetails, setMatchDetails] = useState<Record<string, { screenshots: Screenshot[] }>>({});
  const [loadingDetail, setLoadingDetail] = useState(false);

  const loadLeagueData = useCallback(async () => {
    setLoading(true);
    try {
      // Load league info
      const { data: leagueData } = await getLeagueById(leagueId);
      if (leagueData) {
        setLeague(leagueData);

        // Load standings or cup groups based on format
        if (leagueData.tournament_format === 'cup' && leagueData.has_group_stage) {
          const { data: groupsData } = await getCupGroupsWithStandings(leagueId);
          setCupGroups(groupsData || []);
        } else if (leagueData.tournament_format === 'league' || leagueData.tournament_format === 'league_cup') {
          const { data: standingsData } = await getStandingsWithZones(leagueId);
          if (standingsData) {
            // Separate standings and zones
            setStandings(standingsData);
            // Extract unique zones from standings
            const uniqueZones: LeagueZone[] = [];
            standingsData.forEach((s: StandingWithTeam & { zone?: LeagueZone }) => {
              if (s.zone && !uniqueZones.find(z => z.id === s.zone!.id)) {
                uniqueZones.push(s.zone);
              }
            });
            setZones(uniqueZones);
          }
        }

        // Load matches
        const { data: matchesData } = await getMatchesByLeague(leagueId);
        setMatches(matchesData || []);

        // Filter knockout matches
        const knockout = (matchesData || []).filter((m: MatchWithTeams) =>
          m.cup_stage && m.cup_stage !== 'group_stage'
        );
        setKnockoutMatches(knockout);
      }
    } catch (err) {
      console.error('Failed to load league data:', err);
    } finally {
      setLoading(false);
    }
  }, [leagueId]);

  const loadMatchDetail = useCallback(async (matchId: string) => {
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
  }, [matchDetails]);

  const toggleMatchDetail = useCallback(async (matchId: string) => {
    if (expandedMatch === matchId) {
      setExpandedMatch(null);
    } else {
      setExpandedMatch(matchId);
      await loadMatchDetail(matchId);
    }
  }, [expandedMatch, loadMatchDetail]);

  useEffect(() => {
    if (leagueId) {
      loadLeagueData();
    }
  }, [leagueId, loadLeagueData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!league) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Turnamen Tidak Ditemukan</h1>
          <Link href="/" className="text-blue-400 hover:text-blue-300">
            ← Kembali ke Home
          </Link>
        </div>
      </div>
    );
  }

  const isCupFormat = league.tournament_format === 'cup' || league.tournament_format === 'league_cup';
  const hasGroupStage = league.has_group_stage;
  const upcomingMatches = matches.filter(m => m.status === 'scheduled').slice(0, 5);
  const recentMatches = matches.filter(m => m.status === 'completed').slice(0, 5);

  return (
    <div className="min-h-screen bg-geometric relative">
      {/* Animated Background Elements - SAMA SEPERTI KLASEMEN */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-20 -left-32 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -right-32 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-amber-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-blue-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50"></div>
      </div>

      {/* Navigation - SAMA SEPERTI KLASEMEN */}
      <nav className="sticky top-0 z-50 border-b border-slate-800/50 bg-slate-950/90 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25 transition-transform group-hover:scale-105">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L10 14v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                  </svg>
                </div>
                <span className="font-bold text-white">Football Leagues</span>
              </Link>
            </div>
            <div className="hidden md:flex items-center gap-1">
              <Link href="/standings" className="px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800/80 rounded transition-colors">Klasemen</Link>
              <Link href="/schedule" className="px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800/80 rounded transition-colors">Jadwal</Link>
              <Link href="/teams" className="px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800/80 rounded transition-colors">Tim</Link>
              <Link href="/matches" className="px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800/80 rounded transition-colors">Riwayat</Link>
            </div>
            <Link href="/login" className="flex items-center gap-1.5 rounded bg-slate-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="hidden sm:inline">Admin</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        {/* Header Section - SAMA SEPERTI KLASEMEN */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-xl shadow-amber-500/30">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 4h2a2 2 0 012 2v2a4 4 0 01-4 4h-1m-6 0H8a4 4 0 01-4-4V6a2 2 0 012-2h2m8 0V3a1 1 0 00-1-1H9a1 1 0 00-1 1v1m8 0H8m4 16v-4m-4 4h8m-4-8a4 4 0 01-4-4V4h8v4a4 4 0 01-4 4z" />
                  </svg>
                </div>
                <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse"></div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Link href="/" className="text-slate-400 hover:text-white text-sm">← Kembali</Link>
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">{league.name}</h1>
                <p className="text-sm text-slate-400 mt-0.5">Musim {league.season}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation - SAMA SEPERTI KLASEMEN */}
        <div className="mb-6">
          <div className="flex rounded bg-slate-800/70 border border-slate-700/50 p-1 backdrop-blur-sm overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 rounded px-4 py-2 text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('standings')}
              className={`flex items-center gap-2 rounded px-4 py-2 text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'standings'
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <span>{isCupFormat && hasGroupStage ? 'Groups' : 'Klasemen'}</span>
            </button>

            <button
              onClick={() => setActiveTab('matches')}
              className={`flex items-center gap-2 rounded px-4 py-2 text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'matches'
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <span>Pertandingan</span>
            </button>

            {isCupFormat && (
              <button
                onClick={() => setActiveTab('bracket')}
                className={`flex items-center gap-2 rounded px-4 py-2 text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === 'bracket'
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <span>Bracket</span>
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="rounded-lg bg-slate-900 border border-slate-800 p-4 text-center">
                  <p className="text-2xl font-bold text-white mb-1">{matches.length}</p>
                  <p className="text-xs text-slate-500">Total Pertandingan</p>
                </div>
                <div className="rounded-lg bg-slate-900 border border-slate-800 p-4 text-center">
                  <p className="text-2xl font-bold text-emerald-400 mb-1">
                    {matches.filter(m => m.status === 'completed').length}
                  </p>
                  <p className="text-xs text-slate-500">Selesai</p>
                </div>
                <div className="rounded-lg bg-slate-900 border border-slate-800 p-4 text-center">
                  <p className="text-2xl font-bold text-blue-400 mb-1">
                    {matches.filter(m => m.status === 'scheduled').length}
                  </p>
                  <p className="text-xs text-slate-500">Akan Datang</p>
                </div>
                <div className="rounded-lg bg-slate-900 border border-slate-800 p-4 text-center">
                  <p className="text-2xl font-bold text-purple-400 mb-1">
                    {standings.length || cupGroups.reduce((acc, g) => acc + g.standings.length, 0)}
                  </p>
                  <p className="text-xs text-slate-500">Total Tim</p>
                </div>
              </div>

              {/* Recent & Upcoming Matches */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Recent Matches */}
                <div className="rounded-lg bg-slate-900 border border-slate-800 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-800">
                    <h3 className="text-white font-semibold">Hasil Terbaru</h3>
                  </div>
                  <div className="p-4">
                    {recentMatches.length === 0 ? (
                      <p className="text-slate-500 text-center py-8 text-sm">Belum ada hasil</p>
                    ) : (
                      <div className="space-y-3">
                        {recentMatches.map(match => (
                          <div key={match.id} className="rounded bg-slate-800/50 p-3">
                            <div className="flex items-center justify-between mb-2 text-xs text-slate-500">
                              <span>
                                {new Date(match.match_date).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short'
                                })}
                              </span>
                              {match.cup_stage && (
                                <span className="text-purple-400">{match.cup_stage}</span>
                              )}
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                {match.home_team.logo_url && (
                                  <Image src={match.home_team.logo_url} className="w-5 h-5 object-contain flex-shrink-0" alt=""  width={20} height={20} />
                                )}
                                <span className="text-white truncate">{match.home_team.name}</span>
                              </div>
                              <div className="px-3 py-1 bg-slate-900 rounded font-bold text-white mx-2">
                                {match.home_score} - {match.away_score}
                              </div>
                              <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                                <span className="text-white truncate text-right">{match.away_team.name}</span>
                                {match.away_team.logo_url && (
                                  <Image src={match.away_team.logo_url} className="w-5 h-5 object-contain flex-shrink-0" alt=""  width={20} height={20} />
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Upcoming Matches */}
                <div className="rounded-lg bg-slate-900 border border-slate-800 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-800">
                    <h3 className="text-white font-semibold">Pertandingan Mendatang</h3>
                  </div>
                  <div className="p-4">
                    {upcomingMatches.length === 0 ? (
                      <p className="text-slate-500 text-center py-8 text-sm">Belum ada jadwal</p>
                    ) : (
                      <div className="space-y-3">
                        {upcomingMatches.map(match => (
                          <div key={match.id} className="rounded bg-slate-800/50 p-3">
                            <div className="flex items-center justify-between mb-2 text-xs text-slate-500">
                              <span>
                                {new Date(match.match_date).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                              {match.cup_stage && (
                                <span className="text-purple-400">{match.cup_stage}</span>
                              )}
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                {match.home_team.logo_url && (
                                  <Image src={match.home_team.logo_url} className="w-5 h-5 object-contain flex-shrink-0" alt=""  width={20} height={20} />
                                )}
                                <span className="text-white truncate">{match.home_team.name}</span>
                              </div>
                              <div className="px-3 py-1 text-slate-500 text-xs mx-2">
                                VS
                              </div>
                              <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                                <span className="text-white truncate text-right">{match.away_team.name}</span>
                                {match.away_team.logo_url && (
                                  <Image src={match.away_team.logo_url} className="w-5 h-5 object-contain flex-shrink-0" alt=""  width={20} height={20} />
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Standings Tab */}
          {activeTab === 'standings' && (
            <div>
              {isCupFormat && hasGroupStage ? (
                <EnhancedCupGroupStandings groups={cupGroups} leagueType={league.type} />
              ) : (
                <StandingsTableWithZones standings={standings} zones={zones} leagueType={league.type} />
              )}
            </div>
          )}

          {/* Matches Tab */}
          {activeTab === 'matches' && (
            <div>
              {matches.length === 0 ? (
                <div className="bg-slate-800/50 rounded-lg p-10 text-center border border-slate-700">
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-700/50 text-slate-400 mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-white mb-2">Belum Ada Pertandingan</h2>
                  <p className="text-sm text-slate-400">Liga ini belum memiliki pertandingan.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Group matches by week */}
                  {(() => {
                    const groupedMatches = matches.reduce((acc, match) => {
                      const week = match.match_week || 0;
                      if (!acc[week]) acc[week] = [];
                      acc[week].push(match);
                      return acc;
                    }, {} as Record<number, typeof matches>);

                    return Object.entries(groupedMatches)
                      .sort(([a], [b]) => Number(b) - Number(a))
                      .map(([week, weekMatches]) => {
                        const matchDates = weekMatches
                          .filter(m => m.match_date)
                          .map(m => new Date(m.match_date))
                          .sort((a, b) => a.getTime() - b.getTime());

                        const dateRangeText = matchDates.length > 0
                          ? matchDates.length === 1
                            ? matchDates[0].toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                            : `${matchDates[0].toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - ${matchDates[matchDates.length - 1].toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`
                          : null;

                        return (
                          <div key={week} className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
                            {/* Week Header */}
                            <div className="bg-slate-900/50 px-4 py-3 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="flex h-7 w-7 items-center justify-center rounded bg-indigo-500/20 text-indigo-400">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                  </svg>
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

                            {/* Matches List */}
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
                                      onClick={() => isCompleted && toggleMatchDetail(match.id)}
                                      disabled={!isCompleted}
                                      className={`w-full p-3 transition-colors text-left ${
                                        isCompleted ? 'hover:bg-slate-700/30 cursor-pointer' : 'cursor-default'
                                      }`}
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
                                                {match.home_team?.logo_url ? (
                                                  <Image src={match.home_team.logo_url} alt="" className="w-6 h-6 object-contain"  width={24} height={24} />
                                                ) : (
                                                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                                  </svg>
                                                )}
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
                                                {match.away_team?.logo_url ? (
                                                  <Image src={match.away_team.logo_url} alt="" className="w-6 h-6 object-contain"  width={24} height={24} />
                                                ) : (
                                                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                                  </svg>
                                                )}
                                              </div>
                                              <span className={`text-sm font-medium truncate max-w-[100px] sm:max-w-[150px] ${awayWin ? 'text-green-400' : homeWin ? 'text-red-400' : 'text-white'}`}>
                                                {awayWin && <span className="mr-1">🏆</span>}
                                                {match.away_team?.name}
                                              </span>
                                            </div>
                                          </div>

                                          {/* Status & Expand */}
                                          <div className="flex items-center gap-2 ml-2">
                                            {match.cup_stage && (
                                              <span className="px-2 py-1 rounded text-xs bg-purple-500/20 text-purple-400">
                                                {match.cup_stage}
                                              </span>
                                            )}
                                            <span className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${
                                              match.status === 'completed' ? 'bg-green-600/20 text-green-400' :
                                              match.status === 'scheduled' ? 'bg-blue-600/20 text-blue-400' :
                                              'bg-slate-600/20 text-slate-400'
                                            }`}>
                                              {match.status === 'completed' ? (
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                              ) : (
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                              )}
                                              <span className="hidden sm:inline">{match.status === 'completed' ? 'Selesai' : 'Terjadwal'}</span>
                                            </span>
                                            {isCompleted && (
                                              <div className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                                </svg>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </button>

                                    {/* Expanded Detail */}
                                    {isExpanded && (
                                      <div className="border-t border-slate-700 bg-slate-900/30 p-4">
                                        {loadingDetail && !detail ? (
                                          <div className="flex items-center justify-center py-4">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
                                          </div>
                                        ) : (
                                          <div className="space-y-4">
                                            {/* Match Detail Header */}
                                            <div className="flex items-center justify-center gap-6">
                                              {/* Home Team */}
                                              <div className="flex flex-col items-center gap-2">
                                                <div className="w-14 h-14 rounded-lg bg-slate-700 flex items-center justify-center">
                                                  {match.home_team?.logo_url ? (
                                                    <Image src={match.home_team.logo_url} alt="" className="w-10 h-10 object-contain"  width={40} height={40} />
                                                  ) : (
                                                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                    </svg>
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
                                                    <Image src={match.away_team.logo_url} alt="" className="w-10 h-10 object-contain"  width={40} height={40} />
                                                  ) : (
                                                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                    </svg>
                                                  )}
                                                </div>
                                                <span className="text-xs text-white font-medium text-center max-w-[100px] truncate">{match.away_team?.name}</span>
                                              </div>
                                            </div>

                                            {/* League Info */}
                                            <div className="flex justify-center">
                                              <div className="flex items-center gap-2 text-xs text-slate-400">
                                                <span className={`px-2 py-0.5 rounded ${league.type === 'efootball' ? 'bg-purple-500/20 text-purple-400' : 'bg-green-500/20 text-green-400'}`}>
                                                  {league.type === 'efootball' ? 'eFootball' : 'Football'}
                                                </span>
                                                <span>{league.name}</span>
                                                <span>•</span>
                                                <span>Pekan {match.match_week || '-'}</span>
                                              </div>
                                            </div>

                                            {/* Screenshots */}
                                            {detail && detail.screenshots.length > 0 && (
                                              <div className="space-y-2">
                                                <p className="text-xs text-slate-400 flex items-center gap-1">
                                                  <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                  </svg>
                                                  Screenshot Hasil Pertandingan
                                                </p>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                  {detail.screenshots.map(screenshot => (
                                                    <div key={screenshot.id} className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
                                                      <Image src={screenshot.image_url} alt={screenshot.caption || 'Match Screenshot'} className="w-full h-auto object-cover"  width={32} height={32} />
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
                      });
                  })()}
                </div>
              )}

              {/* Quick Stats */}
              {matches.length > 0 && (
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
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
          )}

          {/* Bracket Tab */}
          {activeTab === 'bracket' && isCupFormat && (
            <div>
              {knockoutMatches.length === 0 ? (
                <div className="rounded-lg bg-slate-900 border border-slate-800 p-12 text-center">
                  <p className="text-slate-500 mb-2 text-sm">Belum ada babak knockout</p>
                  <p className="text-xs text-slate-600">Bracket akan muncul setelah fase grup selesai</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {['round_of_16', 'quarter_final', 'semi_final', 'final', 'third_place'].map(stage => {
                    const stageMatches = knockoutMatches.filter(m => m.cup_stage === stage);
                    if (stageMatches.length === 0) return null;
                    return (
                      <div key={stage}>
                        <TournamentBracket
                          matches={stageMatches}
                          stage={stage as 'round_of_16' | 'quarter_final' | 'semi_final' | 'final' | 'third_place'}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
