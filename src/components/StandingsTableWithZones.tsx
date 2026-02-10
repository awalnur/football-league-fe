'use client';

import { StandingWithTeam, LeagueZone } from '@/types/supabase';

interface FormBadgeProps {
  result: 'W' | 'D' | 'L';
}

function FormBadge({ result }: FormBadgeProps) {
  const colors = {
    W: 'bg-emerald-500 text-white',
    D: 'bg-amber-500 text-white',
    L: 'bg-red-500 text-white',
  };

  return (
    <span
      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${colors[result]} transition-transform hover:scale-110`}
    >
      {result}
    </span>
  );
}

interface StandingsTableWithZonesProps {
  standings: StandingWithTeam[];
  zones?: LeagueZone[];
  leagueType: 'football' | 'efootball';
}

export default function StandingsTableWithZones({
  standings,
  zones = [],
  leagueType
}: StandingsTableWithZonesProps) {

  const getPositionStyle = (position: number, zone?: LeagueZone) => {
    if (zone) {
      return `bg-gradient-to-r from-[${zone.color_code}]/20 to-transparent border-l-4 border-[${zone.color_code}]`;
    }
    return 'border-l-4 border-transparent';
  };

  const getPositionBadge = (position: number) => {
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
    if (position === 3) {
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-600 to-amber-800 text-sm font-bold text-white shadow-lg shadow-amber-600/30">
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

  const parseForm = (form: string | null): ('W' | 'D' | 'L')[] => {
    if (!form) return [];
    return form.split('').slice(0, 5) as ('W' | 'D' | 'L')[];
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-700 bg-gray-800 shadow-xl">
      {/* Header */}
      <div className="bg-gray-900 px-6 py-4">
        <div className="grid grid-cols-12 gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-3">Tim</div>
          <div className="col-span-1 text-center">M</div>
          <div className="col-span-1 text-center">M</div>
          <div className="col-span-1 text-center">S</div>
          <div className="col-span-1 text-center">K</div>
          <div className="col-span-1 text-center hidden sm:block">SG</div>
          <div className="col-span-1 text-center font-bold">Poin</div>
          <div className="col-span-2 text-center hidden md:block">Form</div>
        </div>
      </div>

      {/* Standings */}
      <div className="divide-y divide-gray-700">
        {standings.map((standing) => {
          const position = standing.position;
          const form = parseForm(standing.form);

          return (
            <div
              key={standing.id}
              className={`grid grid-cols-12 gap-2 px-6 py-4 transition-all duration-300 hover:bg-gray-700/50 ${getPositionStyle(position, standing.zone)}`}
              style={standing.zone ? {
                borderLeftColor: standing.zone.color_code,
                background: `linear-gradient(to right, ${standing.zone.color_code}20, transparent)`
              } : {}}
            >
              <div className="col-span-1 flex items-center justify-center">
                {getPositionBadge(position)}
              </div>
              <div className="col-span-3 flex items-center gap-3">
                {standing.team.logo_url ? (
                  <img
                    src={standing.team.logo_url}
                    alt={standing.team.name}
                    className="w-8 h-8 object-contain"
                  />
                ) : (
                  <span className="text-2xl">⚽</span>
                )}
                <div className="flex flex-col">
                  <span className="font-semibold text-white truncate">
                    {standing.team.name}
                  </span>
                  {standing.zone && (
                    <span
                      className="text-xs truncate"
                      style={{ color: standing.zone.color_code }}
                    >
                      {standing.zone.label}
                    </span>
                  )}
                </div>
              </div>
              <div className="col-span-1 flex items-center justify-center text-gray-400">
                {standing.played}
              </div>
              <div className="col-span-1 flex items-center justify-center font-medium text-emerald-400">
                {standing.won}
              </div>
              <div className="col-span-1 flex items-center justify-center text-gray-400">
                {standing.drawn}
              </div>
              <div className="col-span-1 flex items-center justify-center font-medium text-red-400">
                {standing.lost}
              </div>
              <div className="col-span-1 items-center justify-center hidden sm:flex">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-bold ${
                    standing.goal_difference > 0
                      ? 'bg-emerald-900/30 text-emerald-400'
                      : standing.goal_difference < 0
                      ? 'bg-red-900/30 text-red-400'
                      : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {standing.goal_difference > 0 ? '+' : ''}
                  {standing.goal_difference}
                </span>
              </div>
              <div className="col-span-1 flex items-center justify-center">
                <span className="rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 px-3 py-1 text-sm font-bold text-white shadow-lg shadow-indigo-500/30">
                  {standing.points}
                </span>
              </div>
              <div className="col-span-2 items-center justify-center gap-1 hidden md:flex">
                {form.map((result, i) => (
                  <FormBadge key={i} result={result} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      {zones.length > 0 && (
        <div className="border-t border-gray-700 bg-gray-900 px-6 py-4">
          <div className="flex flex-wrap items-center gap-6 text-xs text-gray-400">
            {zones.map((zone) => (
              <div key={zone.id} className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: zone.color_code }}
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
