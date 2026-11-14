import { getDbClient } from '../../lib/db.ts';
import { assertAdminSession } from '../../lib/auth-guard.ts';
import type { MaterialType } from '../../lib/types.ts';
import type { Client } from '@libsql/client';

export interface MaterialInput {
  title: string;
  subject: string;
  semester: number;
  drive_url: string;
  material_type: MaterialType;
  lecturer?: string;
}

export async function createMaterial(
  data: MaterialInput,
  session?: any,
  dbOverride?: Client
) {
  const admin = assertAdminSession(session);
  const db = dbOverride || getDbClient();

  await db.execute({
    sql: `INSERT INTO materials (
      title, subject, semester, drive_url, material_type, lecturer, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [
      data.title,
      data.subject,
      data.semester,
      data.drive_url,
      data.material_type,
      data.lecturer ?? null,
      admin.email,
    ],
  });

  return { success: true };
}

export async function deleteMaterial(
  id: number,
  session?: any,
  dbOverride?: Client
) {
  assertAdminSession(session);
  const db = dbOverride || getDbClient();

  await db.execute({
    sql: 'DELETE FROM materials WHERE id = ?',
    args: [id],
  });

  return { success: true };
}
