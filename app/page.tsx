import Link from 'next/link';
import { getDbClient, initDb } from '@/lib/db';
import { mergeSchedulesWithOverrides } from '@/lib/schedule-merger';
import { getDayOfWeek, formatIndonesianDate, getAcademicYear, getSemesterNumber } from '@/lib/ui-helpers';
import type { Schedule, ScheduleOverride, Task, Material } from '@/lib/types';
import { Header } from '@/components/Header';
import { TodaySchedule } from '@/components/TodaySchedule';
import { WeeklySchedule } from '@/components/WeeklySchedule';
import { TaskList } from '@/components/TaskList';
import { MaterialArchive } from '@/components/MaterialArchive';
import { Sparkles, Calendar, BookOpen, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

export const revalidate = 60; // Revalidate at most every 60s

function getNowWITA(): { dateStr: string; now: Date } {
  // WITA is UTC+8
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const witaTime = new Date(utc + 3600000 * 8);

  const year = witaTime.getFullYear();
  const month = String(witaTime.getMonth() + 1).padStart(2, '0');
  const day = String(witaTime.getDate()).padStart(2, '0');

  return {
    dateStr: `${year}-${month}-${day}`,
    now: witaTime,
  };
}

export default async function HomePage() {
  const db = getDbClient();
  await initDb(db);

  const { dateStr, now } = getNowWITA();
  const dayOfWeek = getDayOfWeek(now);
  const formattedToday = formatIndonesianDate(dateStr);

  const angkatan = Number(process.env.NEXT_PUBLIC_ANGKATAN || 2025);
  const activeSemester = getSemesterNumber(now, angkatan);
  const academicYear = getAcademicYear(now);

  // 1. Fetch weekly master schedules
  const masterRes = await db.execute({
    sql: 'SELECT * FROM schedules WHERE semester = ? ORDER BY day_of_week ASC, start_time ASC',
    args: [activeSemester],
  });
  const allMasterSchedules = masterRes.rows as unknown as Schedule[];

  // 2. Filter master schedules for today
  const todayMasters = allMasterSchedules.filter((s) => s.day_of_week === dayOfWeek);

  // 3. Fetch overrides for today
  const overridesRes = await db.execute({
    sql: 'SELECT * FROM schedule_overrides WHERE date = ?',
    args: [dateStr],
  });
  const todayOverrides = overridesRes.rows as unknown as ScheduleOverride[];

  // 4. Merge
  const mergedToday = mergeSchedulesWithOverrides(todayMasters, todayOverrides);

  // 5. Fetch tasks
  const tasksRes = await db.execute('SELECT * FROM tasks ORDER BY deadline ASC');
  const allTasks = tasksRes.rows as unknown as Task[];

  // 6. Fetch materials
  const materialsRes = await db.execute('SELECT * FROM materials ORDER BY semester DESC, id DESC');
  const allMaterials = materialsRes.rows as unknown as Material[];

  return (
    <div className="min-h-screen bg-canvas text-ink pb-24 selection:bg-neutral-900 selection:text-white">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 space-y-16">
        {/* Saasly Hero Section */}
        <section className="text-center space-y-8 pt-6 pb-12">
          {/* Rating Pill with Avatars */}
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-neutral-100 dark:bg-neutral-800/80 border border-hairline shadow-sm mx-auto">
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full bg-neutral-300 dark:bg-neutral-700 border-2 border-canvas flex items-center text-[10px] font-bold justify-center">A</div>
              <div className="w-6 h-6 rounded-full bg-neutral-400 dark:bg-neutral-600 border-2 border-canvas flex items-center text-[10px] font-bold justify-center">S</div>
              <div className="w-6 h-6 rounded-full bg-neutral-500 dark:bg-neutral-500 border-2 border-canvas flex items-center text-[10px] font-bold justify-center">F</div>
            </div>
            <span className="text-xs font-semibold text-ink">
              Portal Resmi Angkatan {angkatan} • Universitas Tadulako
            </span>
          </div>

          {/* Headline */}
          <div className="space-y-4 max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] text-ink">
              Pusat Kendali Akademik <span className="text-neutral-400 dark:text-neutral-500">Sistem Informasi A</span>
            </h1>
            <p className="text-base sm:text-lg text-ink-muted leading-relaxed max-w-2xl mx-auto">
              Pantau jadwal kuliah real-time, konfirmasi perubahan H-1, lacak tugas kelompok, dan unduh arsip materi dalam satu platform modern.
            </p>
          </div>

          {/* Action CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/admin"
              className="px-6 py-3.5 bg-ink text-canvas hover:bg-neutral-800 dark:hover:bg-neutral-200 dark:text-neutral-900 text-xs font-bold rounded-2xl shadow-xl transition-all flex items-center gap-2 group"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Login Admin (Komti/PJ)</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <div className="px-6 py-3.5 bg-canvas border border-hairline text-ink text-xs font-bold rounded-2xl shadow-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-ink-muted" />
              <span>Semester {activeSemester} • {academicYear}</span>
            </div>
          </div>
        </section>

        {/* Belum ada data state */}
        {allMasterSchedules.length === 0 && (
          <div className="border border-hairline rounded-3xl bg-canvas-subtle p-10 text-center space-y-4 shadow-sm max-w-2xl mx-auto">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-ink">
              <BookOpen className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-ink">Belum Ada Jadwal Mata Kuliah</h3>
              <p className="text-xs text-ink-muted max-w-sm mx-auto leading-relaxed">
                Portal sedang menunggu input data resmi dari pengurus kelas. Silakan login sebagai admin untuk mengisi jadwal.
              </p>
            </div>
            <div>
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-ink text-canvas text-xs font-bold rounded-xl hover:opacity-95 transition-opacity"
              >
                <span>Masuk ke Panel Admin</span>
              </Link>
            </div>
          </div>
        )}

        {/* Saasly Dashboard Mockup Container */}
        <div className="space-y-12 bg-neutral-50/50 dark:bg-neutral-900/40 border border-hairline rounded-[36px] p-6 sm:p-10 shadow-2xl backdrop-blur-sm">
          {/* Section 1: Jadwal Hari Ini */}
          <div className="bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 shadow-xl shadow-neutral-100/50 dark:shadow-none">
            <TodaySchedule
              dateStr={dateStr}
              formattedDate={formattedToday}
              schedules={mergedToday}
            />
          </div>

          {/* Section 2: Jadwal Mingguan */}
          <div className="bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 shadow-xl shadow-neutral-100/50 dark:shadow-none">
            <WeeklySchedule schedules={allMasterSchedules} />
          </div>

          {/* Section 3: Task Tracker */}
          <div className="bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 shadow-xl shadow-neutral-100/50 dark:shadow-none">
            <TaskList tasks={allTasks} />
          </div>

          {/* Section 4: Repositori Materi */}
          <div className="bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 shadow-xl shadow-neutral-100/50 dark:shadow-none">
            <MaterialArchive materials={allMaterials} />
          </div>
        </div>
      </main>

      <footer className="max-w-5xl mx-auto px-4 mt-24 pt-8 border-t border-hairline text-center text-xs text-ink-muted space-y-2">
        <p className="font-bold text-ink">Portal Kelas SI-A • Angkatan 2025 • Universitas Tadulako</p>
        <p className="text-[11px] font-mono">Saasly Design Language • Zero AI Slop • LibSQL & Next.js</p>
      </footer>
    </div>
  );
}
