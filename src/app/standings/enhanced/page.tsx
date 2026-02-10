'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  getLeagueById,
  getStandingsWithZones,
  getCupGroupsWithStandings,
  getLeagueZones
} from '@/lib/supabase';
import StandingsTableWithZones from '@/components/StandingsTableWithZones';
import CupGroupStandings from '@/components/CupGroupStandings';
import { League, StandingWithTeam, CupGroupWithStandings, LeagueZone } from '@/types/supabase';

export default function EnhancedStandingsPage() {
  const searchParams = useSearchParams();
  const leagueId = searchParams.get('league') || '';

  const [league, setLeague] = useState<League | null>(null);
  const [standings, setStandings] = useState<StandingWithTeam[]>([]);
  const [groups, setGroups] = useState<CupGroupWithStandings[]>([]);
  const [zones, setZones] = useState<LeagueZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (leagueId) {
      loadData();
    }
  }, [leagueId]);

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      // Get league info
      const { data: leagueData, error: leagueError } = await getLeagueById(leagueId);
      if (leagueError) throw new Error(leagueError.message);
      setLeague(leagueData);

      if (!leagueData) return;

      // Redirect to cup page for cup tournaments
      if ((leagueData.tournament_format === 'cup' || leagueData.tournament_format === 'league_cup')) {
        window.location.href = `/cup?league=${leagueId}`;
        return;
      }

      // Load based on tournament format
      if (leagueData.tournament_format === 'league') {
        // Load league standings with zones
        const { data: standingsData, error: standingsError } = await getStandingsWithZones(leagueId);
        if (standingsError) throw new Error(standingsError.message);
        setStandings(standingsData || []);

        // Load zones for legend
        const { data: zonesData } = await getLeagueZones(leagueId);
        setZones(zonesData || []);

      } else if (leagueData.tournament_format === 'cup' || leagueData.tournament_format === 'league_cup') {
        if (leagueData.has_group_stage) {
          // Load cup groups with standings
          const { data: groupsData, error: groupsError } = await getCupGroupsWithStandings(leagueId);
          if (groupsError) throw new Error(groupsError.message);
          setGroups(groupsData || []);
        }
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getFormatBadge = () => {
    if (!league) return null;

    const badges = {
      league: { emoji: '🏆', text: 'Liga', color: 'bg-green-600' },
      cup: { emoji: '🏅', text: 'Piala', color: 'bg-blue-600' },
      league_cup: { emoji: '⚡', text: 'Hybrid', color: 'bg-purple-600' },
    };

    const badge = badges[league.tournament_format];

    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-white text-sm font-medium ${badge.color}`}>
        <span>{badge.emoji}</span>
        <span>{badge.text}</span>
      </span>
    );
  };

  const getTypeBadge = () => {
    if (!league) return null;

    return league.type === 'football' ? (
      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-600 text-white text-sm font-medium">
        <span>⚽</span>
        <span>Football</span>
      </span>
    ) : (
      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-600 text-white text-sm font-medium">
        <span>🎮</span>
        <span>eFootball</span>
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading standings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="bg-red-900/20 border border-red-600 rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-bold text-red-400 mb-2">Error</h2>
          <p className="text-gray-300">{error}</p>
          <Link href="/standings" className="mt-4 inline-block text-green-400 hover:text-green-300">
            ← Back to standings
          </Link>
        </div>
      </div>
    );
  }

  if (!league) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">League not found</p>
          <Link href="/standings" className="text-green-400 hover:text-green-300">
            ← Back to standings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/standings"
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            {league.logo_url && (
              <img src={league.logo_url} alt={league.name} className="w-16 h-16 object-contain" />
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{league.name}</h1>
              <p className="text-gray-400">{league.season}</p>
            </div>
            <div className="flex gap-2">
              {getTypeBadge()}
              {getFormatBadge()}
            </div>
          </div>

          {league.description && (
            <p className="text-gray-400 text-sm">{league.description}</p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* League Format */}
        {league.tournament_format === 'league' && (
          <div className="space-y-6">
            {/* Relegation Info */}
            {(league.promotion_slots > 0 || league.relegation_slots > 0 || league.playoff_slots > 0) && (
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <span>⬆️⬇️</span>
                  <span>Sistem Promosi & Degradasi</span>
                </h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  {league.promotion_slots > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      <span className="text-gray-300">
                        <strong className="text-white">{league.promotion_slots}</strong> tim promosi
                      </span>
                    </div>
                  )}
                  {league.playoff_slots > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                      <span className="text-gray-300">
                        <strong className="text-white">{league.playoff_slots}</strong> tim playoff
                      </span>
                    </div>
                  )}
                  {league.relegation_slots > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-500"></div>
                      <span className="text-gray-300">
                        <strong className="text-white">{league.relegation_slots}</strong> tim degradasi
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Standings Table */}
            <StandingsTableWithZones
              standings={standings}
              zones={zones}
              leagueType={league.type}
            />
          </div>
        )}

        {/* Cup Format with Group Stage */}
        {(league.tournament_format === 'cup' || league.tournament_format === 'league_cup') && league.has_group_stage && (
          <div className="space-y-6">
            {/* Group Stage Info */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span>🎯</span>
                <span>Group Stage</span>
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-gray-300">
                  <strong className="text-white">{league.teams_per_group}</strong> tim per group
                </div>
                <div className="text-gray-300">
                  <strong className="text-white">{league.qualifiers_per_group}</strong> tim lolos per group
                </div>
              </div>
            </div>

            {/* Group Standings */}
            {groups.length > 0 ? (
              <CupGroupStandings
                groups={groups}
                leagueType={league.type}
              />
            ) : (
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
                <p className="text-gray-400">No groups created yet</p>
              </div>
            )}
          </div>
        )}

        {/* Cup Format without Group Stage */}
        {(league.tournament_format === 'cup' || league.tournament_format === 'league_cup') && !league.has_group_stage && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold mb-2">Knockout Tournament</h3>
            <p className="text-gray-400 mb-4">Direct elimination format</p>
            <p className="text-sm text-gray-500">Bracket view coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}
