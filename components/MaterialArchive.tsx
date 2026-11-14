'use client';

import { useState } from 'react';
import type { Material } from '@/lib/types';
import { filterMaterials } from '@/lib/ui-helpers';
import { Search, FolderOpen, ExternalLink, FileText, Book, Video, File } from 'lucide-react';

interface MaterialArchiveProps {
  materials: Material[];
}

export function MaterialArchive({ materials }: MaterialArchiveProps) {
  const [selectedSemester, setSelectedSemester] = useState<number | undefined>(undefined);
  const [search, setSearch] = useState('');

  const filtered = filterMaterials(materials, selectedSemester, search);

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'slide':
        return <FileText className="w-3.5 h-3.5 text-neutral-500" />;
      case 'ebook':
        return <Book className="w-3.5 h-3.5 text-neutral-500" />;
      case 'rekaman':
        return <Video className="w-3.5 h-3.5 text-neutral-500" />;
      default:
        return <File className="w-3.5 h-3.5 text-neutral-500" />;
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between border-b border-hairline pb-2">
        <h2 className="text-sm font-semibold text-ink uppercase tracking-wider">Materi & Arsip</h2>
        <span className="text-xs text-ink-muted">{filtered.length} Berkas</span>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            type="text"
            placeholder="Cari materi atau mata kuliah..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs bg-canvas border border-hairline rounded-md pl-9 pr-3 py-2 text-ink focus:outline-none focus:border-ink transition-colors"
          />
        </div>

        <select
          value={selectedSemester ?? ''}
          onChange={(e) => setSelectedSemester(e.target.value ? Number(e.target.value) : undefined)}
          className="text-xs bg-canvas border border-hairline rounded-md px-3 py-2 text-ink focus:outline-none focus:border-ink"
        >
          <option value="">Semua Semester</option>
          <option value="3">Semester 3 (Aktif)</option>
          <option value="2">Semester 2 (Arsip)</option>
          <option value="1">Semester 1 (Arsip)</option>
        </select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="p-8 text-center border border-hairline rounded-lg bg-canvas-subtle">
          <p className="text-xs text-ink-muted">Tidak ada materi yang ditemukan.</p>
        </div>
      ) : (
        <div className="grid gap-2">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-3.5 border border-hairline rounded-lg bg-canvas hover:border-hairline-emphasis transition-all shadow-subtle flex items-center justify-between gap-3"
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="mt-0.5 p-1.5 rounded bg-neutral-100 border border-hairline shrink-0">
                  {getMaterialIcon(item.material_type)}
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-medium text-ink truncate">{item.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-ink-muted mt-0.5">
                    <span>{item.subject}</span>
                    <span>•</span>
                    <span>Sem {item.semester}</span>
                    {item.lecturer && (
                      <>
                        <span>•</span>
                        <span>{item.lecturer}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <a
                href={item.drive_url}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 p-2 text-ink-muted hover:text-ink hover:bg-neutral-100 rounded-md transition-colors"
                title="Buka Google Drive"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
