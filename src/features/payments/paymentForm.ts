import type {
  Bank,
  Book,
  BookStock,
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
  // Libro que se entrega (conceptos de Libros): sale del inventario.
  bookId: string;
  description: string;
  month: string;
  paymentTypeId: string;
  quantity: number;
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
  bookId: item?.bookId ?? '',
  description: item?.description ?? '',
  month: item?.month ?? '',
  paymentTypeId: item?.paymentTypeId ?? '',
  quantity: item?.quantity ?? 1,
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

const findName = (items: { id: string; name: string }[], id: string) =>
  items.find((item) => item.id === id)?.name ?? '';

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
    return nextMonth
      ? { amount: roundMoney(nextMonth.due - nextMonth.paid), month: nextMonth.month }
      : { amount: 0, month: '' };
  }
  if (kind === 'other') return { amount: 0, month: '' };
  return { amount: roundMoney(Math.max(account.charges[kind] - account.paidByKind[kind], 0)), month: '' };
};

const getFilledItems = (items: PaymentItemRow[]) => items.filter((item) => item.paymentTypeId || item.amount > 0);

interface PaymentValidationContext extends PaymentCatalogs {
  books: Book[];
  enrollment: Enrollment | null;
  // Libros que este mismo pago ya había sacado (al editar vuelven a estar disponibles).
  previousBookQuantities: Map<string, number>;
  // null = no se pueden leer las existencias (no se revisa).
  stockByBook: Map<string, BookStock> | null;
}

// Cuántos libros de cada uno pide el pago (sumando líneas).
export const countRequestedBooks = (items: PaymentItemRow[]) => {
  const requested = new Map<string, number>();
  items
    .filter((item) => item.bookId)
    .forEach((item) => requested.set(item.bookId, (requested.get(item.bookId) ?? 0) + item.quantity));
  return requested;
};

const findStockProblem = (values: PaymentFormValues, context: PaymentValidationContext) => {
  if (!context.stockByBook) return null;
  const stockByBook = context.stockByBook;
  const shortBook = [...countRequestedBooks(values.items)].find(([bookId, quantity]) => {
    const available = (stockByBook.get(bookId)?.stock ?? 0) + (context.previousBookQuantities.get(bookId) ?? 0);
    return quantity > available;
  });
  if (!shortBook) return null;
  const [bookId] = shortBook;
  const available = (stockByBook.get(bookId)?.stock ?? 0) + (context.previousBookQuantities.get(bookId) ?? 0);
  const bookName = context.books.find((book) => book.id === bookId)?.name ?? 'ese libro';
  return available > 0
    ? `Solo quedan ${available} de "${bookName}" en el inventario.`
    : `No quedan libros de "${bookName}". Registra la entrada en Inventario de libros.`;
};

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
  if (items.some((item) => item.bookId && (!Number.isInteger(item.quantity) || item.quantity < 1))) {
    return 'Escribe cuántos libros se entregan (1 o más).';
  }
  return findStockProblem(values, context);
};

// Lo que se guarda: con los nombres de tipo de pago, forma de pago y banco copiados (ver types/payments.ts).
export const toPaymentData = (
  values: PaymentFormValues,
  enrollment: Enrollment,
  catalogs: PaymentCatalogs & { books: Book[] },
): Omit<NewRecord<Payment>, 'invoiceNumber'> => {
  const usesBank = catalogs.incomeTypes.find((type) => type.id === values.incomeTypeId)?.usesBank ?? false;
  const items: PaymentItem[] = getFilledItems(values.items).map((item) => {
    const kind = getPaymentTypeKind(catalogs.paymentTypes, item.paymentTypeId);
    const isMonthly = kind === 'monthly';
    const book = kind === 'books' ? catalogs.books.find((candidate) => candidate.id === item.bookId) : undefined;
    const baseItem: PaymentItem = {
      amount: item.amount,
      description: isMonthly ? formatMonth(item.month) : item.description.trim(),
      month: isMonthly ? item.month : '',
      paymentTypeId: item.paymentTypeId,
      paymentTypeName: findName(catalogs.paymentTypes, item.paymentTypeId),
    };
    if (!book) return baseItem;
    const quantityText = item.quantity > 1 ? ` × ${item.quantity}` : '';
    return { ...baseItem, bookId: book.id, description: `${book.name}${quantityText}`, quantity: item.quantity };
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
