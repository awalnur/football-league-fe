'use client';

import { LeagueWithHierarchy } from '@/types/supabase';
import Link from 'next/link';

interface LeagueHierarchyViewProps {
  leagues: LeagueWithHierarchy[];
}

export default function LeagueHierarchyView({ leagues }: LeagueHierarchyViewProps) {

  const getTypeIcon = (type: string) => {
    return type === 'football' ? '⚽' : '🎮';
  };

  // Group leagues by type
  const footballLeagues = leagues.filter(l => l.type === 'football' && l.tournament_format === 'league');
  const efootballLeagues = leagues.filter(l => l.type === 'efootball' && l.tournament_format === 'league');
  const cupLeagues = leagues.filter(l => l.tournament_format !== 'league');

  const renderLeagueCard = (league: LeagueWithHierarchy) => (
    <div
      key={league.id}
      className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{getTypeIcon(league.type)}</span>
            <h3 className="font-semibold text-white">{league.name}</h3>
          </div>
          <p className="text-sm text-slate-400">{league.season}</p>
        </div>
        <Link
          href={`/standings/enhanced?league=${league.id}`}
          className="text-xs px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
        >
          Lihat
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
        <div className="bg-slate-900/50 rounded px-2 py-1">
          <span className="text-slate-500 block">Tim</span>
          <span className="text-white font-semibold">{league.team_count || 0}</span>
        </div>
        {league.promotion_slots > 0 && (
          <div className="bg-green-900/20 rounded px-2 py-1">
            <span className="text-slate-500 block">⬆️ Promosi</span>
            <span className="text-green-400 font-semibold">{league.promotion_slots}</span>
          </div>
        )}
        {league.relegation_slots > 0 && (
          <div className="bg-red-900/20 rounded px-2 py-1">
            <span className="text-slate-500 block">⬇️ Degradasi</span>
            <span className="text-red-400 font-semibold">{league.relegation_slots}</span>
          </div>
        )}
        {league.playoff_slots > 0 && (
          <div className="bg-blue-900/20 rounded px-2 py-1">
            <span className="text-slate-500 block">🏆 Playoff</span>
            <span className="text-blue-400 font-semibold">{league.playoff_slots}</span>
          </div>
        )}
      </div>

      {/* Hierarchy Links */}
      <div className="space-y-1 text-xs">
        {league.parent_league && (
          <div className="flex items-center gap-2 text-slate-400">
            <span className="text-green-400">⬆️</span>
            <span>Promosi ke:</span>
            <span className="text-green-400 font-medium">{league.parent_league.name}</span>
          </div>
        )}
        {league.child_league && (
          <div className="flex items-center gap-2 text-slate-400">
            <span className="text-red-400">⬇️</span>
            <span>Degradasi ke:</span>
            <span className="text-red-400 font-medium">{league.child_league.name}</span>
          </div>
        )}
        {!league.parent_league && !league.child_league && league.tournament_format === 'league' && (
          <div className="text-slate-500 italic">
            Tidak ada link promosi/degradasi
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Football Leagues */}
      {footballLeagues.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">⚽</span>
            <div>
              <h2 className="text-xl font-bold text-white">Football Leagues</h2>
              <p className="text-sm text-slate-400">Sistem liga dengan promosi & degradasi</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {footballLeagues.map(renderLeagueCard)}
          </div>
        </div>
      )}

      {/* eFootball Leagues */}
      {efootballLeagues.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🎮</span>
            <div>
              <h2 className="text-xl font-bold text-white">eFootball Leagues</h2>
              <p className="text-sm text-slate-400">Liga esports dengan sistem tier</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {efootballLeagues.map(renderLeagueCard)}
          </div>
        </div>
      )}

      {/* Cup Tournaments */}
      {cupLeagues.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🏆</span>
            <div>
              <h2 className="text-xl font-bold text-white">Cup Tournaments</h2>
              <p className="text-sm text-slate-400">Kompetisi piala knockout</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cupLeagues.map((league) => (
              <div
                key={league.id}
                className="bg-slate-800 border border-slate-700 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">🏅</span>
                      <h3 className="font-semibold text-white">{league.name}</h3>
                    </div>
                    <p className="text-sm text-slate-400">{league.season}</p>
                  </div>
                  <Link
                    href={`/standings/enhanced?league=${league.id}`}
                    className="text-xs px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
                  >
                    Lihat
                  </Link>
                </div>
                <div className="space-y-1 text-xs text-slate-400">
                  <div>Format: {league.tournament_format === 'cup' ? 'Knockout' : 'Hybrid'}</div>
                  {league.has_group_stage && (
                    <div className="text-blue-400">
                      Group Stage ({league.teams_per_group} tim per group)
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Keterangan</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-green-400">⬆️</span>
            <span className="text-slate-400">Promosi ke liga atas</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-red-400">⬇️</span>
            <span className="text-slate-400">Degradasi ke liga bawah</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-400">🏆</span>
            <span className="text-slate-400">Playoff promosi/degradasi</span>
          </div>
          <div className="flex items-center gap-2">
            <span>⚽/🎮</span>
            <span className="text-slate-400">Football / eFootball</span>
          </div>
        </div>
      </div>
    </div>
  );
}
