'use client';

import Image from 'next/image';
import { MatchWithTeams } from '@/types/supabase';

interface TournamentBracketProps {
  matches: MatchWithTeams[];
  stage: 'round_of_16' | 'quarter_final' | 'semi_final' | 'final';
}

export default function TournamentBracket({ matches, stage }: TournamentBracketProps) {
  const getStageTitle = () => {
    const titles: Record<string, string> = {
      round_of_16: 'Round of 16',
      quarter_final: 'Quarter-Finals',
      semi_final: 'Semi-Finals',
      final: 'Final'
    };
    return titles[stage] || stage;
  };

  const getWinner = (match: MatchWithTeams) => {
    if (match.status !== 'completed' || match.home_score === null || match.away_score === null) {
      return null;
    }

    if (match.is_penalty && match.home_penalty_score !== null && match.away_penalty_score !== null) {
      return match.home_penalty_score > match.away_penalty_score ? match.home_team_id : match.away_team_id;
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

  // Group matches by tie (for two-leg matches)
  const groupedMatches = matches.reduce((acc, match) => {
    const tieKey = match.leg_number ? `${match.home_team_id}-${match.away_team_id}` : match.id;
    if (!acc[tieKey]) {
      acc[tieKey] = [];
    }
    acc[tieKey].push(match);
    return acc;
  }, {} as Record<string, MatchWithTeams[]>);

  const ties = Object.values(groupedMatches);

  const renderMatchCard = (tieMatches: MatchWithTeams[]) => {
    const firstMatch = tieMatches[0];
    const secondMatch = tieMatches.length > 1 ? tieMatches[1] : null;
    const winner = getWinner(secondMatch || firstMatch);
    const isHomeWinner = winner === firstMatch.home_team_id;
    const isAwayWinner = winner === firstMatch.away_team_id;

    // Calculate aggregate
    let homeAggregate = 0;
    let awayAggregate = 0;
    if (tieMatches.length > 1) {
      tieMatches.forEach(m => {
        if (m.home_score !== null && m.away_score !== null) {
          homeAggregate += m.home_score;
          awayAggregate += m.away_score;
        }
      });
    }

    return (
      <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden hover:border-slate-600 transition-all hover:shadow-xl hover:shadow-blue-500/10">
        {/* Home Team */}
        <div className={`relative group ${isHomeWinner ? 'bg-gradient-to-r from-emerald-900/30 via-slate-800 to-slate-800' : ''}`}>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {firstMatch.home_team?.logo_url ? (
                <div className="relative w-10 h-10 shrink-0">
                  <Image
                    src={firstMatch.home_team.logo_url}
                    alt=""
                    className="object-contain"
                    width={40}
                    height={40}
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
                  <span className="text-lg">⚽</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className={`font-semibold truncate ${isHomeWinner ? 'text-white' : 'text-slate-300'}`}>
                  {firstMatch.home_team?.name || 'TBD'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 ml-4">
              {firstMatch.status === 'completed' ? (
                <>
                  {tieMatches.length > 1 && (
                    <span className={`text-2xl font-bold tabular-nums ${
                      isHomeWinner ? 'text-emerald-400' : 'text-slate-400'
                    }`}>
                      {homeAggregate}
                    </span>
                  )}
                  {tieMatches.length === 1 && (
                    <span className={`text-2xl font-bold tabular-nums ${
                      isHomeWinner ? 'text-emerald-400' : 'text-slate-400'
                    }`}>
                      {firstMatch.home_score}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-xl text-slate-600">-</span>
              )}
              {isHomeWinner && (
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              )}
            </div>
          </div>
          {/* Subtle border for winner */}
          {isHomeWinner && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-emerald-600"></div>
          )}
        </div>

        {/* Divider with match info */}
        <div className="relative h-px bg-slate-700">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-800 px-3">
            {tieMatches.length > 1 ? (
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                Agg
              </span>
            ) : (
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                {firstMatch.status === 'completed' ? 'FT' : firstMatch.status === 'live' ? 'LIVE' : 'VS'}
              </span>
            )}
          </div>
        </div>

        {/* Away Team */}
        <div className={`relative group ${isAwayWinner ? 'bg-gradient-to-r from-emerald-900/30 via-slate-800 to-slate-800' : ''}`}>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {firstMatch.away_team?.logo_url ? (
                <div className="relative w-10 h-10 shrink-0">
                  <Image
                    src={firstMatch.away_team.logo_url}
                    alt=""
                    className="object-contain"
                    width={40}
                    height={40}
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
                  <span className="text-lg">⚽</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className={`font-semibold truncate ${isAwayWinner ? 'text-white' : 'text-slate-300'}`}>
                  {firstMatch.away_team?.name || 'TBD'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 ml-4">
              {firstMatch.status === 'completed' ? (
                <>
                  {tieMatches.length > 1 && (
                    <span className={`text-2xl font-bold tabular-nums ${
                      isAwayWinner ? 'text-emerald-400' : 'text-slate-400'
                    }`}>
                      {awayAggregate}
                    </span>
                  )}
                  {tieMatches.length === 1 && (
                    <span className={`text-2xl font-bold tabular-nums ${
                      isAwayWinner ? 'text-emerald-400' : 'text-slate-400'
                    }`}>
                      {firstMatch.away_score}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-xl text-slate-600">-</span>
              )}
              {isAwayWinner && (
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              )}
            </div>
          </div>
          {/* Subtle border for winner */}
          {isAwayWinner && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-emerald-600"></div>
          )}
        </div>

        {/* Match Details Footer */}
        <div className="bg-slate-900/50 px-4 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            {firstMatch.match_date && (
              <span>
                {new Date(firstMatch.match_date).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short'
                })}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {tieMatches.length > 1 && (
              <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-[10px] font-semibold">
                2 LEG
              </span>
            )}
            {firstMatch.is_extra_time && (
              <span className="bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded text-[10px] font-semibold">
                AET
              </span>
            )}
            {firstMatch.is_penalty && (
              <span className="bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded text-[10px] font-semibold">
                PEN
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (matches.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-12 text-center">
        <div className="text-6xl mb-4 opacity-50">🏆</div>
        <p className="text-slate-400 text-lg">No matches scheduled yet for {getStageTitle()}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stage Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full shadow-lg shadow-blue-500/25">
          <span className="text-2xl">🏆</span>
          <h2 className="text-2xl font-bold">{getStageTitle()}</h2>
        </div>
        <div className="mt-4 flex items-center justify-center gap-2">
          <div className="h-px w-24 bg-gradient-to-r from-transparent to-blue-500/50"></div>
          <span className="text-slate-500 text-sm">{ties.length} {ties.length === 1 ? 'Match' : 'Ties'}</span>
          <div className="h-px w-24 bg-gradient-to-l from-transparent to-purple-500/50"></div>
        </div>
      </div>

      {/* Bracket Grid */}
      <div className={`grid gap-6 ${
        stage === 'final' ? 'grid-cols-1 max-w-md mx-auto' :
        stage === 'semi_final' ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto' :
        stage === 'quarter_final' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' :
        'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
      }`}>
        {ties.map((tieMatches, index) => (
          <div key={tieMatches[0].id} className="animate-fadeIn" style={{ animationDelay: `${index * 50}ms` }}>
            {renderMatchCard(tieMatches)}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
            <span>Winner</span>
          </div>
          {matches.some(m => m.leg_number && m.leg_number > 1) && (
            <div className="flex items-center gap-2">
              <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-xs font-semibold">2 LEG</span>
              <span>Two-Leg Tie</span>
            </div>
          )}
          {matches.some(m => m.is_extra_time) && (
            <div className="flex items-center gap-2">
              <span className="bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded text-xs font-semibold">AET</span>
              <span>After Extra Time</span>
            </div>
          )}
          {matches.some(m => m.is_penalty) && (
            <div className="flex items-center gap-2">
              <span className="bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded text-xs font-semibold">PEN</span>
              <span>Penalty Shootout</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
