import { z } from 'zod';

export const GenerateReportRequestSchema = z.object({
  matchId: z.number()
});

export const ReportOutputSchema = z.object({
  summary: z.string(),
  keyMoments: z.array(z.string()),
  standoutPlayers: z.array(z.string()),
  teamAnalysis: z.string(),
  recommendations: z.array(z.string())
});

export const GenerateReportResponseSchema = z.object({
  reportId: z.string(),
  matchId: z.number(),
  homeTeam: z.string(),
  awayTeam: z.string(),
  score: z.string(),
  report: ReportOutputSchema
});
