import { Pool, QueryResult, QueryResultRow } from 'pg';
import { PGlite } from '@electric-sql/pglite';
import path from 'path';
import fs from 'fs';
import { config } from '../config';

let pgPool: Pool | null = null;
let pgliteInstance: PGlite | null = null;
let usePgLite = false;

function getPgPool(): Pool {
  if (!pgPool) {
    pgPool = new Pool({
      connectionString: config.database.url,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
    pgPool.on('error', (err) => {
      if (!usePgLite) {
        console.error('Unexpected database pool error:', err);
      }
    });
  }
  return pgPool;
}

async function getPgLite(): Promise<PGlite> {
  if (!pgliteInstance) {
    const dataDir = process.env.DATA_DIR || path.join(process.cwd(), 'data', 'rakshya_pgdata');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    pgliteInstance = new PGlite(dataDir);
  }
  return pgliteInstance;
}

export async function testConnection(): Promise<boolean> {
  // First try PostgreSQL via pg.Pool
  try {
    const pool = getPgPool();
    await pool.query('SELECT NOW()');
    usePgLite = false;
    console.log('✓ Connected to PostgreSQL server');
    return true;
  } catch (error: any) {
    console.warn(`⚠ Could not connect to PostgreSQL server (${error?.message || error}).`);
    console.log('✓ Initializing persistent embedded PostgreSQL (PGlite)...');
    try {
      usePgLite = true;
      const db = await getPgLite();
      await db.query('SELECT NOW()');
      console.log('✓ Embedded PostgreSQL (PGlite) active with persistent disk storage');
      return true;
    } catch (pglErr) {
      console.error('Database connection test failed:', pglErr);
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

  try {
    const pool = getPgPool();
    const result = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    if (config.isDevelopment && duration > 100) {
      console.log(`Slow query (${duration}ms):`, text.substring(0, 100));
    }
    return result;
  } catch (error: any) {
    // If pool failed to connect and we haven't switched to pglite yet, try fallback
    if (error.code === 'ECONNREFUSED' || error.message?.includes('connect ECONNREFUSED')) {
      console.warn('PostgreSQL connection refused, switching to embedded PGlite...');
      usePgLite = true;
      return query<T>(text, params);
    }
    console.error('Database query error:', { text: text.substring(0, 100), error });
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
