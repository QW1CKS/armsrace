import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

let db: Database.Database | null = null;

function getDbPath(): string {
  if (process.env.DB_PATH) return process.env.DB_PATH;
  // Walk up from packages/api/src/db to repo root, then into data/
  return resolve(__dirname, '../../../../data/armsrace.db');
}

export function getDb(): Database.Database {
  if (!db) throw new Error('Database not initialized. Call initDb() first.');
  return db;
}

export async function initDb(): Promise<void> {
  const dbPath = getDbPath();
  logger.info(`Opening database at: ${dbPath}`);

  db = new Database(dbPath);

  // Run migrations
  const migrationsDir = resolve(__dirname, 'migrations');
  const migrationFiles = ['001_initial.sql', '002_indices.sql', '003_escalation.sql'];

  // Create migrations tracking table if needed
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      name       TEXT PRIMARY KEY,
      applied_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000)
    )
  `);

  for (const file of migrationFiles) {
    const alreadyApplied = db
      .prepare('SELECT 1 FROM _migrations WHERE name = ?')
      .get(file);

    if (!alreadyApplied) {
      const sql = readFileSync(resolve(migrationsDir, file), 'utf-8');
      db.exec(sql);
      db.prepare('INSERT INTO _migrations (name) VALUES (?)').run(file);
      logger.info(`Applied migration: ${file}`);
    }
  }

  logger.info('Database initialized');
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}
