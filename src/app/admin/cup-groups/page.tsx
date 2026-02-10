'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { getLeagues, getCupGroups, createCupGroup, assignTeamToGroup, getTeamsByLeague, randomizeTeamsToGroups, shuffleTeamsInGroups, clearAllGroupAssignments } from '@/lib/supabase';
import { League, CupGroup, Team } from '@/types/supabase';

export default function CupGroupsPage() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string>('');
  const [groups, setGroups] = useState<CupGroup[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Create group states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [creating, setCreating] = useState(false);

  // Assign team states
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [assigning, setAssigning] = useState(false);

  // Randomize states
  const [randomizing, setRandomizing] = useState(false);
  const [shuffling, setShuffling] = useState(false);
  const [clearing, setClearing] = useState(false);

  const loadLeagues = useCallback(async () => {
    try {
      const { data } = await getLeagues();
      if (data) {
        // Filter only cup format with group stage
        const cupLeagues = data.filter(l =>
          (l.tournament_format === 'cup' || l.tournament_format === 'league_cup') &&
          l.has_group_stage
        );
        setLeagues(cupLeagues);
        if (cupLeagues.length > 0) {
          setSelectedLeague(cupLeagues[0].id);
        }
      }
    } catch {
      setError('Failed to load leagues');
    }
  }, []);

  const loadGroupsAndTeams = useCallback(async () => {
    if (!selectedLeague) return;

    setLoading(true);
    setError('');
    try {
      // Load groups
      const { data: groupsData, error: groupsErr } = await getCupGroups(selectedLeague);
      if (groupsErr) throw new Error(groupsErr.message);
      setGroups(groupsData || []);

      // Load teams
      const { data: teamsData, error: teamsErr } = await getTeamsByLeague(selectedLeague);
      if (teamsErr) throw new Error(teamsErr.message);
      setTeams(teamsData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [selectedLeague]);

  useEffect(() => {
    loadLeagues();
  }, [loadLeagues]);

  useEffect(() => {
    if (selectedLeague) {
      loadGroupsAndTeams();
    }
  }, [selectedLeague, loadGroupsAndTeams]);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeague || !newGroupName.trim()) return;

    setCreating(true);
    setError('');
    setSuccess('');

    try {
      const { error: err } = await createCupGroup(selectedLeague, newGroupName.trim().toUpperCase());
      if (err) throw new Error(err.message);

      setSuccess(`Group ${newGroupName.toUpperCase()} berhasil dibuat!`);
      setNewGroupName('');
      setShowCreateDialog(false);
      await loadGroupsAndTeams();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create group');
    } finally {
      setCreating(false);
    }
  };

  const handleAssignTeam = async () => {
    if (!selectedTeam || !selectedGroup) return;

    setAssigning(true);
    setError('');
    setSuccess('');

    try {
      const { error: err } = await assignTeamToGroup(selectedTeam, selectedGroup);
      if (err) throw new Error(err.message);

      const team = teams.find(t => t.id === selectedTeam);
      const group = groups.find(g => g.id === selectedGroup);
      setSuccess(`${team?.name} berhasil diassign ke Group ${group?.group_name}!`);
      setSelectedTeam('');
      setSelectedGroup('');
      await loadGroupsAndTeams();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign team');
    } finally {
      setAssigning(false);
    }
  };

  const handleRandomizeTeams = async () => {
    if (!selectedLeague) return;

    if (!confirm('Acak semua tim ke grup secara random? Tim yang sudah di-assign akan di-reassign ulang.')) {
      return;
    }

    setRandomizing(true);
    setError('');
    setSuccess('');

    try {
      const { data, error: err } = await randomizeTeamsToGroups(selectedLeague);
      if (err) throw new Error(err.message);

      setSuccess(`✅ ${data?.teamsAssigned} tim berhasil diacak ke ${groups.length} grup!`);
      await loadGroupsAndTeams();

      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to randomize teams');
    } finally {
      setRandomizing(false);
    }
  };

  const handleShuffleGroups = async () => {
    if (!selectedLeague) return;

    if (!confirm('Acak posisi tim dalam setiap grup?')) {
      return;
    }

    setShuffling(true);
    setError('');
    setSuccess('');

    try {
      const { data, error: err } = await shuffleTeamsInGroups(selectedLeague);
      if (err) throw new Error(err.message);

      setSuccess(`✅ Posisi tim di ${data?.groupsShuffled} grup berhasil diacak!`);
      await loadGroupsAndTeams();

      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to shuffle teams');
    } finally {
      setShuffling(false);
    }
  };

  const handleClearAssignments = async () => {
    if (!selectedLeague) return;

    if (!confirm('⚠️ Hapus semua assignment tim dari grup? Tindakan ini tidak bisa di-undo!')) {
      return;
    }

    setClearing(true);
    setError('');
    setSuccess('');

    try {
      const { error: err } = await clearAllGroupAssignments(selectedLeague);
      if (err) throw new Error(err.message);

      setSuccess('✅ Semua assignment tim berhasil dihapus!');
      await loadGroupsAndTeams();

      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear assignments');
    } finally {
      setClearing(false);
    }
  };

  const selectedLeagueData = leagues.find(l => l.id === selectedLeague);
  const teamsWithoutGroup = teams.filter(t => !t.cup_group_id);
  const teamsPerGroup = selectedLeagueData?.teams_per_group || 4;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Cup Groups Manager</h1>
          <p className="text-slate-400">Manage group stage untuk tournament cup</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-white font-medium mb-1">Group Stage Setup</h3>
            <p className="text-sm text-slate-400">
              Buat groups (A, B, C, D, dst) dan assign tim ke masing-masing group.
              Setelah semua tim diassign, input hasil match untuk update group standings otomatis.
            </p>
          </div>
        </div>
      </div>

      {/* League Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <label className="block text-sm font-medium text-slate-400 mb-2">Pilih Cup Tournament</label>
        <select
          value={selectedLeague}
          onChange={(e) => setSelectedLeague(e.target.value)}
          className="w-full md:w-1/2 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Pilih Tournament --</option>
          {leagues.map(league => (
            <option key={league.id} value={league.id}>
              {league.name} ({league.season})
            </option>
          ))}
        </select>

        {selectedLeagueData && (
          <div className="mt-4 p-4 bg-slate-800/50 rounded-lg">
            <h3 className="text-white font-medium mb-3">Tournament Settings</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-slate-400">Total Teams</p>
                <p className="text-white font-bold text-lg">{teams.length}</p>
              </div>
              <div>
                <p className="text-slate-400">Teams per Group</p>
                <p className="text-blue-400 font-bold text-lg">{teamsPerGroup}</p>
              </div>
              <div>
                <p className="text-slate-400">Qualifiers per Group</p>
                <p className="text-green-400 font-bold text-lg">{selectedLeagueData.qualifiers_per_group}</p>
              </div>
              <div>
                <p className="text-slate-400">Groups Needed</p>
                <p className="text-purple-400 font-bold text-lg">{Math.ceil(teams.length / teamsPerGroup)}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedLeague && (
        <>
          {/* Messages */}
          {error && (
            <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-4 text-red-400">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-4 text-green-400">
              {success}
            </div>
          )}

          {/* Randomize Tools */}
          <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-700/30 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🎲</span>
              <div>
                <h3 className="text-white font-medium">Randomize Tools</h3>
                <p className="text-sm text-slate-400">Acak tim ke grup secara otomatis</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-3">
              {/* Randomize Teams to Groups */}
              <button
                onClick={handleRandomizeTeams}
                disabled={randomizing || groups.length === 0 || teams.length === 0}
                className="px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-left"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span>🎲</span>
                  <span className="font-medium">Acak Tim ke Grup</span>
                </div>
                <p className="text-xs text-purple-200">
                  {randomizing ? 'Mengacak...' : 'Random assignment ke semua grup'}
                </p>
              </button>

              {/* Shuffle Teams in Groups */}
              <button
                onClick={handleShuffleGroups}
                disabled={shuffling || groups.length === 0 || teamsWithoutGroup.length === teams.length}
                className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-left"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span>🔀</span>
                  <span className="font-medium">Acak Posisi Tim</span>
                </div>
                <p className="text-xs text-blue-200">
                  {shuffling ? 'Mengacak...' : 'Shuffle urutan tim dalam grup'}
                </p>
              </button>

              {/* Clear All Assignments */}
              <button
                onClick={handleClearAssignments}
                disabled={clearing || teamsWithoutGroup.length === teams.length}
                className="px-4 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-left"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span>🗑️</span>
                  <span className="font-medium">Clear Semua</span>
                </div>
                <p className="text-xs text-red-200">
                  {clearing ? 'Menghapus...' : 'Hapus semua assignment'}
                </p>
              </button>
            </div>

            {/* Info */}
            <div className="mt-4 p-3 bg-slate-800/50 rounded text-xs text-slate-400">
              <p className="mb-1">💡 <strong>Tips:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Buat grup terlebih dahulu sebelum mengacak tim</li>
                <li>&quot;Acak Tim ke Grup&quot; akan mendistribusikan semua tim secara merata</li>
                <li>&quot;Acak Posisi Tim&quot; hanya mengacak urutan dalam grup yang sudah ada</li>
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Create Group */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <span>➕</span>
                Create New Group
              </h3>
              {!showCreateDialog ? (
                <button
                  onClick={() => setShowCreateDialog(true)}
                  className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Create Group
                </button>
              ) : (
                <form onSubmit={handleCreateGroup} className="space-y-3">
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="Group name (e.g., A, B, C)"
                    maxLength={3}
                    required
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={creating}
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                    >
                      {creating ? 'Creating...' : 'Create'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateDialog(false);
                        setNewGroupName('');
                      }}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Assign Team */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <span>🎯</span>
                Assign Team to Group
              </h3>
              <div className="space-y-3">
                <select
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select Team --</option>
                  {teamsWithoutGroup.map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select Group --</option>
                  {groups.map(group => {
                    const groupTeams = teams.filter(t => t.cup_group_id === group.id);
                    const isFull = groupTeams.length >= teamsPerGroup;
                    return (
                      <option key={group.id} value={group.id} disabled={isFull}>
                        Group {group.group_name} ({groupTeams.length}/{teamsPerGroup}) {isFull && '- FULL'}
                      </option>
                    );
                  })}
                </select>
                <button
                  onClick={handleAssignTeam}
                  disabled={!selectedTeam || !selectedGroup || assigning}
                  className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  {assigning ? 'Assigning...' : 'Assign Team'}
                </button>
              </div>
            </div>
          </div>

          {/* Groups List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            </div>
          ) : groups.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-12 text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="text-slate-400 mb-4">Belum ada groups untuk tournament ini</p>
              <p className="text-sm text-slate-500">Buat group baru untuk memulai</p>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-slate-800">
                <h3 className="text-white font-medium">Cup Groups ({groups.length})</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {groups.map((group) => {
                  const groupTeams = teams.filter(t => t.cup_group_id === group.id);
                  const isFull = groupTeams.length >= teamsPerGroup;

                  return (
                    <div
                      key={group.id}
                      className="bg-slate-800/50 border border-slate-700 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-lg font-bold text-white">Group {group.group_name}</h4>
                        <span className={`text-xs px-2 py-1 rounded ${
                          isFull ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'
                        }`}>
                          {groupTeams.length}/{teamsPerGroup}
                        </span>
                      </div>

                      {groupTeams.length === 0 ? (
                        <p className="text-sm text-slate-500 italic py-4 text-center">
                          No teams assigned
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {groupTeams.map((team, idx) => (
                            <div key={team.id} className="flex items-center gap-2 text-sm">
                              <span className="text-slate-500 w-5">{idx + 1}.</span>
                              {team.logo_url ? (
                                <Image src={team.logo_url} alt="" className="w-5 h-5 object-contain" width={20} height={20} />
                              ) : (
                                <span className="text-slate-500">⚽</span>
                              )}
                              <span className="text-white truncate">{team.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Unassigned Teams */}
          {teamsWithoutGroup.length > 0 && (
            <div className="bg-orange-900/20 border border-orange-700/30 rounded-lg p-4">
              <h3 className="text-orange-400 font-medium mb-3">
                ⚠️ Unassigned Teams ({teamsWithoutGroup.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {teamsWithoutGroup.map(team => (
                  <div key={team.id} className="text-sm text-slate-400 flex items-center gap-2">
                    {team.logo_url ? (
                      <Image src={team.logo_url} alt="" className="w-4 h-4 object-contain"  width={16} height={16} />
                    ) : (
                      <span>⚽</span>
                    )}
                    <span className="truncate">{team.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* No Leagues */}
      {leagues.length === 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-12 text-center">
          <p className="text-slate-400 mb-4">Belum ada cup tournament dengan group stage</p>
          <a
            href="/admin/leagues/new"
            className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Create Cup Tournament
          </a>
        </div>
      )}
    </div>
  );
}
