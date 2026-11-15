import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/auth';
import { isEmailWhitelisted } from '@/lib/auth-guard';
import { getSemesterNumber } from '@/lib/ui-helpers';
import { getDbClient, initDb } from '@/lib/db';
import type { Schedule, ScheduleOverride, Task, Material } from '@/lib/types';
import Link from 'next/link';
import { AdminCourseManager } from '@/components/admin/AdminCourseManager';
import { AdminScheduleManager } from '@/components/admin/AdminScheduleManager';
import { AdminTaskManager } from '@/components/admin/AdminTaskManager';
import { AdminMaterialManager } from '@/components/admin/AdminMaterialManager';
import { ArrowLeft, ShieldCheck, LogOut } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch (error) {
    console.error('[admin] getServerSession failed:', error);
    redirect('/admin/login');
  }

  const adminWhitelist = process.env.ADMIN_EMAILS || 'shapakid@gmail.com,zalfafya@gmail.com,awaasalwa07@gmail.com';
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
    <div className="min-h-screen bg-canvas pb-20">
      {/* Admin Topbar */}
      <header className="border-b border-hairline bg-canvas sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs text-ink-muted hover:text-ink flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Lihat Portal</span>
            </Link>
            <span className="text-hairline">|</span>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-ink" />
              <span className="text-xs font-semibold text-ink">Dashboard Admin SI-A</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-ink-muted hidden sm:inline">
              {session.user.email}
            </span>
            <Link
              href="/api/auth/signout"
              className="px-2.5 py-1 text-xs border border-hairline rounded hover:bg-neutral-100 text-ink flex items-center gap-1 transition-colors"
            >
              <LogOut className="w-3 h-3" />
              <span>Keluar</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="max-w-4xl mx-auto px-4 pt-8 space-y-10">
        <div>
          <h1 className="text-lg font-bold text-ink">Kelola Konten Perkuliahan</h1>
          <p className="text-xs text-ink-muted mt-0.5">
            Perubahan yang disimpan di halaman ini langsung tersinkron ke halaman publik mahasiswa SI-A.
          </p>
        </div>

        {/* 1. Master Mata Kuliah (harus pertama, jadi sumber subject untuk tugas & override) */}
        <section className="space-y-4">
          <div className="border-b border-hairline pb-2">
            <h2 className="text-sm font-semibold text-ink uppercase tracking-wider">
              1. Mata Kuliah & Jadwal Mingguan
            </h2>
          </div>
          <AdminCourseManager
            schedules={schedules}
            adminEmail={session.user.email}
            activeSemester={activeSemester}
          />
        </section>

        {/* 2. Schedule Override */}
        <section className="space-y-4">
          <div className="border-b border-hairline pb-2">
            <h2 className="text-sm font-semibold text-ink uppercase tracking-wider">
              2. Konfirmasi Jadwal H-1 (Perubahan / Dosen Berhalangan)
            </h2>
          </div>
          <AdminScheduleManager
            schedules={schedules}
            overrides={overrides}
            adminEmail={session.user.email}
          />
        </section>

        {/* 3. Tasks */}
        <section className="space-y-4">
          <div className="border-b border-hairline pb-2">
            <h2 className="text-sm font-semibold text-ink uppercase tracking-wider">
              3. Manajemen Tugas & Project
            </h2>
          </div>
          <AdminTaskManager
            tasks={tasks}
            adminEmail={session.user.email}
            subjects={subjects}
          />
        </section>

        {/* 4. Materials */}
        <section className="space-y-4">
          <div className="border-b border-hairline pb-2">
            <h2 className="text-sm font-semibold text-ink uppercase tracking-wider">
              4. Berkas Materi & Arsip Google Drive
            </h2>
          </div>
          <AdminMaterialManager materials={materials} adminEmail={session.user.email} />
        </section>
      </main>
    </div>
  );
}
