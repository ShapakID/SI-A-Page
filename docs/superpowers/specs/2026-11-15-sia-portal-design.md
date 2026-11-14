# Technical Design Document: SI-A Portal (SI-A-Page)

- **Date**: 2026-11-15
- **Status**: Draft for Review
- **Repository**: `https://github.com/ShapakID/SI-A-Page` (Public)
- **Deployment**: Vercel
- **Design Standard**: Cal.com Design System (`DESIGN.md`)

---

## 1. Context & Background

Kelas Sistem Informasi A (SI-A) memerlukan pusat informasi perkuliahan terpadu dan mobile-friendly yang dapat diakses instan oleh seluruh mahasiswa SI-A tanpa registrasi atau login rumit. Pengurus kelas (PJ Mata Kuliah / Admin) memerlukan kendali cepat untuk memperbarui status perkuliahan secara dinamis (terutama konfirmasi H-1 dari dosen seperti perubahan jam, pindah ruangan, kuliah online, atau libur), mengelola daftar tugas perkuliahan (tugas harian, project, UTS/UAS), serta menyimpan tautan materi kuliah aktif maupun arsip semester lampau.

Proyek ini dibangun di atas repositori GitHub publik, sehingga arsitektur keamanan dirancang dengan isolasi penuh antara kode sumber publik dan kredensial privat.

---

## 2. Goals and Non-Goals

### Goals
- **Instant Mobile Access**: Mahasiswa dapat membuka portal lewat browser smartphone dan melihat jadwal hari ini dalam < 2 detik tanpa login.
- **Dynamic Schedule Override**: Pengurus kelas dapat mengubah jadwal harian (H-1) per tanggal spesifik tanpa merusak master template jadwal mingguan.
- **Dual-Layer Task Tracking**:
  - Global status dikontrol admin (status: aktif / ditutup).
  - Personal checklist mahasiswa disimpan di `localStorage` browser masing-masing tanpa butuh login.
- **Materi & Arsip Perkuliahan**: Repositori tautan materi dosen yang dapat difilter per mata kuliah dan per semester (termasuk semester sebelumnya).
- **Zero AI Slop UI**: Desain visual bersih, fungsional, dan disiplin mengacu pada token `DESIGN.md` (Cal.com style).
- **Public Repo Security**: Zero credentials dalam kode sumber. Otentikasi pengurus via Google OAuth 1-klik dengan server-side whitelist email melalui Environment Variables Vercel.
- **Zero Cost & Serverless**: Memanfaatkan tier gratis Vercel dan Turso (LibSQL Serverless SQLite).

### Non-Goals
- Bukan LMS lengkap (tidak menyediakan fitur upload file langsung ke server database; berkas besar menggunakan Google Drive eksternal).
- Tidak ada form registrasi pengguna biasa (read-only untuk umum).
- Tidak ada sistem notifikasi push native atau SMS gateway.

---

## 3. Technical Stack & Architecture

- **Framework**: Next.js 15 / 14 (App Router, TypeScript)
- **Styling**: Tailwind CSS terkonfigurasi dengan token `DESIGN.md` (Inter, Cal Sans font-fallback, border 1px subtle, palet netral `#111111` dan `#f8f9fa`)
- **Database**: Turso (LibSQL Serverless SQLite) via `@libsql/client`
- **Authentication**: NextAuth.js (Auth.js v5) dengan Google OAuth Provider + Email Whitelist Server-Side
- **Icons**: Lucide React
- **Deployment Platform**: Vercel

### Architecture Diagram
```
Mahasiswa (Browser HP) ──[GET /]───────────────► Next.js App Router (RSC)
                                                         │
Pengurus (Browser Admin) ──[Google OAuth]────────► NextAuth (Auth.js)
                                                         │ (Check ADMIN_EMAILS)
                                                         ▼
                                                Server Actions / API Handlers
                                                         │ (HTTPS)
                                                         ▼
                                                Turso Database (LibSQL)
```

---

## 4. Key Decisions and Tradeoffs

1. **Next.js App Router vs Astro / Vite SPA**:
   - Next.js App Router dipilih untuk Vercel native zero-config, server actions aman untuk database query, dan integrasi mudah dengan NextAuth.
2. **Turso (LibSQL) vs Supabase**:
   - Turso dipilih karena zero cold-sleep pause di free tier, latency SQLite over HTTP sangat rendah, dan kuota 9GB gratis.
3. **Google OAuth + Whitelist vs Password Table**:
   - Menggunakan Google OAuth + `ADMIN_EMAILS` di Vercel env. Menghapus risiko kebocoran password hash di repo publik, zero maintenance untuk fitur reset password.
4. **Dual-Layer Task Completion**:
   - Database hanya menyimpan status global task (`status`: 'active' | 'closed') yang diatur PJ.
   - Centang "selesai dikerjakan" per individu mahasiswa disimpan lokal di `localStorage` HP masing-masing. Aman, instan, dan privasi terjaga.
5. **Override Resolution Logic**:
   - Menggunakan relasi `schedule_id` dengan constraint `UNIQUE(date, schedule_id)`. Mencegah tabrakan jika ada mata kuliah yang memiliki 2 sesi pada hari yang sama (misal Teori dan Praktikum).
6. **Active Semester Resolution**:
   - Menggunakan Environment Variable `NEXT_PUBLIC_ACTIVE_SEMESTER` (default: 3) dengan opsi ganti di UI filter, sehingga transisi ke semester baru tidak memerlukan refactoring kode.

---

## 5. Data Models & Database Schema (SQLite / LibSQL)

