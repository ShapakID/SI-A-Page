import test from 'node:test';
import assert from 'node:assert/strict';
import { getDbClient, initDb } from '../lib/db.ts';

test('db: can initialize tables and perform CRUD operations', async () => {
  const db = getDbClient('file::memory:');
  await initDb(db, { seed: false });

  // Insert master schedule
  const insertMaster = await db.execute({
    sql: 'INSERT INTO schedules (day_of_week, subject, lecturer, start_time, end_time, room, semester) VALUES (?, ?, ?, ?, ?, ?, ?)',
    args: [1, 'Kecerdasan Buatan', 'Dosen Test', '07:30', '09:30', 'JTI-1', 3],
  });
  assert.ok(insertMaster.rowsAffected > 0);

  // Query it back
  const queryResult = await db.execute('SELECT * FROM schedules WHERE day_of_week = 1');
  assert.strictEqual(queryResult.rows.length, 1);
  assert.strictEqual(queryResult.rows[0].subject, 'Kecerdasan Buatan');

  // Insert task
  const insertTask = await db.execute({
    sql: 'INSERT INTO tasks (title, subject, category, deadline, created_by) VALUES (?, ?, ?, ?, ?)',
    args: ['Laporan Praktikum 1', 'Kecerdasan Buatan', 'tugas', '2026-11-20 23:59', 'admin@untad.ac.id'],
  });
  assert.ok(insertTask.rowsAffected > 0);

  const queryTask = await db.execute('SELECT * FROM tasks');
  assert.strictEqual(queryTask.rows.length, 1);
  assert.strictEqual(queryTask.rows[0].status, 'active');
});
