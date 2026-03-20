import { Pool } from "pg";

let pool;
let initialized = false;

function getDatabaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("Database is not configured. Set DATABASE_URL in .env");
  }
  return url;
}

export function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: getDatabaseUrl(),
      ssl: { rejectUnauthorized: false },
    });
  }
  return pool;
}

export async function query(text, params = []) {
  const client = getPool();
  return client.query(text, params);
}

export async function ensureSchema() {
  if (initialized) return;

  await query(`
    CREATE TABLE IF NOT EXISTS sales_plans (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      record JSONB NOT NULL
    );
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_sales_plans_saved_at ON sales_plans(saved_at DESC);
  `);

  initialized = true;
}
