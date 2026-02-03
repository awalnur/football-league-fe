'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Team, League, Match, Schedule } from '@/types/standings';
import { leagues as initialLeagues, standingsData as initialStandings } from '@/data/standings';

interface LeagueContextType {
  leagues: League[];
  teams: Record<string, Team[]>;
  matches: Match[];
  schedules: Schedule[];
  addTeam: (team: Omit<Team, 'id' | 'played' | 'won' | 'drawn' | 'lost' | 'goalsFor' | 'goalsAgainst' | 'goalDifference' | 'points' | 'form'> & { leagueId: string }) => void;
  addMatch: (match: Omit<Match, 'id' | 'createdAt'>) => void;
  addSchedule: (schedule: Omit<Schedule, 'id' | 'status'>) => void;
  updateScheduleStatus: (scheduleId: number, status: Schedule['status']) => void;
  getTeamsByLeague: (leagueId: string) => Team[];
  getMatchesByLeague: (leagueId: string) => Match[];
  getMatchesByTeam: (teamId: number, leagueId: string) => Match[];
  getSchedulesByLeague: (leagueId: string) => Schedule[];
  getSchedulesByTeam: (teamId: number, leagueId: string) => Schedule[];
  getLeagueById: (leagueId: string) => League | undefined;
  getTeamById: (teamId: number, leagueId: string) => Team | undefined;
}

const LeagueContext = createContext<LeagueContextType | undefined>(undefined);

// Add leagueId to initial standings
const processInitialStandings = (): Record<string, Team[]> => {
  const processed: Record<string, Team[]> = {};
  Object.entries(initialStandings).forEach(([leagueId, teams]) => {
    processed[leagueId] = teams.map(team => ({ ...team, leagueId }));
  });
  return processed;
};

