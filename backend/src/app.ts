import fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import DatasetService from './services/dataset.service.ts';
import EventProcessorService from './services/event-processor.service.ts';
import LlmService from './services/llm.service.ts';
import { GetMatchParamsSchema } from './schemas/match.schema.ts';
import { GenerateReportRequestSchema } from './schemas/report.schema.ts';

dotenv.config();

const server = fastify({
  logger: true
});

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });
const datasetService = DatasetService.getInstance();
const eventProcessorService = new EventProcessorService();
const llmService = new LlmService();

// Register CORS
server.register(cors, {
  origin: '*'
});

// Health Check Endpoint
server.get('/health', async (request, reply) => {
  const datasetLoaded = datasetService.checkHealth();
  const llmConfigured = llmService.checkHealth();

  return {
    status: 'healthy',
    datasetLoaded,
    llmConfigured
  };
});

// List World Cup Matches
server.get('/matches', async (request, reply) => {
  try {
    const matches = datasetService.getMatches();
    return { matches };
  } catch (error) {
    server.log.error(error);
    reply.status(500).send({
      error: {
        code: 'DATASET_UNAVAILABLE',
        message: 'Could not retrieve matches from dataset.'
      }
    });
  }
});

// Get Single Match Details
server.get('/matches/:id', async (request, reply) => {
  try {
    const params = GetMatchParamsSchema.parse(request.params);
    const match = datasetService.getMatch(params.id);

    if (!match) {
      reply.status(404).send({
        error: {
          code: 'MATCH_NOT_FOUND',
          message: `Match with ID ${params.id} was not found.`
        }
      });
      return;
    }

    return match;
  } catch (error) {
    server.log.error(error);
    reply.status(400).send({
      error: {
        code: 'INVALID_MATCH_ID',
        message: 'The provided match ID is invalid.'
      }
    });
  }
});

// Get Match Statistics and Lineups
server.get('/matches/:id/stats', async (request, reply) => {
  try {
    const params = GetMatchParamsSchema.parse(request.params);
    const match = datasetService.getMatch(params.id);
    const rawMatch = datasetService.getRawMatch(params.id);

    if (!match || !rawMatch) {
      reply.status(404).send({
        error: {
          code: 'MATCH_NOT_FOUND',
          message: `Match with ID ${params.id} was not found.`
        }
      });
      return;
    }

    const processedData = eventProcessorService.processMatch(params.id);
    
    // Build lineups
    const getLineupForTeam = (teamId: number) => {
      const teamData = rawMatch.teamsData[teamId] as any;
      if (!teamData || !teamData.formation || !teamData.formation.lineup) {
        return [];
      }
      
      const starting = teamData.formation.lineup.map((p: any, index: number) => {
        const playerObj = datasetService.getPlayer(p.playerId);
        const roleCode = playerObj?.role?.code2 || 'MF';
        const isGK = roleCode === 'GK';
        
        let number = '10';
        if (isGK) number = '1';
        else {
          number = String(2 + (index % 22));
        }
        
        let goalsStr = '';
        const gCount = parseInt(p.goals || '0', 10);
        if (!isNaN(gCount) && gCount > 0) {
          goalsStr = '⚽'.repeat(gCount);
        }

        return {
          number,
          name: playerObj ? (playerObj.shortName || `${playerObj.firstName} ${playerObj.lastName}`) : `Player ${p.playerId}`,
          role: isGK ? 'shield' : undefined,
          goals: goalsStr || undefined,
          sub: false
        };
      });

      const subs = teamData.formation.substitutions || [];
      const substitutes = subs.map((sub: any, index: number) => {
        const playerObj = datasetService.getPlayer(sub.playerIn);
        const benchPlayer = teamData.formation.bench?.find((bp: any) => bp.playerId === sub.playerIn);
        let goalsStr = '';
        if (benchPlayer) {
          const gCount = parseInt(benchPlayer.goals || '0', 10);
          if (!isNaN(gCount) && gCount > 0) {
            goalsStr = '⚽'.repeat(gCount);
          }
        }
        return {
          number: String(12 + (index % 10)),
          name: playerObj ? (playerObj.shortName || `${playerObj.firstName} ${playerObj.lastName}`) : `Player ${sub.playerIn}`,
          role: undefined,
          goals: goalsStr || undefined,
          sub: true
        };
      });

      return [...starting, ...substitutes];
    };

    const homeLineup = getLineupForTeam(processedData.homeTeam.teamId);
    const awayLineup = getLineupForTeam(processedData.awayTeam.teamId);

    return {
      matchId: params.id,
      possessionHome: processedData.homeTeam.possession,
      possessionAway: processedData.awayTeam.possession,
      shotsHome: processedData.homeTeam.shots,
      shotsAway: processedData.awayTeam.shots,
      foulsHome: processedData.homeTeam.fouls,
      foulsAway: processedData.awayTeam.fouls,
      foulsText: processedData.homeTeam.fouls > processedData.awayTeam.fouls 
        ? `${processedData.homeTeam.teamName} physical play` 
        : `${processedData.awayTeam.teamName} physical play`,
      homeLineup,
      awayLineup
    };
  } catch (error) {
    server.log.error(error);
    reply.status(400).send({
      error: {
        code: 'INVALID_REQUEST',
        message: 'Could not process match stats.'
      }
    });
  }
});

