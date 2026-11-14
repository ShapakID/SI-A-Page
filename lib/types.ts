export type DayOfWeek = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type ScheduleStatus = 'normal' | 'online' | 'rescheduled' | 'cancelled';

export interface Schedule {
  id: number;
  day_of_week: DayOfWeek;
  subject: string;
  lecturer: string;
  start_time: string; // e.g. "07:30"
  end_time: string;   // e.g. "09:30"
  room: string;
  semester: number;
  created_at?: string;
}

export interface ScheduleOverride {
  id: number;
  date: string; // format "YYYY-MM-DD"
  schedule_id: number;
  subject: string;
  lecturer: string;
  start_time: string;
  end_time: string;
  room: string;
  status: ScheduleStatus;
  note?: string | null;
  updated_by: string;
  updated_at?: string;
}

export interface MergedScheduleItem {
  schedule_id: number;
  override_id?: number | null;
  subject: string;
  lecturer: string;
  start_time: string;
  end_time: string;
  room: string;
  status: ScheduleStatus;
  note?: string | null;
  is_overridden: boolean;
  semester: number;
}

export type TaskCategory = 'tugas' | 'project' | 'uts_uas';
export type TaskStatus = 'active' | 'closed';

export interface Task {
  id: number;
  title: string;
  subject: string;
  category: TaskCategory;
  deadline: string; // ISO string or "YYYY-MM-DD HH:mm"
  description?: string | null;
  submission_url?: string | null;
  status: TaskStatus;
  created_by: string;
  created_at?: string;
}

export type MaterialType = 'slide' | 'ebook' | 'catatan' | 'rekaman';

export interface Material {
  id: number;
  title: string;
  subject: string;
  semester: number;
  lecturer?: string | null;
  drive_url: string;
  material_type: MaterialType;
  created_by: string;
  created_at?: string;
}
