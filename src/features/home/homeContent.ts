import { PATHS } from '../../routes/paths';
import type { RoleKind } from '../../types/index';
import { INSTITUTE } from '../../config/institute';
import { formatLongDate, shiftIsoDate, todayIso } from '../../utils/dateFormat';

// Qué accesos van primero en Inicio según el tipo de persona (lo demás sigue en el orden del menú).
const PRIORITY_BY_KIND: Record<RoleKind, string[]> = {
  staff: [
    PATHS.admissions,
    PATHS.payments,
    PATHS.enrollments,
    PATHS.attendance,
    PATHS.students,
    PATHS.accountStatement,
  ],
  student: [PATHS.myApplication, PATHS.myProfile, PATHS.myPayments],
  teacher: [PATHS.attendance, PATHS.teacherAssignments],
};

export const sortForHome = <Item extends { path: string }>(items: Item[], kind: RoleKind) => {
  const priority = PRIORITY_BY_KIND[kind];
  const rankOf = (item: Item) => {
    const index = priority.indexOf(item.path);
    return index >= 0 ? index : priority.length + items.indexOf(item);
  };
  return [...items].filter((item) => item.path !== PATHS.home).sort((first, second) => rankOf(first) - rankOf(second));
};

export const getGreeting = (hour = new Date().getHours()) => {
  if (hour < 12) return 'Buenos días';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
};

const weekdayOf = (isoDate: string) => {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day).getDay();
};

// "Hoy hay clase" o cuándo es la próxima (las clases son solo los miércoles).
export const describeNextClass = (today = todayIso()) => {
  const daysUntil = (INSTITUTE.classWeekday - weekdayOf(today) + 7) % 7;
  if (daysUntil === 0) return 'Hoy hay clase.';
  if (daysUntil === 1) return 'Mañana hay clase.';
  return `La próxima clase es el ${formatLongDate(shiftIsoDate(today, daysUntil))}.`;
};

export const getFirstName = (fullName: string) => fullName.trim().split(/\s+/)[0] ?? '';
