// Prisma v7 config — connection URL goes here, NOT in schema.prisma
import 'dotenv/config';
import { defineConfig } from 'prisma/config';
import { PrismaPg } from '@prisma/adapter-pg';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  url: process.env.DATABASE_URL!,
  migrations: {
    path: 'prisma/migrations',
  },
  adapter: () =>
    new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});
