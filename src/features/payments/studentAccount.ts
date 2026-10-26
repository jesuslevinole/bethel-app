import type { ChargeKind, CourseCost, MonthStatus, Payment, StudentAccount } from '../../types/index';
import { getBooksTotal, getCourseTotal, getProgramTotal } from '../../utils/courseCost';
import { roundMoney, sumMoney } from '../../utils/money';
import { getChargeKind } from './chargeKinds';

// "AAAA-MM" de una fecha AAAA-MM-DD.
const toMonth = (isoDate: string) => isoDate.slice(0, 7);

const EMPTY_PAID: Record<ChargeKind, number> = { books: 0, enrollment: 0, graduation: 0, monthly: 0, other: 0 };

// Estado de cuenta de un alumno en un período, con la regla de la hoja de PAGOS:
// - Se cobra inscripción + libros + graduación + la mensualidad de cada mes (Costos del curso de su clase).
// - Vencido a la fecha = inscripción y libros (al empezar) + mensualidades de los meses ya llegados
//   + graduación desde el último mes; menos todo lo pagado. Saldo = total del programa − pagado.
export const buildStudentAccount = (cost: CourseCost | null, payments: Payment[], today: string): StudentAccount => {
  const currentMonth = toMonth(today);
  const items = payments.flatMap((payment) => payment.items);
  const paidByKind = { ...EMPTY_PAID };
  items.forEach((item) => {
    const kind = getChargeKind(item.paymentTypeName);
    paidByKind[kind] = roundMoney(paidByKind[kind] + item.amount);
  });
  const paid = sumMoney(items.map((item) => item.amount));

  const monthlyFees = cost?.monthlyFees ?? [];
  const paidByMonth = new Map<string, number>();
  items
    .filter((item) => item.month && getChargeKind(item.paymentTypeName) === 'monthly')
    .forEach((item) => paidByMonth.set(item.month, roundMoney((paidByMonth.get(item.month) ?? 0) + item.amount)));
  const months: MonthStatus[] = monthlyFees.map((fee) => ({
    due: fee.amount,
    isDue: fee.month <= currentMonth,
    month: fee.month,
    paid: paidByMonth.get(fee.month) ?? 0,
  }));

  const lastMonth = monthlyFees[monthlyFees.length - 1]?.month ?? '';
  const charges = {
    books: cost ? getBooksTotal(cost.books) : 0,
    enrollment: cost?.enrollmentFee ?? 0,
    graduation: cost?.graduationFee ?? 0,
    monthly: cost ? getCourseTotal(cost) : 0,
  };
  const dueMonthly = sumMoney(months.filter((status) => status.isDue).map((status) => status.due));
  const dueGraduation = lastMonth && currentMonth >= lastMonth ? charges.graduation : 0;
  const dueToDate = sumMoney([charges.enrollment, charges.books, dueMonthly, dueGraduation]);
  const programTotal = cost ? getProgramTotal(cost) : 0;
  const dates = payments.map((payment) => payment.date).sort();

  return {
    balance: roundMoney(Math.max(programTotal - paid, 0)),
    charges,
    dueToDate,
    lastPaymentDate: dates[dates.length - 1] ?? null,
    months,
    overdue: roundMoney(Math.max(dueToDate - paid, 0)),
    overdueMonths: months.filter((status) => status.isDue && status.paid < status.due).map((status) => status.month),
    paid,
    paidByKind,
    programTotal,
  };
};

export type AccountStatus = 'overdue' | 'paid' | 'pending';

// Debe = tiene algo vencido; Al día = sin vencido pero con saldo del resto del programa; Pagado = saldo 0.
export const getAccountStatus = (account: StudentAccount): AccountStatus => {
  if (account.overdue > 0) return 'overdue';
  if (account.balance > 0) return 'pending';
  return 'paid';
};

export const ACCOUNT_STATUS_LABELS: Record<AccountStatus, string> = {
  overdue: 'Debe',
  paid: 'Pagado',
  pending: 'Al día',
};

export const ACCOUNT_STATUS_BADGES: Record<AccountStatus, string> = {
  overdue: 'badge badge-danger',
  paid: 'badge badge-success',
  pending: 'badge badge-muted',
};
