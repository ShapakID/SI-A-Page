import { NextResponse } from 'next/server';
import { getDbClient, initDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Diagnostik publik: hanya melaporkan nama env yang kosong, tidak pernah nilainya.
const REQUIRED = [
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'ADMIN_EMAILS',
  'TURSO_DATABASE_URL',
  'TURSO_AUTH_TOKEN',
  'NEXT_PUBLIC_ANGKATAN',
];

export async function GET() {
  const missing = REQUIRED.filter((key) => !process.env[key]);

  let db = 'ok';
  try {
    const client = getDbClient();
    await initDb(client);
    await client.execute('SELECT 1');
  } catch (error) {
    console.error('[health] db check failed:', error);
    db = 'error';
  }

  return NextResponse.json(
    { ok: missing.length === 0 && db === 'ok', missing, db },
    { status: 200 }
  );
}
