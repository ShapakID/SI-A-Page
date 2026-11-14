-- Master Weekly Schedule
CREATE TABLE IF NOT EXISTS schedules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  day_of_week INTEGER NOT NULL, -- 1=Senin, 2=Selasa, ..., 7=Minggu
  subject TEXT NOT NULL,
  lecturer TEXT NOT NULL,
  start_time TEXT NOT NULL,      -- format "HH:mm" e.g. "07:30"
  end_time TEXT NOT NULL,        -- format "HH:mm" e.g. "09:30"
  room TEXT NOT NULL,
  semester INTEGER NOT NULL DEFAULT 3,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Daily Overrides (H-1 / Specific Date Changes)
CREATE TABLE IF NOT EXISTS schedule_overrides (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,            -- format "YYYY-MM-DD"
  schedule_id INTEGER NOT NULL,  -- reference to schedules(id)
  subject TEXT NOT NULL,
  lecturer TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  room TEXT NOT NULL,
  status TEXT NOT NULL,          -- 'normal', 'online', 'rescheduled', 'cancelled'
  note TEXT,
  updated_by TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(schedule_id) REFERENCES schedules(id) ON DELETE CASCADE,
  UNIQUE(date, schedule_id)
);

-- Tasks
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  category TEXT NOT NULL,        -- 'tugas', 'project', 'uts_uas'
  deadline TEXT NOT NULL,        -- ISO string or "YYYY-MM-DD HH:mm"
  description TEXT,
  submission_url TEXT,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'closed'
  created_by TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Materials & Semester Archive
CREATE TABLE IF NOT EXISTS materials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  semester INTEGER NOT NULL,     -- 1, 2, 3, etc.
  lecturer TEXT,
  drive_url TEXT NOT NULL,
  material_type TEXT NOT NULL,   -- 'slide', 'ebook', 'catatan', 'rekaman'
  created_by TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
