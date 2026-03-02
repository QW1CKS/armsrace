import Database from 'better-sqlite3';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

let db: Database.Database | null = null;

function getDbPath(): string {
  if (process.env.DB_PATH) return process.env.DB_PATH;
  // Walk up from packages/worker/src/db to repo root, then into data/
  return resolve(__dirname, '../../../../data/armsrace.db');
}

export function getDb(): Database.Database {
  if (!db) throw new Error('Database not initialized. Call initDb() first.');
  return db;
}

export async function initDb(): Promise<void> {
  const dbPath = getDbPath();
  logger.info(`Worker opening database at: ${dbPath}`);

  // Worker opens in WAL mode - the API process will have already created the schema
  // If running worker standalone, the API db/client must be called first (or use docker/init script)
  db = new Database(dbPath);

  // Ensure WAL mode is active for this connection too
  db.pragma('journal_mode=WAL');
  db.pragma('foreign_keys=ON');
  db.pragma('synchronous=NORMAL');

  logger.info('Worker database connection ready');
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}