// Generate Match Report (with PostgreSQL caching)
server.post('/reports/generate', async (request, reply) => {
  try {
    const body = GenerateReportRequestSchema.parse(request.body);
    const match = datasetService.getMatch(body.matchId);

    if (!match) {
      reply.status(404).send({
        error: {
          code: 'MATCH_NOT_FOUND',
          message: `Match with ID ${body.matchId} was not found.`
        }
      });
      return;
    }

    // 1. Ensure Match exists in DB (upsert)
    await prisma.match.upsert({
      where: { id: match.matchId },
      update: {
        homeScore: match.homeScore,
        awayScore: match.awayScore
      },
      create: {
        id: match.matchId,
        date: match.date,
        competition: match.competition,
        venue: match.venue,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        status: 'completed'
      }
    });

    // 2. Check cache
    const cachedReport = await prisma.tacticalReport.findUnique({
      where: { matchId: body.matchId }
    });

    if (cachedReport) {
      server.log.info(`Serving cached tactical report for match ID ${body.matchId}`);
      return {
        reportId: `rep_${body.matchId}`,
        matchId: body.matchId,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        score: `${match.homeScore}-${match.awayScore}`,
        report: {
          summary: cachedReport.summary,
          keyMoments: cachedReport.keyMoments,
          standoutPlayers: cachedReport.standoutPlayers,
          teamAnalysis: cachedReport.teamAnalysis,
          recommendations: cachedReport.recommendations
        }
      };
    }

    server.log.info(`Cache miss. Processing events and invoking LLM for match ID ${body.matchId}...`);
    const processedData = eventProcessorService.processMatch(body.matchId);
    const reportOutput = await llmService.generateReport(processedData);

    // 3. Store in cache
    await prisma.tacticalReport.create({
      data: {
        matchId: body.matchId,
        summary: reportOutput.summary,
        keyMoments: reportOutput.keyMoments,
        standoutPlayers: reportOutput.standoutPlayers,
        teamAnalysis: reportOutput.teamAnalysis,
        recommendations: reportOutput.recommendations
      }
    });

    return {
      reportId: `rep_${body.matchId}`,
      matchId: body.matchId,
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      score: `${match.homeScore}-${match.awayScore}`,
      report: reportOutput
    };
  } catch (error: any) {
    server.log.error(error);
    
    if (error.name === 'ZodError') {
      reply.status(400).send({
        error: {
          code: 'VALIDATION_FAILED',
          message: 'The request body is invalid or the LLM response failed validation.',
          details: error.errors
        }
      });
      return;
    }

    reply.status(500).send({
      error: {
        code: 'REPORT_GENERATION_FAILED',
        message: error.message || 'An error occurred while generating the match report.'
      }
    });
  }
});

