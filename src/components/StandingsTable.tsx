'use client';

import { Team } from '@/types/standings';

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

interface StandingsTableProps {
  teams: Team[];
  leagueType: 'football' | 'efootball';
}

export default function StandingsTable({ teams, leagueType }: StandingsTableProps) {
  const getPositionStyle = (position: number) => {
    if (position <= 4) {
      return 'bg-gradient-to-r from-emerald-500/20 to-transparent border-l-4 border-emerald-500';
    }
    if (position <= 6) {
      return 'bg-gradient-to-r from-blue-500/20 to-transparent border-l-4 border-blue-500';
    }
    if (position >= teams.length - 2) {
      return 'bg-gradient-to-r from-red-500/20 to-transparent border-l-4 border-red-500';
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
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 text-sm font-bold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
        {position}
      </div>
    );
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
      <div className="bg-gradient-to-r from-zinc-100 to-zinc-50 px-6 py-4 dark:from-zinc-800 dark:to-zinc-900">
        <div className="grid grid-cols-12 gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
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

      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {teams.map((team, index) => {
          const position = index + 1;
          return (
            <div
              key={team.id}
              className={`grid grid-cols-12 gap-2 px-6 py-4 transition-all duration-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 ${getPositionStyle(position)}`}
            >
              <div className="col-span-1 flex items-center justify-center">
                {getPositionBadge(position)}
              </div>
              <div className="col-span-3 flex items-center gap-3">
                <span className="text-2xl">{team.logo}</span>
                <span className="font-semibold text-zinc-900 dark:text-white truncate">
                  {team.name}
                </span>
              </div>
              <div className="col-span-1 flex items-center justify-center text-zinc-600 dark:text-zinc-400">
                {team.played}
              </div>
              <div className="col-span-1 flex items-center justify-center font-medium text-emerald-600 dark:text-emerald-400">
                {team.won}
              </div>
              <div className="col-span-1 flex items-center justify-center text-zinc-600 dark:text-zinc-400">
                {team.drawn}
              </div>
              <div className="col-span-1 flex items-center justify-center font-medium text-red-600 dark:text-red-400">
                {team.lost}
              </div>
              <div className="col-span-1 items-center justify-center hidden sm:flex">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-bold ${
                    team.goalDifference > 0
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : team.goalDifference < 0
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  {team.goalDifference > 0 ? '+' : ''}
                  {team.goalDifference}
                </span>
              </div>
              <div className="col-span-1 flex items-center justify-center">
                <span className="rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 px-3 py-1 text-sm font-bold text-white shadow-lg shadow-indigo-500/30">
                  {team.points}
                </span>
              </div>
              <div className="col-span-2 items-center justify-center gap-1 hidden md:flex">
                {team.form.map((result, i) => (
                  <FormBadge key={i} result={result} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-zinc-200 bg-zinc-50 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-wrap items-center gap-6 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-emerald-500" />
            <span>{leagueType === 'football' ? 'Champions League' : 'Grand Finals'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-blue-500" />
            <span>{leagueType === 'football' ? 'Europa League' : 'Playoffs'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <span>{leagueType === 'football' ? 'Degradasi' : 'Eliminasi'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
