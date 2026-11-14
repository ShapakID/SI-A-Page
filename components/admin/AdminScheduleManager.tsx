'use client';

import { useState } from 'react';
import type { Schedule, ScheduleOverride } from '@/lib/types';
import { saveScheduleOverride, deleteScheduleOverride } from '@/app/actions/schedule-actions';
import { useRouter } from 'next/navigation';

interface AdminScheduleManagerProps {
  schedules: Schedule[];
  overrides: ScheduleOverride[];
  adminEmail: string;
}

export function AdminScheduleManager({ schedules, overrides, adminEmail }: AdminScheduleManagerProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form states
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1); // Default to tomorrow for H-1
    return d.toISOString().split('T')[0];
  });
  const [selectedScheduleId, setSelectedScheduleId] = useState<number>(schedules[0]?.id || 1);
  const [status, setStatus] = useState<'normal' | 'online' | 'rescheduled' | 'cancelled'>('online');
  const [room, setRoom] = useState('Online Zoom');
  const [note, setNote] = useState('');

  const selectedBase = schedules.find((s) => s.id === Number(selectedScheduleId)) || schedules[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBase) return;
    setLoading(true);

    try {
      await saveScheduleOverride(
        date,
        selectedBase.id,
        {
          subject: selectedBase.subject,
          lecturer: selectedBase.lecturer,
          start_time: selectedBase.start_time,
          end_time: selectedBase.end_time,
          room: status === 'cancelled' ? selectedBase.room : room,
          status,
          note: note.trim() || null,
        },
        { user: { email: adminEmail } }
      );
      setNote('');
      router.refresh();
    } catch (err: any) {
      alert(`Gagal menyimpan: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus override ini?')) return;
    setLoading(true);
    try {
      await deleteScheduleOverride(id, { user: { email: adminEmail } });
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
        <h3 className="text-sm font-semibold text-ink">Update Jadwal (Konfirmasi H-1)</h3>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-ink-muted mb-1 font-medium">Tanggal</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-canvas border border-hairline rounded-md px-3 py-2 text-ink"
              />
            </div>

            <div>
              <label className="block text-ink-muted mb-1 font-medium">Pilih Mata Kuliah</label>
              <select
                value={selectedScheduleId}
                onChange={(e) => setSelectedScheduleId(Number(e.target.value))}
                className="w-full bg-canvas border border-hairline rounded-md px-3 py-2 text-ink"
              >
                {schedules.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.subject} ({s.start_time} - {s.room})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-ink-muted mb-1 font-medium">Status Perkuliahan</label>
              <select
                value={status}
                onChange={(e: any) => setStatus(e.target.value)}
                className="w-full bg-canvas border border-hairline rounded-md px-3 py-2 text-ink"
              >
                <option value="normal">Normal (Tatap Muka)</option>
                <option value="online">Online</option>
                <option value="rescheduled">Digeser / Ganti Jam</option>
                <option value="cancelled">Ditiadakan / Kosong</option>
              </select>
            </div>

            <div>
              <label className="block text-ink-muted mb-1 font-medium">Ruang / Link Platform</label>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="misal: Online Zoom / Lab Terpadu"
                disabled={status === 'cancelled'}
                className="w-full bg-canvas border border-hairline rounded-md px-3 py-2 text-ink disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-ink-muted mb-1 font-medium">Catatan Tambahan (Opsional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="misal: Dosen konfirmasi kuliah jam 08:30 via Zoom"
              className="w-full bg-canvas border border-hairline rounded-md px-3 py-2 text-ink"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-ink text-canvas hover:bg-neutral-800 rounded-md font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'Menyimpan...' : 'Simpan Update Jadwal'}
          </button>
        </form>
      </div>

      {/* Active Overrides */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-ink uppercase tracking-wider">Daftar Override Terpasang</h4>
        {overrides.length === 0 ? (
          <p className="text-xs text-ink-muted p-4 border border-hairline rounded-lg bg-canvas-subtle text-center">
            Belum ada override jadwal aktif.
          </p>
        ) : (
          <div className="space-y-2">
            {overrides.map((item) => (
              <div
                key={item.id}
                className="p-3 border border-hairline rounded-lg bg-canvas flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-ink-muted">{item.date}</span>
                    <span className="font-semibold text-ink">{item.subject}</span>
                    <span className="px-1.5 py-0.5 rounded bg-neutral-100 text-ink border border-hairline">
                      {item.status}
                    </span>
                  </div>
                  <p className="text-ink-muted text-[11px] mt-1">
                    Ruang: {item.room} • {item.note || 'Tanpa catatan'} (by {item.updated_by})
                  </p>
                </div>

                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={loading}
                  className="text-red-600 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                >
                  Hapus
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
