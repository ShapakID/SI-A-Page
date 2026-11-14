'use client';

import { useState } from 'react';
import type { Schedule, DayOfWeek } from '@/lib/types';
import { Clock, MapPin, User } from 'lucide-react';

interface WeeklyScheduleProps {
  schedules: Schedule[];
}

const DAYS: { id: DayOfWeek; name: string }[] = [
  { id: 1, name: 'Senin' },
  { id: 2, name: 'Selasa' },
  { id: 3, name: 'Rabu' },
  { id: 4, name: 'Kamis' },
  { id: 5, name: 'Jumat' },
];

export function WeeklySchedule({ schedules }: WeeklyScheduleProps) {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(1);

  const filtered = schedules
    .filter((s) => s.day_of_week === selectedDay)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between border-b border-hairline pb-2">
        <h2 className="text-sm font-semibold text-ink uppercase tracking-wider">Jadwal Mingguan</h2>
        <span className="text-xs text-ink-muted">Semester {schedules[0]?.semester || 3}</span>
      </div>

      {/* Day Pills Navigation */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {DAYS.map((day) => {
          const isSelected = selectedDay === day.id;
          const count = schedules.filter((s) => s.day_of_week === day.id).length;

          return (
            <button
              key={day.id}
              onClick={() => setSelectedDay(day.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors shrink-0 flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-ink text-canvas shadow-subtle'
                  : 'bg-canvas border border-hairline text-ink-muted hover:text-ink hover:bg-canvas-subtle'
              }`}
            >
              <span>{day.name}</span>
              <span
                className={`text-[10px] px-1 py-0.2 rounded-full ${
                  isSelected ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-100 text-neutral-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Day Content */}
      {filtered.length === 0 ? (
        <div className="p-8 text-center border border-hairline rounded-lg bg-canvas-subtle">
          <p className="text-xs text-ink-muted">Tidak ada jadwal kuliah di hari ini.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-3.5 border border-hairline rounded-lg bg-canvas hover:border-hairline-emphasis transition-all shadow-subtle"
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-medium text-sm text-ink">{item.subject}</h4>
                <span className="text-xs font-mono tabular-nums text-ink-muted shrink-0">
                  {item.start_time} - {item.end_time}
                </span>
              </div>
              <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{item.room}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>{item.lecturer}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
