import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// DATA_DIR can be overridden via env so platforms with a mounted persistent
// disk (e.g. Render) can point us at the mount path. Defaults to a local
// `.data/` folder for dev.
const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), '.data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const dbPath = path.join(DATA_DIR, 'credvault.sqlite');

let _db: Database.Database | null = null;

export function db(): Database.Database {
  if (_db) return _db;
  _db = new Database(dbPath);
  _db.pragma('journal_mode = WAL');
  _db.exec(`
    CREATE TABLE IF NOT EXISTS keys (
      id INTEGER PRIMARY KEY,
      kid TEXT NOT NULL,
      did TEXT NOT NULL,
      public_key_multibase TEXT NOT NULL,
      private_key_multibase TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS credentials (
      id TEXT PRIMARY KEY,
      subject_email TEXT NOT NULL,
      subject_name TEXT NOT NULL,
      type TEXT NOT NULL,
      claims TEXT NOT NULL,
      issued_at TEXT NOT NULL,
      expires_at TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      vc_jsonld TEXT NOT NULL,
      status_list_index INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS presentations (
      id TEXT PRIMARY KEY,
      credential_id TEXT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      used_at TEXT,
      FOREIGN KEY (credential_id) REFERENCES credentials(id)
    );
    CREATE TABLE IF NOT EXISTS verifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      presentation_id TEXT,
      outcome TEXT NOT NULL,
      verified_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      actor TEXT NOT NULL,
      action TEXT NOT NULL,
      target_id TEXT,
      metadata TEXT,
      occurred_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS status_list (
      id INTEGER PRIMARY KEY,
      revoked_indices TEXT NOT NULL DEFAULT '[]',
      next_index INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL
    );
    INSERT OR IGNORE INTO status_list (id, revoked_indices, next_index, updated_at)
      VALUES (1, '[]', 0, datetime('now'));
  `);
  return _db;
}
