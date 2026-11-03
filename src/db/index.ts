import 'server-only';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '@/lib/env';
import * as schema from './schema';

type DB = ReturnType<typeof drizzle<typeof schema>>;
const g = globalThis as unknown as { __gmDb?: DB };

/** One pooled client per server instance (survives dev hot reloads). */
export function db(): DB {
  if (!g.__gmDb) {
    const client = postgres(env().DATABASE_URL, {
      max: 5,
      prepare: false, // required by transaction poolers (Supabase/Neon)
    });
    g.__gmDb = drizzle(client, { schema });
  }
  return g.__gmDb;
}

export { schema };
