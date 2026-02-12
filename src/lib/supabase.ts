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

// Generate schedule for different competition formats
export async function generateScheduleAdvanced(
  leagueId: string,
  format: 'round_robin' | 'single_round' | 'knockout' | 'group_knockout',
  options: {
    startDate?: string;
    intervalDays?: number;
    matchesPerDay?: number;
    groupCount?: number;
    teamsPerGroup?: number;
    qualifiersPerGroup?: number;
  }
) {
  const {
    startDate,
    intervalDays = 7,
    matchesPerDay = 2,
    groupCount = 4,
    teamsPerGroup = 4,
    qualifiersPerGroup = 2
  } = options;

  // Get teams for this league
  const { data: teams, error: teamsError } = await getTeamsByLeague(leagueId);
  if (teamsError || !teams || teams.length < 2) {
    return { data: null, error: teamsError || new Error('Not enough teams') };
  }

  // Shuffle teams randomly
  const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);

  try {
    switch (format) {
      case 'round_robin':
        return await generateRoundRobinSchedule(leagueId, shuffledTeams, startDate, intervalDays, matchesPerDay, true);

      case 'single_round':
        return await generateRoundRobinSchedule(leagueId, shuffledTeams, startDate, intervalDays, matchesPerDay, false);

      case 'knockout':
        return await generateKnockoutSchedule(leagueId, shuffledTeams, startDate, intervalDays);

      case 'group_knockout':
        return await generateGroupKnockoutSchedule(
          leagueId,
          shuffledTeams,
          startDate,
          intervalDays,
          matchesPerDay,
          groupCount,
          teamsPerGroup,
          qualifiersPerGroup
        );

      default:
        return { data: null, error: new Error('Invalid format') };
    }
  } catch (err) {
    return { data: null, error: err as Error };
  }
}

// Helper: Generate Round Robin schedule (home & away or single)
async function generateRoundRobinSchedule(
  leagueId: string,
  teams: { id: string; name: string }[],
  startDate?: string,
  intervalDays: number = 7,
  matchesPerDay: number = 2,
  homeAndAway: boolean = true
) {
  const n = teams.length;
  const matches: {
    league_id: string;
    home_team_id: string;
    away_team_id: string;
    match_date: string;
    match_week: number;
    status: string;
  }[] = [];

  // Round robin algorithm
  const teamIds = teams.map(t => t.id);
  const rounds: { home: string; away: string }[][] = [];

  // Generate first half (each team plays each other once)
  for (let round = 0; round < n - 1; round++) {
    const roundMatches: { home: string; away: string }[] = [];
    for (let i = 0; i < n / 2; i++) {
      const home = (round + i) % (n - 1);
      let away = (n - 1 - i + round) % (n - 1);
      if (i === 0) away = n - 1;

      roundMatches.push({
        home: teamIds[home],
        away: teamIds[away]
      });
    }
    rounds.push(roundMatches);
  }

  // Add reverse fixtures if home & away
  if (homeAndAway) {
    const reverseRounds = rounds.map(round =>
      round.map(match => ({ home: match.away, away: match.home }))
    );
    rounds.push(...reverseRounds);
  }

  // Create match records with dates
  const baseDate = startDate ? new Date(startDate) : new Date();
  baseDate.setHours(19, 0, 0, 0); // Start at 19:00 WIB

  let currentDate = new Date(baseDate);
  let matchWeek = 1;
  let matchesOnCurrentDay = 0;

  rounds.forEach((round, roundIndex) => {
    round.forEach((match) => {
      matches.push({
        league_id: leagueId,
        home_team_id: match.home,
        away_team_id: match.away,
        match_date: currentDate.toISOString(),
        match_week: matchWeek,
        status: 'scheduled'
      });

      matchesOnCurrentDay++;

      // Move to next time slot or next day
      if (matchesOnCurrentDay >= matchesPerDay) {
        matchesOnCurrentDay = 0;
        currentDate = new Date(currentDate);
        currentDate.setDate(currentDate.getDate() + intervalDays);
        currentDate.setHours(19, 0, 0, 0);
      } else {
        currentDate = new Date(currentDate);
        currentDate.setHours(currentDate.getHours() + 1);
      }
    });

    matchWeek++;
  });

  // Delete existing scheduled matches
  await supabase
    .from('matches')
    .delete()
    .eq('league_id', leagueId)
    .eq('status', 'scheduled');

  // Insert new matches
  const { data, error } = await supabase
    .from('matches')
    .insert(matches)
    .select();

  // Update league status
  await supabase
    .from('leagues')
    .update({ status: 'ongoing' })
    .eq('id', leagueId);

  return { data: data?.length || 0, error };
}