### Tabel `schedules` (Master Jadwal Mingguan)
```sql
CREATE TABLE IF NOT EXISTS schedules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  day_of_week INTEGER NOT NULL, -- 1 = Senin, 2 = Selasa, ..., 7 = Minggu
  subject TEXT NOT NULL,
  lecturer TEXT NOT NULL,
  start_time TEXT NOT NULL,      -- format "07:30"
  end_time TEXT NOT NULL,        -- format "09:30"
  room TEXT NOT NULL,
  semester INTEGER NOT NULL DEFAULT 3,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Tabel `schedule_overrides` (Penyesuaian Jadwal H-1 / Per Tanggal)
```sql
CREATE TABLE IF NOT EXISTS schedule_overrides (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,            -- format "YYYY-MM-DD"
  schedule_id INTEGER NOT NULL,  -- foreign key ke schedules(id)
  subject TEXT NOT NULL,
  lecturer TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  room TEXT NOT NULL,
  status TEXT NOT NULL,          -- 'normal', 'online', 'rescheduled', 'cancelled'
  note TEXT,
  updated_by TEXT NOT NULL,      -- email pengurus yang mengedit
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(schedule_id) REFERENCES schedules(id) ON DELETE CASCADE,
  UNIQUE(date, schedule_id)
);
```

### Tabel `tasks` (Daftar Tugas)
```sql
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  category TEXT NOT NULL,        -- 'tugas', 'project', 'uts_uas'
  deadline DATETIME NOT NULL,
  description TEXT,
  submission_url TEXT,
  status TEXT NOT NULL DEFAULT 'active', -- 'active' (dibuka), 'closed' (ditutup)
  created_by TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Tabel `materials` (Materi Kuliah & Arsip)
```sql
CREATE TABLE IF NOT EXISTS materials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  semester INTEGER NOT NULL,     -- 1, 2, 3, dst.
  lecturer TEXT,
  drive_url TEXT NOT NULL,
  material_type TEXT NOT NULL,   -- 'slide', 'ebook', 'catatan', 'rekaman'
  created_by TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 6. Daily Schedule Merge Logic (Algorithm)

Saat memuat jadwal untuk tanggal `T` (hari dalam seminggu `D`):
1. Query semua baris master dari `schedules WHERE day_of_week = D AND semester = ACTIVE_SEMESTER`.
2. Query semua baris override dari `schedule_overrides WHERE date = T`.
3. Buat dictionary override berdasarkan `schedule_id`.
4. Untuk setiap jadwal master:
   - Jika ada override dengan `schedule_id` yang cocok: gunakan data override (jam, ruangan, status 'online'/'cancelled'/'rescheduled', catatan dosen).
   - Jika tidak ada override: gunakan data master default dengan status 'normal'.
5. Urutkan hasil berdasarkan `start_time` ascending.

---

## 6. Security & Credential Isolation

Semua kunci rahasia disimpan di Vercel Environment Variables dan tidak pernah di-commit ke Git.
- `TURSO_DATABASE_URL`: URL LibSQL cluster.
- `TURSO_AUTH_TOKEN`: Token otentikasi LibSQL.
- `AUTH_SECRET`: Secret hash session NextAuth.
- `AUTH_GOOGLE_ID`: Client ID Google Cloud OAuth.
- `AUTH_GOOGLE_SECRET`: Client Secret Google Cloud OAuth.
- `ADMIN_EMAILS`: String CSV berisi email pengurus kelas yang diizinkan mengakses dashboard admin, contoh: `shapak@gmail.com,pj_rpl@gmail.com`.

### Verifikasi Akses Admin (Server Action Guard):
```ts
import { auth } from "@/auth";

export async function assertAdmin() {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");
  
  const allowed = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map(e => e.trim().toLowerCase());
    
  if (!allowed.includes(session.user.email.toLowerCase())) {
    throw new Error("Forbidden: Email tidak terdaftar sebagai pengurus");
  }
  return session.user;
}
```

---

## 7. Implementation Sequence

1. **Phase 1: Project Initialization & Design Tokens Setup**
   - Inisialisasi Next.js App Router dengan TypeScript dan Tailwind CSS.
   - Terapkan token `DESIGN.md` ke dalam `tailwind.config.ts` dan `globals.css`.
   - Setup `.gitignore` dan `.env.example`.

2. **Phase 2: Database Layer & Migration**
   - Buat helper koneksi LibSQL (`lib/db.ts`).
   - Buat skrip migrasi/inisialisasi tabel lokal dan Turso (`lib/schema.sql`).
   - Seed data default jadwal mingguan SI-A.

3. **Phase 3: Auth & Security Guard**
   - Konfigurasi NextAuth v5 dengan Google Provider (`auth.ts`).
   - Buat utility `assertAdmin()` untuk memproteksi mutasi data.

4. **Phase 4: Public View (Mahasiswa)**
   - Header & Navigasi Mobile-First.
   - Komponen "Jadwal Hari Ini" (otomatis menggabungkan jadwal master dengan override tanggal hari ini).
   - Komponen "Jadwal Mingguan".
   - Tab "Daftar Tugas" (filter kategori & status deadline).
   - Tab "Materi & Arsip" (filter semester & mata kuliah).

5. **Phase 5: Admin Panel & CRUD Operations**
   - Panel edit cepat status jadwal H-1 (normal / online / geser jam / libur).
   - CRUD master jadwal perkuliahan mingguan.
   - CRUD tugas perkuliahan.
   - CRUD tautan materi Google Drive.

6. **Phase 6: Verification & Deployment**
   - Verifikasi performa mobile dan responsivitas UI.
   - Verifikasi alur auth Google dan penolakan email non-whitelist.
   - Setup repository remote GitHub dan deploy ke Vercel.
