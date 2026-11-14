import type { MergedScheduleItem } from '@/lib/types';
import { getStatusBadge } from '@/lib/ui-helpers';
import { Clock, MapPin, User, AlertCircle } from 'lucide-react';

interface TodayScheduleProps {
  dateStr: string;
  formattedDate: string;
  schedules: MergedScheduleItem[];
}

export function TodaySchedule({ formattedDate, schedules }: TodayScheduleProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between border-b border-hairline pb-2">
        <div>
          <h2 className="text-sm font-semibold text-ink uppercase tracking-wider">Jadwal Hari Ini</h2>
          <p className="text-xs text-ink-muted mt-0.5">{formattedDate}</p>
        </div>
        <span className="text-xs font-mono text-ink-muted">{schedules.length} Sesi</span>
      </div>

      {schedules.length === 0 ? (
        <div className="p-8 text-center border border-hairline rounded-lg bg-canvas-subtle">
          <p className="text-sm text-ink-muted">Tidak ada perkuliahan hari ini. Nikmati istirahatmu!</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {schedules.map((item) => {
            const badge = getStatusBadge(item.status);
            const isCancelled = item.status === 'cancelled';

            return (
              <div
                key={item.schedule_id}
                className={`p-4 border rounded-lg transition-all ${
                  isCancelled
                    ? 'border-hairline bg-neutral-50/50 opacity-75'
                    : 'border-hairline bg-canvas hover:border-hairline-emphasis shadow-subtle'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded border ${badge.bg} ${badge.text} ${badge.border}`}
                      >
                        {badge.label}
                      </span>
                      {item.is_overridden && (
                        <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          Update H-1
                        </span>
                      )}
                    </div>
                    <h3 className={`font-semibold text-sm ${isCancelled ? 'line-through text-ink-muted' : 'text-ink'}`}>
                      {item.subject}
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono tabular-nums text-ink font-medium">
                      {item.start_time} - {item.end_time}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-hairline flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-muted">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{item.room}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>{item.lecturer}</span>
                  </div>
                </div>

                {item.note && (
                  <div className="mt-2.5 p-2 rounded bg-neutral-100 text-ink text-xs flex items-start gap-2 border border-neutral-200">
                    <AlertCircle className="w-3.5 h-3.5 text-ink-muted shrink-0 mt-0.5" />
                    <span>{item.note}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