// Helper: Generate Knockout schedule
async function generateKnockoutSchedule(
  leagueId: string,
  teams: { id: string; name: string }[],
  startDate?: string,
  intervalDays: number = 7
) {
  const n = teams.length;
  const matches: {
    league_id: string;
    home_team_id: string;
    away_team_id: string;
    match_date: string;
    cup_stage: string;
    status: string;
  }[] = [];

  // Determine stages based on team count
  const getStage = (teamsInRound: number): string => {
    switch (teamsInRound) {
      case 32: return 'round_of_32';
      case 16: return 'round_of_16';
      case 8: return 'quarter_final';
      case 4: return 'semi_final';
      case 2: return 'final';
      default: return 'round_of_' + teamsInRound;
    }
  };

  const baseDate = startDate ? new Date(startDate) : new Date();
  baseDate.setHours(19, 0, 0, 0);
  let roundDate = new Date(baseDate);

  // Generate bracket - all matches in same round on same day
  let currentRoundTeams = teams.map(t => t.id);

  while (currentRoundTeams.length >= 2) {
    const stage = getStage(currentRoundTeams.length);
    const matchesInRound = currentRoundTeams.length / 2;

    for (let i = 0; i < currentRoundTeams.length; i += 2) {
      const matchIndex = i / 2;
      const matchTime = new Date(roundDate);
      // Stagger times: 19:00, 19:30, 20:00, 20:30, etc.
      matchTime.setHours(19 + Math.floor(matchIndex / 2), (matchIndex % 2) * 30, 0, 0);

      matches.push({
        league_id: leagueId,
        home_team_id: currentRoundTeams[i],
        away_team_id: currentRoundTeams[i + 1],
        match_date: matchTime.toISOString(),
        cup_stage: stage,
        status: 'scheduled'
      });
    }

    // Move to next round date (different day)
    roundDate = new Date(roundDate);
    roundDate.setDate(roundDate.getDate() + intervalDays);
    roundDate.setHours(19, 0, 0, 0);

    // For next round, we'll have half the teams (placeholders)
    currentRoundTeams = currentRoundTeams.filter((_, i) => i % 2 === 0);
  }

  // Delete existing scheduled matches
  await supabase
    .from('matches')
    .delete()
    .eq('league_id', leagueId)
    .eq('status', 'scheduled');

  // Insert new matches
  const { data, error } = await supabase
    .from('matches')
    .insert(matches)
    .select();

  // Update league
  await supabase
    .from('leagues')
    .update({
      status: 'ongoing',
      tournament_format: 'cup'
    })
    .eq('id', leagueId);

  return { data: data?.length || 0, error };
}



