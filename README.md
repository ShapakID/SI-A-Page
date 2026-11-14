# Portal Mahasiswa Sistem Informasi A (SI-A)

Portal perkuliahan modern, ringan, dan zero AI slop untuk kelas Sistem Informasi A Universitas Tadulako.
Dibangun menggunakan **Next.js 15 (App Router)**, **Tailwind CSS (Cal.com Design Tokens)**, **LibSQL / Turso SQLite**, dan **NextAuth Google OAuth**.

---

## Fitur Utama

1. **Jadwal Kuliah Dinamis (Konfirmasi H-1)**
   - Jadwal harian otomatis mendeteksi hari aktif (WITA UTC+8).
   - Dukungan update instan oleh pengurus kelas jika dosen konfirmasi online, ganti jam/ruang, atau batal.
   - Jadwal mingguan lengkap Senin - Jumat dengan filter hari responsif.
2. **Personal Task Tracker**
   - Daftar tugas, proyek besar, dan UTS/UAS terintegrasi.
   - Mahasiswa umum dapat menandai tugas yang selesai secara mandiri tanpa login (tersimpan di `localStorage` per browser).
   - Tautan langsung ke Google Classroom / form pengumpulan tugas.
3. **Repositori & Arsip Berkas**
   - Materi slide kuliah, e-book, rangkuman, dan rekaman kelas.
   - Filter pencarian instan dan arsip lintas semester (Semester 1, 2, dan 3 aktif).
   - Terintegrasi langsung dengan link Google Drive.
4. **Keamanan & Role Berbasis Google OAuth**
   - **Mahasiswa (Public)**: Langsung akses tanpa registrasi atau login. Aman untuk repositori publik GitHub.
   - **Admin / Pengurus (PJ Kelas)**: Login via akun Google dengan perlindungan server-side whitelist (`ADMIN_EMAILS`).

---

## Desain Anti AI-Slop (Cal.com Style)

Website ini menolak tren AI slop (tidak ada gradient ungu-biru norak, tidak ada glassmorphism blur, tidak ada emoji dekoratif acak, tidak ada animasi berlebihan).
- Kontras tinggi dan bersih (`#111111` di atas `#ffffff`).
- Hairline border presisi 1px (`#e5e7eb`).
- Tipografi angka tabular (`tabular-nums`) untuk jadwal kuliah dan jam.
- Card dengan sudut rounded natural (8px - 12px) dan shadow halus.

---

## Konfigurasi Lingkungan (Environment Variables)

Untuk deployment di Vercel atau lokal, siapkan environment variable berikut:

| Variable | Deskripsi | Contoh |
|---|---|---|
| `TURSO_DATABASE_URL` | URL database LibSQL / Turso | `libsql://si-a-db-username.turso.io` |
| `TURSO_AUTH_TOKEN` | Token autentikasi Turso | `eyJhbGciOi...` |
| `NEXTAUTH_URL` | URL dasar aplikasi | `https://si-a-page.vercel.app` (prod) / `http://localhost:3000` (lokal) |
| `NEXTAUTH_SECRET` | Kunci enkripsi token sesi NextAuth | String acak aman (`openssl rand -base64 32`) |
| `GOOGLE_CLIENT_ID` | OAuth Client ID dari Google Cloud Console | `xxxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | OAuth Client Secret Google | `GOCSPX-xxxx` |
| `ADMIN_EMAILS` | Daftar email Google admin/PJ (pisahkan dengan koma) | `shapak@gmail.com,pj1@gmail.com` |
| `NEXT_PUBLIC_ACTIVE_SEMESTER` | Nomor semester aktif saat ini | `3` |

---

## Cara Menjalankan Secara Lokal

1. Salin template environment variables:
   ```bash
   cp .env.example .env.local
   ```
2. Install dependensi:
   ```bash
   npm install
   ```
3. Jalankan unit test:
   ```bash
   npm test
   ```
4. Jalankan development server:
   ```bash
   npm run dev
   ```
   Buka `http://localhost:3000` di browser.

---

## Panduan Deploy ke Vercel

1. **Import Repositori**: Hubungkan akun Vercel dengan repositori GitHub `https://github.com/ShapakID/SI-A-Page`.
2. **Isi Environment Variables**: Masukkan 8 variabel di atas pada menu Settings > Environment Variables di Vercel Dashboard.
3. **Google Cloud Console Settings**:
   - Di tab **Credentials > Authorized redirect URIs**, tambahkan:
     - `https://si-a-page.vercel.app/api/auth/callback/google`
     - `http://localhost:3000/api/auth/callback/google` (untuk lokal)
4. **Deploy**: Klik tombol Deploy. Build akan berjalan otomatis dan siap diakses.