// Save a Match Report to User's Saved Reports
server.post('/reports/save', async (request, reply) => {
  try {
    const reportData: any = request.body;
    if (!reportData || !reportData.matchId) {
      reply.status(400).send({ error: { message: 'Invalid report data.' } });
      return;
    }

    const matchId = parseInt(reportData.matchId, 10);
    const match = datasetService.getMatch(matchId);
    if (!match) {
      reply.status(404).send({ error: { message: `Match with ID ${matchId} not found.` } });
      return;
    }

    // Ensure match and report exist in database
    await prisma.match.upsert({
      where: { id: matchId },
      update: {},
      create: {
        id: matchId,
        date: match.date,
        competition: match.competition,
        venue: match.venue,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        status: 'completed'
      }
    });

    if (reportData.report) {
      await prisma.tacticalReport.upsert({
        where: { matchId },
        update: {},
        create: {
          matchId,
          summary: reportData.report.summary || '',
          keyMoments: reportData.report.keyMoments || [],
          standoutPlayers: reportData.report.standoutPlayers || [],
          teamAnalysis: reportData.report.teamAnalysis || '',
          recommendations: reportData.report.recommendations || []
        }
      });
    }

    // Save under mock user id "default_user_1"
    await prisma.savedReport.upsert({
      where: {
        userId_matchId: {
          userId: 'default_user_1',
          matchId
        }
      },
      update: {},
      create: {
        userId: 'default_user_1',
        matchId
      }
    });

    const count = await prisma.savedReport.count({
      where: { userId: 'default_user_1' }
    });

    return { success: true, savedReportsCount: count };
  } catch (error) {
    server.log.error(error);
    reply.status(500).send({ error: { message: 'Failed to save report.' } });
  }
});

// Get all Saved Reports for Current User
server.get('/reports/saved', async (request, reply) => {
  try {
    const saved = await prisma.savedReport.findMany({
      where: { userId: 'default_user_1' },
      include: {
        match: {
          include: {
            tacticalReport: true
          }
        }
      }
    });

    // Map database relations back to schema format expected by mobile app
    const reports = saved.map(s => {
      const m = s.match;
      return {
        matchId: m.id,
        homeTeam: m.homeTeam,
        awayTeam: m.awayTeam,
        score: `${m.homeScore}-${m.awayScore}`,
        competition: m.competition,
        date: m.date,
        venue: m.venue,
        report: m.tacticalReport ? {
          summary: m.tacticalReport.summary,
          keyMoments: m.tacticalReport.keyMoments,
          standoutPlayers: m.tacticalReport.standoutPlayers,
          teamAnalysis: m.tacticalReport.teamAnalysis,
          recommendations: m.tacticalReport.recommendations
        } : null
      };
    });

    return { reports };
  } catch (error) {
    server.log.error(error);
    reply.status(500).send({ error: { message: 'Failed to retrieve saved reports.' } });
  }
});

// Delete a Saved Report
server.delete('/reports/saved/:matchId', async (request, reply) => {
  try {
    const params = request.params as any;
    const matchId = parseInt(params.matchId, 10);
    await prisma.savedReport.delete({
      where: {
        userId_matchId: {
          userId: 'default_user_1',
          matchId
        }
      }
    });

    const count = await prisma.savedReport.count({
      where: { userId: 'default_user_1' }
    });

    return { success: true, savedReportsCount: count };
  } catch (error) {
    server.log.error(error);
    reply.status(500).send({ error: { message: 'Failed to delete saved report.' } });
  }
});

// Start Server
const start = async () => {
  try {
    // Bootstrap dataset service first
    await datasetService.initialize();

    const port = parseInt(process.env.PORT || '3000', 10);
    await server.listen({ port, host: '0.0.0.0' });
    console.log(`Server is running at http://localhost:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
