import { getDbClient } from '../../lib/db.ts';
import { assertAdminSession } from '../../lib/auth-guard.ts';
import type { TaskCategory, TaskStatus } from '../../lib/types.ts';
import type { Client } from '@libsql/client';

export interface TaskInput {
  title: string;
  subject: string;
  category: TaskCategory;
  deadline: string;
  description?: string;
  submission_url?: string;
  status?: TaskStatus;
}

export async function createTask(
  data: TaskInput,
  session?: any,
  dbOverride?: Client
) {
  const admin = assertAdminSession(session);
  const db = dbOverride || getDbClient();

  await db.execute({
    sql: `INSERT INTO tasks (
      title, subject, category, deadline, description, submission_url, status, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      data.title,
      data.subject,
      data.category,
      data.deadline,
      data.description ?? null,
      data.submission_url ?? null,
      data.status || 'active',
      admin.email,
    ],
  });

  return { success: true };
}

export async function deleteTask(
  id: number,
  session?: any,
  dbOverride?: Client
) {
  assertAdminSession(session);
  const db = dbOverride || getDbClient();

  await db.execute({
    sql: 'DELETE FROM tasks WHERE id = ?',
    args: [id],
  });

  return { success: true };
}
