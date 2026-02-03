// ============================================
// Supabase Database Types
// Auto-generated based on schema
// ============================================

export type LeagueType = 'football' | 'efootball';
export type LeagueStatus = 'upcoming' | 'ongoing' | 'completed';
export type MatchStatus = 'scheduled' | 'live' | 'completed' | 'postponed' | 'cancelled';

export interface Admin {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface League {
  id: string;
  name: string;
  type: LeagueType;
  season: string;
  status: LeagueStatus;
  logo_url: string | null;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  league_id: string;
  name: string;
  logo_url: string | null;
  short_name: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// Game Player / Gamer (untuk eFootball - orang yang bermain game)
export interface GamePlayer {
  id: string;
  team_id: string;
  real_name: string; // Nama asli gamer
  gamertag: string; // PSN ID, Xbox Gamertag, dll
  avatar_url: string | null;
  phone: string | null; // Nomor telepon untuk koordinasi
  discord: string | null; // Discord username
  is_captain: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: string;
  league_id: string;
  home_team_id: string;
  away_team_id: string;
  match_week: number;
  match_date: string | null;
  status: MatchStatus;
  home_score: number | null;
  away_score: number | null;
  venue: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface MatchScreenshot {
  id: string;
  match_id: string;
  image_url: string;
  caption: string | null;
  uploaded_by: string | null;
  created_at: string;
}

export interface Standing {
  id: string;
  league_id: string;
  team_id: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
  form: string | null;
  updated_at: string;
}

// ============================================
// Extended Types with Relations
// ============================================

export interface TeamWithGamePlayers extends Team {
  game_players: GamePlayer[];
}

export interface MatchWithTeams extends Match {
  home_team: Team;
  away_team: Team;
  screenshots?: MatchScreenshot[];
}

export interface LeagueWithTeams extends League {
  teams: Team[];
}

export interface StandingWithTeam extends Standing {
  position: number;
  team: Team;
}

// ============================================
// API Response Types
// ============================================

export interface LeagueStandingsResponse {
  position: number;
  team_id: string;
  team_name: string;
  team_logo: string | null;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
  form: string | null;
}

export interface TeamMatchResponse {
  match_id: string;
  match_date: string;
  match_week: number;
  home_team_id: string;
  home_team_name: string;
  home_team_logo: string | null;
  away_team_id: string;
  away_team_name: string;
  away_team_logo: string | null;
  home_score: number | null;
  away_score: number | null;
  status: MatchStatus;
  is_home: boolean;
  result: 'W' | 'D' | 'L' | null;
}

export interface UpcomingMatchResponse {
  match_id: string;
  match_date: string;
  match_week: number;
  home_team_id: string;
  home_team_name: string;
  home_team_logo: string | null;
  away_team_id: string;
  away_team_name: string;
  away_team_logo: string | null;
  venue: string | null;
}

// ============================================
// Form Types
// ============================================

export interface CreateLeagueForm {
  name: string;
  type: LeagueType;
  season: string;
  logo?: File;
  description?: string;
  start_date?: string;
  end_date?: string;
}

export interface CreateTeamForm {
  league_id: string;
  name: string;
  short_name?: string;
  logo?: File;
  primary_color?: string;
  secondary_color?: string;
}

// Form untuk menambah gamer eFootball
export interface CreateGamePlayerForm {
  team_id: string;
  real_name: string;
  gamertag: string;
  avatar?: File;
  phone?: string;
  discord?: string;
  is_captain?: boolean;
}

export interface RecordMatchResultForm {
  match_id: string;
  home_score: number;
  away_score: number;
  screenshot?: File;
  screenshot_caption?: string;
}

// ============================================
// Database Types for Supabase Client
// ============================================

export interface Database {
  public: {
    Tables: {
      admins: {
        Row: Admin;
        Insert: Omit<Admin, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Admin, 'id' | 'created_at' | 'updated_at'>>;
      };
      leagues: {
        Row: League;
        Insert: Omit<League, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<League, 'id' | 'created_at' | 'updated_at'>>;
      };
      teams: {
        Row: Team;
        Insert: Omit<Team, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Team, 'id' | 'created_at' | 'updated_at'>>;
      };
      game_players: {
        Row: GamePlayer;
        Insert: Omit<GamePlayer, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<GamePlayer, 'id' | 'created_at' | 'updated_at'>>;
      };
      matches: {
        Row: Match;
        Insert: Omit<Match, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Match, 'id' | 'created_at' | 'updated_at'>>;
      };
      match_screenshots: {
        Row: MatchScreenshot;
        Insert: Omit<MatchScreenshot, 'id' | 'created_at'>;
        Update: Partial<Omit<MatchScreenshot, 'id' | 'created_at'>>;
      };
      standings: {
        Row: Standing;
        Insert: Omit<Standing, 'id' | 'updated_at'>;
        Update: Partial<Omit<Standing, 'id' | 'updated_at'>>;
      };
    };
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      make_user_admin: {
        Args: { p_user_id: string };
        Returns: string;
      };
      generate_league_schedule: {
        Args: { p_league_id: string; p_start_date?: string; p_interval_days?: number };
        Returns: number;
      };
      get_league_standings: {
        Args: { p_league_id: string };
        Returns: LeagueStandingsResponse[];
      };
      get_team_matches: {
        Args: { p_team_id: string; p_status?: MatchStatus };
        Returns: TeamMatchResponse[];
      };
      get_upcoming_matches: {
        Args: { p_league_id: string; p_limit?: number };
        Returns: UpcomingMatchResponse[];
      };
      record_match_result: {
        Args: {
          p_match_id: string;
          p_home_score: number;
          p_away_score: number;
          p_screenshot_url?: string;
          p_screenshot_caption?: string;
        };
        Returns: boolean;
      };
    };
  };
}
