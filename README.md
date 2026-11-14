# SIA - Portal Kelas SI-A

Portal web ringan untuk jadwal dinamis, tracking tugas, dan arsip materi kelas SI-A.
Dibuat dengan Python stdlib murni (tanpa pip / external dependencies) + SQLite + Tailwind CSS.

## Fitur
1. **Jadwal Kuliah Dinamis**: Otomatis memuat jadwal SI-A mingguan. PJ kelas bisa ubah status harian (Normal, Kuliah Online, Reschedule/Pindah Ruang, Libur/Batal) dan input catatan dosen (H-1).
2. **Daftar Tugas & Deadline**: Filter Projek, UTS/UAS, dan Tugas Biasa. Bisa ditandai selesai.
3. **Materi & Catatan Kuliah**: Repositori materi per pertemuan dan arsip semester sebelumnya (Semester 1, Semester 2, Semester 3).
4. **Role Akses**:
   - Mahasiswa: Langsung buka tanpa login, responsif di HP (mobile-first).
   - PJ Kelas (Admin): Klik tombol "Mode PJ", masukkan PIN default: `sia123`.

## Cara Menjalankan
- Di Windows: Dobel klik `run.bat` atau jalankan:
  ```bash
  python server.py 8000
  ```
- Di STB / Linux:
  ```bash
  python3 server.py 8000
  ```
Buka di browser: `http://localhost:8000` (atau IP Tailscale jika di STB).
