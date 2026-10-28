import type { DateRange } from '../types/index';
import { todayIso } from './dateFormat';

const padNumber = (value: number) => String(value).padStart(2, '0');

const lastDayOfMonth = (year: number, month: number) => new Date(year, month, 0).getDate();

// Mes completo de una fecha AAAA-MM-DD (o de hoy).
export const getMonthRange = (isoDate = todayIso(), monthOffset = 0): DateRange => {
  const [year, month] = isoDate.split('-').map(Number);
  const shifted = new Date(year, month - 1 + monthOffset, 1);
  const shiftedYear = shifted.getFullYear();
  const shiftedMonth = shifted.getMonth() + 1;
  const prefix = `${shiftedYear}-${padNumber(shiftedMonth)}`;
  return { endDate: `${prefix}-${padNumber(lastDayOfMonth(shiftedYear, shiftedMonth))}`, startDate: `${prefix}-01` };
};

export const getYearRange = (isoDate = todayIso()): DateRange => {
  const year = isoDate.slice(0, 4);
  return { endDate: `${year}-12-31`, startDate: `${year}-01-01` };
};

export const isSameRange = (first: DateRange, second: DateRange) =>
  first.startDate === second.startDate && first.endDate === second.endDate;
