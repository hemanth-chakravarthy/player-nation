// Prisma v7 config — connection URL goes here, NOT in schema.prisma
import 'dotenv/config';
import { defineConfig } from 'prisma/config';
import { PrismaPg } from '@prisma/adapter-pg';

const dbUrl = process.env.DATABASE_URL || process.env.DATABASE_URL_LOCAL || '';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: dbUrl,
  },
  migrations: {
    path: 'prisma/migrations',
  },
  adapter: () =>
    new PrismaPg({ connectionString: dbUrl }),
});
