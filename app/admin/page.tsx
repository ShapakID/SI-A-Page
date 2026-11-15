import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/auth';
import { isEmailWhitelisted, DEFAULT_ADMIN_EMAILS } from '@/lib/auth-guard';
import { getSemesterNumber } from '@/lib/ui-helpers';
import { getDbClient, initDb } from '@/lib/db';
import type { Schedule, ScheduleOverride, Task, Material } from '@/lib/types';
import Link from 'next/link';
import { AdminDashboardTabs } from '@/components/admin/AdminDashboardTabs';
import { ArrowLeft, ShieldCheck, LogOut, LayoutDashboard } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch (error) {
    console.error('[admin] getServerSession failed:', error);
    redirect('/admin/login');
  }

  const adminWhitelist = process.env.ADMIN_EMAILS || DEFAULT_ADMIN_EMAILS;
  if (!session?.user?.email || !isEmailWhitelisted(session.user.email, adminWhitelist)) {
    redirect('/admin/login');
  }

  const db = getDbClient();
  await initDb(db);

  const schedulesRes = await db.execute('SELECT * FROM schedules ORDER BY day_of_week ASC, start_time ASC');
  const schedules = schedulesRes.rows as unknown as Schedule[];

  const overridesRes = await db.execute('SELECT * FROM schedule_overrides ORDER BY date DESC');
  const overrides = overridesRes.rows as unknown as ScheduleOverride[];

  const tasksRes = await db.execute('SELECT * FROM tasks ORDER BY deadline ASC');
  const tasks = tasksRes.rows as unknown as Task[];

  const materialsRes = await db.execute('SELECT * FROM materials ORDER BY semester DESC, id DESC');
  const materials = materialsRes.rows as unknown as Material[];

  const angkatan = Number(process.env.NEXT_PUBLIC_ANGKATAN || 2025);
  const activeSemester = getSemesterNumber(new Date(), angkatan);
  const subjects = Array.from(new Set(schedules.map((s) => s.subject))).sort();

  return (
    <div className="min-h-screen bg-canvas pb-24">
      {/* Modern SaaS Header */}
      <header className="border-b border-hairline bg-canvas/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-xs font-medium text-ink-muted hover:text-ink flex items-center gap-1.5 transition-colors bg-neutral-100 dark:bg-neutral-800 py-1.5 px-3 rounded-xl"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Portal SI-A</span>
            </Link>
            <div className="h-4 w-px bg-hairline" />
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-ink">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-ink">Dashboard Admin</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-ink-muted bg-neutral-100 dark:bg-neutral-800/60 px-3 py-1.5 rounded-xl border border-hairline hidden sm:inline">
              {session.user.email}
            </span>
            <Link
              href="/api/auth/signout"
              className="px-3.5 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl flex items-center gap-1.5 transition-colors border border-red-200 dark:border-red-900/30"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-900 text-white dark:bg-neutral-900/80 p-8 rounded-3xl relative overflow-hidden shadow-2xl">
          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-[11px] font-medium tracking-wide">
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Pengurus Kelas SI-A 2025</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Pusat Kendali Portal</h1>
            <p className="text-xs text-neutral-400 max-w-lg leading-relaxed">
              Kelola seluruh data perkuliahan secara langsung. Perubahan akan instan tersambung ke seluruh mahasiswa SI-A.
            </p>
          </div>
        </div>

        {/* Tabbed Control Dashboard */}
        <AdminDashboardTabs
          schedules={schedules}
          overrides={overrides}
          tasks={tasks}
          materials={materials}
          adminEmail={session.user.email}
          activeSemester={activeSemester}
          subjects={subjects}
        />
      </main>
    </div>
  );
}
