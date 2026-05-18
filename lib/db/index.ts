import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

let cachedClient: ReturnType<typeof postgres> | null = null;
let cachedDb: PostgresJsDatabase<typeof schema> | null = null;

function getConnectionString() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not configured.');
  }

  return connectionString;
}

export function getClient() {
  if (!cachedClient) {
    // Disable prefetch as it is not supported for "Transaction" pool mode.
    cachedClient = postgres(getConnectionString(), { prepare: false });
  }

  return cachedClient;
}

export function getDb() {
  if (!cachedDb) {
    cachedDb = drizzle(getClient(), { schema });
  }

  return cachedDb;
}

export const client = new Proxy({} as ReturnType<typeof postgres>, {
  get(_target, prop) {
    const target = getClient();
    const value = Reflect.get(target, prop);
    return typeof value === 'function' ? value.bind(target) : value;
  },
});

export const db = new Proxy({} as PostgresJsDatabase<typeof schema>, {
  get(_target, prop) {
    const target = getDb();
    const value = Reflect.get(target, prop);
    return typeof value === 'function' ? value.bind(target) : value;
  },
});
