'use client';

import Image from 'next/image';
import { useMemo } from 'react';
import { MatchWithTeams } from '@/types/supabase';

interface ConnectedBracketProps {
  matches: MatchWithTeams[];
}

/**
 * Professional bracket component inspired by UEFA Champions League
 * Displays knockout progression with visual connectors
 */
export default function ConnectedBracket({
  matches
}: ConnectedBracketProps) {


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

  // Filter single-leg matches only
  const displayMatches = useMemo(() => {
    return matches.filter(m => (m.leg_number || 1) === 1);
  }, [matches]);

  // Calculate statistics
  const stats = useMemo(() => {
    const completed = displayMatches.filter(m => m.status === 'completed').length;
    const live = displayMatches.filter(m => m.status === 'live').length;
    const scheduled = displayMatches.filter(m => m.status === 'scheduled').length;

    return { completed, live, scheduled, total: displayMatches.length };
  }, [displayMatches]);

  const renderTeamPanel = (
    teamId: string,
    teamName: string,
    teamShort: string | null | undefined,
    logo: string | null | undefined,
    score: number | null,
    winnerId: string | null
  ) => {
    const isWinner = winnerId === teamId;
    const isTBD = teamName === 'TBD';

    return (
      <div className={`flex items-center justify-between px-5 py-4 text-sm transition-all ${
        isTBD
          ? 'bg-slate-900/20 text-slate-500'
          : isWinner
            ? 'bg-emerald-600/20 border-l-4 border-emerald-500 text-white font-semibold'
            : 'bg-slate-800/40 text-slate-200'
      }`}>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {logo && !isTBD ? (
            <div className="relative w-6 h-6 shrink-0 rounded overflow-hidden">
              <Image
                src={logo}
                alt={teamName}
                className="object-cover"
                fill
                sizes="24px"
              />
            </div>
          ) : (
            <div className="w-6 h-6 shrink-0 rounded bg-slate-700 flex items-center justify-center text-xs flex-none">
              ⚽
            </div>
          )}
          <span className="truncate font-medium">
            {(teamShort || teamName).toUpperCase()}
          </span>
        </div>
        <span className={`ml-3 text-lg font-bold tabular-nums ${
          isWinner ? 'text-emerald-400' : 'text-slate-300'
        }`}>
          {score !== null ? score : '-'}
        </span>
      </div>
    );
  };

  if (displayMatches.length === 0) {
    return (
      <div className="relative">
        <div className="absolute inset-0 bg-linear-to-br from-slate-800/20 to-slate-900/20 rounded-2xl blur-xl"></div>
        <div className="relative bg-slate-900/60 border border-slate-700/50 rounded-2xl p-16 text-center backdrop-blur-sm">
          <div className="text-5xl mb-4 opacity-40">🏟️</div>
          <p className="text-slate-400 font-medium">No matches scheduled</p>
        </div>
      </div>
    );
  }

  // Responsive grid
  const getGridClass = () => {
    const count = displayMatches.length;
    if (count === 1) return 'max-w-md mx-auto';
    if (count === 2) return 'grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto';
    if (count <= 4) return 'grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto';
    if (count <= 8) return 'grid grid-cols-2 lg:grid-cols-4 gap-4';
    return 'grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3';
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent mb-2">
              Knockout Stage
            </h2>
            <p className="text-slate-400 text-sm">
              {displayMatches.length} match{displayMatches.length !== 1 ? 'es' : ''} in this round
            </p>
          </div>

          {/* Stats Badges */}
          <div className="flex items-center gap-3 flex-wrap">
            {stats.completed > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600/15 text-emerald-400 text-xs font-semibold border border-emerald-600/30">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50"></div>
                <span>{stats.completed} Completed</span>
              </div>
            )}
            {stats.live > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600/15 text-red-400 text-xs font-semibold border border-red-600/30">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse shadow-lg shadow-red-400/50"></div>
                <span>{stats.live} Live</span>
              </div>
            )}
            {stats.scheduled > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-600/15 text-slate-400 text-xs font-semibold border border-slate-600/30">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-500"></div>
                <span>{stats.scheduled} Upcoming</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {stats.total > 0 && (
          <div className="w-full bg-slate-900/50 rounded-lg p-3 border border-slate-700/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">Round Progress</span>
              <span className="text-xs font-bold text-blue-400">
                {Math.round((stats.completed / stats.total) * 100)}%
              </span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-blue-500 via-emerald-500 to-blue-500 transition-all duration-500"
                style={{ width: `${(stats.completed / stats.total) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Matches */}
      <div className={getGridClass()}>
        {displayMatches.map((match) => {
          const winnerId = getWinnerId(match);
          const isCompleted = match.status === 'completed';
          const isLive = match.status === 'live';

          return (
            <div key={match.id} className="group relative">
              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-linear-to-br from-blue-600/0 via-blue-600/0 to-blue-600/0 group-hover:from-blue-600/10 group-hover:via-blue-600/5 group-hover:to-blue-600/10 rounded-xl transition-all duration-300"></div>

              {/* Card */}
              <div className={`relative border rounded-xl overflow-hidden shadow-lg transition-all duration-300 ${
                isLive
                  ? 'bg-linear-to-b from-slate-800 to-slate-900 border-red-600/50 shadow-red-500/20'
                  : isCompleted
                    ? 'bg-linear-to-b from-slate-800 to-slate-900 border-emerald-600/50 shadow-emerald-500/10'
                    : 'bg-linear-to-b from-slate-800/80 to-slate-900/80 border-slate-700/50 shadow-slate-950/50'
              }`}>

                {/* Match Info Header */}
                {match.match_date && (
                  <div className="px-5 py-3 bg-slate-900/50 border-b border-slate-700/30 flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      {new Date(match.match_date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                    {isLive && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600/30 text-red-400 font-bold">
                        <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
                        LIVE
                      </div>
                    )}
                  </div>
                )}

                {/* Home Team */}
                <div>
                  {renderTeamPanel(
                    match.home_team_id,
                    match.home_team?.name || 'TBD',
                    match.home_team?.short_name,
                    match.home_team?.logo_url,
                    match.home_score,
                    winnerId
                  )}
                </div>

                {/* Divider */}
                <div className="h-px bg-linear-to-r from-transparent via-slate-700/50 to-transparent"></div>

                {/* Away Team */}
                <div>
                  {renderTeamPanel(
                    match.away_team_id,
                    match.away_team?.name || 'TBD',
                    match.away_team?.short_name,
                    match.away_team?.logo_url,
                    match.away_score,
                    winnerId
                  )}
                </div>

                {/* Result Indicators */}
                {isCompleted && (
                  <div className="px-5 py-2.5 bg-slate-900/30 border-t border-slate-700/30 flex items-center justify-center gap-2 flex-wrap text-xs">
                    {match.is_extra_time && (
                      <span className="px-2.5 py-1 rounded-full bg-orange-600/20 text-orange-400 font-medium inline-flex items-center gap-1">
                        <span>⏱️</span>
                        <span>AET</span>
                      </span>
                    )}
                    {match.is_penalty && (
                      <span className="px-2.5 py-1 rounded-full bg-purple-600/20 text-purple-400 font-medium inline-flex items-center gap-1">
                        <span>⚽</span>
                        <span>PEN</span>
                      </span>
                    )}
                    <span className="px-2.5 py-1 rounded-full bg-green-600/20 text-green-400 font-medium inline-flex items-center gap-1">
                      <span>✓</span>
                      <span>FT</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="bg-linear-to-r from-slate-800/40 to-slate-900/40 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
        <h3 className="text-sm font-bold text-slate-300 uppercase mb-4 flex items-center gap-2">
          <span>📋</span>
          <span>Legend & Match Information</span>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"></div>
            <span className="text-slate-400">Qualified / Winner</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded-full bg-orange-600/30 text-orange-400 text-xs font-semibold">⏱️ AET</span>
            <span className="text-slate-400">Extra Time</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded-full bg-purple-600/30 text-purple-400 text-xs font-semibold">⚽ PEN</span>
            <span className="text-slate-400">Penalties</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-lg shadow-red-500/50"></div>
            <span className="text-slate-400">Live Match</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded-full bg-slate-600/30 text-slate-400 text-xs font-semibold">TBD</span>
            <span className="text-slate-400">Team Pending</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-blue-400 font-bold text-sm">Leg N</span>
            <span className="text-slate-400">Two-Leg Tie</span>
          </div>
        </div>
      </div>
    </div>
  );
}

