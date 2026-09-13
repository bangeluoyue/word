import 'server-only';

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from './schema';

const connectionString = process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error('POSTGRES_URL is not configured');
}

type PostgresClient = ReturnType<typeof postgres>;

const globalForDatabase = globalThis as typeof globalThis & {
  wordLearningPostgres?: PostgresClient;
};

export const postgresClient =
  globalForDatabase.wordLearningPostgres ??
  postgres(connectionString, {
    max: 1,
    prepare: false,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForDatabase.wordLearningPostgres = postgresClient;
}

export const db = drizzle(postgresClient, { schema });

