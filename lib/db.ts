import { createClient, type Client } from '@libsql/client';

let globalClient: Client | null = null;

export function getDbClient(overrideUrl?: string): Client {
  if (overrideUrl) {
    return createClient({
      url: overrideUrl,
    });
  }

  if (globalClient) {
    return globalClient;
  }

  const defaultUrl = 'file:local.db';
  const url = process.env.TURSO_DATABASE_URL || defaultUrl;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  globalClient = createClient({
    url,
    authToken,
  });

  return globalClient;
}

export async function initDb(client?: Client, options?: { seed?: boolean }): Promise<void> {
  const db = client || getDbClient();

  const statements = [
    `CREATE TABLE IF NOT EXISTS schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      day_of_week INTEGER NOT NULL,
      subject TEXT NOT NULL,
      lecturer TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      room TEXT NOT NULL,
      semester INTEGER NOT NULL DEFAULT 3,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS schedule_overrides (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      schedule_id INTEGER NOT NULL,
      subject TEXT NOT NULL,
      lecturer TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      room TEXT NOT NULL,
      status TEXT NOT NULL,
      note TEXT,
      updated_by TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(schedule_id) REFERENCES schedules(id) ON DELETE CASCADE,
      UNIQUE(date, schedule_id)
    );`,
    `CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      subject TEXT NOT NULL,
      category TEXT NOT NULL,
      deadline TEXT NOT NULL,
      description TEXT,
      submission_url TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      created_by TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      subject TEXT NOT NULL,
      semester INTEGER NOT NULL,
      lecturer TEXT,
      drive_url TEXT NOT NULL,
      material_type TEXT NOT NULL,
      created_by TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,
  ];

  for (const sql of statements) {
    await db.execute(sql);
  }
}
