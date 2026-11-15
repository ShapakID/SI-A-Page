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
import { Sparkles, Calendar, BookOpen } from 'lucide-react';

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
    <div className="min-h-screen bg-canvas pb-24">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 space-y-12">
        {/* Saasly Hero Banner */}
        <section className="bg-neutral-900 text-white dark:bg-neutral-900/90 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-medium tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Portal Resmi Angkatan {angkatan}</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">Sistem Informasi A</h1>
              <p className="text-xs sm:text-sm text-neutral-400 max-w-md leading-relaxed">
                Universitas Tadulako • Semester {activeSemester} ({academicYear})
              </p>
            </div>

            <div className="flex flex-row md:flex-col items-start md:items-end gap-3 shrink-0">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono bg-white/10 text-neutral-200 border border-white/10">
                <Calendar className="w-3.5 h-3.5" />
                <span>WITA (UTC+8)</span>
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                {formattedToday}
              </span>
            </div>
          </div>
        </section>

        {/* Belum ada data state */}
        {allMasterSchedules.length === 0 && (
          <div className="border border-hairline rounded-3xl bg-canvas-subtle p-8 text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-ink">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-ink">Belum Ada Jadwal Mata Kuliah</h3>
              <p className="text-xs text-ink-muted max-w-sm mx-auto">
                Portal sedang menunggu input data resmi dari pengurus kelas (Komti / PJ).
              </p>
            </div>
            <div>
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 px-4 py-2 bg-ink text-canvas text-xs font-bold rounded-xl hover:opacity-95 transition-opacity"
              >
                <span>Masuk sebagai Admin</span>
              </Link>
            </div>
          </div>
        )}

        {/* Quick Stats / Sections Grid */}
        <div className="space-y-12">
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

      <footer className="max-w-4xl mx-auto px-4 mt-20 pt-8 border-t border-hairline text-center text-xs text-ink-muted space-y-2">
        <p className="font-semibold text-ink">Portal Kelas SI-A • Angkatan 2025</p>
        <p className="text-[11px]">Dikembangkan untuk efisiensi perkuliahan bersama • Zero AI Slop • LibSQL</p>
      </footer>
    </div>
  );
}
