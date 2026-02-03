export interface Team {
  id: number;
  name: string;
  logo: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: ('W' | 'D' | 'L')[];
  leagueId?: string;
}

export interface League {
  id: string;
  name: string;
  logo: string;
  season: string;
  type: 'football' | 'efootball';
}

export interface Match {
  id: number;
  leagueId: string;
  homeTeamId: number;
  awayTeamId: number;
  homeScore: number;
  awayScore: number;
  date: string;
  screenshot?: string; // Base64 image for eFootball matches
  createdAt: string;
}

export interface Schedule {
  id: number;
  leagueId: string;
  homeTeamId: number;
  awayTeamId: number;
  date: string;
  time: string;
  venue?: string;
  matchweek?: number;
  status: 'scheduled' | 'completed' | 'postponed';
}

