import type { AcademicPeriod, CourseBook, CourseCost, MonthlyFee } from '../types/index';
import { formatMoney, sumMoney } from './money';

export const getBooksTotal = (books: CourseBook[]) => sumMoney(books.map((book) => book.amount));

// Total curso = la suma de las mensualidades de todos los meses.
export const getCourseTotal = (cost: Pick<CourseCost, 'monthlyFees'>) =>
  sumMoney((cost.monthlyFees ?? []).map((fee) => fee.amount));

// Lo que paga un alumno en todo el programa: inscripción + libros + graduación + total curso.
export const getProgramTotal = (cost: Pick<CourseCost, 'books' | 'enrollmentFee' | 'graduationFee' | 'monthlyFees'>) =>
  sumMoney([cost.enrollmentFee, getBooksTotal(cost.books), cost.graduationFee, getCourseTotal(cost)]);

// "$55.00 × 9 · $25.00 × 1": montos iguales seguidos se agrupan (meses con $0 no cuentan).
export const summarizeMonthlyFees = (fees: MonthlyFee[] | undefined) => {
  const groups: { amount: number; count: number }[] = [];
  (fees ?? [])
    .filter((fee) => fee.amount > 0)
    .forEach((fee) => {
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.amount === fee.amount) lastGroup.count += 1;
      else groups.push({ amount: fee.amount, count: 1 });
    });
  if (groups.length === 0) return '—';
  return groups.map((group) => `${formatMoney(group.amount)} × ${group.count}`).join(' · ');
};

export const countPaidMonths = (fees: MonthlyFee[] | undefined) => (fees ?? []).filter((fee) => fee.amount > 0).length;

// Los meses del período (AAAA-MM), del mes de inicio al de fin.
export const listPeriodMonths = (period: Pick<AcademicPeriod, 'endDate' | 'startDate'>) => {
  const months: string[] = [];
  let [year, month] = period.startDate.split('-').map(Number);
  const [endYear, endMonth] = period.endDate.split('-').map(Number);
  while (year < endYear || (year === endYear && month <= endMonth)) {
    months.push(`${year}-${String(month).padStart(2, '0')}`);
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }
  return months;
};

const MONTH_FORMAT = new Intl.DateTimeFormat('es', { month: 'long', year: 'numeric' });

// "2026-10" → "Octubre 2026".
export const formatMonth = (month: string) => {
  const [year, monthNumber] = month.split('-').map(Number);
  const text = MONTH_FORMAT.format(new Date(year, monthNumber - 1, 1)).replace(' de ', ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
};
