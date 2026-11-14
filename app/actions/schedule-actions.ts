import { getDbClient } from '../../lib/db.ts';
import { assertAdminSession } from '../../lib/auth-guard.ts';
import type { ScheduleStatus } from '../../lib/types.ts';
import type { Client } from '@libsql/client';

export interface OverrideInput {
  subject: string;
  lecturer: string;
  start_time: string;
  end_time: string;
  room: string;
  status: ScheduleStatus;
  note?: string | null;
}

export async function saveScheduleOverride(
  date: string,
  scheduleId: number,
  data: OverrideInput,
  session?: any,
  dbOverride?: Client
) {
  const admin = assertAdminSession(session);
  const db = dbOverride || getDbClient();

  // Insert or Replace override for (date, schedule_id)
  await db.execute({
    sql: `INSERT INTO schedule_overrides (
      date, schedule_id, subject, lecturer, start_time, end_time, room, status, note, updated_by, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(date, schedule_id) DO UPDATE SET
      subject = excluded.subject,
      lecturer = excluded.lecturer,
      start_time = excluded.start_time,
      end_time = excluded.end_time,
      room = excluded.room,
      status = excluded.status,
      note = excluded.note,
      updated_by = excluded.updated_by,
      updated_at = CURRENT_TIMESTAMP`,
    args: [
      date,
      scheduleId,
      data.subject,
      data.lecturer,
      data.start_time,
      data.end_time,
      data.room,
      data.status,
      data.note ?? null,
      admin.email,
    ],
  });

  return { success: true };
}

export async function deleteScheduleOverride(
  id: number,
  session?: any,
  dbOverride?: Client
) {
  assertAdminSession(session);
  const db = dbOverride || getDbClient();

  await db.execute({
    sql: 'DELETE FROM schedule_overrides WHERE id = ?',
    args: [id],
  });

  return { success: true };
}
