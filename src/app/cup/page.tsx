'use client';

import Image from 'next/image';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  getLeagueById,
  getCupGroupsWithStandings,
  getMatchesByLeague
} from '@/lib/supabase';
import CupGroupStandings from '@/components/CupGroupStandings';
import KnockoutBracket from '@/components/KnockoutBracket';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { League, CupGroupWithStandings, MatchWithTeams } from '@/types/supabase';

type TabType = 'groups' | 'r16' | 'quarters' | 'semis' | 'final';

export default function CupTournamentPage() {
  const searchParams = useSearchParams();
  const leagueId = searchParams.get('league') || '';

  const [league, setLeague] = useState<League | null>(null);
  const [groups, setGroups] = useState<CupGroupWithStandings[]>([]);
  const [matches, setMatches] = useState<MatchWithTeams[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('groups');

  const loadData = useCallback(async () => {
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
    if (leagueId) {
      loadData();
    }
  }, [leagueId, loadData]);

  // Filter matches by stage
  const r16Matches = matches.filter(m => m.cup_stage === 'round_of_16');
  const quarterMatches = matches.filter(m => m.cup_stage === 'quarter_final');
  const semiMatches = matches.filter(m => m.cup_stage === 'semi_final');
  const finalMatches = matches.filter(m => m.cup_stage === 'final');
  const thirdPlaceMatch = matches.filter(m => m.cup_stage === 'third_place');

  const tabs = [
    { id: 'groups' as TabType, label: 'Group Stage', icon: '🎯', count: groups.length, show: league?.has_group_stage },
    { id: 'r16' as TabType, label: 'Round of 16', icon: '🔥', count: r16Matches.length, show: r16Matches.length > 0 },
    { id: 'quarters' as TabType, label: 'Quarter Finals', icon: '⚡', count: quarterMatches.length, show: quarterMatches.length > 0 },
    { id: 'semis' as TabType, label: 'Semi Finals', icon: '🏆', count: semiMatches.length, show: semiMatches.length > 0 },
    { id: 'final' as TabType, label: 'Final', icon: '👑', count: finalMatches.length, show: finalMatches.length > 0 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading tournament...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="bg-red-900/20 border border-red-600 rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-bold text-red-400 mb-2">Error</h2>
          <p className="text-slate-300">{error}</p>
          <Link href="/standings" className="mt-4 inline-block text-blue-400 hover:text-blue-300">
            ← Back
          </Link>
        </div>
      </div>
    );
  }

  if (!league) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Tournament not found</p>
          <Link href="/standings" className="text-blue-400 hover:text-blue-300">
            ← Back
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-white">
      <Navigation />
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/standings"
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            {league.logo_url && (
              <Image src={league.logo_url} alt={league.name} className="w-16 h-16 object-contain"  width={64} height={64} />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-3xl font-bold">{league.name}</h1>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-600 text-white text-sm">
                  <span>🏅</span>
                  <span>Cup</span>
                </span>
              </div>
              <p className="text-slate-400">{league.season}</p>
            </div>
          </div>

          {league.description && (
            <p className="text-slate-400 text-sm">{league.description}</p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-slate-800/50 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto">
            {tabs.filter(tab => tab.show).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-white'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className="bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Group Stage */}
        {activeTab === 'groups' && league.has_group_stage && (
          <div className="space-y-6">
            {groups.length > 0 ? (
              <>
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2">Group Stage Format</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-slate-400">Total Groups</p>
                      <p className="text-white font-bold text-lg">{groups.length}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Teams per Group</p>
                      <p className="text-blue-400 font-bold text-lg">{league.teams_per_group}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Qualifiers per Group</p>
                      <p className="text-green-400 font-bold text-lg">{league.qualifiers_per_group}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Total Qualifiers</p>
                      <p className="text-purple-400 font-bold text-lg">
                        {groups.length * league.qualifiers_per_group}
                      </p>
                    </div>
                  </div>
                </div>
                <CupGroupStandings groups={groups} leagueType={league.type} />
              </>
            ) : (
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
                <p className="text-slate-400 mb-4">No groups created yet</p>
                <a
                  href="/admin/cup-groups"
                  className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Setup Groups
                </a>
              </div>
            )}
          </div>
        )}

        {/* Round of 16 */}
        {activeTab === 'r16' && (
          <KnockoutBracket matches={r16Matches} stage="round_of_16" />
        )}

        {/* Quarter Finals */}
        {activeTab === 'quarters' && (
          <KnockoutBracket matches={quarterMatches} stage="quarter_final" />
        )}

        {/* Semi Finals */}
        {activeTab === 'semis' && (
          <div className="space-y-6">
            <KnockoutBracket matches={semiMatches} stage="semi_final" />

            {/* Third Place */}
            {thirdPlaceMatch.length > 0 && (
              <div className="mt-8">
                <KnockoutBracket matches={thirdPlaceMatch} stage="third_place" />
              </div>
            )}
          </div>
        )}

        {/* Final */}
        {activeTab === 'final' && (
          <div className="max-w-2xl mx-auto">
            <KnockoutBracket matches={finalMatches} stage="final" />

            {/* Champion Display if final is completed */}
            {finalMatches.length > 0 && finalMatches[0].status === 'completed' && (
              <div className="mt-8 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border-2 border-yellow-500/50 rounded-xl p-8 text-center">
                <div className="text-6xl mb-4">🏆</div>
                <h2 className="text-3xl font-bold text-yellow-400 mb-2">CHAMPION!</h2>
                <p className="text-xl text-white">
                  {/* Winner logic here based on final match */}
                  Season {league.season}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
