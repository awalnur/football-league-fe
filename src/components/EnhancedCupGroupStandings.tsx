'use client';

import Image from 'next/image';
import { CupGroupWithStandings } from '@/types/supabase';
import PositionBadge from './PositionBadge';

interface EnhancedCupGroupStandingsProps {
  groups: CupGroupWithStandings[];
}

export default function EnhancedCupGroupStandings({ groups }: EnhancedCupGroupStandingsProps) {

  const getPositionBadge = (position: number, isQualified: boolean) => {
    // Use custom green badge for qualified teams (not 1st or 2nd)
    if (isQualified && position > 2) {
      return (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-400/20">
          {position}
        </div>
      );
    }
    // Use standard position badge for top 2
    return <PositionBadge position={position} />;
  };

  // Calculate group statistics
  const getGroupStats = (group: CupGroupWithStandings) => {
    const totalMatches = group.standings.reduce((sum, s) => sum + s.played, 0);
    const totalGoals = group.standings.reduce((sum, s) => sum + s.goals_for, 0);
    return { totalMatches, totalGoals };
  };

  return (
    <div className="space-y-8">
      {/* Groups Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {groups.map((group) => {
          const stats = getGroupStats(group);
          
          return (
            <div
              key={group.id}
              className="group/card relative overflow-hidden rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900 shadow-2xl hover:shadow-blue-500/10 transition-all duration-300"
            >
              {/* Decorative gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300"></div>
              
              {/* Group Header */}
              <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <span className="text-2xl">🏆</span>
                      <span>Group {group.group_name}</span>
                    </h3>
                    <div className="flex items-center gap-4 mt-1 text-xs text-blue-100">
                      <span className="flex items-center gap-1">
                        <span>⚽</span>
                        <span>{stats.totalGoals} goals</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span>📊</span>
                        <span>{stats.totalMatches} matches</span>
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-white/90">
                      {group.standings.length}
                    </div>
                    <div className="text-xs text-blue-100">teams</div>
                  </div>
                </div>
              </div>

              {/* Table Header */}
              <div className="relative bg-slate-900/80 px-5 py-3 border-b border-slate-700/50">
                <div className="grid grid-cols-12 gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <div className="col-span-1 text-center">#</div>
                  <div className="col-span-4">Team</div>
                  <div className="col-span-1 text-center" title="Played">P</div>
                  <div className="col-span-1 text-center" title="Won">W</div>
                  <div className="col-span-1 text-center" title="Draw">D</div>
                  <div className="col-span-1 text-center" title="Lost">L</div>
                  <div className="col-span-1 text-center hidden sm:block" title="Goal Difference">GD</div>
                  <div className="col-span-2 text-center font-bold">Pts</div>
                </div>
              </div>

              {/* Standings Rows */}
              <div className="relative divide-y divide-slate-700/30">
                {group.standings.map((standing, index) => {
                  const isQualified = standing.qualified;
                  const position = standing.position;
                  const isLeader = position === 1;

                  return (
                    <div
                      key={standing.id}
                      className={`relative transition-all duration-200 hover:bg-slate-700/30 px-5 py-4 ${
                        isQualified ? 'bg-emerald-900/10' : ''
                      } ${isLeader ? 'bg-gradient-to-r from-yellow-900/10 to-transparent' : ''}`}
                    >
                      {/* Qualified indicator bar */}
                      {isQualified && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-emerald-600"></div>
                      )}
                      
                      <div className="grid grid-cols-12 gap-2 items-center text-sm relative z-10">
                        {/* Position */}
                        <div className="col-span-1 flex justify-center">
                          {getPositionBadge(position, isQualified)}
                        </div>

                        {/* Team */}
                        <div className="col-span-4 flex items-center gap-2 min-w-0">
                          {standing.team?.logo_url ? (
                            <div className="relative w-8 h-8 flex-shrink-0">
                              <Image
                                src={standing.team.logo_url}
                                alt=""
                                className="object-contain"
                                width={32}
                                height={32}
                              />
                            </div>
                          ) : (
                            <div className="w-8 h-8 flex-shrink-0 rounded-full bg-slate-700 flex items-center justify-center">
                              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                              </svg>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <span className={`truncate font-semibold block ${
                              isLeader ? 'text-yellow-300' : 'text-white'
                            }`}>
                              {standing.team?.short_name || standing.team?.name}
                            </span>
                          </div>
                          {isLeader && (
                            <svg className="w-4 h-4 text-yellow-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="col-span-1 text-center text-slate-300 font-medium">
                          {standing.played}
                        </div>
                        <div className="col-span-1 text-center text-emerald-400 font-semibold">
                          {standing.won}
                        </div>
                        <div className="col-span-1 text-center text-amber-400 font-semibold">
                          {standing.drawn}
                        </div>
                        <div className="col-span-1 text-center text-red-400 font-semibold">
                          {standing.lost}
                        </div>
                        <div className={`col-span-1 text-center font-semibold hidden sm:block ${
                          standing.goal_difference > 0 ? 'text-emerald-400' :
                          standing.goal_difference < 0 ? 'text-red-400' : 'text-slate-400'
                        }`}>
                          {standing.goal_difference > 0 ? '+' : ''}{standing.goal_difference}
                        </div>

                        {/* Points */}
                        <div className="col-span-2 flex justify-center">
                          <div className={`inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-sm font-bold text-white shadow-lg min-w-[3rem] ${
                            isLeader 
                              ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 shadow-yellow-500/30' 
                              : 'bg-gradient-to-r from-indigo-600 to-purple-600 shadow-indigo-500/30'
                          }`}>
                            {standing.points}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Qualification Legend */}
              {group.standings.some(s => s.qualified) && (
                <div className="relative border-t border-slate-700/50 bg-slate-900/50 px-5 py-3">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <div className="h-3 w-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"></div>
                    <span>Qualified for knockout stage</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend Card */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
        <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <span>📖</span>
          <span>Legend</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">P:</span>
            <span className="text-white">Played</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">W:</span>
            <span className="text-emerald-400">Won</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">D:</span>
            <span className="text-amber-400">Draw</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">L:</span>
            <span className="text-red-400">Lost</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">GD:</span>
            <span className="text-white">Goal Difference</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">Pts:</span>
            <span className="text-white">Points</span>
          </div>
          <div className="flex items-center gap-2 text-sm col-span-2">
            <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
            <span className="text-white">Qualified</span>
          </div>
        </div>
      </div>
    </div>
  );
}