// Helper: Generate Group + Knockout schedule
async function generateGroupKnockoutSchedule(
  leagueId: string,
  teams: { id: string; name: string }[],
  startDate?: string,
  intervalDays: number = 7,
  _matchesPerDay: number = 2, // Not used for cup - all matches same day
  groupCount: number = 4,
  teamsPerGroup: number = 4,
  qualifiersPerGroup: number = 2
) {
  const totalGroupTeams = groupCount * teamsPerGroup;
  if (teams.length < totalGroupTeams) {
    return { data: null, error: new Error(`Need at least ${totalGroupTeams} teams`) };
  }

  // Use only the required number of teams
  const selectedTeams = teams.slice(0, totalGroupTeams);

  // Create groups
  const groups: { id: string; name: string; teams: { id: string; name: string }[] }[] = [];

  // Delete existing groups for this league
  // await supabase
  //   .from('cup_groups')
  //   .delete()
  //   .eq('league_id', leagueId);

  const { data: existingGroups, error: existingError } = await supabase
      .from('cup_groups')
      .select(`
    id,
    group_name,
    qualifiers_count,
    cup_standings (
      team_id,
      pos,
      teams (
        id,
        name
      )
    )
  `)
      .eq('league_id', leagueId);

  if (existingError) {
    return { data: null, error: existingError };
  }

// 2️⃣ If groups already exist → load from DB
  if (existingGroups && existingGroups.length > 0) {
    for (const group of existingGroups) {
      groups.push({
        id: group.id,
        name: group.group_name,
        teams: group.cup_standings.map((standing: any) => standing.teams)
      });
    }

    return { data: groups, error: null };
  }else{

  const groupNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  // Create new groups
  for (let i = 0; i < groupCount; i++) {
    const groupTeams = selectedTeams.slice(i * teamsPerGroup, (i + 1) * teamsPerGroup);

    // Insert group
    const { data: groupData, error: groupError } = await supabase
      .from('cup_groups')
      .insert({
        league_id: leagueId,
        group_name: groupNames[i],
        qualifiers_count: qualifiersPerGroup
      })
      .select()
      .single();

    if (groupError || !groupData) {
      return { data: null, error: groupError };
    }

    // Update teams with group assignment
    for (const team of groupTeams) {
      await supabase
        .from('teams')
        .update({ cup_group_id: groupData.id })
        .eq('id', team.id);
    }

    // Create cup standings for each team
    for (let pos = 0; pos < groupTeams.length; pos++) {
      await supabase
        .from('cup_standings')
        .insert({
          cup_group_id: groupData.id,
          team_id: groupTeams[pos].id,
          position: pos + 1,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goals_for: 0,
          goals_against: 0,
          goal_difference: 0,
          points: 0,
          qualified: false
        });
    }

    groups.push({
      id: groupData.id,
      name: groupNames[i],
      teams: groupTeams
    });
  }
  }

  // Generate group stage matches - ALL MATCHES ON SAME DAY PER MATCHWEEK
  // Using round-robin algorithm for each group
  const allGroupMatches: {
    league_id: string;
    home_team_id: string;
    away_team_id: string;
    match_week: number;
    cup_stage: string;
    cup_group_id: string;
    status: string;
  }[][] = []; // Array of matchweeks, each containing all matches for that week

  // Calculate number of matchweeks needed (n-1 for n teams in round robin)
  const matchweeksNeeded = teamsPerGroup - 1;

  // Initialize matchweeks array
  for (let i = 0; i < matchweeksNeeded; i++) {
    allGroupMatches[i] = [];
  }

  // Generate round-robin matches for each group
  for (const group of groups) {
    const groupTeamIds = group.teams.map(t => t.id);
    const n = groupTeamIds.length;

    // Round robin algorithm
    for (let round = 0; round < n - 1; round++) {
      for (let i = 0; i < n / 2; i++) {
        const home = (round + i) % (n - 1);
        let away = (n - 1 - i + round) % (n - 1);
        if (i === 0) away = n - 1;

        // Alternate home/away each round
        const isHomeFirst = round % 2 === 0;

        allGroupMatches[round].push({
          league_id: leagueId,
          home_team_id: isHomeFirst ? groupTeamIds[home] : groupTeamIds[away],
          away_team_id: isHomeFirst ? groupTeamIds[away] : groupTeamIds[home],
          match_week: round + 1,
          cup_stage: 'group_stage',
          cup_group_id: group.id,
          status: 'scheduled'
        });
      }
    }
  }

  // Assign dates - all matches in same matchweek on same day
  const matches: {
    league_id: string;
    home_team_id: string;
    away_team_id: string;
    match_date: string;
    match_week: number;
    cup_stage: string;
    cup_group_id: string;
    status: string;
  }[] = [];

  const baseDate = startDate ? new Date(startDate) : new Date();
  baseDate.setHours(19, 0, 0, 0); // Start at 19:00 WIB

  for (let week = 0; week < allGroupMatches.length; week++) {
    const matchweekDate = new Date(baseDate);
    matchweekDate.setDate(matchweekDate.getDate() + (week * intervalDays));

    // All matches in this week start at same base time, staggered by 1 hour
    allGroupMatches[week].forEach((match, idx) => {
      const matchTime = new Date(matchweekDate);
      matchTime.setHours(19 + Math.floor(idx / 2), (idx % 2) * 30, 0, 0); // 19:00, 19:30, 20:00, 20:30, etc.

      matches.push({
        ...match,
        match_date: matchTime.toISOString()
      });
    });
  }

  // Add placeholder knockout matches
  const qualifiedTeamsCount = groupCount * qualifiersPerGroup;
  const knockoutStages: { stage: string; matchCount: number }[] = [];

  let teamsInStage = qualifiedTeamsCount;
  while (teamsInStage >= 2) {
    const stageName =
      teamsInStage === 2 ? 'final' :
      teamsInStage === 4 ? 'semi_final' :
      teamsInStage === 8 ? 'quarter_final' :
      teamsInStage === 16 ? 'round_of_16' :
      `round_of_${teamsInStage}`;

    knockoutStages.push({
      stage: stageName,
      matchCount: teamsInStage / 2
    });

    teamsInStage = teamsInStage / 2;
  }

  // Add third place match if semi finals exist
  if (knockoutStages.some(s => s.stage === 'semi_final')) {
    knockoutStages.push({
      stage: 'third_place',
      matchCount: 1
    });
  }

  // Calculate knockout start date (after group stage)
  const lastGroupMatchweek = matchweeksNeeded;
  let knockoutDate = new Date(baseDate);
  knockoutDate.setDate(knockoutDate.getDate() + (lastGroupMatchweek * intervalDays) + intervalDays); // Gap after group stage
  knockoutDate.setHours(19, 0, 0, 0);

  // Create knockout matches - all matches in same stage on same day
  for (const stageInfo of knockoutStages) {
    for (let i = 0; i < stageInfo.matchCount; i++) {
      const matchTime = new Date(knockoutDate);
      matchTime.setHours(19 + Math.floor(i / 2), (i % 2) * 30, 0, 0); // Stagger times

      // Use placeholder - teams will be assigned after group stage
      matches.push({
        league_id: leagueId,
        home_team_id: selectedTeams[0].id, // Placeholder
        away_team_id: selectedTeams[1].id, // Placeholder
        match_date: matchTime.toISOString(),
        match_week: 0,
        cup_stage: stageInfo.stage,
        cup_group_id: '',
        status: 'scheduled'
      });
    }

    // Next stage on different day
    knockoutDate = new Date(knockoutDate);
    knockoutDate.setDate(knockoutDate.getDate() + intervalDays);
    knockoutDate.setHours(19, 0, 0, 0);
  }

  // Delete existing matches
  await supabase
    .from('matches')
    .delete()
    .eq('league_id', leagueId)
    .eq('status', 'scheduled');

  // Insert group stage matches only (knockout will be generated later)
  const groupMatches = matches.filter(m => m.cup_stage === 'group_stage');
  const { data, error } = await supabase
    .from('matches')
    .insert(groupMatches)
    .select();

  // Update league
  await supabase
    .from('leagues')
    .update({
      status: 'ongoing',
      tournament_format: 'cup',
      has_group_stage: true,
      teams_per_group: teamsPerGroup,
      qualifiers_per_group: qualifiersPerGroup
    })
    .eq('id', leagueId);

  return {
    data: {
      totalMatches: groupMatches.length,
      groups: groups.length,
      knockoutTeams: qualifiedTeamsCount
    },
    error
  };
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

// ============================================
// Generate Knockout from Group Results
// ============================================

export async function generateKnockoutFromGroups(leagueId: string, startDate?: string, intervalDays: number = 7) {
  // Get league info
  const { data: league, error: leagueError } = await getLeagueById(leagueId);
  if (leagueError || !league) {
    return { data: null, error: leagueError || new Error('League not found') };
  }

  // Get all groups with standings
  const { data: groups, error: groupsError } = await getCupGroupsWithStandings(leagueId);
  if (groupsError || !groups || groups.length === 0) {
    return { data: null, error: groupsError || new Error('No groups found') };
  }

  const qualifiersPerGroup = league.qualifiers_per_group || 2;

  // Get qualified teams from each group
  const qualifiedTeams: { teamId: string; groupName: string; position: number }[] = [];

  for (const group of groups) {
    // Sort standings by points, goal difference, goals for
    const sortedStandings = [...group.standings].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goal_difference !== a.goal_difference) return b.goal_difference - a.goal_difference;
      return b.goals_for - a.goals_for;
    });

    // Take top N teams from each group
    for (let i = 0; i < Math.min(qualifiersPerGroup, sortedStandings.length); i++) {
      const standing = sortedStandings[i];
      qualifiedTeams.push({
        teamId: standing.team_id,
        groupName: group.group_name,
        position: i + 1
      });

      // Mark team as qualified in standings
      await supabase
        .from('cup_standings')
        .update({ qualified: true })
        .eq('id', standing.id);
    }
  }

  if (qualifiedTeams.length < 2) {
    return { data: null, error: new Error('Not enough qualified teams') };
  }

  // Create knockout bracket
  // Standard bracket: 1A vs 2B, 1B vs 2A, 1C vs 2D, 1D vs 2C, etc.
  const matches: {
    league_id: string;
    home_team_id: string;
    away_team_id: string;
    match_date: string;
    cup_stage: string;
    status: string;
  }[] = [];

  const baseDate = startDate ? new Date(startDate) : new Date();
  baseDate.setHours(19, 0, 0, 0);
  let currentDate = new Date(baseDate);

  // Pair teams: 1st place of one group vs 2nd place of another
  const groupNames = [...new Set(qualifiedTeams.map(t => t.groupName))].sort();
  const firstPlaceTeams = qualifiedTeams.filter(t => t.position === 1);
  const secondPlaceTeams = qualifiedTeams.filter(t => t.position === 2);

  // Create pairings
  const pairings: { home: string; away: string }[] = [];

  // Standard World Cup style pairing
  for (let i = 0; i < firstPlaceTeams.length; i++) {
    // Pair with second place from different group
    const pairIndex = (i + 1) % secondPlaceTeams.length;
    pairings.push({
      home: firstPlaceTeams[i].teamId,
      away: secondPlaceTeams[pairIndex].teamId
    });
  }

  // Determine initial stage based on number of qualified teams
  const getInitialStage = (teamCount: number): string => {
    if (teamCount <= 2) return 'final';
    if (teamCount <= 4) return 'semi_final';
    if (teamCount <= 8) return 'quarter_final';
    if (teamCount <= 16) return 'round_of_16';
    return 'round_of_32';
  };

  const initialStage = getInitialStage(qualifiedTeams.length);

  // Create initial round matches
  for (const pairing of pairings) {
    matches.push({
      league_id: leagueId,
      home_team_id: pairing.home,
      away_team_id: pairing.away,
      match_date: currentDate.toISOString(),
      cup_stage: initialStage,
      status: 'scheduled'
    });

    currentDate = new Date(currentDate);
    currentDate.setHours(currentDate.getHours() + 1);
  }

  // Generate subsequent rounds (with placeholders)
  const stages = ['round_of_16', 'quarter_final', 'semi_final', 'final'];
  const initialStageIndex = stages.indexOf(initialStage);

  currentDate = new Date(currentDate);
  currentDate.setDate(currentDate.getDate() + intervalDays);
  currentDate.setHours(19, 0, 0, 0);

  let teamsInNextRound = pairings.length;

  for (let stageIndex = initialStageIndex + 1; stageIndex < stages.length; stageIndex++) {
    teamsInNextRound = Math.floor(teamsInNextRound / 2);
    if (teamsInNextRound < 1) break;

    const stage = stages[stageIndex];

    for (let i = 0; i < teamsInNextRound; i++) {
      // Placeholder match - teams will be determined by previous round results
      matches.push({
        league_id: leagueId,
        home_team_id: qualifiedTeams[0].teamId, // Placeholder
        away_team_id: qualifiedTeams[1].teamId, // Placeholder
        match_date: currentDate.toISOString(),
        cup_stage: stage,
        status: 'scheduled'
      });

      currentDate = new Date(currentDate);
      currentDate.setHours(currentDate.getHours() + 1);
    }

    currentDate = new Date(currentDate);
    currentDate.setDate(currentDate.getDate() + intervalDays);
    currentDate.setHours(19, 0, 0, 0);
  }

  // Add third place match
  if (stages.indexOf(initialStage) <= stages.indexOf('semi_final')) {
    matches.push({
      league_id: leagueId,
      home_team_id: qualifiedTeams[0].teamId, // Placeholder
      away_team_id: qualifiedTeams[1].teamId, // Placeholder
      match_date: currentDate.toISOString(),
      cup_stage: 'third_place',
      status: 'scheduled'
    });
  }

  // Delete existing knockout matches (keep group stage matches)
  await supabase
    .from('matches')
    .delete()
    .eq('league_id', leagueId)
    .neq('cup_stage', 'group_stage')
    .eq('status', 'scheduled');

  // Insert knockout matches
  const { data, error } = await supabase
    .from('matches')
    .insert(matches)
    .select();

  return {
    data: {
      matchesCreated: data?.length || 0,
      qualifiedTeams: qualifiedTeams.length,
      initialStage
    },
    error
  };
}

// Check if group stage is complete
export async function isGroupStageComplete(leagueId: string) {
  // Get all group stage matches
  const { data: matches, error } = await supabase
    .from('matches')
    .select('id, status')
    .eq('league_id', leagueId)
    .eq('cup_stage', 'group_stage');

  if (error || !matches) return { complete: false, error };

  const totalMatches = matches.length;
  const completedMatches = matches.filter(m => m.status === 'completed').length;

  return {
    complete: totalMatches > 0 && totalMatches === completedMatches,
    total: totalMatches,
    completed: completedMatches
  };
}
