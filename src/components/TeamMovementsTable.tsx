'use client';

import Image from 'next/image';

import { TeamMovementWithDetails } from '@/types/supabase';

interface TeamMovementsTableProps {
  movements: TeamMovementWithDetails[];
  showTeamColumn?: boolean;
}

export default function TeamMovementsTable({
  movements,
  showTeamColumn = true
}: TeamMovementsTableProps) {

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'promotion':
        return { icon: '⬆️', color: 'text-green-400', label: 'Promosi' };
      case 'relegation':
        return { icon: '⬇️', color: 'text-red-400', label: 'Degradasi' };
      case 'playoff_winner':
        return { icon: '🏆', color: 'text-blue-400', label: 'Playoff Win' };
      case 'playoff_loser':
        return { icon: '💔', color: 'text-orange-400', label: 'Playoff Loss' };
      case 'transfer':
        return { icon: '↔️', color: 'text-gray-400', label: 'Transfer' };
      default:
        return { icon: '❓', color: 'text-gray-400', label: 'Unknown' };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (movements.length === 0) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
        <p className="text-gray-400">Belum ada riwayat perpindahan tim</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-700 bg-gray-800">
      {/* Header */}
      <div className="bg-gray-900 px-4 py-3">
        <h3 className="text-lg font-semibold text-white">Riwayat Perpindahan Tim</h3>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-900/50 text-xs text-gray-400 border-b border-gray-700">
            <tr>
              <th className="px-4 py-3 text-left">Musim</th>
              {showTeamColumn && <th className="px-4 py-3 text-left">Tim</th>}
              <th className="px-4 py-3 text-left">Tipe</th>
              <th className="px-4 py-3 text-left">Dari</th>
              <th className="px-4 py-3 text-center">→</th>
              <th className="px-4 py-3 text-left">Ke</th>
              <th className="px-4 py-3 text-center hidden md:table-cell">Posisi Akhir</th>
              <th className="px-4 py-3 text-left hidden lg:table-cell">Tanggal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {movements.map((movement) => {
              const movementInfo = getMovementIcon(movement.movement_type);

              return (
                <tr
                  key={movement.id}
                  className="hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-white">
                    {movement.season}
                  </td>
                  {showTeamColumn && (
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {movement.team.logo_url ? (
                          <Image
                          src={movement.team.logo_url}
                            alt={movement.team.name}
                            className="w-6 h-6 object-contain"
                           width={24} height={24} />
                        ) : (
                          <span className="text-lg">⚽</span>
                        )}
                        <span className="font-medium text-white truncate max-w-[150px]">
                          {movement.team.name}
                        </span>
                      </div>
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 ${movementInfo.color} font-medium`}>
                      <span className="text-base">{movementInfo.icon}</span>
                      <span className="hidden sm:inline">{movementInfo.label}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-300 max-w-[120px] truncate">
                    {movement.from_league.name}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-500">
                    →
                  </td>
                  <td className="px-4 py-3 text-gray-300 max-w-[120px] truncate">
                    {movement.to_league.name}
                  </td>
                  <td className="px-4 py-3 text-center hidden md:table-cell">
                    {movement.final_position ? (
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-700 text-white font-semibold text-xs">
                        {movement.final_position}
                      </span>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-400 hidden lg:table-cell">
                    {formatDate(movement.movement_date)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Notes Section (if any movement has notes) */}
      {movements.some(m => m.notes) && (
        <div className="bg-gray-900/30 px-4 py-3 border-t border-gray-700">
          <div className="space-y-2">
            {movements
              .filter(m => m.notes)
              .slice(0, 3)
              .map((movement) => (
                <div key={movement.id} className="text-xs text-gray-400">
                  <span className="font-medium text-gray-300">{movement.team.name}:</span>{' '}
                  {movement.notes}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
