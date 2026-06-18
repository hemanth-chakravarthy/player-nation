import dotenv from 'dotenv';
import Groq from 'groq-sdk';
import { GoogleGenAI } from '@google/genai';
import { ProcessedMatchData } from './event-processor.service.ts';
import { ReportOutputSchema } from '../schemas/report.schema.ts';

dotenv.config();

export interface GeneratedReport {
  summary: string;
  keyMoments: string[];
  standoutPlayers: string[];
  teamAnalysis: string;
  recommendations: string[];
}

export class LlmService {
  private geminiKey: string | undefined;
  private groqKey: string | undefined;
  private groqClient: Groq | null = null;
  private geminiClient: GoogleGenAI | null = null;

  constructor() {
    this.geminiKey = process.env.GEMINI_API_KEY || undefined;
    this.groqKey = process.env.GROQ_API_KEY || undefined;

    if (this.geminiKey) {
      console.log('LLM Service: Gemini API Key detected. Initializing Gemini Client.');
      this.geminiClient = new GoogleGenAI({ apiKey: this.geminiKey });
    }

    if (this.groqKey) {
      console.log('LLM Service: Groq API Key detected. Initializing Groq Client.');
      this.groqClient = new Groq({ apiKey: this.groqKey });
    }

    if (!this.geminiKey && !this.groqKey) {
      console.warn('LLM Service: No API Keys detected. Running in Mock Fallback Mode.');
    }
  }

  public async generateReport(matchData: ProcessedMatchData): Promise<GeneratedReport> {
    const prompt = this.buildPrompt(matchData);

    // 1. Try Gemini
    if (this.geminiClient) {
      try {
        console.log('Generating report via Gemini...');
        const response = await this.geminiClient.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json'
          }
        });
        
