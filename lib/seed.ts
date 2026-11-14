import type { Client } from '@libsql/client';

export async function seedDefaultData(db: Client): Promise<void> {
  const check = await db.execute('SELECT COUNT(*) as count FROM schedules');
  const count = Number(check.rows[0].count);

  if (count > 0) {
    return; // Already seeded
  }

  // 1. Master schedules for Semester 3
  const schedules = [
    // Senin
    { day: 1, subject: 'Kecerdasan Buatan', lecturer: 'Tim Dosen AI', start: '07:30', end: '09:30', room: 'JTI-1', sem: 3 },
    { day: 1, subject: 'Keamanan Sistem Informasi', lecturer: 'Tim Dosen KSI', start: '13:00', end: '15:00', room: 'SG07', sem: 3 },
    { day: 1, subject: 'Rekayasa Perangkat Lunak', lecturer: 'Tim Dosen RPL', start: '15:30', end: '18:00', room: 'JTI-1', sem: 3 },
    // Selasa
    { day: 2, subject: 'Praktikum Rekayasa Perangkat Lunak', lecturer: 'Asisten Lab RPL', start: '10:00', end: '12:00', room: 'Lab Komputer', sem: 3 },
    // Rabu
    { day: 3, subject: 'Analisis & Perancangan SI (APSI)', lecturer: 'Tim Dosen APSI', start: '10:00', end: '12:30', room: 'SG05', sem: 3 },
    // Kamis
    { day: 4, subject: 'Bahasa Inggris', lecturer: 'Tim Dosen Binggris', start: '13:00', end: '14:15', room: 'SG05', sem: 3 },
    { day: 4, subject: 'Pendidikan Karakter', lecturer: 'Tim Dosen Karakter', start: '14:20', end: '16:00', room: 'JTI-2', sem: 3 },
    // Jumat
    { day: 5, subject: 'Tata Kelola Teknologi Informasi', lecturer: 'Tim Dosen TKTI', start: '07:30', end: '09:30', room: 'JTI-2', sem: 3 },
  ];

  for (const s of schedules) {
    await db.execute({
      sql: `INSERT INTO schedules (day_of_week, subject, lecturer, start_time, end_time, room, semester)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [s.day, s.subject, s.lecturer, s.start, s.end, s.room, s.sem],
    });
  }

  // 2. Default tasks
  const tasks = [
    {
      title: 'Tugas Proyek Waterfall APSI',
      subject: 'Analisis & Perancangan SI',
      category: 'project',
      deadline: '2026-12-15 23:59',
      description: 'Laporan 12 minggu, 5 peran tim, prototype Figma dan berkas tulis tangan.',
      url: 'https://classroom.google.com',
    },
    {
      title: 'Praktikum Modul RPL Mingguan',
      subject: 'Rekayasa Perangkat Lunak',
      category: 'tugas',
      deadline: '2026-11-20 23:59',
      description: 'Format Word/PDF sesuai panduan doc_591027, font TNR 12 spasi 1.5.',
      url: 'https://classroom.google.com',
    },
  ];

  for (const t of tasks) {
    await db.execute({
      sql: `INSERT INTO tasks (title, subject, category, deadline, description, submission_url, status, created_by)
            VALUES (?, ?, ?, ?, ?, ?, 'active', 'system@untad.ac.id')`,
      args: [t.title, t.subject, t.category, t.deadline, t.description, t.url],
    });
  }

  // 3. Default materials
  const materials = [
    {
      title: 'Modul Praktikum RPL 2024',
      subject: 'Rekayasa Perangkat Lunak',
      semester: 3,
      lecturer: 'Tim Dosen RPL',
      drive_url: 'https://drive.google.com',
      material_type: 'slide',
    },
    {
      title: 'Slide Pengantar Keamanan Sistem Informasi',
      subject: 'Keamanan Sistem Informasi',
      semester: 3,
      lecturer: 'Tim Dosen KSI',
      drive_url: 'https://drive.google.com',
      material_type: 'slide',
    },
    {
      title: 'Arsip Algoritma & Pemrograman Semester 1',
      subject: 'Algoritma & Pemrograman',
      semester: 1,
      lecturer: 'Dosen Alpro',
      drive_url: 'https://drive.google.com',
      material_type: 'ebook',
    },
  ];

  for (const m of materials) {
    await db.execute({
      sql: `INSERT INTO materials (title, subject, semester, lecturer, drive_url, material_type, created_by)
            VALUES (?, ?, ?, ?, ?, ?, 'system@untad.ac.id')`,
      args: [m.title, m.subject, m.semester, m.lecturer, m.drive_url, m.material_type],
    });
  }
}
