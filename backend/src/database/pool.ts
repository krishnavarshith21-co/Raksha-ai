import { Pool, QueryResult, QueryResultRow } from 'pg';
import type { PGlite } from '@electric-sql/pglite';
import path from 'path';
import fs from 'fs';
import { config } from '../config';

let pgPool: Pool | null = null;
let pgliteInstance: PGlite | null = null;
let usePgLite = false;

function getPgPool(): Pool {
  if (!pgPool) {
    const connectionString = config.database.url;
    if (!connectionString) {
      throw new Error('DATABASE_URL is not configured. External PostgreSQL connection is required in production.');
    }

    // Auto-detect SSL for hosted PostgreSQL databases (Neon, Supabase, Render, AWS, etc.)
    const isLocalhost = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');
    const ssl = isLocalhost ? false : { rejectUnauthorized: false };

    // Memory-efficient connection pool: 4 max connections for Render Free (512MB RAM)
    pgPool = new Pool({
      connectionString,
      max: config.isProduction ? 4 : 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      ssl,
    });

    pgPool.on('error', (err) => {
      console.error('Unexpected database pool error:', err.message || err);
    });
  }
  return pgPool;
}

// Embedded PGlite is STRICTLY restricted to development and dynamically imported on-demand
async function getPgLite(): Promise<PGlite> {
  if (config.isProduction) {
    throw new Error('Embedded database (PGlite) is disabled in production to protect memory limits (512MB). Please configure DATABASE_URL.');
  }

  if (!pgliteInstance) {
    // Dynamic import ensures @electric-sql/pglite WASM runtime is NEVER loaded into memory in production
    const { PGlite: PGliteClass } = await import('@electric-sql/pglite');
    const dataDir = process.env.DATA_DIR || path.join(process.cwd(), 'data', 'rakshya_pgdata');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    } else {
      // Clean up orphaned postmaster.pid left over from abrupt process termination
      const pidFile = path.join(dataDir, 'postmaster.pid');
      if (fs.existsSync(pidFile)) {
        try {
          fs.unlinkSync(pidFile);
        } catch {
          // ignore if locked
        }
      }
    }
    try {
      pgliteInstance = new PGliteClass(dataDir);
      await pgliteInstance.waitReady;
    } catch (initErr) {
      console.warn('PGlite data directory recovery needed, re-initializing database...', initErr);
      try {
        fs.rmSync(dataDir, { recursive: true, force: true });
        fs.mkdirSync(dataDir, { recursive: true });
        pgliteInstance = new PGliteClass(dataDir);
        await pgliteInstance.waitReady;
      } catch {
        pgliteInstance = new PGliteClass();
        await pgliteInstance.waitReady;
      }
    }
  }
  return pgliteInstance;
}

export async function testConnection(): Promise<boolean> {
  // In production: If no DATABASE_URL provided, fail clearly without starting PGlite
  if (config.isProduction && !config.database.hasDatabaseUrl) {
    console.error('\n❌ [DATABASE] No external DATABASE_URL provided in production.');
    console.error('   Please configure the DATABASE_URL environment variable with a PostgreSQL connection string.');
    console.error('   (e.g., from Neon.tech, Supabase, or Render PostgreSQL)');
    console.error('   Embedded PGlite is disabled in production to prevent 512MB RAM exhaustion.\n');
    return false;
  }

  // Try connecting to external PostgreSQL via pg.Pool
  try {
    const pool = getPgPool();
    const client = await pool.connect();
    try {
      await client.query('SELECT NOW()');
    } finally {
      client.release();
    }
    usePgLite = false;
    console.log('✓ Connected to PostgreSQL server');
    return true;
  } catch (error: any) {
    console.warn(`⚠ Could not connect to PostgreSQL server: ${error?.message || error}`);

    // IN PRODUCTION: NEVER fall back to embedded PGlite!
    if (config.isProduction) {
      console.error('\n❌ [DATABASE] Failed to connect to external PostgreSQL in production.');
      console.error('   Embedded database fallback is strictly disabled in production to prevent 512MB memory exhaustion.');
      console.error('   Server will continue running in degraded mode: /health will respond, but database-dependent APIs will return 503.\n');
      return false;
    }

    // IN DEVELOPMENT ONLY: Fallback to embedded PGlite for local convenience
    console.log('ℹ [DEVELOPMENT ONLY] Initializing embedded PostgreSQL (PGlite)...');
    try {
      usePgLite = true;
      const db = await getPgLite();
      await db.query('SELECT NOW()');
      console.log('✓ Embedded PostgreSQL (PGlite) active for local development');
      return true;
    } catch (pglErr: any) {
      console.error('Embedded database initialization failed:', pglErr?.message || pglErr);
      return false;
    }
  }
}

export async function query<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
  const start = Date.now();

  if (usePgLite) {
    try {
      const db = await getPgLite();
      const res = await db.query<T>(text, params);
      const duration = Date.now() - start;
      if (config.isDevelopment && duration > 100) {
        console.log(`Slow query (${duration}ms):`, text.substring(0, 100));
      }
      return {
        rows: (res.rows || []) as T[],
        command: '',
        rowCount: res.affectedRows ?? res.rows?.length ?? 0,
        oid: 0,
        fields: (res.fields || []) as any,
      };
    } catch (error) {
      console.error('PGlite query error:', { text: text.substring(0, 100), error });
      throw error;
    }
  }

  // If in production and database URL is missing or disconnected
  if (config.isProduction && !config.database.hasDatabaseUrl) {
    const err: any = new Error('Database is unavailable: DATABASE_URL is not configured.');
    err.code = 'DATABASE_UNAVAILABLE';
    throw err;
  }

  try {
    const pool = getPgPool();
    const result = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    if (config.isDevelopment && duration > 100) {
      console.log(`Slow query (${duration}ms):`, text.substring(0, 100));
    }
    return result;
  } catch (error: any) {
    // Only in local development do we auto-fallback on connection refused
    if (!config.isProduction && (error.code === 'ECONNREFUSED' || error.message?.includes('connect ECONNREFUSED'))) {
      console.warn('PostgreSQL connection refused, switching to embedded PGlite (dev only)...');
      usePgLite = true;
      return query<T>(text, params);
    }
    console.error('Database query error:', { text: text.substring(0, 100), error: error.message || error });
    throw error;
  }
}

export async function getClient() {
  if (usePgLite) {
    const db = await getPgLite();
    return {
      query: (t: string, p?: any[]) => query(t, p),
      release: () => {},
    };
  }
  const pool = getPgPool();
  return await pool.connect();
}

export async function transaction<T>(callback: (queryFn: (text: string, params?: any[]) => Promise<QueryResult>) => Promise<T>): Promise<T> {
  if (usePgLite) {
    const db = await getPgLite();
    return await db.transaction(async (tx) => {
      const txQuery = async (text: string, params?: any[]) => {
        const res = await tx.query(text, params);
        return {
          rows: res.rows || [],
          command: '',
          rowCount: res.affectedRows ?? res.rows?.length ?? 0,
          oid: 0,
          fields: (res.fields || []) as any,
        } as QueryResult;
      };
      return await callback(txQuery);
    });
  }

  const pool = getPgPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback((text, params) => client.query(text, params));
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export default { query, testConnection, getClient, transaction };

