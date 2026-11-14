import test from 'node:test';
import assert from 'node:assert/strict';
import { getDbClient, initDb } from '../lib/db.ts';
import { saveScheduleOverride } from '../app/actions/schedule-actions.ts';
import { createTask, deleteTask } from '../app/actions/task-actions.ts';
import { createMaterial, deleteMaterial } from '../app/actions/material-actions.ts';

const validAdminSession = {
  user: {
    email: 'shapak@gmail.com',
    name: 'Shapak',
  },
};

const unauthorizedSession = {
  user: {
    email: 'stranger@gmail.com',
    name: 'Stranger',
  },
};

test('admin actions: reject unauthorized callers', async () => {
  process.env.ADMIN_EMAILS = 'shapak@gmail.com';
  const db = getDbClient('file::memory:');
  await initDb(db, { seed: false });

  await assert.rejects(
    () =>
      saveScheduleOverride(
        '2026-11-16',
        1,
        {
          subject: 'AI',
          lecturer: 'Dosen A',
          start_time: '08:00',
          end_time: '10:00',
          room: 'Zoom',
          status: 'online',
          note: 'Online',
        },
        unauthorizedSession,
        db
      ),
    /Unauthorized/
  );

  await assert.rejects(
    () =>
      createTask(
        {
          title: 'Tugas Hacker',
          subject: 'KSI',
          category: 'tugas',
          deadline: '2026-11-20 23:59',
        },
        null,
        db
      ),
    /Unauthorized/
  );

  await assert.rejects(
    () =>
      createMaterial(
        {
          title: 'Materi Palsu',
          subject: 'KSI',
          semester: 3,
          drive_url: 'https://evil.com',
          material_type: 'slide',
        },
        unauthorizedSession,
        db
      ),
    /Unauthorized/
  );
});

test('admin actions: authorized admin can perform mutations', async () => {
  process.env.ADMIN_EMAILS = 'shapak@gmail.com';
  const db = getDbClient('file::memory:');
  await initDb(db, { seed: false });

  // Insert base schedule
  await db.execute({
    sql: 'INSERT INTO schedules (id, day_of_week, subject, lecturer, start_time, end_time, room, semester) VALUES (1, 1, ?, ?, ?, ?, ?, ?)',
    args: ['Kecerdasan Buatan', 'Dosen A', '07:30', '09:30', 'JTI-1', 3],
  });

  // 1. Save schedule override
  const overrideRes = await saveScheduleOverride(
    '2026-11-16',
    1,
    {
      subject: 'Kecerdasan Buatan',
      lecturer: 'Dosen A',
      start_time: '08:00',
      end_time: '10:00',
      room: 'Online Zoom',
      status: 'online',
      note: 'Dosen ada seminar',
    },
    validAdminSession,
    db
  );
  assert.strictEqual(overrideRes.success, true);

  const checkOverride = await db.execute({
    sql: 'SELECT * FROM schedule_overrides WHERE date = ?',
    args: ['2026-11-16'],
  });
  assert.strictEqual(checkOverride.rows.length, 1);
  assert.strictEqual(checkOverride.rows[0].status, 'online');
  assert.strictEqual(checkOverride.rows[0].updated_by, 'shapak@gmail.com');

  // 2. Create and delete task
  const taskRes = await createTask(
    {
      title: 'Tugas Resume Bab 4',
      subject: 'Kecerdasan Buatan',
      category: 'tugas',
      deadline: '2026-11-20 23:59',
      description: 'Format PDF 2 halaman',
    },
    validAdminSession,
    db
  );
  assert.strictEqual(taskRes.success, true);

  const checkTask = await db.execute('SELECT * FROM tasks');
  assert.strictEqual(checkTask.rows.length, 1);
  const taskId = Number(checkTask.rows[0].id);

  await deleteTask(taskId, validAdminSession, db);
  const checkTaskAfterDelete = await db.execute('SELECT * FROM tasks');
  assert.strictEqual(checkTaskAfterDelete.rows.length, 0);

  // 3. Create and delete material
  const matRes = await createMaterial(
    {
      title: 'Slide Bab 1',
      subject: 'Kecerdasan Buatan',
      semester: 3,
      drive_url: 'https://drive.google.com/test',
      material_type: 'slide',
    },
    validAdminSession,
    db
  );
  assert.strictEqual(matRes.success, true);

  const checkMat = await db.execute('SELECT * FROM materials');
  assert.strictEqual(checkMat.rows.length, 1);
  const matId = Number(checkMat.rows[0].id);

  await deleteMaterial(matId, validAdminSession, db);
  const checkMatAfterDelete = await db.execute('SELECT * FROM materials');
  assert.strictEqual(checkMatAfterDelete.rows.length, 0);
});
