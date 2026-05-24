import * as SQLite from 'expo-sqlite';

/**
 * On-device SQLite (expo-sqlite). The plant list works fully offline; cloud sync
 * to AWS AppSync/DynamoDB is layered on later (Module 5+). Opened once and
 * memoised; the schema is created on first access.
 */
let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync('gardenguard.db');
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS plants (
          id            TEXT PRIMARY KEY NOT NULL,
          ownerId       TEXT NOT NULL,
          name          TEXT NOT NULL,
          category      TEXT NOT NULL,
          repels        TEXT NOT NULL,
          sun           TEXT NOT NULL,
          water         TEXT NOT NULL,
          zoneMin       INTEGER NOT NULL,
          zoneMax       INTEGER NOT NULL,
          locationLabel TEXT NOT NULL,
          latitude      REAL,
          longitude     REAL,
          notes         TEXT,
          catalogId     TEXT,
          createdAt     INTEGER NOT NULL,
          updatedAt     INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_plants_owner ON plants (ownerId);
      `);
      return db;
    })();
  }
  return dbPromise;
}
