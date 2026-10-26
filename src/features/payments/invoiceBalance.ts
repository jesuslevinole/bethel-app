import type { CourseCost, Payment } from '../../types/index';
import { getProgramTotal } from '../../utils/courseCost';
import { roundMoney, sumMoney } from '../../utils/money';

export interface InvoiceBalance {
  balanceAfter: number;
  balanceBefore: number;
  paidToDate: number;
  programTotal: number;
}

const isUpTo = (candidate: Payment, payment: Payment) =>
  candidate.date < payment.date ||
  (candidate.date === payment.date && candidate.invoiceNumber <= payment.invoiceNumber);

// Saldo del alumno justo antes y justo después de ESTE pago (no el de hoy): así un invoice viejo
// siempre muestra lo mismo aunque después lleguen más pagos.
export const getInvoiceBalance = (
  cost: CourseCost | null,
  studentPayments: Payment[],
  payment: Payment,
): InvoiceBalance | null => {
  if (!cost) return null;
  const programTotal = getProgramTotal(cost);
  const paidToDate = sumMoney(
    studentPayments.filter((candidate) => isUpTo(candidate, payment)).map((candidate) => candidate.total),
  );
  const balanceAfter = roundMoney(Math.max(programTotal - paidToDate, 0));
  return {
    balanceAfter,
    balanceBefore: roundMoney(Math.max(programTotal - paidToDate + payment.total, 0)),
    paidToDate,
    programTotal,
  };
};
