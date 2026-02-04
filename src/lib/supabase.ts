/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
