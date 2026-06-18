import { RawEvent, DatasetService, ParsedMatch } from './dataset.service.ts';

export interface TeamStats {
  teamId: number;
  teamName: string;
  possession: number;
  shots: number;
  shotsOnTarget: number;
  passesAttempted: number;
  passesCompleted: number;
  passAccuracy: number;
  fouls: number;
  yellowCards: number;
  redCards: number;
  corners: number;
  goals: number;
}

export interface PlayerStats {
  playerId: number;
  playerName: string;
  teamId: number;
  teamName: string;
  goals: number;
  assists: number;
  keyPasses: number;
  duelsWon: number;
  interceptions: number;
  rating: number;
}

export interface KeyMoment {
  minute: number;
  type: 'goal' | 'red_card' | 'penalty' | 'equalizer' | 'winning_goal' | 'own_goal';
  description: string;
  teamId: number;
}

export interface ProcessedMatchData {
  matchId: number;
  homeTeam: TeamStats;
  awayTeam: TeamStats;
  topPlayers: PlayerStats[];
  keyMoments: KeyMoment[];
}

export class EventProcessorService {
  private datasetService: DatasetService;

  constructor() {
    this.datasetService = DatasetService.getInstance();
  }

  public processMatch(matchId: number): ProcessedMatchData {
    const match = this.datasetService.getMatch(matchId);
    const rawMatch = this.datasetService.getRawMatch(matchId);
    if (!match || !rawMatch) {
      throw new Error(`Match ${matchId} not found in dataset.`);
    }

    const events = this.datasetService.getMatchEvents(matchId);
    
    const teamIds = Object.keys(rawMatch.teamsData).map(id => parseInt(id, 10));
    const homeTeamId = teamIds.find(id => rawMatch.teamsData[id].side === 'home')!;
    const awayTeamId = teamIds.find(id => rawMatch.teamsData[id].side === 'away')!;

    // 1. Process Team Statistics
    const homeStats = this.initializeTeamStats(homeTeamId, match.homeTeam);
    const awayStats = this.initializeTeamStats(awayTeamId, match.awayTeam);
    
    // Player statistics lookup
    const playerStatsMap: Map<number, PlayerStats> = new Map();

    // Chronological moments list
    const rawMoments: Array<{
      minute: number;
      second: number;
      type: KeyMoment['type'];
      description: string;
      teamId: number;
      scoreAfter?: string;
    }> = [];

    let homeCurrentScore = 0;
    let awayCurrentScore = 0;
    const passesMap = { [homeTeamId]: 0, [awayTeamId]: 0 };
    const completedPassesMap = { [homeTeamId]: 0, [awayTeamId]: 0 };

    // Sort events by period and second to ensure proper timeline
    const sortedEvents = [...events].sort((a, b) => {
      if (a.matchPeriod !== b.matchPeriod) {
        const periodOrder = { '1H': 1, '2H': 2, 'E1': 3, 'E2': 4, 'P': 5 };
        return periodOrder[a.matchPeriod] - periodOrder[b.matchPeriod];
      }
      return a.eventSec - b.eventSec;
    });

    sortedEvents.forEach(event => {
      const { eventName, subEventName, teamId, playerId, tags, eventSec, matchPeriod } = event;
      
      // Calculate minute based on period
      let minute = Math.floor(eventSec / 60);
      if (matchPeriod === '2H') minute += 45;
      else if (matchPeriod === 'E1') minute += 90;
      else if (matchPeriod === 'E2') minute += 105;

      const second = Math.floor(eventSec % 60);
      const isHome = teamId === homeTeamId;
      const currentTeamStats = isHome ? homeStats : awayStats;
      const opponentStats = isHome ? awayStats : homeStats;

      // Ensure player stats object exists
      if (playerId > 0 && !playerStatsMap.has(playerId)) {
        playerStatsMap.set(playerId, {
          playerId,
          playerName: this.datasetService.getPlayerName(playerId),
          teamId,
          teamName: isHome ? match.homeTeam : match.awayTeam,
          goals: 0,
          assists: 0,
          keyPasses: 0,
          duelsWon: 0,
          interceptions: 0,
          rating: 6.0 // Base rating
        });
      }
      const currentPlayerStats = playerStatsMap.get(playerId);

      // TAGS Check Helpers
      const hasTag = (tagId: number) => tags.some(t => t.id === tagId);
      const isGoal = hasTag(101);
      const isOwnGoal = hasTag(102);
      const isAssist = hasTag(301);
      const isKeyPass = hasTag(302);
      const isAccurate = hasTag(1801);
      const isRedCard = hasTag(1701) || hasTag(1703);
      const isYellowCard = hasTag(1702);

      // --- 1. Passes ---
      if (eventName === 'Pass') {
        currentTeamStats.passesAttempted++;
        passesMap[teamId]++;
        if (isAccurate) {
          currentTeamStats.passesCompleted++;
          completedPassesMap[teamId]++;
        }

        if (currentPlayerStats) {
          if (isAssist) {
            currentPlayerStats.assists++;
          }
          if (isKeyPass) {
            currentPlayerStats.keyPasses++;
          }
        }
      }

      // --- 2. Shots & Goals ---
      if (eventName === 'Shot' || subEventName === 'Penalty') {
        currentTeamStats.shots++;
        if (isAccurate || isGoal) {
          currentTeamStats.shotsOnTarget++;
        }

        if (isGoal && !isOwnGoal) {
          currentTeamStats.goals++;
          if (isHome) homeCurrentScore++;
          else awayCurrentScore++;

          const scorer = this.datasetService.getPlayerName(playerId);
          const scoreStr = `${homeCurrentScore}-${awayCurrentScore}`;

          if (currentPlayerStats) {
            currentPlayerStats.goals++;
          }

          let type: KeyMoment['type'] = 'goal';
          let desc = `${minute}' Goal! ${scorer} scores for ${currentTeamStats.teamName}. (${scoreStr})`;
          
          if (subEventName === 'Penalty') {
            type = 'penalty';
            desc = `${minute}' Penalty Goal! ${scorer} converts from the spot for ${currentTeamStats.teamName}. (${scoreStr})`;
          }

          rawMoments.push({
            minute,
            second,
            type,
            description: desc,
            teamId,
            scoreAfter: scoreStr
          });
        }
      }

      // --- 3. Own Goals ---
      if (isOwnGoal && isGoal) {
        // Own goal benefits the opponent team
        opponentStats.goals++;
        if (isHome) awayCurrentScore++;
        else homeCurrentScore++;

        const scorer = this.datasetService.getPlayerName(playerId);
        const scoreStr = `${homeCurrentScore}-${awayCurrentScore}`;

        rawMoments.push({
          minute,
          second,
          type: 'own_goal',
          description: `${minute}' Own Goal! Unfortunate moment as ${scorer} scores in his own net. (${scoreStr})`,
          teamId,
          scoreAfter: scoreStr
        });
      }

      // --- 4. Corners ---
      if (eventName === 'Free Kick' && subEventName === 'Corner') {
        currentTeamStats.corners++;
      }

      // --- 5. Fouls & Cards ---
      if (eventName === 'Foul') {
        currentTeamStats.fouls++;
      }

      if (isYellowCard) {
        currentTeamStats.yellowCards++;
      }

      if (isRedCard) {
        currentTeamStats.redCards++;
        const player = this.datasetService.getPlayerName(playerId);
        rawMoments.push({
          minute,
          second,
          type: 'red_card',
          description: `${minute}' Red Card! ${player} (${currentTeamStats.teamName}) is sent off.`,
          teamId
        });
      }

      // --- 6. Duels and Interceptions (Player rating helper) ---
      if (eventName === 'Duel' && isAccurate && currentPlayerStats) {
        currentPlayerStats.duelsWon++;
      }
      
      // Simple Interception/Clearance Detection
      if ((eventName === 'Others on the ball' && subEventName === 'Clearance' && currentPlayerStats) ||
          (eventName === 'Save' && currentPlayerStats)) {
        currentPlayerStats.interceptions++;
      }
    });

    // Calculate Possession Estimates (percentage of total completed passes)
    const totalCompletedPasses = completedPassesMap[homeTeamId] + completedPassesMap[awayTeamId];
    if (totalCompletedPasses > 0) {
      homeStats.possession = Math.round((completedPassesMap[homeTeamId] / totalCompletedPasses) * 100);
      awayStats.possession = 100 - homeStats.possession;
    } else {
      homeStats.possession = 50;
      awayStats.possession = 50;
    }

    // Calculate Pass Accuracies
    if (homeStats.passesAttempted > 0) {
      homeStats.passAccuracy = Math.round((homeStats.passesCompleted / homeStats.passesAttempted) * 100);
    }
    if (awayStats.passesAttempted > 0) {
      awayStats.passAccuracy = Math.round((awayStats.passesCompleted / awayStats.passesAttempted) * 100);
    }

    // Process Player Ratings & Sort
    const players = Array.from(playerStatsMap.values());
    players.forEach(p => {
      // Rating calculation: base 6.0, add for key actions, cap at 10.0
      let rawRating = 6.0;
      rawRating += p.goals * 1.5;
      rawRating += p.assists * 1.2;
      rawRating += p.keyPasses * 0.4;
      rawRating += p.duelsWon * 0.1;
      rawRating += p.interceptions * 0.15;
      p.rating = Math.min(10, Math.round(rawRating * 10) / 10);
    });

    // Sort top performers (highest rating first)
    const topPlayers = players
      .sort((a, b) => b.rating - a.rating || (b.goals + b.assists) - (a.goals + a.assists))
      .slice(0, 5);

    // Identify Equalizers and Winning Goal in timeline
    const finalScoreStr = `${homeCurrentScore}-${awayCurrentScore}`;
    const winningTeamId = homeCurrentScore > awayCurrentScore ? homeTeamId : (awayCurrentScore > homeCurrentScore ? awayTeamId : null);

    const processedMoments: KeyMoment[] = [];
    let lastGoalMomentIndex = -1;

    rawMoments.forEach((m, idx) => {
      let type = m.type;
      let desc = m.description;

      if (m.scoreAfter) {
        const parts = m.scoreAfter.split('-');
        const hScore = parseInt(parts[0], 10);
        const aScore = parseInt(parts[1], 10);

        // Check if this was an equalizer
        if (hScore === aScore && hScore > 0) {
          type = 'equalizer';
          desc = `${m.minute}' Equalizer! ${desc.split('! ')[1]}`;
        }
        
        lastGoalMomentIndex = idx;
      }

      processedMoments.push({
        minute: m.minute,
        type,
        description: desc,
        teamId: m.teamId
      });
    });

    // Mark the last goal that changed the outcome permanently as the winning goal
    if (winningTeamId !== null && lastGoalMomentIndex !== -1) {
      // Find the goal that actually gave the winning team the final lead
      let winningGoalIndex = -1;
      let tempH = 0;
      let tempA = 0;
      let finalWinnerLeadFound = false;

      rawMoments.forEach((m, idx) => {
        if (m.scoreAfter) {
          const parts = m.scoreAfter.split('-');
          const h = parseInt(parts[0], 10);
          const a = parseInt(parts[1], 10);
          
          const leader = h > a ? homeTeamId : (a > h ? awayTeamId : null);
          if (leader === winningTeamId) {
            if (!finalWinnerLeadFound) {
              winningGoalIndex = idx;
            }
          } else {
            // Level or trailing means previous lead was lost, reset winning goal
            winningGoalIndex = -1;
          }
          tempH = h;
          tempA = a;
        }
      });

      if (winningGoalIndex !== -1) {
        processedMoments[winningGoalIndex].type = 'winning_goal';
        processedMoments[winningGoalIndex].description = `${rawMoments[winningGoalIndex].minute}' Match Winner! ${rawMoments[winningGoalIndex].description.split('! ')[1]} (Crucial goal that decided the match)`;
      }
    }

    return {
      matchId,
      homeTeam: homeStats,
      awayTeam: awayStats,
      topPlayers,
      keyMoments: processedMoments
    };
  }

  private initializeTeamStats(teamId: number, name: string): TeamStats {
    return {
      teamId,
      teamName: name,
      possession: 0,
      shots: 0,
      shotsOnTarget: 0,
      passesAttempted: 0,
      passesCompleted: 0,
      passAccuracy: 0,
      fouls: 0,
      yellowCards: 0,
      redCards: 0,
      corners: 0,
      goals: 0
    };
  }
}
export default EventProcessorService;
