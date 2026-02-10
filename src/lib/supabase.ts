/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Only create client if credentials are available (allows for build-time compilation)
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key');

// ============================================
// Auth Helpers
// ============================================

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function isCurrentUserAdmin() {
  const { data, error } = await supabase.rpc('is_admin');
  if (error) return false;
  return data;
}

// ============================================
// League Functions
// ============================================

export async function getLeagues() {
  const { data, error } = await supabase
    .from('leagues')
    .select('*')
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function getLeagueById(id: string) {
  const { data, error } = await supabase
    .from('leagues')
    .select('*')
    .eq('id', id)
    .single();
  return { data, error };
}

export async function createLeague(league: {
  name: string;
  type: 'football' | 'efootball';
  season: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  tournament_format?: 'league' | 'cup' | 'league_cup';
  promotion_slots?: number;
  relegation_slots?: number;
  playoff_slots?: number;
  parent_league_id?: string;
  has_group_stage?: boolean;
  teams_per_group?: number;
  qualifiers_per_group?: number;
}) {
  const { data, error } = await supabase
    .from('leagues')
    .insert(league as any)
    .select()
    .single();
  return { data, error };
}

export async function generateSchedule(leagueId: string, startDate?: string, intervalDays: number = 7, matchesPerDay: number = 2) {
  const { data, error } = await supabase.rpc('generate_league_schedule', {
    p_league_id: leagueId,
    p_start_date: startDate,
    p_interval_days: intervalDays,
    p_matches_per_day: matchesPerDay,
  } as any);
  return { data, error };
}

// ============================================
// Team Functions
// ============================================

export async function getTeamsByLeague(leagueId: string) {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('league_id', leagueId)
    .order('name');
  return { data, error };
}

export async function getTeamById(id: string) {
  const { data, error } = await supabase
    .from('teams')
    .select('*, game_players(*)')
    .eq('id', id)
    .single();
  return { data, error };
}

export async function createTeam(team: {
  league_id: string;
  name: string;
  short_name?: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
}) {
  const { data, error } = await supabase
    .from('teams')
    .insert(team as any)
    .select()
    .single();
  return { data, error };
}

export async function updateTeam(id: string, updates: {
  name?: string;
  short_name?: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
}) {
  const { data, error } = await supabase
    .from('teams')
    .update(updates as any)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}

export async function deleteTeam(id: string) {
  const { error } = await supabase
    .from('teams')
    .delete()
    .eq('id', id);
  return { error };
}

// ============================================
// Game Player Functions (untuk gamer eFootball)
// ============================================

export async function getGamePlayersByTeam(teamId: string) {
  const { data, error } = await supabase
    .from('game_players')
    .select('*')
    .eq('team_id', teamId)
    .order('is_captain', { ascending: false });
  return { data, error };
}

export async function createGamePlayer(gamePlayer: {
  team_id: string;
  real_name: string;
  gamertag: string;
  avatar_url?: string;
  phone?: string;
  discord?: string;
  is_captain?: boolean;
}) {
  const { data, error } = await supabase
    .from('game_players')
    .insert(gamePlayer as any)
    .select()
    .single();
  return { data, error };
}

export async function updateGamePlayer(id: string, updates: {
  real_name?: string;
  gamertag?: string;
  avatar_url?: string;
  phone?: string;
  discord?: string;
  is_captain?: boolean;
}) {
  const { data, error } = await supabase
    .from('game_players')
    .update(updates as any)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}

export async function deleteGamePlayer(id: string) {
  const { error } = await supabase
    .from('game_players')
    .delete()
    .eq('id', id);
  return { error };
}

// ============================================
// Standings Functions
// ============================================

export async function getLeagueStandings(leagueId: string) {
  const { data, error } = await supabase.rpc('get_league_standings', {
    p_league_id: leagueId,
  } as any);
  return { data, error };
}

// ============================================
// Match Functions
// ============================================

export async function getMatchesByLeague(leagueId: string, status?: string) {
  let query = supabase
    .from('matches')
    .select(`
      *,
      home_team:teams!matches_home_team_id_fkey(*),
      away_team:teams!matches_away_team_id_fkey(*)
    `)
    .eq('league_id', leagueId)
    .order('match_date', { ascending: true });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  return { data, error };
}

export async function getTeamMatches(teamId: string, status?: string) {
  const { data, error } = await supabase.rpc('get_team_matches', {
    p_team_id: teamId,
    p_status: status,
  } as any);
  return { data, error };
}

export async function getUpcomingMatches(leagueId: string, limit = 10) {
  const { data, error } = await supabase.rpc('get_upcoming_matches', {
    p_league_id: leagueId,
    p_limit: limit,
  } as any);
  return { data, error };
}

export async function getMatchById(id: string) {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      home_team:teams!matches_home_team_id_fkey(*),
      away_team:teams!matches_away_team_id_fkey(*),
      screenshots:match_screenshots(*)
    `)
    .eq('id', id)
    .single();
  return { data, error };
}

export async function recordMatchResult(
  matchId: string,
  homeScore: number,
  awayScore: number,
  screenshotUrl?: string,
  screenshotCaption?: string
) {
  const { data, error } = await supabase.rpc('record_match_result', {
    p_match_id: matchId,
    p_home_score: homeScore,
    p_away_score: awayScore,
    p_screenshot_url: screenshotUrl,
    p_screenshot_caption: screenshotCaption,
  } as any);
  return { data, error };
}

// ============================================
// Storage Functions
// ============================================

export async function uploadTeamLogo(file: File, teamId: string) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${teamId}.${fileExt}`;

  const { error } = await supabase.storage
    .from('team-logos')
    .upload(fileName, file, { upsert: true });

  if (error) return { url: null, error };

  const { data: urlData } = supabase.storage
    .from('team-logos')
    .getPublicUrl(fileName);

  return { url: urlData.publicUrl, error: null };
}

export async function uploadGamerAvatar(file: File, gamePlayerId: string) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${gamePlayerId}.${fileExt}`;

  const { error } = await supabase.storage
    .from('gamer-avatars')
    .upload(fileName, file, { upsert: true });

  if (error) return { url: null, error };

  const { data: urlData } = supabase.storage
    .from('gamer-avatars')
    .getPublicUrl(fileName);

  return { url: urlData.publicUrl, error: null };
}

export async function uploadMatchScreenshot(file: File, matchId: string) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${matchId}-${Date.now()}.${fileExt}`;

  const { error } = await supabase.storage
    .from('match-screenshots')
    .upload(fileName, file);

  if (error) return { url: null, error };

  const { data: urlData } = supabase.storage
    .from('match-screenshots')
    .getPublicUrl(fileName);

  return { url: urlData.publicUrl, error: null };
}

