'use client';

import { League } from '@/types/standings';

interface LeagueSelectorProps {
  leagues: League[];
  selectedLeague: string;
  onSelectLeague: (leagueId: string) => void;
  activeTab: 'football' | 'efootball';
  onTabChange: (tab: 'football' | 'efootball') => void;
}

export default function LeagueSelector({
  leagues,
  selectedLeague,
  onSelectLeague,
  activeTab,
  onTabChange,
}: LeagueSelectorProps) {
  const filteredLeagues = leagues.filter((league) => league.type === activeTab);

  return (
    <div className="space-y-6">
      {/* Tab Selector */}
      <div className="flex items-center justify-center">
        <div className="inline-flex rounded-2xl bg-zinc-100 p-1.5 dark:bg-zinc-800">
          <button
            onClick={() => onTabChange('football')}
            className={`flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-300 ${
              activeTab === 'football'
                ? 'bg-white text-zinc-900 shadow-lg dark:bg-zinc-700 dark:text-white'
                : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            <span className="text-xl">⚽</span>
            <span>Football</span>
          </button>
          <button
            onClick={() => onTabChange('efootball')}
            className={`flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-300 ${
              activeTab === 'efootball'
                ? 'bg-white text-zinc-900 shadow-lg dark:bg-zinc-700 dark:text-white'
                : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            <span className="text-xl">🎮</span>
            <span>eFootball</span>
          </button>
        </div>
      </div>

      {/* League Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredLeagues.map((league) => (
          <button
            key={league.id}
            onClick={() => onSelectLeague(league.id)}
            className={`group relative overflow-hidden rounded-2xl border-2 p-6 transition-all duration-300 ${
              selectedLeague === league.id
                ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg shadow-indigo-500/20 dark:from-indigo-900/30 dark:to-purple-900/30'
                : 'border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-600'
            }`}
          >
            {/* Selected indicator */}
            {selectedLeague === league.id && (
              <div className="absolute right-4 top-4">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500 text-white">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
            )}

            <div className="flex items-center gap-4">
              <span className="text-4xl transition-transform duration-300 group-hover:scale-110">
                {league.logo}
              </span>
              <div className="text-left">
                <h3 className="font-bold text-zinc-900 dark:text-white">
                  {league.name}
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Season {league.season}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
