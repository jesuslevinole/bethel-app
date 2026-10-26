import type {
  Bank,
  Enrollment,
  IncomeType,
  NewRecord,
  Payment,
  PaymentItem,
  PaymentType,
  StudentAccount,
} from '../../types/index';
import { formatMonth } from '../../utils/courseCost';
import { todayIso } from '../../utils/dateFormat';
import { roundMoney, sumMoney } from '../../utils/money';
import { getChargeKind } from './chargeKinds';

// Línea editable del formulario: rowId solo existe en pantalla.
export interface PaymentItemRow {
  amount: number;
  description: string;
  month: string;
  paymentTypeId: string;
  rowId: string;
}

export interface PaymentFormValues {
  bankId: string;
  date: string;
  incomeTypeId: string;
  items: PaymentItemRow[];
  notes: string;
  studentId: string;
}

export const createItemRow = (item?: Partial<PaymentItem>): PaymentItemRow => ({
  amount: item?.amount ?? 0,
  description: item?.description ?? '',
  month: item?.month ?? '',
  paymentTypeId: item?.paymentTypeId ?? '',
  rowId: crypto.randomUUID(),
});

export const toPaymentFormValues = (payment: Payment | null, studentId = ''): PaymentFormValues => ({
  bankId: payment?.bankId ?? '',
  date: payment?.date ?? todayIso(),
  incomeTypeId: payment?.incomeTypeId ?? '',
  items: payment?.items.length ? payment.items.map(createItemRow) : [createItemRow()],
  notes: payment?.notes ?? '',
  studentId: payment?.studentId ?? studentId,
});

interface PaymentCatalogs {
  banks: Bank[];
  incomeTypes: IncomeType[];
  paymentTypes: PaymentType[];
}

const findName = (items: { id: string; name: string }[], id: string) => items.find((item) => item.id === id)?.name ?? '';

export const getPaymentTypeKind = (paymentTypes: PaymentType[], paymentTypeId: string) =>
  getChargeKind(findName(paymentTypes, paymentTypeId));

// Monto y mes sugeridos al elegir el tipo de pago: lo que le falta de ese concepto
// (en mensualidades, el primer mes que no está pagado ni ya puesto en otra línea).
export const suggestItem = (
  kind: ReturnType<typeof getChargeKind>,
  account: StudentAccount | null,
  otherRows: PaymentItemRow[],
): Pick<PaymentItemRow, 'amount' | 'month'> => {
  if (!account) return { amount: 0, month: '' };
  if (kind === 'monthly') {
    const takenMonths = new Set(otherRows.map((row) => row.month).filter(Boolean));
    const nextMonth = account.months.find((status) => status.paid < status.due && !takenMonths.has(status.month));
    return nextMonth ? { amount: roundMoney(nextMonth.due - nextMonth.paid), month: nextMonth.month } : { amount: 0, month: '' };
  }
  if (kind === 'other') return { amount: 0, month: '' };
  return { amount: roundMoney(Math.max(account.charges[kind] - account.paidByKind[kind], 0)), month: '' };
};

const getFilledItems = (items: PaymentItemRow[]) => items.filter((item) => item.paymentTypeId || item.amount > 0);

interface PaymentValidationContext extends PaymentCatalogs {
  enrollment: Enrollment | null;
}

export const validatePayment = (values: PaymentFormValues, context: PaymentValidationContext) => {
  if (!values.studentId) return 'Elige el alumno.';
  if (!context.enrollment) return 'El alumno no está inscrito en este período. Inscríbelo primero.';
  if (!values.date) return 'Escribe la fecha del pago.';
  if (!values.incomeTypeId) return 'Elige la forma de pago.';
  const usesBank = context.incomeTypes.find((type) => type.id === values.incomeTypeId)?.usesBank ?? false;
  if (usesBank && !values.bankId) return 'Elige el banco donde se depositó.';
  const items = getFilledItems(values.items);
  if (items.length === 0) return 'Agrega al menos un concepto.';
  if (items.some((item) => !item.paymentTypeId)) return 'Cada concepto necesita su tipo de pago.';
  if (items.some((item) => item.amount <= 0)) return 'Cada concepto necesita su monto.';
  const missingMonth = items.find(
    (item) => getPaymentTypeKind(context.paymentTypes, item.paymentTypeId) === 'monthly' && !item.month,
  );
  if (missingMonth) return 'Elige el mes de cada mensualidad.';
  return null;
};

// Lo que se guarda: con los nombres de tipo de pago, forma de pago y banco copiados (ver types/payments.ts).
export const toPaymentData = (
  values: PaymentFormValues,
  enrollment: Enrollment,
  catalogs: PaymentCatalogs,
): Omit<NewRecord<Payment>, 'invoiceNumber'> => {
  const usesBank = catalogs.incomeTypes.find((type) => type.id === values.incomeTypeId)?.usesBank ?? false;
  const items: PaymentItem[] = getFilledItems(values.items).map((item) => {
    const isMonthly = getPaymentTypeKind(catalogs.paymentTypes, item.paymentTypeId) === 'monthly';
    return {
      amount: item.amount,
      description: isMonthly ? formatMonth(item.month) : item.description.trim(),
      month: isMonthly ? item.month : '',
      paymentTypeId: item.paymentTypeId,
      paymentTypeName: findName(catalogs.paymentTypes, item.paymentTypeId),
    };
  });
  return {
    bankId: usesBank ? values.bankId : '',
    bankName: usesBank ? findName(catalogs.banks, values.bankId) : '',
    classId: enrollment.classId,
    date: values.date,
    incomeTypeId: values.incomeTypeId,
    incomeTypeName: findName(catalogs.incomeTypes, values.incomeTypeId),
    items,
    notes: values.notes.trim(),
    periodId: enrollment.periodId,
    studentId: values.studentId,
    total: sumMoney(items.map((item) => item.amount)),
  };
};
