'use client';

import { MatchWithTeams } from '@/types/supabase';

interface KnockoutBracketProps {
  matches: MatchWithTeams[];
  stage: 'round_of_16' | 'quarter_final' | 'semi_final' | 'final' | 'third_place';
}

export default function KnockoutBracket({ matches, stage }: KnockoutBracketProps) {

  const getStageTitle = (stage: string) => {
    const titles: Record<string, string> = {
      round_of_32: 'Round of 32',
      round_of_16: 'Round of 16',
      quarter_final: 'Quarter Finals',
      semi_final: 'Semi Finals',
      final: 'Final',
      third_place: '3rd Place Match'
    };
    return titles[stage] || stage;
  };

  const getWinner = (match: MatchWithTeams) => {
    if (match.status !== 'completed' || match.home_score === null || match.away_score === null) {
      return null;
    }

    // Check penalties
    if (match.is_penalty && match.home_penalty_score !== null && match.away_penalty_score !== null) {
      if (match.home_penalty_score > match.away_penalty_score) {
        return match.home_team_id;
      } else {
        return match.away_team_id;
      }
    }

    // Check aggregate for two-leg
    if (match.aggregate_winner_id) {
      return match.aggregate_winner_id;
    }

    // Single match
    if (match.home_score > match.away_score) {
      return match.home_team_id;
    } else if (match.away_score > match.home_score) {
      return match.away_team_id;
    }

    return null;
  };

  const renderMatchCard = (match: MatchWithTeams) => {
    const winner = getWinner(match);
    const isHomeWinner = winner === match.home_team_id;
    const isAwayWinner = winner === match.away_team_id;

    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden hover:border-slate-600 transition-colors">
        {/* Home Team */}
        <div className={`flex items-center justify-between p-3 ${
          isHomeWinner ? 'bg-green-900/20 border-l-4 border-green-500' : ''
        }`}>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {match.home_team?.logo_url ? (
              <img
                src={match.home_team.logo_url}
                alt=""
                className="w-6 h-6 object-contain shrink-0"
              />
            ) : (
              <span className="text-lg shrink-0">⚽</span>
            )}
            <span className={`text-sm truncate ${
              isHomeWinner ? 'font-bold text-white' : 'text-slate-300'
            }`}>
              {match.home_team?.short_name || match.home_team?.name || 'TBD'}
            </span>
          </div>
          <div className="flex items-center gap-2 ml-2">
            {match.status === 'completed' ? (
              <>
                <span className={`text-lg font-bold ${
                  isHomeWinner ? 'text-green-400' : 'text-slate-400'
                }`}>
                  {match.home_score}
                </span>
                {match.is_penalty && match.home_penalty_score !== null && (
                  <span className="text-xs text-slate-500">
                    ({match.home_penalty_score})
                  </span>
                )}
              </>
            ) : (
              <span className="text-slate-500">-</span>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-700"></div>

        {/* Away Team */}
        <div className={`flex items-center justify-between p-3 ${
          isAwayWinner ? 'bg-green-900/20 border-l-4 border-green-500' : ''
        }`}>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {match.away_team?.logo_url ? (
              <img
                src={match.away_team.logo_url}
                alt=""
                className="w-6 h-6 object-contain shrink-0"
              />
            ) : (
              <span className="text-lg shrink-0">⚽</span>
            )}
            <span className={`text-sm truncate ${
              isAwayWinner ? 'font-bold text-white' : 'text-slate-300'
            }`}>
              {match.away_team?.short_name || match.away_team?.name || 'TBD'}
            </span>
          </div>
          <div className="flex items-center gap-2 ml-2">
            {match.status === 'completed' ? (
              <>
                <span className={`text-lg font-bold ${
                  isAwayWinner ? 'text-green-400' : 'text-slate-400'
                }`}>
                  {match.away_score}
                </span>
                {match.is_penalty && match.away_penalty_score !== null && (
                  <span className="text-xs text-slate-500">
                    ({match.away_penalty_score})
                  </span>
                )}
              </>
            ) : (
              <span className="text-slate-500">-</span>
            )}
          </div>
        </div>

        {/* Match Info */}
        <div className="bg-slate-900/50 px-3 py-2 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            {match.match_date ? new Date(match.match_date).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short'
            }) : 'TBD'}
          </span>
          <div className="flex items-center gap-2">
            {match.is_extra_time && (
              <span className="bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded text-[10px]">
                AET
              </span>
            )}
            {match.is_penalty && (
              <span className="bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded text-[10px]">
                PEN
              </span>
            )}
            {match.leg_number && match.leg_number > 1 && (
              <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-[10px]">
                Leg {match.leg_number}
              </span>
            )}
            <span className={`px-2 py-0.5 rounded text-[10px] ${
              match.status === 'completed' ? 'bg-green-500/20 text-green-400' :
              match.status === 'live' ? 'bg-red-500/20 text-red-400' :
              'bg-slate-700 text-slate-400'
            }`}>
              {match.status === 'completed' ? 'FT' :
               match.status === 'live' ? 'LIVE' :
               match.status}
            </span>
          </div>
        </div>
      </div>
    );
  };

  if (matches.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 text-center">
        <p className="text-slate-400">No matches for {getStageTitle(stage)}</p>
      </div>
    );
  }

  // Group by match_week for two-leg ties
  const matchesByWeek = matches.reduce((acc, match) => {
    const week = match.match_week || 1;
    if (!acc[week]) acc[week] = [];
    acc[week].push(match);
    return acc;
  }, {} as Record<number, MatchWithTeams[]>);

  const weeks = Object.keys(matchesByWeek).map(Number).sort();

  return (
    <div className="space-y-6">
      {/* Stage Title */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">{getStageTitle(stage)}</h2>
        <div className="h-1 w-24 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mt-2 rounded-full"></div>
      </div>

      {/* Bracket Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {weeks.map(week => (
          matchesByWeek[week].map((match) => (
            <div key={match.id}>
              {renderMatchCard(match)}
            </div>
          ))
        ))}
      </div>

      {/* Legend */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500/20 border border-green-500 rounded"></div>
            <span>Winner</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded">AET</span>
            <span>After Extra Time</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded">PEN</span>
            <span>Penalty Shootout</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">Leg 2</span>
            <span>Two-Leg Tie</span>
          </div>
        </div>
      </div>
    </div>
  );
}