        const text = response.text;
        if (text) {
          const parsed = JSON.parse(text);
          const validated = ReportOutputSchema.parse(parsed);
          return validated;
        }
      } catch (err) {
        console.error('Gemini report generation failed:', err);
        // Fall through to Groq if key exists, otherwise Mock
      }
    }

    // 2. Try Groq
    if (this.groqClient) {
      try {
        console.log('Generating report via Groq...');
        const response = await this.groqClient.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: 'You are a professional football analyst. You must return only a valid JSON object matching the requested schema. Do not include markdown blocks or any text outside of the JSON object.'
            },
            { role: 'user', content: prompt }
          ],
          model: 'llama-3.3-70b-versatile',
          response_format: { type: 'json_object' }
        });

        const text = response.choices[0]?.message?.content;
        if (text) {
          const parsed = JSON.parse(text);
          const validated = ReportOutputSchema.parse(parsed);
          return validated;
        }
      } catch (err) {
        console.error('Groq report generation failed:', err);
      }
    }

    // 3. Fallback to Mock Report
    console.log('Falling back to structured Mock Report Generation...');
    return this.generateMockReport(matchData);
  }

  private buildPrompt(matchData: ProcessedMatchData): string {
    const home = matchData.homeTeam;
    const away = matchData.awayTeam;

    return `You are a professional football analyst. 
Generate a comprehensive match report based strictly on the following structured statistics.

CRITICAL INSTRUCTIONS:
1. You must maintain 100% accuracy. Do not fabricate scores, player names, cards, or events.
2. Use ONLY the players, scores, and moments listed below.
3. Clean any player names containing unicode accent representations (e.g. replace "Š." or "\\u0160." with "S.").
4. The final score is EXACTLY ${home.goals} - ${away.goals} (Home Team: ${home.teamName} has ${home.goals} goals, Away Team: ${away.teamName} has ${away.goals} goals).

MATCH: ${home.teamName} (${home.goals}) vs ${away.teamName} (${away.goals})

TEAM STATISTICS:
- ${home.teamName}:
  * Goals: ${home.goals}
  * Possession Estimate: ${home.possession}%
  * Shots (On Target): ${home.shots} (${home.shotsOnTarget})
  * Pass Accuracy: ${home.passAccuracy}% (Passes completed: ${home.passesCompleted}/${home.passesAttempted})
  * Corners: ${home.corners}
  * Fouls: ${home.fouls}
  * Discipline: ${home.yellowCards} Yellows, ${home.redCards} Reds

- ${away.teamName}:
  * Goals: ${away.goals}
  * Possession Estimate: ${away.possession}%
  * Shots (On Target): ${away.shots} (${away.shotsOnTarget})
  * Pass Accuracy: ${away.passAccuracy}% (Passes completed: ${away.passesCompleted}/${away.passesAttempted})
  * Corners: ${away.corners}
  * Fouls: ${away.fouls}
  * Discipline: ${away.yellowCards} Yellows, ${away.redCards} Reds

STANDOUT PLAYER PERFORMANCES:
${matchData.topPlayers.map(p => `- ${p.playerName} (${p.teamName}): Goals: ${p.goals}, Assists: ${p.assists}, Key Passes: ${p.keyPasses}, Duels Won: ${p.duelsWon}, Interceptions: ${p.interceptions}, Rating: ${p.rating}/10`).join('\n')}

KEY MOMENTS CHRONOLOGY:
${matchData.keyMoments.map(m => `- ${m.description}`).join('\n')}

Generate the report and format it strictly as a JSON object with the following fields:
{
  "summary": "A 2-3 sentence narrative summary of the match flow, context, and outcome. Make sure the final score (${home.goals} - ${away.goals}) and key moments are accurately represented.",
  "keyMoments": ["An array of 3-5 strings detailing the analytical significance of the key turning points in the match based on the chronology above."],
  "standoutPlayers": ["An array of 2-3 strings describing the specific impact of the standout players on the game. Only mention players listed in the standout player performances above."],
  "teamAnalysis": "A short paragraph analyzing the tactical setups, possession strategies, and team-level performances of both teams using the possession and shots stats.",
  "recommendations": ["An array of 2-3 specific, actionable tactical recommendations/insights for each team based on their stats (e.g., '${home.teamName} should focus on converting transition possession', '${away.teamName} must decrease fouls in key areas')."]
}

Use factual information only. Do not fabricate events. Do not include markdown code block characters (\`\`\`), just return the raw JSON object.`;
  }

  private generateMockReport(matchData: ProcessedMatchData): GeneratedReport {
    const home = matchData.homeTeam;
    const away = matchData.awayTeam;
    
    const winnerName = home.goals > away.goals ? home.teamName : (away.goals > home.goals ? away.teamName : null);
    const scoreStr = `${home.goals}-${away.goals}`;

    const summary = winnerName 
      ? `A highly competitive fixture saw ${winnerName} secure a hard-fought victory over their opponents with a final scoreline of ${scoreStr}. The match was characterized by tactical discipline and moments of individual brilliance that ultimately decided the outcome.`
      : `An intense, tactically demanding battle ended in a ${scoreStr} draw. Both teams had opportunities to snatch a victory, but defensive resilience and crucial saves ensured the spoils were shared at the final whistle.`;

    const keyMoments = matchData.keyMoments.map(m => {
      if (m.type === 'winning_goal') return `The decisive moment came when the match-winning goal was scored, shattering the opponent's defensive structure and shifting the psychological advantage.`;
      if (m.type === 'red_card') return `The sending-off altered the tactical balance of the match, forcing one side into a low block and allowing the other to dominate possession.`;
      if (m.type === 'penalty') return `The penalty decision was a turning point, placing immense pressure on the keeper and providing a crucial scoring opportunity.`;
      return `The goal at the specific minute set the tone, forcing tactical adjustments from both coaches to chase the game.`;
    }).slice(0, 4);

    const standoutPlayers = matchData.topPlayers.map(p => {
      let desc = `${p.playerName} was instrumental, commanding the pitch with a rating of ${p.rating}/10. `;
      if (p.goals > 0) desc += `His clinical finishing was the difference-maker, converting critical chances under pressure.`;
      else if (p.assists > 0) desc += `His playmaking vision unlocked the defense, delivering key passes and facilitating transition play.`;
      else desc += `His defensive work rate and positioning broke up opposition build-ups and provided transition opportunities.`;
      return desc;
    }).slice(0, 3);

    const teamAnalysis = `${home.teamName} controlled ${home.possession}% of the ball with a pass completion rate of ${home.passAccuracy}%, establishing their tactical rhythm early. On the other side, ${away.teamName} registered ${away.shots} shots, displaying high attacking urgency while maintaining a compact shape in transition.`;

    const recommendations = [
      `${home.teamName} should focus on converting their ${home.possession}% possession into more clinical final-third entries to reduce reliance on counter-attacks.`,
      `${away.teamName} needs to address defensive lapses in transition and improve their ${away.passAccuracy}% passing accuracy under pressure to maintain structural stability.`
    ];

    return {
      summary,
      keyMoments,
      standoutPlayers,
      teamAnalysis,
      recommendations
    };
  }

  public checkHealth(): boolean {
    return this.geminiClient !== null || this.groqClient !== null;
  }
}
export default LlmService;
