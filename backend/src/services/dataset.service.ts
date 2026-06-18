import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export interface Team {
  wyId: number;
  name: string;
  officialName: string;
  area: {
    name: string;
    alpha3code: string;
  };
}

export interface Player {
  wyId: number;
  firstName: string;
  lastName: string;
  shortName: string;
  currentTeamId: number;
  role: {
    name: string;
    code2: string;
  };
}

export interface MatchTeamData {
  teamId: number;
  side: 'home' | 'away';
  score: number;
  scoreHT: number;
  scoreET?: number;
  scoreP?: number;
}

export interface RawMatch {
  wyId: number;
  label: string;
  dateutc: string;
  status: string;
  venue: string;
  roundId: number;
  teamsData: {
    [teamId: string]: MatchTeamData;
  };
}

export interface RawEvent {
  eventId: number;
  eventName: string;
  subEventName: string;
  teamId: number;
  playerId: number;
  matchId: number;
  matchPeriod: '1H' | '2H' | 'E1' | 'E2' | 'P';
  eventSec: number;
  tags: Array<{ id: number }>;
}

export interface ParsedMatch {
  matchId: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  date: string;
  competition: string;
  venue: string;
}

export class DatasetService {
  private static instance: DatasetService;
  private dataPath: string;
  private teams: Map<number, Team> = new Map();
  private players: Map<number, Player> = new Map();
  private matches: ParsedMatch[] = [];
  private rawMatches: RawMatch[] = [];
  private eventCache: Map<number, RawEvent[]> = new Map();
  private isLoaded = false;

  private constructor() {
    this.dataPath = process.env.DATASET_PATH || path.join(__dirname, '..', 'data');
  }

  public static getInstance(): DatasetService {
    if (!DatasetService.instance) {
      DatasetService.instance = new DatasetService();
    }
    return DatasetService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isLoaded) return;

    try {
      console.log('Initializing Dataset Service, loading JSON files...');
      
      const teamsPath = path.join(this.dataPath, 'teams.json');
      const playersPath = path.join(this.dataPath, 'players.json');
      const matchesPath = path.join(this.dataPath, 'matches_World_Cup.json');
      const eventsPath = path.join(this.dataPath, 'events_World_Cup.json');

      if (!fs.existsSync(teamsPath) || !fs.existsSync(playersPath) || !fs.existsSync(matchesPath)) {
        throw new Error(`Dataset files not found at ${this.dataPath}. Make sure to run download script first.`);
      }

      // Load Teams
      const rawTeams: Team[] = JSON.parse(fs.readFileSync(teamsPath, 'utf8'));
      rawTeams.forEach(team => this.teams.set(team.wyId, team));
      console.log(`Loaded ${this.teams.size} teams.`);

      // Load Players
      const rawPlayers: Player[] = JSON.parse(fs.readFileSync(playersPath, 'utf8'));
      rawPlayers.forEach(player => this.players.set(player.wyId, player));
      console.log(`Loaded ${this.players.size} players.`);

      // Load Matches
      this.rawMatches = JSON.parse(fs.readFileSync(matchesPath, 'utf8'));
      this.matches = this.rawMatches.map(match => {
        const teamsData = Object.values(match.teamsData);
        const home = teamsData.find(t => t.side === 'home');
        const away = teamsData.find(t => t.side === 'away');

        const homeName = home ? this.getTeamName(home.teamId) : 'Unknown';
        const awayName = away ? this.getTeamName(away.teamId) : 'Unknown';

        // Extract clean date (YYYY-MM-DD)
        const dateStr = match.dateutc.split(' ')[0];

        let compStage = 'Group Stage';
        if (match.roundId === 4165368) compStage = 'Final';
        else if (match.roundId === 4165367) compStage = 'Third Place';
        else if (match.roundId === 4165366) compStage = 'Semi-Final';
        else if (match.roundId === 4165365) compStage = 'Quarter-Final';
        else if (match.roundId === 4165364) compStage = 'Round of 16';

        return {
          matchId: match.wyId,
          homeTeam: homeName,
          awayTeam: awayName,
          homeScore: home?.score ?? 0,
          awayScore: away?.score ?? 0,
          date: dateStr,
          competition: `FIFA World Cup 2018 - ${compStage}`,
          venue: match.venue || 'Unknown Stadium'
        };
      });
      console.log(`Loaded ${this.matches.length} World Cup matches.`);

      // Pre-load and Index Events for 100x faster stats loading
      if (fs.existsSync(eventsPath)) {
        console.log('Pre-indexing all match events from disk...');
        const allEvents: RawEvent[] = JSON.parse(fs.readFileSync(eventsPath, 'utf8'));
        allEvents.forEach(e => {
          if (!this.eventCache.has(e.matchId)) {
            this.eventCache.set(e.matchId, []);
          }
          this.eventCache.get(e.matchId)!.push(e);
        });
        console.log(`Indexed events for ${this.eventCache.size} matches.`);
      }

      this.isLoaded = true;
    } catch (error) {
      console.error('Failed to initialize dataset:', error);
      throw error;
    }
  }

  public getTeamName(teamId: number): string {
    const team = this.teams.get(teamId);
    return team ? team.name : `Team ${teamId}`;
  }

  public getPlayerName(playerId: number): string {
    if (playerId === 0) return 'Unknown';
    const player = this.players.get(playerId);
    if (!player) return `Player ${playerId}`;
    return player.shortName || `${player.firstName} ${player.lastName}`;
  }

  public getPlayer(playerId: number): Player | undefined {
    return this.players.get(playerId);
  }

  public getMatches(): ParsedMatch[] {
    return this.matches;
  }

  public getMatch(matchId: number): ParsedMatch | undefined {
    return this.matches.find(m => m.matchId === matchId);
  }

  public getRawMatch(matchId: number): RawMatch | undefined {
    return this.rawMatches.find(m => m.wyId === matchId);
  }

  public getMatchEvents(matchId: number): RawEvent[] {
    return this.eventCache.get(matchId) || [];
  }

  public checkHealth(): boolean {
    return this.isLoaded;
  }
}
export default DatasetService;