export function LeagueProvider({ children }: { children: ReactNode }) {
  const [leagues] = useState<League[]>(initialLeagues);
  const [teams, setTeams] = useState<Record<string, Team[]>>(() => processInitialStandings());
  const [matches, setMatches] = useState<Match[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedTeams = localStorage.getItem('football-leagues-teams');
    const savedMatches = localStorage.getItem('football-leagues-matches');
    const savedSchedules = localStorage.getItem('football-leagues-schedules');

    if (savedTeams) {
      try {
        setTeams(JSON.parse(savedTeams));
      } catch (e) {
        console.error('Failed to parse saved teams:', e);
      }
    }

    if (savedMatches) {
      try {
        setMatches(JSON.parse(savedMatches));
      } catch (e) {
        console.error('Failed to parse saved matches:', e);
      }
    }

    if (savedSchedules) {
      try {
        setSchedules(JSON.parse(savedSchedules));
      } catch (e) {
        console.error('Failed to parse saved schedules:', e);
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('football-leagues-teams', JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    localStorage.setItem('football-leagues-matches', JSON.stringify(matches));
  }, [matches]);

  useEffect(() => {
    localStorage.setItem('football-leagues-schedules', JSON.stringify(schedules));
  }, [schedules]);

  const addTeam = (teamData: Omit<Team, 'id' | 'played' | 'won' | 'drawn' | 'lost' | 'goalsFor' | 'goalsAgainst' | 'goalDifference' | 'points' | 'form'> & { leagueId: string }) => {
    const leagueTeams = teams[teamData.leagueId] || [];
    const maxId = Math.max(0, ...leagueTeams.map(t => t.id), ...Object.values(teams).flat().map(t => t.id));

    const newTeam: Team = {
      ...teamData,
      id: maxId + 1,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      form: [],
    };

    setTeams(prev => ({
      ...prev,
      [teamData.leagueId]: [...(prev[teamData.leagueId] || []), newTeam],
    }));
  };

  const updateTeamStats = (teamId: number, leagueId: string, goalsScored: number, goalsConceded: number) => {
    setTeams(prev => {
      const leagueTeams = prev[leagueId] || [];
      const updatedTeams = leagueTeams.map(team => {
        if (team.id !== teamId) return team;

        const isWin = goalsScored > goalsConceded;
        const isDraw = goalsScored === goalsConceded;
        const result: 'W' | 'D' | 'L' = isWin ? 'W' : isDraw ? 'D' : 'L';

        const newForm = [result, ...team.form].slice(0, 5);

        return {
          ...team,
          played: team.played + 1,
          won: team.won + (isWin ? 1 : 0),
          drawn: team.drawn + (isDraw ? 1 : 0),
          lost: team.lost + (!isWin && !isDraw ? 1 : 0),
          goalsFor: team.goalsFor + goalsScored,
          goalsAgainst: team.goalsAgainst + goalsConceded,
          goalDifference: team.goalDifference + goalsScored - goalsConceded,
          points: team.points + (isWin ? 3 : isDraw ? 1 : 0),
          form: newForm,
        };
      });

      // Sort by points, then goal difference, then goals scored
      updatedTeams.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        return b.goalsFor - a.goalsFor;
      });

      return { ...prev, [leagueId]: updatedTeams };
    });
  };

  const addMatch = (matchData: Omit<Match, 'id' | 'createdAt'>) => {
    const maxId = Math.max(0, ...matches.map(m => m.id));

    const newMatch: Match = {
      ...matchData,
      id: maxId + 1,
      createdAt: new Date().toISOString(),
    };

    setMatches(prev => [newMatch, ...prev]);

    // Update team stats
    updateTeamStats(matchData.homeTeamId, matchData.leagueId, matchData.homeScore, matchData.awayScore);
    updateTeamStats(matchData.awayTeamId, matchData.leagueId, matchData.awayScore, matchData.homeScore);
  };

  const getTeamsByLeague = (leagueId: string) => teams[leagueId] || [];

  const getMatchesByLeague = (leagueId: string) => matches.filter(m => m.leagueId === leagueId);

  const getMatchesByTeam = (teamId: number, leagueId: string) =>
    matches.filter(m => m.leagueId === leagueId && (m.homeTeamId === teamId || m.awayTeamId === teamId));

  const getSchedulesByLeague = (leagueId: string) =>
    schedules.filter(s => s.leagueId === leagueId).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const getSchedulesByTeam = (teamId: number, leagueId: string) =>
    schedules.filter(s => s.leagueId === leagueId && (s.homeTeamId === teamId || s.awayTeamId === teamId))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const addSchedule = (scheduleData: Omit<Schedule, 'id' | 'status'>) => {
    const maxId = Math.max(0, ...schedules.map(s => s.id));

    const newSchedule: Schedule = {
      ...scheduleData,
      id: maxId + 1,
      status: 'scheduled',
    };

    setSchedules(prev => [...prev, newSchedule]);
  };

  const updateScheduleStatus = (scheduleId: number, status: Schedule['status']) => {
    setSchedules(prev => prev.map(s => s.id === scheduleId ? { ...s, status } : s));
  };

  const getLeagueById = (leagueId: string) => leagues.find(l => l.id === leagueId);

  const getTeamById = (teamId: number, leagueId: string) =>
    teams[leagueId]?.find(t => t.id === teamId);

  return (
    <LeagueContext.Provider
      value={{
        leagues,
        teams,
        matches,
        schedules,
        addTeam,
        addMatch,
        addSchedule,
        updateScheduleStatus,
        getTeamsByLeague,
        getMatchesByLeague,
        getMatchesByTeam,
        getSchedulesByLeague,
        getSchedulesByTeam,
        getLeagueById,
        getTeamById,
      }}
    >
      {children}
    </LeagueContext.Provider>
  );
}

export function useLeague() {
  const context = useContext(LeagueContext);
  if (!context) {
    throw new Error('useLeague must be used within a LeagueProvider');
  }
  return context;
}
