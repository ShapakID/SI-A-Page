'use client';

import { useState } from 'react';
import { bulkCreateSchedules, resetAllData } from '@/app/actions/schedule-actions';
import { useRouter } from 'next/navigation';
import { Upload, Trash2, FileJson, AlertTriangle } from 'lucide-react';

interface AdminBulkToolsProps {
  adminEmail: string;
  activeSemester: number;
}

const SAMPLE_JSON = `[
  {
    "day_of_week": 1,
    "subject": "Kecerdasan Buatan",
    "lecturer": "Dr. Dosen, M.Kom.",
    "start_time": "07:30",
    "end_time": "10:00",
    "room": "JTI-1"
  },
  {
    "day_of_week": 2,
    "subject": "Pemrograman Web",
    "lecturer": "Tim Dosen",
    "start_time": "10:00",
    "end_time": "12:30",
    "room": "Lab Komputer"
  }
]`;

export function AdminBulkTools({ adminEmail, activeSemester }: AdminBulkToolsProps) {
  const router = useRouter();
  const [jsonInput, setJsonInput] = useState(SAMPLE_JSON);
  const [loadingBulk, setLoadingBulk] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm('Import jadwal kuliah secara bulk ke semester aktif?')) return;

    setLoadingBulk(true);
    try {
      const parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed)) {
        throw new Error('Format JSON harus berupa Array [...]');
      }

      const items = parsed.map((item: any) => ({
        day_of_week: Number(item.day_of_week),
        subject: String(item.subject),
        lecturer: String(item.lecturer),
        start_time: String(item.start_time),
        end_time: String(item.end_time),
        room: String(item.room),
        semester: activeSemester,
      }));

      await bulkCreateSchedules(items, { user: { email: adminEmail } });
      alert(`Berhasil mengimpor ${items.length} mata kuliah!`);
      router.refresh();
    } catch (err: any) {
      alert(`Gagal import JSON: ${err.message}`);
    } finally {
      setLoadingBulk(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('PERINGATAN: Aksi ini akan MENGHAPUS SEMUA data mata kuliah, tugas, materi, dan override secara permanen! Lanjutkan?')) {
      return;
    }

    setLoadingReset(true);
    try {
      await resetAllData({ user: { email: adminEmail } });
      alert('Database berhasil di-reset total.');
      router.refresh();
    } catch (err: any) {
      alert(`Gagal reset database: ${err.message}`);
    } finally {
      setLoadingReset(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Bulk JSON Import Card */}
      <div className="bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="space-y-1">
          <div className="inline-flex p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-ink mb-1">
            <FileJson className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-ink">Import Jadwal Kuliah Bulk (JSON)</h3>
          <p className="text-xs text-ink-muted">
            Paste format JSON array di bawah untuk memasukkan banyak mata kuliah sekaligus tanpa harus mengetik satu-satu.
          </p>
        </div>

        <form onSubmit={handleBulkSubmit} className="space-y-4">
          <textarea
            rows={8}
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className="w-full font-mono text-xs p-4 bg-canvas-subtle border border-hairline rounded-2xl text-ink focus:outline-none focus:ring-1 focus:ring-neutral-400"
            placeholder="Paste JSON disini..."
          />

          <button
            type="submit"
            disabled={loadingBulk}
            className="px-5 py-3 bg-ink text-canvas hover:bg-neutral-800 disabled:opacity-50 text-xs font-bold rounded-xl transition-all flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>{loadingBulk ? 'Mengimpor...' : 'Import Data Bulk'}</span>
          </button>
        </form>
      </div>

      {/* Database Reset Card */}
      <div className="bg-red-50/50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="space-y-1">
          <div className="inline-flex p-2 rounded-xl bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 mb-1">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-red-900 dark:text-red-300">Zona Bahaya: Reset Database</h3>
          <p className="text-xs text-red-700/80 dark:text-red-400/80">
            Hapus seluruh data master kuliah, tugas, materi, dan override untuk memulai dari awal bersih.
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          disabled={loadingReset}
          className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-red-600/20"
        >
          <Trash2 className="w-4 h-4" />
          <span>{loadingReset ? 'Mereset...' : 'Reset Semua Data Portal'}</span>
        </button>
      </div>
    </div>
  );
}
