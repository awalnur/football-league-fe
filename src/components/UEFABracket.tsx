'use client';

import Image from 'next/image';
import { useMemo } from 'react';
import { MatchWithTeams } from '@/types/supabase';

interface UEFABracketProps {
  matches: MatchWithTeams[];
  stage: 'round_of_16' | 'round_of_32' | 'quarter_final' | 'semi_final' | 'final' | 'third_place';
}

interface BracketMatch {
  id: string;
  homeTeam: {
    id: string;
    name: string;
    shortName?: string;
    logo?: string;
    seed?: number;
  };
  awayTeam: {
    id: string;
    name: string;
    shortName?: string;
    logo?: string;
    seed?: number;
  };
  homeScore: number | null;
  awayScore: number | null;
  homePenalty?: number | null;
  awayPenalty?: number | null;
  status: string;
  date?: string;
  isExtraTime?: boolean;
  isPenalty?: boolean;
  aggregateWinnerId?: string | null;
  legNumber?: number;
  matchDate?: string | null;
}


export default function UEFABracket({ matches, stage }: UEFABracketProps) {
  const getStageTitle = (): string => {
    const titles: Record<string, string> = {
      round_of_32: 'Round of 32',
      round_of_16: 'Round of 16',
      quarter_final: 'Quarter-Finals',
      semi_final: 'Semi-Finals',
      final: 'Final',
      third_place: '3rd Place Match'
    };
    return titles[stage] || stage;
  };

  const getWinnerId = (match: MatchWithTeams): string | null => {
    if (match.status !== 'completed' || match.home_score === null || match.away_score === null) {
      return null;
    }

    // Check penalties first
    if (match.is_penalty && match.home_penalty_score !== null && match.away_penalty_score !== null) {
      return match.home_penalty_score > match.away_penalty_score
        ? match.home_team_id
        : match.away_team_id;
    }

    // Check aggregate for two-leg ties
    if (match.aggregate_winner_id) {
      return match.aggregate_winner_id;
    }

    // Regular result
    if (match.home_score > match.away_score) {
      return match.home_team_id;
    } else if (match.away_score > match.home_score) {
      return match.away_team_id;
    }

    return null;
  };

  // Transform matches into bracket format
  const bracketMatches = useMemo(() => {
    return matches.map((match): BracketMatch => ({
      id: match.id,
      homeTeam: {
        id: match.home_team_id,
        name: match.home_team?.name || 'TBD',
        shortName: match.home_team?.short_name || undefined,
        logo: match.home_team?.logo_url || undefined,
      },
      awayTeam: {
        id: match.away_team_id,
        name: match.away_team?.name || 'TBD',
        shortName: match.away_team?.short_name || undefined,
        logo: match.away_team?.logo_url || undefined,
      },
      homeScore: match.home_score,
      awayScore: match.away_score,
      homePenalty: match.home_penalty_score,
      awayPenalty: match.away_penalty_score,
      status: match.status,
      matchDate: match.match_date,
      isExtraTime: match.is_extra_time,
      isPenalty: match.is_penalty,
      aggregateWinnerId: match.aggregate_winner_id,
      legNumber: match.leg_number,
    }));
  }, [matches]);

  // Group by leg for two-leg ties
  const groupedByLeg = useMemo(() => {
    return bracketMatches.reduce((acc, match) => {
      const tieKey = match.legNumber ? `${match.homeTeam.id}-${match.awayTeam.id}` : match.id;
      if (!acc[tieKey]) {
        acc[tieKey] = [];
      }
      acc[tieKey].push(match);
      return acc;
    }, {} as Record<string, BracketMatch[]>);
  }, [bracketMatches]);

  const tieMatches = Object.values(groupedByLeg);

  const TeamCard = ({ team, score, penalty, isWinner, isPenaltyWinner }: {
    team: BracketMatch['homeTeam'] | BracketMatch['awayTeam'];
    score: number | null;
    penalty?: number | null;
    isWinner?: boolean;
    isPenaltyWinner?: boolean;
  }) => {
    const showTBD = team.name === 'TBD';

    return (
      <div className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
        showTBD
          ? 'bg-slate-900/50 border border-slate-700/50'
          : isWinner
            ? 'bg-linear-to-r from-emerald-600/30 to-emerald-600/10 border border-emerald-500/50 shadow-lg shadow-emerald-500/10'
            : 'bg-slate-800/50 border border-slate-700/50'
      }`}>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {team.logo && !showTBD ? (
            <div className="relative w-8 h-8 shrink-0 rounded-full overflow-hidden bg-slate-700">
              <Image
                src={team.logo}
                alt={team.name}
                className="object-contain p-1"
                fill
                sizes="32px"
              />
            </div>
          ) : (
            <div className="w-8 h-8 shrink-0 rounded-full bg-slate-700 flex items-center justify-center text-sm">
              ⚽
            </div>
          )}
          <div className="min-w-0">
            <div className={`text-sm font-semibold truncate ${
              showTBD ? 'text-slate-500' : isWinner ? 'text-emerald-400' : 'text-white'
            }`}>
              {team.shortName || team.name}
            </div>
            {team.seed && (
              <div className="text-xs text-slate-500">
                Seed {team.seed}
              </div>
            )}
          </div>
        </div>

        <div className={`ml-3 flex items-baseline gap-1 shrink-0 ${
          isWinner ? 'text-emerald-400 font-bold' : 'text-slate-400'
        }`}>
          <span className="text-lg font-bold">
            {score !== null ? score : '-'}
          </span>
          {penalty !== null && penalty !== undefined && (
            <span className={`text-xs ${isPenaltyWinner ? 'text-amber-400' : 'text-slate-500'}`}>
              ({penalty})
            </span>
          )}
        </div>
      </div>
    );
  };

  const MatchCard = ({ tieMatches }: {
    tieMatches: BracketMatch[];
  }) => {
    const isTwoLeg = tieMatches.length > 1;

    // For display
    const firstMatch = tieMatches[0];
    const secondMatch = tieMatches[1];
    const homeTeam = firstMatch.homeTeam;
    const awayTeam = firstMatch.awayTeam;

    const homeWinnerId = isTwoLeg
      ? firstMatch.aggregateWinnerId
      : (() => {
          if (firstMatch.status !== 'completed' || firstMatch.homeScore === null || firstMatch.awayScore === null) {
            return null;
          }

          if (firstMatch.isPenalty && firstMatch.homePenalty !== null && firstMatch.homePenalty !== undefined && firstMatch.awayPenalty !== null && firstMatch.awayPenalty !== undefined) {
            return firstMatch.homePenalty > firstMatch.awayPenalty
              ? firstMatch.homeTeam.id
              : firstMatch.awayTeam.id;
          }

          if (firstMatch.homeScore > firstMatch.awayScore) {
            return firstMatch.homeTeam.id;
          } else if (firstMatch.awayScore > firstMatch.homeScore) {
            return firstMatch.awayTeam.id;
          }

          return null;
        })();

    const isHomeWinner = homeWinnerId === homeTeam.id;
    const isAwayWinner = homeWinnerId === awayTeam.id;

    // Helper flags for penalty
    const homePenaltyScore = firstMatch.homePenalty ?? null;
    const awayPenaltyScore = firstMatch.awayPenalty ?? null;

    return (
      <div className="relative">
        <div className="bg-gradient-to-b from-slate-800/80 to-slate-900/80 border border-slate-700/50 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow backdrop-blur-sm">
          {/* Match Header with Date */}
          {firstMatch.matchDate && !isTwoLeg && (
            <div className="px-4 py-2.5 bg-slate-900/50 border-b border-slate-700/50 flex items-center justify-between text-xs text-slate-400">
              <span>
                {new Date(firstMatch.matchDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
              <div className="flex items-center gap-2">
                {firstMatch.status === 'live' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-600/20 text-red-400 font-semibold">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    LIVE
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Home Team */}
          <div className="px-4 pt-4">
            <TeamCard
              team={homeTeam}
              score={firstMatch.homeScore}
              penalty={homePenaltyScore}
              isWinner={isHomeWinner}
              isPenaltyWinner={
                firstMatch.isPenalty &&
                typeof homePenaltyScore === 'number' &&
                typeof awayPenaltyScore === 'number' &&
                homePenaltyScore > awayPenaltyScore
              }
            />
          </div>

          {/* Score Divider or Leg Separator */}
          {isTwoLeg && (
            <div className="px-4 py-2 border-t border-b border-slate-700/50 bg-slate-900/30">
              <div className="text-center">
                <span className="text-xs font-semibold text-slate-500 uppercase">Leg 1</span>
              </div>
            </div>
          )}

          {/* Away Team (Leg 1) */}
          <div className={`px-4 ${isTwoLeg ? 'pb-2' : 'pb-4'}`}>
            <TeamCard
              team={awayTeam}
              score={firstMatch.awayScore}
              penalty={awayPenaltyScore}
              isWinner={isAwayWinner}
              isPenaltyWinner={
                firstMatch.isPenalty &&
                typeof awayPenaltyScore === 'number' &&
                typeof homePenaltyScore === 'number' &&
                awayPenaltyScore > homePenaltyScore
              }
            />
          </div>

          {/* Leg 2 (if two-leg tie) */}
          {isTwoLeg && secondMatch && (
            <>
              <div className="px-4 py-2 border-t border-slate-700/50 bg-slate-900/30">
                <div className="text-center">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Leg 2</span>
                </div>
              </div>

              <div className="px-4 pt-2">
                <TeamCard
                  team={homeTeam}
                  score={secondMatch.homeScore}
                  penalty={secondMatch.homePenalty}
                  isWinner={isHomeWinner}
                />
              </div>

              <div className="px-4 pb-4">
                <TeamCard
                  team={awayTeam}
                  score={secondMatch.awayScore}
                  penalty={secondMatch.awayPenalty}
                  isWinner={isAwayWinner}
                />
              </div>

              {/* Aggregate Result */}
              {firstMatch.aggregateWinnerId && firstMatch.status === 'completed' && (
                <div className="px-4 py-3 border-t border-slate-700/50 bg-emerald-900/20 border-t-emerald-600/30">
                  <div className="text-center text-xs text-emerald-400 font-semibold">
                    🏆 {isHomeWinner ? homeTeam.shortName || homeTeam.name : awayTeam.shortName || awayTeam.name} Advances
                  </div>
                </div>
              )}
            </>
          )}

          {/* Extra Time & Penalties Info */}
          {firstMatch.status === 'completed' && (
            <div className="px-4 py-2 border-t border-slate-700/50 bg-slate-900/30 flex items-center justify-center gap-2 flex-wrap text-xs">
              {firstMatch.isExtraTime && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/20 text-orange-400">
                  ⏱️ AET
                </span>
              )}
              {firstMatch.isPenalty && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-500/20 text-purple-400">
                  ⚽ PEN
                </span>
              )}
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${
                firstMatch.status === 'completed'
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-slate-700 text-slate-400'
              }`}>
                {firstMatch.status === 'completed' ? '✓ FT' : 'Scheduled'}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (tieMatches.length === 0) {
    return (
      <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-12 text-center backdrop-blur-sm">
        <div className="text-6xl mb-4">🏟️</div>
        <p className="text-slate-400 text-lg mb-2">No matches scheduled</p>
        <p className="text-slate-500 text-sm">for {getStageTitle()}</p>
      </div>
    );
  }

  // Determine number of columns based on stage and number of matches
  const getGridCols = () => {
    const count = tieMatches.length;
    if (count === 1) return 'grid-cols-1 max-w-md mx-auto';
    if (count === 2) return 'grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto';
    if (count <= 4) return 'grid-cols-1 md:grid-cols-2 gap-6';
    if (count <= 8) return 'grid-cols-2 lg:grid-cols-4 gap-4';
    return 'grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4';
  };

  return (
    <div className="space-y-8">
      {/* Stage Header */}
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent mb-3">
          {getStageTitle()}
        </h2>
        <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
          <div className="h-px flex-1 bg-linear-to-r from-transparent via-slate-600 to-transparent max-w-xs"></div>
          <span>{tieMatches.length} match{tieMatches.length !== 1 ? 'es' : ''}</span>
          <div className="h-px flex-1 bg-linear-to-r from-transparent via-slate-600 to-transparent max-w-xs"></div>
        </div>
      </div>

      {/* Bracket Grid */}
      <div className={`grid ${getGridCols()}`}>
        {tieMatches.map((tie, index) => (
          <MatchCard
            key={`${tie[0].id}-${index}`}
            tieMatches={tie}
            // matchIndex={index}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="bg-linear-to-r from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
        <h3 className="text-sm font-semibold text-white mb-4">Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-slate-400">Qualified Team</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/20 text-orange-400">⏱️</span>
            <span className="text-slate-400">After Extra Time</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-500/20 text-purple-400">⚽</span>
            <span className="text-slate-400">Penalty Shootout</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">×2</span>
            <span className="text-slate-400">Two-Leg Tie</span>
          </div>
        </div>
      </div>
    </div>
  );
}

