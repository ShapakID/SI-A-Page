'use client';

import { useState } from 'react';
import type { Material } from '@/lib/types';
import { createMaterial, deleteMaterial } from '@/app/actions/material-actions';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

interface AdminMaterialManagerProps {
  materials: Material[];
  adminEmail: string;
}

export function AdminMaterialManager({ materials, adminEmail }: AdminMaterialManagerProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [semester, setSemester] = useState<number>(3);
  const [driveUrl, setDriveUrl] = useState('');
  const [materialType, setMaterialType] = useState<'slide' | 'ebook' | 'catatan' | 'rekaman'>('slide');
  const [lecturer, setLecturer] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !subject || !driveUrl) return;
    setLoading(true);

    try {
      await createMaterial(
        {
          title,
          subject,
          semester,
          drive_url: driveUrl,
          material_type: materialType,
          lecturer: lecturer.trim() || undefined,
        },
        { user: { email: adminEmail } }
      );
      setTitle('');
      setSubject('');
      setDriveUrl('');
      setLecturer('');
      router.refresh();
    } catch (err: any) {
      alert(`Gagal menambah materi: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus materi ini?')) return;
    setLoading(true);
    try {
      await deleteMaterial(id, { user: { email: adminEmail } });
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
        <h3 className="text-sm font-semibold text-ink">Tambah Materi / Arsip Google Drive</h3>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-ink-muted mb-1 font-medium">Judul Berkas / Topik</label>
              <input
                type="text"
                required
                placeholder="misal: Pertemuan 1 - Pengantar AI"
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
                placeholder="misal: Kecerdasan Buatan"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-canvas border border-hairline rounded-md px-3 py-2 text-ink"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-ink-muted mb-1 font-medium">Semester</label>
              <select
                value={semester}
                onChange={(e) => setSemester(Number(e.target.value))}
                className="w-full bg-canvas border border-hairline rounded-md px-3 py-2 text-ink"
              >
                <option value={3}>Semester 3 (Aktif)</option>
                <option value={2}>Semester 2</option>
                <option value={1}>Semester 1</option>
              </select>
            </div>

            <div>
              <label className="block text-ink-muted mb-1 font-medium">Jenis Materi</label>
              <select
                value={materialType}
                onChange={(e: any) => setMaterialType(e.target.value)}
                className="w-full bg-canvas border border-hairline rounded-md px-3 py-2 text-ink"
              >
                <option value="slide">Slide PPT / PDF</option>
                <option value="ebook">E-Book / Buku Ajar</option>
                <option value="catatan">Catatan / Rangkuman</option>
                <option value="rekaman">Rekaman Kuliah Zoom</option>
              </select>
            </div>

            <div>
              <label className="block text-ink-muted mb-1 font-medium">Dosen Pengampu (Opsional)</label>
              <input
                type="text"
                placeholder="misal: Dr. ..."
                value={lecturer}
                onChange={(e) => setLecturer(e.target.value)}
                className="w-full bg-canvas border border-hairline rounded-md px-3 py-2 text-ink"
              />
            </div>
          </div>

          <div>
            <label className="block text-ink-muted mb-1 font-medium">Link Google Drive</label>
            <input
              type="url"
              required
              placeholder="https://drive.google.com/file/d/..."
              value={driveUrl}
              onChange={(e) => setDriveUrl(e.target.value)}
              className="w-full bg-canvas border border-hairline rounded-md px-3 py-2 text-ink"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-ink text-canvas hover:bg-neutral-800 rounded-md font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'Menyimpan...' : 'Simpan Materi'}
          </button>
        </form>
      </div>

      {/* Material List */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-ink uppercase tracking-wider">
          Daftar Materi Terdaftar ({materials.length})
        </h4>
        {materials.length === 0 ? (
          <p className="text-xs text-ink-muted p-4 border border-hairline rounded-lg bg-canvas-subtle text-center">
            Belum ada berkas materi yang disimpan.
          </p>
        ) : (
          <div className="space-y-2">
            {materials.map((m) => (
              <div
                key={m.id}
                className="p-3 border border-hairline rounded-lg bg-canvas flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-ink truncate">{m.title}</span>
                    <span className="text-ink-muted shrink-0">
                      ({m.subject} • Sem {m.semester})
                    </span>
                  </div>
                  <a
                    href={m.drive_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-neutral-500 hover:text-ink text-[11px] truncate block mt-0.5"
                  >
                    {m.drive_url}
                  </a>
                </div>

                <button
                  onClick={() => handleDelete(m.id)}
                  disabled={loading}
                  className="text-red-600 hover:text-red-700 p-1.5 rounded hover:bg-red-50 transition-colors shrink-0"
                  title="Hapus materi"
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
