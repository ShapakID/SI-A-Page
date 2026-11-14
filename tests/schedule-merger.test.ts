import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeSchedulesWithOverrides } from '../lib/schedule-merger.ts';
import type { Schedule, ScheduleOverride } from '../lib/types.ts';

const mockMasterSchedules: Schedule[] = [
  {
    id: 1,
    day_of_week: 1, // Senin
    subject: 'Kecerdasan Buatan',
    lecturer: 'Dosen A',
    start_time: '07:30',
    end_time: '09:30',
    room: 'JTI-1',
    semester: 3,
  },
  {
    id: 2,
    day_of_week: 1, // Senin
    subject: 'Keamanan Sistem Informasi',
    lecturer: 'Dosen B',
    start_time: '13:00',
    end_time: '15:00',
    room: 'SG07',
    semester: 3,
  },
  {
    id: 3,
    day_of_week: 1, // Senin
    subject: 'Rekayasa Perangkat Lunak',
    lecturer: 'Dosen C',
    start_time: '15:30',
    end_time: '18:00',
    room: 'JTI-2',
    semester: 3,
  },
];

test('mergeSchedulesWithOverrides: returns normal schedules when no overrides exist', () => {
  const result = mergeSchedulesWithOverrides(mockMasterSchedules, []);
  assert.strictEqual(result.length, 3);
  assert.strictEqual(result[0].subject, 'Kecerdasan Buatan');
  assert.strictEqual(result[0].status, 'normal');
  assert.strictEqual(result[0].room, 'JTI-1');
  assert.strictEqual(result[0].is_overridden, false);
});

test('mergeSchedulesWithOverrides: applies override replacing room and status', () => {
  const overrides: ScheduleOverride[] = [
    {
      id: 101,
      date: '2026-11-16',
      schedule_id: 1,
      subject: 'Kecerdasan Buatan',
      lecturer: 'Dosen A',
      start_time: '08:00',
      end_time: '10:00',
      room: 'Zoom Meeting',
      status: 'online',
      note: 'Kuliah daring via Zoom',
      updated_by: 'admin@untad.ac.id',
    },
  ];

  const result = mergeSchedulesWithOverrides(mockMasterSchedules, overrides);
  assert.strictEqual(result.length, 3);
  const aiClass = result.find((item) => item.schedule_id === 1);
  assert.ok(aiClass);
  assert.strictEqual(aiClass.start_time, '08:00');
  assert.strictEqual(aiClass.room, 'Zoom Meeting');
  assert.strictEqual(aiClass.status, 'online');
  assert.strictEqual(aiClass.note, 'Kuliah daring via Zoom');
  assert.strictEqual(aiClass.is_overridden, true);

  // Unaffected class remains normal
  const ksiClass = result.find((item) => item.schedule_id === 2);
  assert.ok(ksiClass);
  assert.strictEqual(ksiClass.status, 'normal');
  assert.strictEqual(ksiClass.room, 'SG07');
  assert.strictEqual(ksiClass.is_overridden, false);
});

test('mergeSchedulesWithOverrides: handles cancelled status', () => {
  const overrides: ScheduleOverride[] = [
    {
      id: 102,
      date: '2026-11-16',
      schedule_id: 3,
      subject: 'Rekayasa Perangkat Lunak',
      lecturer: 'Dosen C',
      start_time: '15:30',
      end_time: '18:00',
      room: 'JTI-2',
      status: 'cancelled',
      note: 'Dosen dinas luar, kelas ditiadakan',
      updated_by: 'admin@untad.ac.id',
    },
  ];

  const result = mergeSchedulesWithOverrides(mockMasterSchedules, overrides);
  const rplClass = result.find((item) => item.schedule_id === 3);
  assert.ok(rplClass);
  assert.strictEqual(rplClass.status, 'cancelled');
  assert.strictEqual(rplClass.note, 'Dosen dinas luar, kelas ditiadakan');
});

test('mergeSchedulesWithOverrides: isolates override when two courses share the day', () => {
  const multiSlotMasters: Schedule[] = [
    {
      id: 10,
      day_of_week: 2,
      subject: 'RPL Teori',
      lecturer: 'Dosen C',
      start_time: '08:00',
      end_time: '10:00',
      room: 'SG01',
      semester: 3,
    },
    {
      id: 11,
      day_of_week: 2,
      subject: 'RPL Praktikum',
      lecturer: 'Asisten Lab',
      start_time: '10:00',
      end_time: '12:00',
      room: 'Lab Komputer 2',
      semester: 3,
    },
  ];

  const overrides: ScheduleOverride[] = [
    {
      id: 201,
      date: '2026-11-17',
      schedule_id: 11,
      subject: 'RPL Praktikum',
      lecturer: 'Asisten Lab',
      start_time: '13:00',
      end_time: '15:00',
      room: 'Lab Komputer 3',
      status: 'rescheduled',
      note: 'Praktikum dipindah ke siang di Lab 3',
      updated_by: 'admin@untad.ac.id',
    },
  ];

  const result = mergeSchedulesWithOverrides(multiSlotMasters, overrides);
  assert.strictEqual(result.length, 2);

  const teori = result.find((item) => item.schedule_id === 10);
  assert.ok(teori);
  assert.strictEqual(teori.start_time, '08:00');
  assert.strictEqual(teori.room, 'SG01');
  assert.strictEqual(teori.is_overridden, false);

  const praktikum = result.find((item) => item.schedule_id === 11);
  assert.ok(praktikum);
  assert.strictEqual(praktikum.start_time, '13:00');
  assert.strictEqual(praktikum.room, 'Lab Komputer 3');
  assert.strictEqual(praktikum.status, 'rescheduled');
  assert.strictEqual(praktikum.is_overridden, true);
});
