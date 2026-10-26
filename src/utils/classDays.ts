import { INSTITUTE } from '../config/institute';
import type { AcademicPeriod, AcademicSemester } from '../types/index';
import { shiftIsoDate } from './dateFormat';

export const SEMESTER_NAMES = ['Primer semestre', 'Segundo semestre'];
const DAYS_PER_WEEK = 7;

export interface ClassDate {
  date: string;
  // 0 = primer semestre, 1 = segundo; null si el período no tiene semestres.
  semesterIndex: number | null;
}

const getWeekday = (isoDate: string) => {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day).getDay();
};

export const isClassWeekday = (isoDate: string) => getWeekday(isoDate) === INSTITUTE.classWeekday;

// Los rangos con clases: los semestres, o el período completo si aún no los tiene.
export const getPeriodRanges = (period: AcademicPeriod): AcademicSemester[] =>
  period.semesters?.length ? period.semesters : [{ endDate: period.endDate, startDate: period.startDate }];

// Todos los días de clase (miércoles) del período, del primero al último, dentro de los semestres.
export const listClassDates = (period: AcademicPeriod): ClassDate[] => {
  const hasSemesters = Boolean(period.semesters?.length);
  return getPeriodRanges(period).flatMap((range, index) => {
    const offset = (INSTITUTE.classWeekday - getWeekday(range.startDate) + DAYS_PER_WEEK) % DAYS_PER_WEEK;
    const dates: ClassDate[] = [];
    for (let date = shiftIsoDate(range.startDate, offset); date <= range.endDate; date = shiftIsoDate(date, DAYS_PER_WEEK)) {
      dates.push({ date, semesterIndex: hasSemesters ? index : null });
    }
    return dates;
  });
};

// Semestre de una fecha (null si cae fuera de los semestres o el período no los tiene).
export const getSemesterIndex = (period: AcademicPeriod, isoDate: string) => {
  const index = (period.semesters ?? []).findIndex((range) => isoDate >= range.startDate && isoDate <= range.endDate);
  return index >= 0 ? index : null;
};

// Día de clase con el que abre la asistencia: el último que ya pasó (o hoy), o el primero si aún no empieza.
export const pickDefaultClassDate = (dates: string[], today: string) =>
  [...dates].reverse().find((date) => date <= today) ?? dates[0] ?? '';

// Sugerencia: el período partido a la mitad (el segundo semestre empieza el día siguiente).
export const suggestSemesters = (startDate: string, endDate: string): AcademicSemester[] | null => {
  if (!startDate || !endDate || endDate <= startDate) return null;
  const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
  const [endYear, endMonth, endDay] = endDate.split('-').map(Number);
  const totalDays = Math.round(
    (new Date(endYear, endMonth - 1, endDay).getTime() - new Date(startYear, startMonth - 1, startDay).getTime()) /
      (24 * 60 * 60 * 1000),
  );
  const firstEnd = shiftIsoDate(startDate, Math.floor(totalDays / 2));
  return [
    { endDate: firstEnd, startDate },
    { endDate, startDate: shiftIsoDate(firstEnd, 1) },
  ];
};

// Semestre de una materia (1 o 2) en texto corto; '' si no tiene.
const SEMESTER_SHORT_NAMES = ['1er semestre', '2do semestre'];
export const SEMESTER_OPTIONS = [1, 2].map((semester) => ({ label: SEMESTER_NAMES[semester - 1], value: String(semester) }));
export const getSemesterLabel = (semester: number | undefined) =>
  semester === 1 || semester === 2 ? SEMESTER_SHORT_NAMES[semester - 1] : '';

// Solo las clases guardadas en un día de clase del período (miércoles dentro de los semestres).
// Fechas guardadas en otro día no se muestran ni cuentan en promedios ni asistencia.
export const keepClassSessions = <Session extends { date: string }>(sessions: Session[], period: AcademicPeriod) => {
  const classDates = new Set(listClassDates(period).map((classDate) => classDate.date));
  return sessions.filter((session) => classDates.has(session.date));
};
