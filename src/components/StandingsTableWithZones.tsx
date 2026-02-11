'use client';

import Image from 'next/image';

import { StandingWithTeam, LeagueZone } from '@/types/supabase';
import FormBadge from './FormBadge';
import PositionBadge from './PositionBadge';

interface StandingsTableWithZonesProps {
  standings: StandingWithTeam[];
  zones?: LeagueZone[];
  leagueType: 'football' | 'efootball';
}

export default function StandingsTableWithZones({
  standings,
  zones = []
}: StandingsTableWithZonesProps) {

  const getPositionStyle = (position: number, zone?: LeagueZone) => {
    if (zone) {
      return `bg-gradient-to-r from-[${zone.color_code}]/20 to-transparent border-l-4 border-[${zone.color_code}]`;
    }
    return 'border-l-4 border-transparent';
  };



  const parseForm = (form: string | null): ('W' | 'D' | 'L')[] => {
    if (!form) return [];
    return form.split('').slice(0, 5) as ('W' | 'D' | 'L')[];
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900 shadow-xl backdrop-blur-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800/50 px-4 sm:px-6 py-4 border-b border-slate-700/50">
        <div className="grid grid-cols-12 gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-4 sm:col-span-3">Tim</div>
          <div className="col-span-1 text-center hidden sm:block" title="Dimainkan">P</div>
          <div className="col-span-1 text-center" title="Menang">W</div>
          <div className="col-span-1 text-center hidden sm:block" title="Seri">D</div>
          <div className="col-span-1 text-center" title="Kalah">L</div>
          <div className="col-span-1 text-center hidden md:block" title="Selisih Gol">GD</div>
          <div className="col-span-2 sm:col-span-1 text-center font-bold" title="Poin">Pts</div>
          <div className="col-span-2 text-center hidden lg:block">Form</div>
        </div>
      </div>

      {/* Standings */}
      <div className="divide-y divide-slate-700/30" role="table" aria-label="Klasemen Liga">
        {standings.map((standing) => {
          const position = standing.position;
          const form = parseForm(standing.form);

          return (
            <div
              key={standing.id}
              role="row"
              className={`grid grid-cols-12 gap-2 px-4 sm:px-6 py-3 sm:py-4 transition-all duration-300 hover:bg-slate-700/50 ${getPositionStyle(position, standing.zone)}`}
              style={standing.zone ? {
                borderLeftColor: standing.zone.color_code,
                background: `linear-gradient(to right, ${standing.zone.color_code}20, transparent)`
              } : {}}
            >
              <div className="col-span-1 flex items-center justify-center" role="cell">
                <PositionBadge position={position} size="md" />
              </div>
              <div className="col-span-4 sm:col-span-3 flex items-center gap-2 sm:gap-3 min-w-0" role="cell">
                {standing.team.logo_url ? (
                  <Image
                    src={standing.team.logo_url}
                    alt={`${standing.team.name} logo`}
                    className="w-6 h-6 sm:w-8 sm:h-8 object-contain flex-shrink-0"
                    width={32} 
                    height={32} 
                  />
                ) : (
                  <span className="text-xl sm:text-2xl flex-shrink-0" aria-hidden="true">⚽</span>
                )}
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-white text-sm sm:text-base truncate">
                    {standing.team.short_name || standing.team.name}
                  </span>
                  {standing.zone && (
                    <span
                      className="text-xs truncate"
                      style={{ color: standing.zone.color_code }}
                      aria-label={standing.zone.label}
                    >
                      {standing.zone.label}
                    </span>
                  )}
                </div>
              </div>
              <div className="col-span-1 items-center justify-center text-slate-300 text-sm hidden sm:flex font-medium" role="cell">
                {standing.played}
              </div>
              <div className="col-span-1 flex items-center justify-center font-medium text-emerald-400 text-sm" role="cell">
                {standing.won}
              </div>
              <div className="col-span-1 items-center justify-center text-amber-400 text-sm hidden sm:flex font-medium" role="cell">
                {standing.drawn}
              </div>
              <div className="col-span-1 flex items-center justify-center font-medium text-red-400 text-sm" role="cell">
                {standing.lost}
              </div>
              <div className="col-span-1 items-center justify-center hidden md:flex" role="cell">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-bold ${
                    standing.goal_difference > 0
                      ? 'bg-emerald-900/30 text-emerald-400'
                      : standing.goal_difference < 0
                      ? 'bg-red-900/30 text-red-400'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {standing.goal_difference > 0 ? '+' : ''}
                  {standing.goal_difference}
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1 flex items-center justify-center" role="cell">
                <span className="rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 px-2 sm:px-3 py-1 text-sm font-bold text-white shadow-lg shadow-indigo-500/30">
                  {standing.points}
                </span>
              </div>
              <div className="col-span-2 items-center justify-center gap-1 hidden lg:flex" role="cell">
                {form.map((result, i) => (
                  <FormBadge key={i} result={result} size="sm" />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      {zones.length > 0 && (
        <div className="border-t border-slate-700/50 bg-slate-900/80 px-6 py-4">
          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-300">
            {zones.map((zone) => (
              <div key={zone.id} className="flex items-center gap-2 transition-opacity hover:opacity-80">
                <div
                  className="h-3 w-3 rounded-full shadow-lg"
                  style={{ backgroundColor: zone.color_code, boxShadow: `0 0 8px ${zone.color_code}40` }}
                />
                <span>{zone.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
