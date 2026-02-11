'use client';

import Image from 'next/image';
import { useMemo } from 'react';
import { MatchWithTeams } from '@/types/supabase';

interface AdvancedBracketProps {
  matches: MatchWithTeams[];
  stage: 'round_of_32' | 'round_of_16' | 'quarter_final' | 'semi_final' | 'final';
}


export default function AdvancedBracket({ matches, stage }: AdvancedBracketProps) {
  const getStageTitle = (): string => {
    const titles: Record<string, string> = {
      round_of_32: 'Round of 32',
      round_of_16: 'Round of 16',
      quarter_final: 'Quarter-Finals',
      semi_final: 'Semi-Finals',
      final: 'Final',
    };
    return titles[stage] || stage;
  };

  const getWinnerId = (match: MatchWithTeams): string | null => {
    if (match.status !== 'completed' || match.home_score === null || match.away_score === null) {
      return null;
    }

    if (match.is_penalty && match.home_penalty_score !== null && match.away_penalty_score !== null) {
      return match.home_penalty_score > match.away_penalty_score
        ? match.home_team_id
        : match.away_team_id;
    }

    if (match.aggregate_winner_id) {
      return match.aggregate_winner_id;
    }

    if (match.home_score > match.away_score) {
      return match.home_team_id;
    } else if (match.away_score > match.home_score) {
      return match.away_team_id;
    }

    return null;
  };

  // Simple layout for single leg knockout
  const singleLegMatches = useMemo(() => {
    return matches.filter(m => (m.leg_number || 1) === 1);
  }, [matches]);

  const renderTeamRow = (
    teamId: string,
    teamName: string,
    teamShort: string | null | undefined,
    logo: string | null | undefined,
    score: number | null,
    winnerId: string | null,
    isPenalty: boolean,
    penaltyScore: number | null,
    penalty: boolean
  ) => {
    const isWinner = winnerId === teamId;
    const showTBD = teamName === 'TBD';

    return (
      <div className={`flex items-center justify-between px-4 py-3 text-sm font-medium transition-all ${
        showTBD
          ? 'bg-slate-900/30 text-slate-500'
          : isWinner
            ? 'bg-linear-to-r from-emerald-600/40 to-emerald-600/20 text-emerald-100 border-l-4 border-emerald-500'
            : 'bg-slate-800/40 text-slate-200'
      }`}>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {logo && !showTBD ? (
            <div className="relative w-7 h-7 shrink-0">
              <Image
                src={logo}
                alt=""
                className="object-contain"
                fill
                sizes="28px"
              />
            </div>
          ) : (
            <div className="w-7 h-7 shrink-0 rounded-full bg-slate-700 flex items-center justify-center text-xs">
              ⚽
            </div>
          )}
          <span className="truncate font-semibold">{teamShort || teamName}</span>
        </div>

        <div className="ml-3 flex items-baseline gap-1 text-right">
          <span className={`text-base font-bold ${isWinner ? 'text-emerald-400' : 'text-slate-300'}`}>
            {score !== null ? score : '-'}
          </span>
          {penalty && penaltyScore !== null && (
            <span className="text-xs text-amber-400 ml-1">({penaltyScore})</span>
          )}
        </div>
      </div>
    );
  };

  const MatchBox = ({ match }: { match: MatchWithTeams }) => {
    const winnerId = getWinnerId(match);
    const isCompleted = match.status === 'completed';
    const isLive = match.status === 'live';

    return (
      <div key={match.id} className="relative">
        <div className={`bg-linear-to-b from-slate-800/50 to-slate-900/50 border rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all ${
          isCompleted
            ? 'border-emerald-600/50'
            : isLive
              ? 'border-red-600/50 shadow-red-500/20'
              : 'border-slate-700/50'
        }`}>
          {/* Date/Time Header */}
          {match.match_date && (
            <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-700/50 flex items-center justify-between text-xs text-slate-400">
              <span>
                {new Date(match.match_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
              {isLive && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600/20 text-red-400 text-xs font-bold">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  LIVE
                </span>
              )}
            </div>
          )}

          {/* Home Team */}
          <div>
            {renderTeamRow(
              match.home_team_id,
              match.home_team?.name || 'TBD',
              match.home_team?.short_name,
              match.home_team?.logo_url,
              match.home_score,
              winnerId,
              match.is_penalty,
              match.home_penalty_score,
              false
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-slate-700/50"></div>

          {/* Away Team */}
          <div>
            {renderTeamRow(
              match.away_team_id,
              match.away_team?.name || 'TBD',
              match.away_team?.short_name,
              match.away_team?.logo_url,
              match.away_score,
              winnerId,
              match.is_penalty,
              match.away_penalty_score,
              false
            )}
          </div>

          {/* Status Badges */}
          {isCompleted && (
            <div className="px-4 py-2 bg-emerald-900/20 border-t border-emerald-600/30 flex items-center justify-center gap-2 flex-wrap text-xs">
              {match.is_extra_time && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/20 text-orange-400 font-medium">
                  ⏱️ AET
                </span>
              )}
              {match.is_penalty && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 font-medium">
                  ⚽ PEN
                </span>
              )}
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-400 font-medium">
                ✓ FT
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (singleLegMatches.length === 0) {
    return (
      <div className="bg-linear-to-b from-slate-800/30 to-slate-900/50 border border-slate-700/50 rounded-2xl p-16 text-center backdrop-blur-sm">
        <div className="text-6xl mb-4 opacity-50">🏟️</div>
        <p className="text-slate-400 text-lg font-medium">No matches scheduled</p>
        <p className="text-slate-500 text-sm mt-1">for {getStageTitle()}</p>
      </div>
    );
  }

  const matchCount = singleLegMatches.length;
  const gridColsClass = matchCount === 1
    ? 'grid-cols-1 max-w-sm mx-auto'
    : matchCount === 2
      ? 'grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto'
      : matchCount <= 4
        ? 'grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto'
        : matchCount <= 8
          ? 'grid-cols-2 lg:grid-cols-4 gap-4'
          : 'grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3';

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-bold text-white">
          {getStageTitle()}
        </h2>
        <p className="text-slate-400">
          {matchCount} match{matchCount !== 1 ? 'es' : ''}
        </p>
      </div>

      {/* Matches Grid */}
      <div className={`grid ${gridColsClass}`}>
        {singleLegMatches.map((match) => (
          <MatchBox key={match.id} match={match} />
        ))}
      </div>

      {/* Info Footer */}
      <div className="bg-slate-900/40 border border-slate-700/50 rounded-xl p-4 text-center text-xs text-slate-400">
        <p>Results are updated in real-time as matches conclude</p>
      </div>
    </div>
  );
}

