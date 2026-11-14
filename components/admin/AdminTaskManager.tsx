'use client';

import { useState } from 'react';
import type { Task } from '@/lib/types';
import { createTask, deleteTask } from '@/app/actions/task-actions';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

interface AdminTaskManagerProps {
  tasks: Task[];
  adminEmail: string;
}

export function AdminTaskManager({ tasks, adminEmail }: AdminTaskManagerProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<'tugas' | 'project' | 'uts_uas'>('tugas');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');
  const [submissionUrl, setSubmissionUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !subject || !deadline) return;
    setLoading(true);

    try {
      await createTask(
        {
          title,
          subject,
          category,
          deadline,
          description: description.trim() || undefined,
          submission_url: submissionUrl.trim() || undefined,
        },
        { user: { email: adminEmail } }
      );
      setTitle('');
      setSubject('');
      setDescription('');
      setSubmissionUrl('');
      setDeadline('');
      router.refresh();
    } catch (err: any) {
      alert(`Gagal menambah tugas: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus tugas ini?')) return;
    setLoading(true);
    try {
      await deleteTask(id, { user: { email: adminEmail } });
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
        <h3 className="text-sm font-semibold text-ink">Tambah Tugas Baru</h3>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-ink-muted mb-1 font-medium">Judul Tugas</label>
              <input
                type="text"
                required
                placeholder="misal: Makalah Rekayasa Perangkat Lunak"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-canvas border border-hairline rounded-md px-3 py-2 text-ink"
              />
            </div>

            <div>
              <label className="block text-ink-muted mb-1 font-medium">Mata Kuliah</label>
              <input
                type="text"
                required
                placeholder="misal: Rekayasa Perangkat Lunak"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-canvas border border-hairline rounded-md px-3 py-2 text-ink"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-ink-muted mb-1 font-medium">Kategori</label>
              <select
                value={category}
                onChange={(e: any) => setCategory(e.target.value)}
                className="w-full bg-canvas border border-hairline rounded-md px-3 py-2 text-ink"
              >
                <option value="tugas">Tugas Reguler</option>
                <option value="project">Project Besar</option>
                <option value="uts_uas">UTS / UAS</option>
              </select>
            </div>

            <div>
              <label className="block text-ink-muted mb-1 font-medium">Batas Waktu (Deadline)</label>
              <input
                type="text"
                required
                placeholder="YYYY-MM-DD HH:mm (misal: 2026-11-20 23:59)"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-canvas border border-hairline rounded-md px-3 py-2 text-ink"
              />
            </div>
          </div>

          <div>
            <label className="block text-ink-muted mb-1 font-medium">Link Pengumpulan (Opsional)</label>
            <input
              type="url"
              placeholder="https://classroom.google.com/..."
              value={submissionUrl}
              onChange={(e) => setSubmissionUrl(e.target.value)}
              className="w-full bg-canvas border border-hairline rounded-md px-3 py-2 text-ink"
            />
          </div>

          <div>
            <label className="block text-ink-muted mb-1 font-medium">Deskripsi / Detail Tugas</label>
            <textarea
              rows={3}
              placeholder="Tuliskan format pengumpulan, template, atau petunjuk khusus..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-canvas border border-hairline rounded-md px-3 py-2 text-ink"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-ink text-canvas hover:bg-neutral-800 rounded-md font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'Menambahkan...' : 'Publikasikan Tugas'}
          </button>
        </form>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-ink uppercase tracking-wider">Daftar Tugas Aktif ({tasks.length})</h4>
        {tasks.length === 0 ? (
          <p className="text-xs text-ink-muted p-4 border border-hairline rounded-lg bg-canvas-subtle text-center">
            Belum ada tugas yang tersimpan.
          </p>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="p-3 border border-hairline rounded-lg bg-canvas flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-ink">{task.title}</span>
                    <span className="text-ink-muted">({task.subject})</span>
                  </div>
                  <p className="text-ink-muted text-[11px] mt-0.5">
                    Deadline: {task.deadline} • Oleh: {task.created_by}
                  </p>
                </div>

                <button
                  onClick={() => handleDelete(task.id)}
                  disabled={loading}
                  className="text-red-600 hover:text-red-700 p-1.5 rounded hover:bg-red-50 transition-colors"
                  title="Hapus tugas"
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
