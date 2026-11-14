import { getDbClient, initDb } from '@/lib/db';
import { mergeSchedulesWithOverrides } from '@/lib/schedule-merger';
import { getDayOfWeek, formatIndonesianDate } from '@/lib/ui-helpers';
import type { Schedule, ScheduleOverride, Task, Material } from '@/lib/types';
import { Header } from '@/components/Header';
import { TodaySchedule } from '@/components/TodaySchedule';
import { WeeklySchedule } from '@/components/WeeklySchedule';
import { TaskList } from '@/components/TaskList';
import { MaterialArchive } from '@/components/MaterialArchive';

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

  const activeSemester = Number(process.env.NEXT_PUBLIC_ACTIVE_SEMESTER || 3);

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
    <div className="min-h-screen bg-canvas pb-20">
      <Header />

      <main className="max-w-2xl mx-auto px-4 pt-6 space-y-10">
        {/* Banner / Class Identity */}
        <section className="border-b border-hairline pb-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-ink">Sistem Informasi A</h1>
              <p className="text-xs text-ink-muted mt-0.5">
                Universitas Tadulako • Semester {activeSemester} (2024/2025)
              </p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-neutral-100 text-neutral-800 border border-hairline">
                WITA (UTC+8)
              </span>
            </div>
          </div>
        </section>

        {/* Section 1: Jadwal Hari Ini */}
        <TodaySchedule
          dateStr={dateStr}
          formattedDate={formattedToday}
          schedules={mergedToday}
        />

        {/* Section 2: Jadwal Mingguan */}
        <WeeklySchedule schedules={allMasterSchedules} />

        {/* Section 3: Task Tracker */}
        <TaskList tasks={allTasks} />

        {/* Section 4: Repositori Materi */}
        <MaterialArchive materials={allMaterials} />
      </main>

      <footer className="max-w-2xl mx-auto px-4 mt-16 pt-6 border-t border-hairline text-center text-xs text-ink-muted space-y-1">
        <p>Portal Kelas SI-A • Dikembangkan untuk efisiensi perkuliahan bersama.</p>
        <p className="font-mono text-[10px]">Zero AI Slop • Cal.com Design Tokens • LibSQL</p>
      </footer>
    </div>
  );
}
