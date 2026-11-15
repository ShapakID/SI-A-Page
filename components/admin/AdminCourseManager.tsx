'use client';

import { useState } from 'react';
import type { Schedule } from '@/lib/types';
import { createSchedule, deleteSchedule } from '@/app/actions/schedule-actions';
import { useRouter } from 'next/navigation';
import { Trash2, Plus } from 'lucide-react';

const DAYS = [
  { value: 1, label: 'Senin' },
  { value: 2, label: 'Selasa' },
  { value: 3, label: 'Rabu' },
  { value: 4, label: 'Kamis' },
  { value: 5, label: 'Jumat' },
];

interface AdminCourseManagerProps {
  schedules: Schedule[];
  adminEmail: string;
  activeSemester: number;
}

export function AdminCourseManager({ schedules, adminEmail, activeSemester }: AdminCourseManagerProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [subject, setSubject] = useState('');
  const [lecturer, setLecturer] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [room, setRoom] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !lecturer || !startTime || !endTime || !room) return;
    setLoading(true);
    try {
      await createSchedule(
        {
          day_of_week: dayOfWeek,
          subject,
          lecturer,
          start_time: startTime,
          end_time: endTime,
          room,
          semester: activeSemester,
        },
        { user: { email: adminEmail } }
      );
      setSubject('');
      setLecturer('');
      setStartTime('');
      setEndTime('');
      setRoom('');
      router.refresh();
    } catch (err: any) {
      alert(`Gagal menambah mata kuliah: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus mata kuliah ini beserta jadwal override-nya?')) return;
    setLoading(true);
    try {
      await deleteSchedule(id, { user: { email: adminEmail } });
      router.refresh();
    } catch (err: any) {
      alert(`Gagal menghapus: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-canvas border border-hairline rounded-xl p-5 shadow-subtle space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-ink">Tambah Mata Kuliah</h3>
          <p className="text-[11px] text-ink-muted mt-0.5">
            Isi jadwal dulu di sini. Tugas dan konfirmasi H-1 baru bisa dibuat setelah mata kuliah ada.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-ink-muted mb-1 font-medium">Nama Mata Kuliah</label>
              <input
                type="text"
                required
                placeholder="misal: Rekayasa Perangkat Lunak"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-canvas border border-hairline rounded-md px-3 py-2 text-ink"
              />
            </div>
            <div>
              <label className="block text-ink-muted mb-1 font-medium">Dosen</label>
              <input
                type="text"
                required
                placeholder="misal: Dr. Nama Dosen, M.Kom."
                value={lecturer}
                onChange={(e) => setLecturer(e.target.value)}
                className="w-full bg-canvas border border-hairline rounded-md px-3 py-2 text-ink"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-ink-muted mb-1 font-medium">Hari</label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(Number(e.target.value))}
                className="w-full bg-canvas border border-hairline rounded-md px-3 py-2 text-ink"
              >
                {DAYS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-ink-muted mb-1 font-medium">Mulai</label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-canvas border border-hairline rounded-md px-3 py-2 text-ink tabular-nums"
              />
            </div>
            <div>
              <label className="block text-ink-muted mb-1 font-medium">Selesai</label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-canvas border border-hairline rounded-md px-3 py-2 text-ink tabular-nums"
              />
            </div>
            <div>
              <label className="block text-ink-muted mb-1 font-medium">Ruang</label>
              <input
                type="text"
                required
                placeholder="JTI-1"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full bg-canvas border border-hairline rounded-md px-3 py-2 text-ink"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-ink text-canvas hover:bg-neutral-800 rounded-md font-medium transition-colors disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" />
            {loading ? 'Menyimpan...' : 'Simpan Mata Kuliah'}
          </button>
        </form>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-ink uppercase tracking-wider">
          Mata Kuliah Terdaftar ({schedules.length})
        </h4>
        {schedules.length === 0 ? (
          <p className="text-xs text-ink-muted p-4 border border-hairline rounded-lg bg-canvas-subtle text-center">
            Belum ada mata kuliah. Tambahkan dulu supaya portal tidak kosong.
          </p>
        ) : (
          <div className="space-y-2">
            {schedules.map((s) => (
              <div
                key={s.id}
                className="p-3 border border-hairline rounded-lg bg-canvas flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-ink">{s.subject}</span>
                    <span className="text-ink-muted tabular-nums">
                      {DAYS.find((d) => d.value === s.day_of_week)?.label ?? '-'} {s.start_time}-{s.end_time}
                    </span>
                  </div>
                  <p className="text-ink-muted text-[11px] mt-0.5">
                    {s.lecturer} • {s.room} • Semester {s.semester}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(s.id)}
                  disabled={loading}
                  className="text-red-600 hover:text-red-700 p-1.5 rounded hover:bg-red-50 transition-colors"
                  title="Hapus mata kuliah"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
