import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

const connectionString = 'postgresql://postgres:SinchanaPGudagi@db.fbxmsxjbrffgejwgskeg.supabase.co:5432/postgres';

  const pool = new Pool({
    connectionString,
    ssl: {
    rejectUnauthorized: false
    }
  });

  const db = drizzle(pool);

async function runMigrations() {
  try {
    console.log('Running database migrations...');
  await migrate(db, { migrationsFolder: './migrations' });
    console.log('Migrations completed successfully!');
  } catch (error) {
    console.error('Error running migrations:', error);
  } finally {
  await pool.end();
  }
}

runMigrations();