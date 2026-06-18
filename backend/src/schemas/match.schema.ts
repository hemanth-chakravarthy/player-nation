import { z } from 'zod';

export const GetMatchesResponseSchema = z.object({
  matches: z.array(
    z.object({
      matchId: z.number(),
      homeTeam: z.string(),
      awayTeam: z.string(),
      homeScore: z.number(),
      awayScore: z.number(),
      date: z.string(),
      competition: z.string(),
      venue: z.string()
    })
  )
});

export const GetMatchParamsSchema = z.object({
  id: z.string().transform((val) => parseInt(val, 10))
});

export const GetMatchResponseSchema = z.object({
  matchId: z.number(),
  homeTeam: z.string(),
  awayTeam: z.string(),
  homeScore: z.number(),
  awayScore: z.number(),
  date: z.string(),
  competition: z.string(),
  venue: z.string()
});
