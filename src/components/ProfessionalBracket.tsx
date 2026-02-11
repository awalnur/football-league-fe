'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { MatchWithTeams } from '@/types/supabase';

interface ProfessionalBracketProps {
  matches: MatchWithTeams[];
  stage?: 'round_of_16' | 'round_of_32' | 'quarter_final' | 'semi_final' | 'final' | 'third_place';
  title?: string;
  description?: string;
}

interface BracketMatch {
  id: string;
  homeTeam: {
    id: string;
    name: string;
    shortName?: string;
    logo?: string;
  };
  awayTeam: {
    id: string;
    name: string;
    shortName?: string;
    logo?: string;
  };
  homeScore: number | null;
  awayScore: number | null;
  homePenalty?: number | null;
  awayPenalty?: number | null;
  status: 'scheduled' | 'live' | 'completed' | 'postponed';
  date?: string;
  isExtraTime?: boolean;
  isPenalty?: boolean;
  aggregateWinnerId?: string | null;
  legNumber?: number;
  winnerId?: string | null;
}

export default function ProfessionalBracket({
  matches,
  stage = 'quarter_final',
  title,
  description
}: ProfessionalBracketProps) {
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);

  const getStageTitle = (): string => {
    const titles: Record<string, string> = {
      round_of_32: 'Round of 32',
      round_of_16: 'Round of 16',
      quarter_final: 'Quarter-Finals',
      semi_final: 'Semi-Finals',
      final: 'Final',
      third_place: '3rd Place Match'
    };
    return title || titles[stage] || stage;
  };

  const getWinnerId = (match: MatchWithTeams): string | null => {
    if (match.status !== 'completed' || match.home_score === null || match.away_score === null) {
      return null;
    }

    // Penalties take precedence
    if (match.is_penalty && match.home_penalty_score !== null && match.away_penalty_score !== null) {
      return match.home_penalty_score > match.away_penalty_score
        ? match.home_team_id
        : match.away_team_id;
    }

    // Aggregate for two-leg ties
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

  // Transform and filter matches
  const displayMatches = useMemo(() => {
    return matches
      .filter(m => (m.leg_number || 1) === 1)
      .map((match): BracketMatch => ({
        id: match.id,
        homeTeam: {
          id: match.home_team_id,
          name: match.home_team?.name || 'TBD',
          shortName: match.home_team?.short_name ?? undefined,
          logo: match.home_team?.logo_url ?? undefined
        },
        awayTeam: {
          id: match.away_team_id,
          name: match.away_team?.name || 'TBD',
          shortName: match.away_team?.short_name ?? undefined,
          logo: match.away_team?.logo_url ?? undefined
        },
        homeScore: match.home_score,
        awayScore: match.away_score,
        homePenalty: match.home_penalty_score ?? undefined,
        awayPenalty: match.away_penalty_score ?? undefined,
        status: match.status as 'scheduled' | 'live' | 'completed' | 'postponed',
        date: match.match_date ?? undefined,
        isExtraTime: match.is_extra_time ?? undefined,
        isPenalty: match.is_penalty ?? undefined,
        aggregateWinnerId: match.aggregate_winner_id ?? undefined,
        legNumber: match.leg_number ?? undefined,
        winnerId: getWinnerId(match) ?? undefined
      }));
  }, [matches]);

  // Calculate statistics
  const stats = useMemo(() => {
    return {
      total: displayMatches.length,
      completed: displayMatches.filter(m => m.status === 'completed').length,
      live: displayMatches.filter(m => m.status === 'live').length,
      scheduled: displayMatches.filter(m => m.status === 'scheduled').length,
      postponed: displayMatches.filter(m => m.status === 'postponed').length
    };
  }, [displayMatches]);

  const TeamDisplay = ({
    team,
    score,
    penalty,
    isWinner,
    isTBD
  }: {
    team: BracketMatch['homeTeam'] | BracketMatch['awayTeam'];
    score: number | null;
    penalty?: number | null;
    isWinner?: boolean;
    isTBD?: boolean;
  }) => {
    return (
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {team.logo && !isTBD ? (
            <div className="relative w-7 h-7 shrink-0 rounded-md overflow-hidden bg-slate-700/50">
              <Image
                src={team.logo}
                alt={team.name}
                className="object-contain p-0.5"
                fill
                sizes="28px"
              />
            </div>
          ) : (
            <div className="w-7 h-7 shrink-0 rounded-md bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-400">
              ⚽
            </div>
          )}
          <span className={`text-sm font-semibold truncate ${
            isTBD ? 'text-slate-500' : isWinner ? 'text-white' : 'text-slate-300'
          }`}>
            {team.shortName?.toUpperCase() || team.name.toUpperCase()}
          </span>
        </div>

        <div className="flex items-baseline gap-1 ml-auto pl-3">
          <span className={`text-2xl font-black tabular-nums ${
            isWinner ? 'text-emerald-400' : isTBD ? 'text-slate-600' : 'text-white'
          }`}>
            {score !== null ? score : '-'}
          </span>
          {penalty !== null && penalty !== undefined && (
            <span className={`text-xs font-bold tabular-nums ml-1 ${
              isWinner ? 'text-amber-400' : 'text-slate-500'
            }`}>
              ({penalty})
            </span>
          )}
        </div>
      </div>
    );
  };

  const MatchCard = ({ match }: { match: BracketMatch }) => {
    const isExpanded = selectedMatch === match.id;
    const isCompleted = match.status === 'completed';
    const isLive = match.status === 'live';
    const isPostponed = match.status === 'postponed';
    const homeIsTBD = match.homeTeam.name === 'TBD';
    const awayIsTBD = match.awayTeam.name === 'TBD';

    const getStatusColor = () => {
      if (isPostponed) return 'border-orange-600/40 bg-linear-to-b from-orange-950/30 to-orange-900/20 shadow-orange-500/10';
      if (isLive) return 'border-red-600/60 bg-linear-to-b from-red-950/40 to-red-900/20 shadow-red-500/20';
      if (isCompleted) return 'border-emerald-600/40 bg-linear-to-b from-emerald-950/30 to-emerald-900/20 shadow-emerald-500/10';
      return 'border-slate-700/40 bg-linear-to-b from-slate-800/50 to-slate-900/50 shadow-slate-950/50';
    };

    return (
      <div
        className="group"
        onClick={() => setSelectedMatch(isExpanded ? null : match.id)}
      >
        <div className={`relative border rounded-2xl overflow-hidden shadow-lg transition-all duration-300 cursor-pointer hover:shadow-xl ${getStatusColor()}`}>

          {/* Header with Date and Status */}
          <div className="px-5 py-3 bg-slate-950/60 border-b border-slate-700/30 flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              {match.date && (
                <>
                  <div className="text-xs text-slate-500 font-medium">
                    {new Date(match.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="w-px h-4 bg-slate-700/50"></div>
                  <div className="text-xs text-slate-400">
                    {new Date(match.date).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Live Badge */}
            {isLive && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-600/30 text-red-400 text-xs font-bold ml-auto">
                <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
                <span>LIVE</span>
              </div>
            )}

            {/* Postponed Badge */}
            {isPostponed && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-600/30 text-orange-400 text-xs font-bold ml-auto">
                <span>⏸️ POSTPONED</span>
              </div>
            )}
          </div>

          {/* Home Team */}
          <div className={`px-5 py-4 bg-slate-900/40 border-b border-slate-700/20 transition-colors ${
            match.winnerId === match.homeTeam.id && isCompleted
              ? 'bg-emerald-950/40'
              : ''
          }`}>
            <TeamDisplay
              team={match.homeTeam}
              score={match.homeScore}
              penalty={match.homePenalty}
              isWinner={match.winnerId === match.homeTeam.id && isCompleted}
              isTBD={homeIsTBD}
            />
          </div>

          {/* VS Divider */}
          <div className="px-5 py-2 flex items-center gap-3">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent"></div>
            <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">VS</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent"></div>
          </div>

          {/* Away Team */}
          <div className={`px-5 py-4 bg-slate-900/40 transition-colors ${
            match.winnerId === match.awayTeam.id && isCompleted
              ? 'bg-emerald-950/40'
              : ''
          }`}>
            <TeamDisplay
              team={match.awayTeam}
              score={match.awayScore}
              penalty={match.awayPenalty}
              isWinner={match.winnerId === match.awayTeam.id && isCompleted}
              isTBD={awayIsTBD}
            />
          </div>

          {/* Result Indicators Footer */}
          {isCompleted && (
            <div className="px-5 py-3 bg-slate-950/60 border-t border-slate-700/30 flex items-center justify-center gap-2 flex-wrap text-xs">
              {match.isExtraTime && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-600/20 text-amber-400 font-semibold">
                  <span>⏱️</span>
                  <span>AET</span>
                </span>
              )}
              {match.isPenalty && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-600/20 text-purple-400 font-semibold">
                  <span>⚽</span>
                  <span>PEN</span>
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-600/20 text-green-400 font-semibold">
                <span>✓</span>
                <span>FINAL</span>
              </span>
            </div>
          )}

          {/* Expanded Details */}
          {isExpanded && (
            <div className="px-5 py-4 bg-slate-900/30 border-t border-slate-700/30 text-xs text-slate-400 space-y-2">
              <div className="flex justify-between items-center">
                <span>Match ID</span>
                <span className="font-mono text-slate-500">{match.id.slice(0, 8)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Status</span>
                <span className="capitalize font-semibold text-slate-300">{match.status}</span>
              </div>
              {match.aggregateWinnerId && (
                <div className="flex justify-between items-center pt-2 border-t border-slate-700/30">
                  <span>Aggregate Winner</span>
                  <span className="font-semibold text-emerald-400">
                    {match.aggregateWinnerId === match.homeTeam.id
                      ? match.homeTeam.name
                      : match.awayTeam.name}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (displayMatches.length === 0) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-white">
            {getStageTitle()}
          </h2>
          {description && (
            <p className="text-slate-400">{description}</p>
          )}
        </div>

        {/* Empty State */}
        <div className="relative">
          <div className="absolute inset-0 bg-linear-to-br from-slate-800/20 to-slate-900/20 rounded-3xl blur-2xl"></div>
          <div className="relative bg-slate-900/60 border border-slate-700/30 rounded-3xl p-24 text-center backdrop-blur-sm">
            <div className="text-6xl mb-4 opacity-30">🏟️</div>
            <p className="text-slate-400 font-semibold text-lg">No matches scheduled</p>
            <p className="text-slate-500 text-sm mt-2">for {getStageTitle()}</p>
          </div>
        </div>
      </div>
    );
  }

  // Determine grid layout
  const getGridClass = () => {
    const count = displayMatches.length;
    if (count === 1) return 'grid-cols-1 max-w-md mx-auto';
    if (count === 2) return 'grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto';
    if (count <= 4) return 'grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto';
    if (count <= 8) return 'grid-cols-2 lg:grid-cols-4 gap-5';
    return 'grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4';
  };

  return (
    <div className="space-y-8 w-full">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-4xl md:text-5xl font-black text-white">
            {getStageTitle()}
          </h2>
          {description && (
            <p className="text-slate-400 text-lg">{description}</p>
          )}
        </div>

        {/* Stats Bar */}
        {stats.total > 0 && (
          <div className="flex flex-wrap gap-3 pt-2">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl text-xs font-semibold text-slate-300">
              <span className="text-lg">🎯</span>
              <span>{stats.total} matches</span>
            </div>

            {stats.completed > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-900/40 border border-emerald-600/30 rounded-xl text-xs font-semibold text-emerald-400">
                <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                <span>{stats.completed} Completed</span>
              </div>
            )}

            {stats.live > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-red-900/40 border border-red-600/30 rounded-xl text-xs font-semibold text-red-400">
                <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
                <span>{stats.live} Live</span>
              </div>
            )}

            {stats.scheduled > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-900/40 border border-blue-600/30 rounded-xl text-xs font-semibold text-blue-400">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                <span>{stats.scheduled} Scheduled</span>
              </div>
            )}

            {stats.postponed > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-orange-900/40 border border-orange-600/30 rounded-xl text-xs font-semibold text-orange-400">
                <span>⏸️</span>
                <span>{stats.postponed} Postponed</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Matches Grid */}
      <div className={`grid ${getGridClass()}`}>
        {displayMatches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>

      {/* Info Footer */}
      <div className="bg-linear-to-r from-slate-800/50 to-slate-900/50 border border-slate-700/30 rounded-2xl p-6 backdrop-blur-sm">
        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">ℹ️ Information</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-400">
            <div>
              <span className="font-semibold text-slate-300">Winner Indicator:</span>
              <p>Highlighted row indicates match winner</p>
            </div>
            <div>
              <span className="font-semibold text-slate-300">Penalty Shootout:</span>
              <p>Shown in parentheses (e.g., 3 after score)</p>
            </div>
            <div>
              <span className="font-semibold text-slate-300">Extra Time:</span>
              <p>Marked with ⏱️ AET badge when applicable</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 pt-2 border-t border-slate-700/30">
            📊 Results are updated in real-time as matches conclude
          </p>
        </div>
      </div>
    </div>
  );
}

