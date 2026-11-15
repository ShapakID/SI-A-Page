import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getDayOfWeek,
  formatIndonesianDate,
  getCategoryBadge,
  getStatusBadge,
  filterMaterials,
  getAcademicYear,
  getSemesterNumber,
} from '../lib/ui-helpers.ts';
import type { Material } from '../lib/types.ts';

test('getDayOfWeek: returns 1 for Monday through 7 for Sunday', () => {
  // 2026-11-16 is Monday
  const monday = new Date('2026-11-16T08:00:00+08:00');
  assert.strictEqual(getDayOfWeek(monday), 1);

  // 2026-11-20 is Friday
  const friday = new Date('2026-11-20T08:00:00+08:00');
  assert.strictEqual(getDayOfWeek(friday), 5);

  // 2026-11-22 is Sunday
  const sunday = new Date('2026-11-22T08:00:00+08:00');
  assert.strictEqual(getDayOfWeek(sunday), 7);
});

test('formatIndonesianDate: formats date cleanly to Indonesian locale', () => {
  const formatted = formatIndonesianDate('2026-11-16');
  assert.match(formatted, /Senin/);
  assert.match(formatted, /16/);
  assert.match(formatted, /November/);
  assert.match(formatted, /2026/);
});

test('getCategoryBadge & getStatusBadge: returns anti-slop neutral tokens', () => {
  const tugasBadge = getCategoryBadge('tugas');
  assert.strictEqual(tugasBadge.label, 'Tugas');

  const projectBadge = getCategoryBadge('project');
  assert.strictEqual(projectBadge.label, 'Project');

  const onlineBadge = getStatusBadge('online');
  assert.strictEqual(onlineBadge.label, 'Online');

  const normalBadge = getStatusBadge('normal');
  assert.strictEqual(normalBadge.label, 'Normal');

  const cancelledBadge = getStatusBadge('cancelled');
  assert.strictEqual(cancelledBadge.label, 'Ditiadakan');
});

test('academic calendar: angkatan 2025 in Nov 2026 is semester 3, TA 2026/2027', () => {
  const nov2026 = new Date('2026-11-15T10:00:00+08:00');
  assert.strictEqual(getAcademicYear(nov2026), '2026/2027');
  assert.strictEqual(getSemesterNumber(nov2026, 2025), 3);

  const apr2027 = new Date('2027-04-10T10:00:00+08:00');
  assert.strictEqual(getAcademicYear(apr2027), '2026/2027');
  assert.strictEqual(getSemesterNumber(apr2027, 2025), 4);

  const sep2027 = new Date('2027-09-05T10:00:00+08:00');
  assert.strictEqual(getAcademicYear(sep2027), '2027/2028');
  assert.strictEqual(getSemesterNumber(sep2027, 2025), 5);
});

test('filterMaterials: filters by semester and subject query correctly', () => {
  const mockMaterials: Material[] = [
    {
      id: 1,
      title: 'Slide Pengenalan AI',
      subject: 'Kecerdasan Buatan',
      semester: 3,
      drive_url: 'https://drive.google.com/test1',
      material_type: 'slide',
      created_by: 'admin',
    },
    {
      id: 2,
      title: 'Ebook Algoritma',
      subject: 'Algoritma & Pemrograman',
      semester: 1,
      drive_url: 'https://drive.google.com/test2',
      material_type: 'ebook',
      created_by: 'admin',
    },
    {
      id: 3,
      title: 'Modul Praktikum RPL',
      subject: 'Rekayasa Perangkat Lunak',
      semester: 3,
      drive_url: 'https://drive.google.com/test3',
      material_type: 'catatan',
      created_by: 'admin',
    },
  ];

  const sem3 = filterMaterials(mockMaterials, 3, '');
  assert.strictEqual(sem3.length, 2);

  const searchRpl = filterMaterials(mockMaterials, 3, 'rpl');
  assert.strictEqual(searchRpl.length, 1);
  assert.strictEqual(searchRpl[0].subject, 'Rekayasa Perangkat Lunak');
});