export async function uploadLeagueLogo(file: File, leagueId: string) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${leagueId}.${fileExt}`;

  const { error } = await supabase.storage
    .from('league-logos')
    .upload(fileName, file, { upsert: true });

  if (error) return { url: null, error };

  const { data: urlData } = supabase.storage
    .from('league-logos')
    .getPublicUrl(fileName);

  return { url: urlData.publicUrl, error: null };
}

// ============================================
// League Zones Functions (Relegation/Promotion)
// ============================================

export async function getLeagueZones(leagueId: string) {
  const { data, error } = await supabase
    .from('league_zones')
    .select('*')
    .eq('league_id', leagueId)
    .order('position_start', { ascending: true });
  return { data, error };
}

export async function autoCreateLeagueZones(leagueId: string) {
  const { data, error } = await supabase.rpc('auto_create_league_zones', {
    p_league_id: leagueId,
  } as any);
  return { data, error };
}

// ============================================
// Cup Groups Functions
// ============================================

export async function getCupGroups(leagueId: string) {
  const { data, error } = await supabase
    .from('cup_groups')
    .select('*')
    .eq('league_id', leagueId)
    .order('group_name', { ascending: true });
  return { data, error };
}

export async function createCupGroup(leagueId: string, groupName: string) {
  const { data, error } = await supabase
    .from('cup_groups')
    .insert({ league_id: leagueId, group_name: groupName })
    .select()
    .single();
  return { data, error };
}

export async function assignTeamToGroup(teamId: string, cupGroupId: string) {
  const { data, error } = await supabase
    .from('teams')
    .update({ cup_group_id: cupGroupId })
    .eq('id', teamId)
    .select()
    .single();
  return { data, error };
}

export async function randomizeTeamsToGroups(leagueId: string) {
  // Get all teams for the league
  const { data: teams, error: teamsError } = await getTeamsByLeague(leagueId);
  if (teamsError || !teams) return { data: null, error: teamsError };

  // Get all groups for the league
  const { data: groups, error: groupsError } = await getCupGroups(leagueId);
  if (groupsError || !groups || groups.length === 0) {
    return { data: null, error: { message: 'No groups found. Create groups first.' } };
  }

  // Get league info for teams_per_group
  const { data: league, error: leagueError } = await getLeagueById(leagueId);
  if (leagueError || !league) return { data: null, error: leagueError };

  const teamsPerGroup = league.teams_per_group || 4;

  // Shuffle teams randomly
  const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);

  // Distribute teams to groups
  const updates = [];
  for (let i = 0; i < shuffledTeams.length; i++) {
    const groupIndex = Math.floor(i / teamsPerGroup) % groups.length;
    const group = groups[groupIndex];

    updates.push(
      supabase
        .from('teams')
        .update({ cup_group_id: group.id })
        .eq('id', shuffledTeams[i].id)
    );
  }

  // Execute all updates
  await Promise.all(updates);

  return { data: { success: true, teamsAssigned: shuffledTeams.length }, error: null };
}

export async function shuffleTeamsInGroups(leagueId: string) {
  // Get all groups for the league
  const { data: groups, error: groupsError } = await getCupGroups(leagueId);
  if (groupsError || !groups || groups.length === 0) {
    return { data: null, error: { message: 'No groups found.' } };
  }

  // Get all teams for the league
  const { data: teams, error: teamsError } = await getTeamsByLeague(leagueId);
  if (teamsError || !teams) return { data: null, error: teamsError };

  // Shuffle teams within each group
  for (const group of groups) {
    const groupTeams = teams.filter(t => t.cup_group_id === group.id);

    if (groupTeams.length > 0) {
      // Shuffle team order by reassigning them
      const shuffledTeams = [...groupTeams].sort(() => Math.random() - 0.5);

      // Update teams (this will affect the display order when sorted by name or created_at)
      // Since we can't directly control display order, we'll just reassign them
      // The shuffle effect will be visible when teams are re-fetched
      for (const team of shuffledTeams) {
        await supabase
          .from('teams')
          .update({
            cup_group_id: group.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', team.id);

        // Small delay to ensure different timestamps
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
  }

  return { data: { success: true, groupsShuffled: groups.length }, error: null };
}

export async function clearAllGroupAssignments(leagueId: string) {
  const { error } = await supabase
    .from('teams')
    .update({ cup_group_id: null })
    .eq('league_id', leagueId);

  return { error };
}

// ============================================
// Cup Standings Functions
// ============================================

export async function getCupStandings(cupGroupId: string) {
  const { data, error } = await supabase
    .from('cup_standings')
    .select(`
      *,
      team:teams(*)
    `)
    .eq('cup_group_id', cupGroupId)
    .order('points', { ascending: false })
    .order('goal_difference', { ascending: false })
    .order('goals_for', { ascending: false });
  return { data, error };
}

export async function getCupGroupsWithStandings(leagueId: string) {
  // Get all groups for this league
  const { data: groups, error: groupError } = await getCupGroups(leagueId);
  if (groupError || !groups) return { data: null, error: groupError };

  // Get standings for each group
  const groupsWithStandings = await Promise.all(
    groups.map(async (group) => {
      const { data: standings, error: standingsError } = await getCupStandings(group.id);
      return {
        ...group,
        standings: standings?.map((s, idx) => ({ ...s, position: idx + 1 })) || [],
      };
    })
  );

  return { data: groupsWithStandings, error: null };
}

// ============================================
// Enhanced Standings with Zones
// ============================================

export async function getStandingsWithZones(leagueId: string) {
  // Get regular standings
  const { data: standings, error: standingsError } = await supabase
    .from('standings')
    .select(`
      *,
      team:teams(*)
    `)
    .eq('league_id', leagueId)
    .order('points', { ascending: false })
    .order('goal_difference', { ascending: false })
    .order('goals_for', { ascending: false });

  if (standingsError || !standings) return { data: null, error: standingsError };

  // Get zones
  const { data: zones, error: zonesError } = await getLeagueZones(leagueId);
  if (zonesError) return { data: standings, error: null }; // Return standings without zones if zones fail

  // Attach zone to each standing based on position
  const standingsWithZones = standings.map((standing, idx) => {
    const position = idx + 1;
    const zone = zones?.find(z => position >= z.position_start && position <= z.position_end);
    return {
      ...standing,
      position,
      zone,
    };
  });

  return { data: standingsWithZones, error: null };
}

// ============================================
// Team Movements & Promotion/Relegation
// ============================================

export async function getTeamMovements(teamId?: string, season?: string) {
  let query = supabase
    .from('team_movements')
    .select(`
      *,
      team:teams(*),
      from_league:leagues!team_movements_from_league_id_fkey(*),
      to_league:leagues!team_movements_to_league_id_fkey(*)
    `)
    .order('movement_date', { ascending: false });

  if (teamId) {
    query = query.eq('team_id', teamId);
  }
  if (season) {
    query = query.eq('season', season);
  }

  const { data, error } = await query;
  return { data, error };
}

export async function getLeagueHierarchy() {
  const { data, error } = await supabase
    .from('league_hierarchy')
    .select('*')
    .order('name', { ascending: true });

  return { data, error };
}

export async function getPromotionEligibleTeams(leagueId: string) {
  const { data, error } = await supabase.rpc('get_promotion_eligible_teams', {
    p_league_id: leagueId,
  } as any);
  return { data, error };
}

export async function getRelegationEligibleTeams(leagueId: string) {
  const { data, error } = await supabase.rpc('get_relegation_eligible_teams', {
    p_league_id: leagueId,
  } as any);
  return { data, error };
}

export async function executeSeasonEndMovements(leagueId: string, season: string) {
  const { data, error } = await supabase.rpc('execute_season_end_movements', {
    p_league_id: leagueId,
    p_season: season,
  } as any);
  return { data, error };
}

export async function recordTeamMovement(
  teamId: string,
  fromLeagueId: string,
  toLeagueId: string,
  movementType: 'promotion' | 'relegation' | 'playoff_winner' | 'playoff_loser' | 'transfer',
  season: string,
  finalPosition?: number,
  notes?: string
) {
  const { data, error } = await supabase
    .from('team_movements')
    .insert({
      team_id: teamId,
      from_league_id: fromLeagueId,
      to_league_id: toLeagueId,
      movement_type: movementType,
      season: season,
      final_position: finalPosition,
      notes: notes,
    })
    .select()
    .single();

  return { data, error };
}

export async function getLeagueWithHierarchy(leagueId: string) {
  const { data: league, error } = await supabase
    .from('leagues')
    .select(`
      *,
      parent_league:leagues!leagues_parent_league_id_fkey(*),
      child_league:leagues!leagues_child_league_id_fkey(*)
    `)
    .eq('id', leagueId)
    .single();

  return { data: league, error };
}

