'use client';

import { useState } from 'react';
import { BookOpen, Calendar, CheckSquare, FolderDown, Terminal } from 'lucide-react';
import type { Schedule, ScheduleOverride, Task, Material } from '@/lib/types';
import { AdminCourseManager } from './AdminCourseManager';
import { AdminScheduleManager } from './AdminScheduleManager';
import { AdminTaskManager } from './AdminTaskManager';
import { AdminMaterialManager } from './AdminMaterialManager';
import { AdminBulkTools } from './AdminBulkTools';

interface AdminDashboardTabsProps {
  schedules: Schedule[];
  overrides: ScheduleOverride[];
  tasks: Task[];
  materials: Material[];
  adminEmail: string;
  activeSemester: number;
  subjects: string[];
}

export function AdminDashboardTabs({
  schedules,
  overrides,
  tasks,
  materials,
  adminEmail,
  activeSemester,
  subjects,
}: AdminDashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<'courses' | 'schedules' | 'tasks' | 'materials' | 'bulk'>('courses');

  const tabs = [
    {
      id: 'courses',
      label: '1. Mata Kuliah Master',
      icon: BookOpen,
      count: schedules.length,
    },
    {
      id: 'schedules',
      label: '2. Konfirmasi H-1',
      icon: Calendar,
      count: overrides.length,
    },
    {
      id: 'tasks',
      label: '3. Tugas & Project',
      icon: CheckSquare,
      count: tasks.length,
    },
    {
      id: 'materials',
      label: '4. Berkas & Drive',
      icon: FolderDown,
      count: materials.length,
    },
    {
      id: 'bulk',
      label: '5. Bulk & Reset',
      icon: Terminal,
      count: '⚡',
    },
  ] as const;

  return (
    <div className="space-y-8">
      {/* Saasly Modern Tab Bar */}
      <div className="flex items-center gap-2 p-1.5 bg-neutral-100 dark:bg-neutral-900 border border-hairline rounded-2xl overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-canvas text-ink shadow-md shadow-neutral-200/50 dark:shadow-none border border-hairline'
                  : 'text-ink-muted hover:text-ink hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-ink' : 'text-ink-muted'}`} />
              <span>{tab.label}</span>
              <span
                className={`px-2 py-0.5 text-[10px] font-mono rounded-full ${
                  isActive
                    ? 'bg-neutral-100 dark:bg-neutral-800 text-ink'
                    : 'bg-neutral-200 dark:bg-neutral-800 text-ink-muted'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 shadow-xl shadow-neutral-100/50 dark:shadow-none min-h-[400px]">
        {activeTab === 'courses' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-hairline pb-4">
              <h2 className="text-base font-bold text-ink">Master Mata Kuliah & Jadwal Mingguan</h2>
              <p className="text-xs text-ink-muted mt-1">
                Tambahkan daftar mata kuliah semester ini terlebih dahulu. Data ini akan menjadi acuan input tugas dan perubahan jadwal.
              </p>
            </div>
            <AdminCourseManager
              schedules={schedules}
              adminEmail={adminEmail}
              activeSemester={activeSemester}
            />
          </div>
        )}

        {activeTab === 'schedules' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-hairline pb-4">
              <h2 className="text-base font-bold text-ink">Konfirmasi Jadwal H-1 (Override)</h2>
              <p className="text-xs text-ink-muted mt-1">
                Gunakan fitur ini jika ada perubahan ruangan, kelas online, atau dosen berhalangan hadir pada tanggal spesifik.
              </p>
            </div>
            <AdminScheduleManager
              schedules={schedules}
              overrides={overrides}
              adminEmail={adminEmail}
            />
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-hairline pb-4">
              <h2 className="text-base font-bold text-ink">Manajemen Tugas & Project</h2>
              <p className="text-xs text-ink-muted mt-1">
                Catat tugas individu maupun kelompok beserta tenggat waktu (deadline).
              </p>
            </div>
            <AdminTaskManager
              tasks={tasks}
              adminEmail={adminEmail}
              subjects={subjects}
            />
          </div>
        )}

        {activeTab === 'materials' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-hairline pb-4">
              <h2 className="text-base font-bold text-ink">Berkas Materi & Google Drive</h2>
              <p className="text-xs text-ink-muted mt-1">
                Bagikan tautan slide presentasi, e-book, atau folder Google Drive perkuliahan.
              </p>
            </div>
            <AdminMaterialManager materials={materials} adminEmail={adminEmail} />
          </div>
        )}

        {activeTab === 'bulk' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-hairline pb-4">
              <h2 className="text-base font-bold text-ink">Admin Bulk Tools & Database Reset</h2>
              <p className="text-xs text-ink-muted mt-1">
                Import jadwal secara massal lewat JSON atau reset total database portal.
              </p>
            </div>
            <AdminBulkTools adminEmail={adminEmail} activeSemester={activeSemester} />
          </div>
        )}
      </div>
    </div>
  );
}
