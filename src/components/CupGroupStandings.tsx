'use client';

import Image from 'next/image';

import { CupGroupWithStandings } from '@/types/supabase';

interface CupGroupStandingsProps {
  groups: CupGroupWithStandings[];
  leagueType: 'football' | 'efootball';
}

export default function CupGroupStandings({ groups, leagueType }: CupGroupStandingsProps) {

  const getPositionBadge = (position: number, isQualified: boolean) => {
    if (position === 1) {
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 text-sm font-bold text-white shadow-lg shadow-yellow-500/30">
          {position}
        </div>
      );
    }
    if (position === 2) {
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-gray-300 to-gray-500 text-sm font-bold text-white shadow-lg shadow-gray-400/30">
          {position}
        </div>
      );
    }
    if (isQualified) {
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-green-700 text-sm font-bold text-white shadow-lg shadow-green-500/30">
          {position}
        </div>
      );
    }
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-700 text-sm font-bold text-gray-300">
        {position}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {groups.map((group) => (
        <div
          key={group.id}
          className="overflow-hidden rounded-2xl border border-gray-700 bg-gray-800 shadow-xl"
        >
          {/* Group Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3">
            <h3 className="text-lg font-bold text-white">
              Group {group.group_name}
            </h3>
          </div>

          {/* Standings Table */}
          <div className="bg-gray-900 px-4 py-3">
            <div className="grid grid-cols-12 gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-3">Tim</div>
              <div className="col-span-1 text-center">M</div>
              <div className="col-span-1 text-center">M</div>
              <div className="col-span-1 text-center">S</div>
              <div className="col-span-1 text-center">K</div>
              <div className="col-span-1 text-center hidden sm:block">SG</div>
              <div className="col-span-1 text-center font-bold">Poin</div>
            </div>
          </div>

          {/* Standings Rows */}
          <div className="divide-y divide-gray-700">
            {group.standings.map((standing) => {
              const isQualified = standing.qualified;
              const position = standing.position;

              return (
                <div
                  key={standing.id}
                  className={`transition-colors hover:bg-gray-700/50 px-4 py-3 ${
                    isQualified ? 'bg-green-900/10 border-l-4 border-green-500' : 'border-l-4 border-transparent'
                  }`}
                >
                  <div className="grid grid-cols-12 gap-2 items-center text-sm">
                    {/* Position */}
                    <div className="col-span-1 flex justify-center">
                      {getPositionBadge(position, isQualified)}
                    </div>

                    {/* Team */}
                    <div className="col-span-3 flex items-center gap-2 min-w-0">
                      {standing.team?.logo_url ? (
                        <Image
                          src={standing.team.logo_url}
                          alt=""
                          className="h-6 w-6 flex-shrink-0 rounded object-contain"
                         width={24} height={24} />
                      ) : (
                        <div className="h-6 w-6 flex-shrink-0 rounded bg-gray-700 flex items-center justify-center">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                      )}
                      <span className="truncate font-medium text-white">
                        {standing.team?.name}
                      </span>
                      {position === 1 && (
                        <svg className="w-4 h-4 text-yellow-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      )}
                    </div>

                    {/* Matches Played */}
                    <div className="col-span-1 text-center text-gray-300">
                      {standing.played}
                    </div>

                    {/* Wins */}
                    <div className="col-span-1 text-center text-green-400 font-semibold">
                      {standing.won}
                    </div>

                    {/* Draws */}
                    <div className="col-span-1 text-center text-amber-400 font-semibold">
                      {standing.drawn}
                    </div>

                    {/* Losses */}
                    <div className="col-span-1 text-center text-red-400 font-semibold">
                      {standing.lost}
                    </div>

                    {/* Goal Difference */}
                    <div className={`col-span-1 text-center font-semibold hidden sm:block ${
                      standing.goal_difference > 0 ? 'text-green-400' :
                      standing.goal_difference < 0 ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      {standing.goal_difference > 0 ? '+' : ''}{standing.goal_difference}
                    </div>

                    {/* Points */}
                    <div className="col-span-1 text-center">
                      <span className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-2.5 py-1 text-sm font-bold text-white shadow-lg">
                        {standing.points}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Qualification Legend */}
          {group.standings.some(s => s.qualified) && (
            <div className="border-t border-gray-700 bg-gray-900/50 px-4 py-3">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <span>Lolos ke fase berikutnya</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

