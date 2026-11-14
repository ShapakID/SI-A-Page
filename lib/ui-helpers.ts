import type { DayOfWeek, ScheduleStatus, TaskCategory, Material } from './types.ts';

export function getDayOfWeek(date: Date): DayOfWeek {
  const day = date.getDay(); // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
  return day === 0 ? 7 : (day as DayOfWeek);
}

export function formatIndonesianDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const dayName = days[date.getDay()];
  const dayNum = date.getDate();
  const monthName = months[date.getMonth()];
  const year = date.getFullYear();

  return `${dayName}, ${dayNum} ${monthName} ${year}`;
}

export function getCategoryBadge(category: TaskCategory): {
  label: string;
  bg: string;
  text: string;
  border: string;
} {
  switch (category) {
    case 'project':
      return {
        label: 'Project',
        bg: 'bg-neutral-100',
        text: 'text-neutral-800 font-medium',
        border: 'border-neutral-300',
      };
    case 'uts_uas':
      return {
        label: 'UTS / UAS',
        bg: 'bg-neutral-900',
        text: 'text-white font-medium',
        border: 'border-neutral-900',
      };
    case 'tugas':
    default:
      return {
        label: 'Tugas',
        bg: 'bg-neutral-50',
        text: 'text-neutral-600',
        border: 'border-neutral-200',
      };
  }
}

export function getStatusBadge(status: ScheduleStatus): {
  label: string;
  bg: string;
  text: string;
  border: string;
} {
  switch (status) {
    case 'online':
      return {
        label: 'Online',
        bg: 'bg-sky-50',
        text: 'text-sky-800 font-medium',
        border: 'border-sky-200',
      };
    case 'rescheduled':
      return {
        label: 'Digeser',
        bg: 'bg-amber-50',
        text: 'text-amber-800 font-medium',
        border: 'border-amber-200',
      };
    case 'cancelled':
      return {
        label: 'Ditiadakan',
        bg: 'bg-rose-50',
        text: 'text-rose-800 font-medium',
        border: 'border-rose-200',
      };
    case 'normal':
    default:
      return {
        label: 'Normal',
        bg: 'bg-neutral-50',
        text: 'text-neutral-700',
        border: 'border-neutral-200',
      };
  }
}

export function filterMaterials(
  materials: Material[],
  semester?: number,
  searchQuery?: string
): Material[] {
  return materials.filter((m) => {
    if (semester && m.semester !== semester) {
      return false;
    }
    if (searchQuery && searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = m.title.toLowerCase().includes(q);
      const matchSubject = m.subject.toLowerCase().includes(q);
      return matchTitle || matchSubject;
    }
    return true;
  });
}
