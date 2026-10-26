import type { AcademicPeriod } from '../types/index';
import { isDateWithin, todayIso } from './dateFormat';

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const getMonthYear = (isoDate: string) => {
  const [year, month] = isoDate.split('-');
  return `${MONTH_NAMES[Number(month) - 1]} ${year}`;
};

// "Julio 2026 – Abril 2027" a partir de las fechas de inicio y fin.
export const suggestPeriodName = (startDate: string, endDate: string) =>
  startDate && endDate ? `${getMonthYear(startDate)} – ${getMonthYear(endDate)}` : '';

// Período por defecto: el que contiene hoy; si ninguno, el que empieza más pronto en el futuro;
// si tampoco, el más reciente. La lista llega ordenada por inicio, del más nuevo al más viejo.
export const getDefaultPeriod = (periods: AcademicPeriod[], today = todayIso()) =>
  periods.find((period) => isDateWithin(today, period.startDate, period.endDate)) ??
  [...periods].reverse().find((period) => period.startDate > today) ??
  periods[0] ??
  null;

export const isDuplicatePeriodName = (periods: AcademicPeriod[], name: string, ownId?: string) =>
  periods.some((period) => period.id !== ownId && period.name.trim().toLowerCase() === name.trim().toLowerCase());
