import type { Schedule, ScheduleOverride, MergedScheduleItem } from './types.ts';

export function mergeSchedulesWithOverrides(
  masters: Schedule[],
  overrides: ScheduleOverride[]
): MergedScheduleItem[] {
  const overrideMap = new Map<number, ScheduleOverride>();
  for (const ov of overrides) {
    overrideMap.set(ov.schedule_id, ov);
  }

  const merged: MergedScheduleItem[] = masters.map((master) => {
    const ov = overrideMap.get(master.id);
    if (ov) {
      return {
        schedule_id: master.id,
        override_id: ov.id,
        subject: ov.subject || master.subject,
        lecturer: ov.lecturer || master.lecturer,
        start_time: ov.start_time || master.start_time,
        end_time: ov.end_time || master.end_time,
        room: ov.room || master.room,
        status: ov.status || 'normal',
        note: ov.note ?? null,
        is_overridden: true,
        semester: master.semester,
      };
    }

    return {
      schedule_id: master.id,
      override_id: null,
      subject: master.subject,
      lecturer: master.lecturer,
      start_time: master.start_time,
      end_time: master.end_time,
      room: master.room,
      status: 'normal',
      note: null,
      is_overridden: false,
      semester: master.semester,
    };
  });

  return merged.sort((a, b) => a.start_time.localeCompare(b.start_time));
}
