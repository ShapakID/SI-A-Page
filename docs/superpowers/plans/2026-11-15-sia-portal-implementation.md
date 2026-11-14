# SI-A Portal (SI-A-Page) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first, zero-AI-slop web portal for class SI-A featuring dynamic H-1 schedules, task tracking, and lecture materials, deployed on Vercel with Turso database and Google OAuth.

**Architecture:** Next.js App Router fullstack application styled with Cal.com design tokens. Data is persisted in Turso (LibSQL SQLite) with read-only public access for students and server-side protected actions for class admins authenticated via Google OAuth with environment variable email whitelisting.

**Tech Stack:** Next.js 15 (App Router, TypeScript), Tailwind CSS, @libsql/client, NextAuth v5, Lucide React.

**Spec:** `docs/superpowers/specs/2026-11-15-sia-portal-design.md`

## Global Constraints

- Design strictly adheres to `DESIGN.md` (Cal.com tokens: #111111 ink, #ffffff canvas, #f8f9fa surface-soft, 1px #e5e7eb hairline, rounded-md 8px, rounded-lg 12px, zero AI slop).
- Repo is public: Zero credentials or personal lecturer phone numbers hardcoded in source code or Git history.
- Node.js >= 20, TypeScript strict mode enabled.
- Database access only via `@libsql/client` (LibSQL protocol over HTTPS).

## Review Focus

- Multi-slot daily schedule collisions (e.g. theoretical lecture and practical lab on the same day).
- Tamper resistance on server actions (unauthenticated caller cannot create, modify, or delete schedules, tasks, or materials).
- Schedule override fallback (if override exists for date D, it supersedes master schedule; if no override, master schedule renders seamlessly).
- Case-insensitivity in email whitelist validation (`shapak@gmail.com` matches `SHAPAK@GMAIL.COM`).
- Personal task checkoff isolation (student toggling completed task only updates their own `localStorage`, never touching Turso DB).

---

### Task 1: Repository Initialization & Design System Setup

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, `next.config.ts`, `app/globals.css`, `app/layout.tsx`, `app/page.tsx`, `.gitignore`, `.env.example`
- Test: `tests/design-tokens.test.ts`

**Interfaces:**
- Produces: Base Next.js app running with Tailwind configured to `DESIGN.md` color and typography tokens.

- [ ] **Step 1: Write the failing test for design tokens and project configuration**
Create `tests/design-tokens.test.ts` asserting that `tailwind.config.ts` exports theme colors matching `DESIGN.md` (`primary: '#111111'`, `canvas: '#ffffff'`, `hairline: '#e5e7eb'`).

- [ ] **Step 2: Run test to verify it fails**
Run: `npx tsx tests/design-tokens.test.ts`
Expected: FAIL (file or config missing)

- [ ] **Step 3: Scaffold Next.js TypeScript project & configure Tailwind with Cal.com tokens**
Initialize Next.js App Router, install dependencies (`tailwindcss`, `postcss`, `autoprefixer`, `clsx`, `tailwind-merge`, `lucide-react`), configure `tailwind.config.ts` and `app/globals.css` with Cal.com tokens. Set up `.gitignore` preventing `.env*` leaks.

- [ ] **Step 4: Run test to verify it passes**
Run: `npx tsx tests/design-tokens.test.ts`
Expected: PASS

- [ ] **Step 5: Initialize Git and initial commit**
Initialize git repo, add remote `https://github.com/ShapakID/SI-A-Page.git`, commit clean scaffold.

---

### Task 2: Database Layer & Schedule Merge Algorithm

**Files:**
- Create: `lib/db.ts`, `lib/schema.sql`, `lib/schedule-merger.ts`
- Test: `tests/schedule-merger.test.ts`, `tests/db-connection.test.ts`

**Interfaces:**
- Produces:
  - `getDbClient(): Client` (LibSQL client supporting local SQLite or Turso HTTP)
  - `mergeSchedulesWithOverrides(masters: Schedule[], overrides: ScheduleOverride[]): MergedScheduleItem[]`

- [ ] **Step 1: Write failing tests for schedule merge algorithm**
In `tests/schedule-merger.test.ts`:
1. Normal day with only master schedules returns all master items sorted by start time.
2. Schedule with matching `schedule_id` override replaces time, room, status, and note.
3. Master subject with override status `cancelled` flags item correctly.
4. Multiple slots on same day (e.g. RPL Teori and RPL Praktikum) override only targeted `schedule_id`.

- [ ] **Step 2: Run test to verify it fails**
Run: `npx tsx tests/schedule-merger.test.ts`
Expected: FAIL (module not found)

- [ ] **Step 3: Implement `lib/schema.sql`, `lib/db.ts`, and `lib/schedule-merger.ts`**
Implement schema creation script matching design doc (`schedules`, `schedule_overrides`, `tasks`, `materials`). Implement pure algorithm `mergeSchedulesWithOverrides`.

- [ ] **Step 4: Run test to verify it passes**
Run: `npx tsx tests/schedule-merger.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**
`git add lib/ tests/ && git commit -m "feat(db): implement schema, db client, and schedule merger"`

---

### Task 3: Authentication & Security Guard

**Files:**
- Create: `auth.ts`, `lib/auth-guard.ts`
- Test: `tests/auth-guard.test.ts`

**Interfaces:**
- Produces:
  - `isEmailWhitelisted(email: string | null | undefined, whitelistCsv: string | undefined): boolean`
  - `assertAdminSession(session: any): { email: string, name: string }`

- [ ] **Step 1: Write failing tests for whitelist validation and session guard**
In `tests/auth-guard.test.ts`:
1. Valid whitelisted email (case-insensitive, trimmed) returns true.
2. Non-whitelisted email returns false.
3. Null or undefined email returns false.
4. `assertAdminSession` throws `Error("Unauthorized")` when session is absent or email is not whitelisted.

- [ ] **Step 2: Run test to verify it fails**
Run: `npx tsx tests/auth-guard.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement `lib/auth-guard.ts` and `auth.ts` configuration**
Implement pure function `isEmailWhitelisted` and `assertAdminSession`. Setup Auth.js / NextAuth v5 Google provider config with session callbacks.

- [ ] **Step 4: Run test to verify it passes**
Run: `npx tsx tests/auth-guard.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**
`git add auth.ts lib/auth-guard.ts tests/auth-guard.test.ts && git commit -m "feat(auth): implement Google OAuth guard and email whitelist"`

---

### Task 4: Public View (Mobile-First Portal)

**Files:**
- Create: `app/page.tsx`, `components/Header.tsx`, `components/TodaySchedule.tsx`, `components/WeeklySchedule.tsx`, `components/TaskList.tsx`, `components/MaterialArchive.tsx`
- Test: `tests/public-view-logic.test.ts`

**Interfaces:**
- Consumes: `mergeSchedulesWithOverrides`, `getDbClient`
- Produces: Interactive React UI honoring Cal.com design tokens, tabs for Jadwal Hari Ini, Jadwal Mingguan, Tugas, and Materi.

- [ ] **Step 1: Write test for date formatting, category badges, and personal task storage logic**
In `tests/public-view-logic.test.ts`, test pure helper formatting and filtering functions: day-of-week calculation, category badge styling mapping ('project' -> purple/blue, 'uts_uas' -> red, 'tugas' -> neutral), and semester filtering.

- [ ] **Step 2: Run test to verify it fails**
Run: `npx tsx tests/public-view-logic.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement UI components**
Build `TodaySchedule` with dynamic status pills (normal, online, digeser, libur), `WeeklySchedule` Monday-Friday accordion/tabs, `TaskList` with client-side localStorage checklist, and `MaterialArchive` with semester & subject dropdown filters.

- [ ] **Step 4: Run test to verify it passes**
Run: `npx tsx tests/public-view-logic.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**
`git commit -m "feat(ui): implement mobile-first public portal components"`

---

### Task 5: Admin Dashboard & Server Actions

**Files:**
- Create: `app/admin/page.tsx`, `app/actions/schedule-actions.ts`, `app/actions/task-actions.ts`, `app/actions/material-actions.ts`
- Test: `tests/admin-actions.test.ts`

**Interfaces:**
- Consumes: `assertAdminSession`, `getDbClient`
- Produces:
  - `saveScheduleOverride(date: string, scheduleId: number, data: OverrideInput)`
  - `createTask(data: TaskInput)`, `updateTaskStatus(id: number, status: string)`, `deleteTask(id: number)`
  - `createMaterial(data: MaterialInput)`, `deleteMaterial(id: number)`

- [ ] **Step 1: Write failing test for action guards**
In `tests/admin-actions.test.ts`, simulate server action calls without valid admin session and assert rejection with error.

- [ ] **Step 2: Run test to verify it fails**
Run: `npx tsx tests/admin-actions.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement server actions and admin UI**
Implement server actions with `revalidatePath('/')`. Build simple modal/forms in `app/admin/page.tsx` for quick H-1 schedule edits, task creation, and Google Drive material links.

- [ ] **Step 4: Run test to verify it passes**
Run: `npx tsx tests/admin-actions.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**
`git commit -m "feat(admin): implement admin panel and protected server actions"`

---

### Task 6: Seeding, Build Verification & Vercel Deployment Setup

**Files:**
- Create: `scripts/seed.ts`, `README.md`
- Test: `npm run build`

**Interfaces:**
- Produces: Production build passing without type or lint errors, seed script with SI-A schedule pre-populated, verified Git push to https://github.com/ShapakID/SI-A-Page.

- [ ] **Step 1: Write seed script for SI-A semester schedule**
Pre-populate SI-A courses: Kecerdasan Buatan (Sen 07.30), Keamanan Sistem Informasi (Sen 13.00), Rekayasa Perangkat Lunak (Sen 15.30), Praktikum RPL (Sel 10.00), Analisis & Perancangan Sistem Informasi (Rab 10.00), Bahasa Inggris (Kam 13.00), Pendidikan Karakter (Kam 14.20), Tata Kelola TI (Jum 07.30).

- [ ] **Step 2: Run seed script locally**
Run: `npx tsx scripts/seed.ts`
Expected: Database seeded with 8 courses.

- [ ] **Step 3: Run production Next.js build**
Run: `npm run build`
Expected: Build passes with exit code 0.

- [ ] **Step 4: Push to GitHub repository**
Run: `git push -u origin main`
Expected: Remote `ShapakID/SI-A-Page` updated.

- [ ] **Step 5: Guide Vercel environment variables & deployment connection**
Provide exact list of environment variables to paste into Vercel Project Settings and trigger deployment.
