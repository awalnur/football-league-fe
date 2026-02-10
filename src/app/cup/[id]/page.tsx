'use client';

import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getLeagueById,
  getCupGroupsWithStandings,
  getMatchesByLeague
} from '@/lib/supabase';
import CupGroupStandings from '@/components/CupGroupStandings';
import TournamentBracket from '@/components/TournamentBracket';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { League, CupGroupWithStandings, MatchWithTeams } from '@/types/supabase';

type TabType = 'overview' | 'groups' | 'r16' | 'quarters' | 'semis' | 'final';

export default function CupTournamentPage() {
  const params = useParams();
  const router = useRouter();
  const leagueId = params.id as string;

  const [league, setLeague] = useState<League | null>(null);
  const [groups, setGroups] = useState<CupGroupWithStandings[]>([]);
  const [matches, setMatches] = useState<MatchWithTeams[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const loadData = useCallback(async () => {
    if (!leagueId) return;
    
    setLoading(true);
    setError('');

    try {
      // Get league info
      const { data: leagueData, error: leagueError } = await getLeagueById(leagueId);
      if (leagueError) {
        setError(leagueError.message);
        setLoading(false);
        return;
      }
      setLeague(leagueData);

      if (!leagueData) return;

      // Load group standings if has group stage
      if (leagueData.has_group_stage) {
        const { data: groupsData, error: groupsError } = await getCupGroupsWithStandings(leagueId);
        if (groupsError) {
          setError(groupsError.message);
        } else {
          setGroups(groupsData || []);
        }
      }

      // Load all matches with teams
      const { data: matchesData, error: matchesError } = await getMatchesByLeague(leagueId);
      if (matchesError) {
        setError(matchesError.message);
      } else {
        setMatches((matchesData as MatchWithTeams[]) || []);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [leagueId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-select first available tab
  useEffect(() => {
    if (league && activeTab === 'overview') {
      if (league.has_group_stage && groups.length > 0) {
        setActiveTab('groups');
      } else if (r16Matches.length > 0) {
        setActiveTab('r16');
      } else if (quarterMatches.length > 0) {
        setActiveTab('quarters');
      } else if (semiMatches.length > 0) {
        setActiveTab('semis');
      } else if (finalMatches.length > 0) {
        setActiveTab('final');
      }
    }
  }, [league, groups]);

  // Filter matches by stage
  const r16Matches = matches.filter(m => m.cup_stage === 'round_of_16');
  const quarterMatches = matches.filter(m => m.cup_stage === 'quarter_final');
  const semiMatches = matches.filter(m => m.cup_stage === 'semi_final');
  const finalMatches = matches.filter(m => m.cup_stage === 'final');
  const thirdPlaceMatch = matches.filter(m => m.cup_stage === 'third_place');

  // Calculate statistics
  const totalMatches = matches.length;
  const completedMatches = matches.filter(m => m.status === 'completed').length;
  const progress = totalMatches > 0 ? (completedMatches / totalMatches) * 100 : 0;

  const tabs = [
    { 
      id: 'groups' as TabType, 
      label: 'Group Stage', 
      icon: '🎯', 
      count: groups.length, 
      show: league?.has_group_stage && groups.length > 0 
    },
    { 
      id: 'r16' as TabType, 
      label: 'Round of 16', 
      icon: '🔥', 
      count: r16Matches.length / (r16Matches.some(m => m.leg_number === 2) ? 2 : 1), 
      show: r16Matches.length > 0 
    },
    { 
      id: 'quarters' as TabType, 
      label: 'Quarter Finals', 
      icon: '⚡', 
      count: quarterMatches.length / (quarterMatches.some(m => m.leg_number === 2) ? 2 : 1), 
      show: quarterMatches.length > 0 
    },
    { 
      id: 'semis' as TabType, 
      label: 'Semi Finals', 
      icon: '🏆', 
      count: semiMatches.length / (semiMatches.some(m => m.leg_number === 2) ? 2 : 1), 
      show: semiMatches.length > 0 
    },
    { 
      id: 'final' as TabType, 
      label: 'Final', 
      icon: '👑', 
      count: finalMatches.length, 
      show: finalMatches.length > 0 
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-slate-700"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
          </div>
          <p className="text-slate-400 text-lg">Loading tournament...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-red-900/20 border border-red-600/50 rounded-2xl p-8 backdrop-blur-sm">
            <div className="text-center mb-4">
              <span className="text-6xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold text-red-400 mb-3 text-center">Error</h2>
            <p className="text-slate-300 mb-6 text-center">{error}</p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => router.back()}
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                ← Back
              </button>
              <button 
                onClick={loadData}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!league) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🏆</div>
          <p className="text-slate-400 mb-6 text-lg">Tournament not found</p>
          <Link 
            href="/standings" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <span>←</span>
            <span>Back to Standings</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <Navigation />
      
      {/* Hero Header */}
      <div className="relative bg-slate-800/50 border-b border-slate-700/50 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-blue-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-start gap-6 mb-6">
            <Link
              href="/standings"
              className="p-3 hover:bg-slate-700/50 rounded-xl transition-all hover:scale-105"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            
            {league.logo_url && (
              <div className="relative w-20 h-20 shrink-0">
                <Image 
                  src={league.logo_url} 
                  alt={league.name} 
                  className="object-contain drop-shadow-2xl"  
                  width={80} 
                  height={80} 
                />
              </div>
            )}
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                  {league.name}
                </h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold shadow-lg shadow-blue-500/25">
                  <span>🏅</span>
                  <span>Cup Tournament</span>
                </span>
              </div>
              <p className="text-slate-400 text-lg mb-3">{league.season}</p>
              {league.description && (
                <p className="text-slate-400 text-sm max-w-2xl">{league.description}</p>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-slate-900/50 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Tournament Progress</span>
              <span className="text-sm font-semibold text-blue-400">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 transition-all duration-500 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
              <span>{completedMatches} matches completed</span>
              <span>{totalMatches - completedMatches} remaining</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="sticky top-0 z-10 bg-slate-800/80 backdrop-blur-md border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto hide-scrollbar">
            {tabs.filter(tab => tab.show).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group relative px-6 py-4 text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-xl">{tab.icon}</span>
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-300'
                    }`}>
                      {Math.round(tab.count)}
                    </span>
                  )}
                </span>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {/* Group Stage */}
        {activeTab === 'groups' && league.has_group_stage && (
          <div className="space-y-8">
            {groups.length > 0 ? (
              <>
                {/* Group Stage Info Card */}
                <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-2xl p-6 backdrop-blur-sm">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <span>📊</span>
                    <span>Group Stage Format</span>
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-900/50 rounded-xl p-4 text-center">
                      <p className="text-slate-400 text-sm mb-1">Total Groups</p>
                      <p className="text-white font-bold text-2xl">{groups.length}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-xl p-4 text-center">
                      <p className="text-slate-400 text-sm mb-1">Teams per Group</p>
                      <p className="text-blue-400 font-bold text-2xl">{league.teams_per_group}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-xl p-4 text-center">
                      <p className="text-slate-400 text-sm mb-1">Qualify per Group</p>
                      <p className="text-emerald-400 font-bold text-2xl">{league.qualifiers_per_group}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-xl p-4 text-center">
                      <p className="text-slate-400 text-sm mb-1">Total Qualifiers</p>
                      <p className="text-purple-400 font-bold text-2xl">
                        {groups.length * league.qualifiers_per_group}
                      </p>
                    </div>
                  </div>
                </div>
                <CupGroupStandings groups={groups} leagueType={league.type} />
              </>
            ) : (
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-16 text-center backdrop-blur-sm">
                <div className="text-6xl mb-4">🎯</div>
                <p className="text-slate-400 mb-6 text-lg">No groups created yet</p>
                <a
                  href="/admin/cup-groups"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-medium shadow-lg shadow-blue-500/25"
                >
                  <span>+</span>
                  <span>Setup Groups</span>
                </a>
              </div>
            )}
          </div>
        )}

        {/* Round of 16 */}
        {activeTab === 'r16' && (
          <TournamentBracket matches={r16Matches} stage="round_of_16" />
        )}

        {/* Quarter Finals */}
        {activeTab === 'quarters' && (
          <TournamentBracket matches={quarterMatches} stage="quarter_final" />
        )}

        {/* Semi Finals */}
        {activeTab === 'semis' && (
          <div className="space-y-8">
            <TournamentBracket matches={semiMatches} stage="semi_final" />

            {/* Third Place */}
            {thirdPlaceMatch.length > 0 && (
              <div className="pt-8 border-t border-slate-700/50">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 bg-amber-600/20 text-amber-400 px-4 py-2 rounded-full text-sm font-semibold">
                    <span>🥉</span>
                    <span>Third Place Match</span>
                  </div>
                </div>
                <TournamentBracket matches={thirdPlaceMatch} stage="semi_final" />
              </div>
            )}
          </div>
        )}

        {/* Final */}
        {activeTab === 'final' && (
          <div className="space-y-8">
            <TournamentBracket matches={finalMatches} stage="final" />

            {/* Champion Display if final is completed */}
            {finalMatches.length > 0 && finalMatches[0].status === 'completed' && (
              <div className="bg-gradient-to-br from-yellow-600/30 via-orange-600/20 to-yellow-600/30 border-2 border-yellow-500/50 rounded-3xl p-12 text-center backdrop-blur-sm shadow-2xl shadow-yellow-500/20">
                <div className="text-8xl mb-6 animate-bounce">🏆</div>
                <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-300 bg-clip-text text-transparent mb-4">
                  CHAMPION!
                </h2>
                <div className="text-3xl font-bold text-white mb-2">
                  {/* Determine winner */}
                  {finalMatches[0].home_score! > finalMatches[0].away_score! 
                    ? finalMatches[0].home_team?.name 
                    : finalMatches[0].away_team?.name}
                </div>
                <p className="text-xl text-yellow-200/80">
                  {league.name} • {league.season}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      
      <Footer />

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
