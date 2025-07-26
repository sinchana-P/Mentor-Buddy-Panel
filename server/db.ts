import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from 'server/shared/schema';
import { config } from './config';

const connectionString = config.DATABASE_URL;

// Create the connection pool for Supabase PostgreSQL
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false // Required for Supabase
  }
});

export const db = drizzle(pool, { schema });

export default db;