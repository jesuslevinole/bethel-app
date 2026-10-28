import { doc, serverTimestamp, type DocumentData, type DocumentReference } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { COLLECTIONS } from '../../../lib/firebase/collections';
import type { BookMovement, NewRecord, Payment, PaymentItem } from '../../../types/index';

// Ventas de libros de un pago: un movimiento por libro (sumando las cantidades), con id fijo
// sale-<pago>-<libro>, así editar o borrar el pago rehace o borra exactamente sus ventas.
type SalePayment = Pick<Payment, 'date' | 'invoiceNumber' | 'items' | 'studentId'>;

const saleId = (paymentId: string, bookId: string) => `sale-${paymentId}-${bookId}`;

const bookItems = (items: PaymentItem[]) => items.filter((item) => item.bookId && (item.quantity ?? 0) > 0);

const buildSales = (paymentId: string, payment: SalePayment) => {
  const byBook = new Map<string, { bookName: string; quantity: number }>();
  bookItems(payment.items).forEach((item) => {
    const bookId = item.bookId ?? '';
    const current = byBook.get(bookId);
    byBook.set(bookId, {
      bookName: current?.bookName ?? item.description.replace(/ × \d+$/, ''),
      quantity: (current?.quantity ?? 0) + (item.quantity ?? 0),
    });
  });
  return [...byBook].map(([bookId, sale]) => ({
    data: {
      bookId,
      bookName: sale.bookName,
      date: payment.date,
      invoiceNumber: payment.invoiceNumber,
      kind: 'sale' as const,
      notes: '',
      paymentId,
      quantity: sale.quantity,
      studentId: payment.studentId,
    } satisfies NewRecord<BookMovement>,
    id: saleId(paymentId, bookId),
  }));
};

// Una transacción o un lote (writeBatch): los dos saben set y delete.
interface Writer {
  delete(documentRef: DocumentReference): unknown;
  set(documentRef: DocumentReference, data: DocumentData): unknown;
}

// Escribe las ventas de un pago dentro de la misma transacción o lote que el pago.
// previous = el pago como estaba antes (al editar o borrar), para quitar las ventas que ya no van.
export const writeBookSales = (
  writer: Writer,
  paymentId: string,
  payment: SalePayment | null,
  previous: SalePayment | null,
) => {
  const nextSales = payment ? buildSales(paymentId, payment) : [];
  const nextIds = new Set(nextSales.map((sale) => sale.id));
  const previousIds = previous ? buildSales(paymentId, previous).map((sale) => sale.id) : [];
  previousIds.filter((id) => !nextIds.has(id)).forEach((id) => writer.delete(doc(db, COLLECTIONS.bookMovements, id)));
  nextSales.forEach(({ data, id }) =>
    writer.set(doc(db, COLLECTIONS.bookMovements, id), { ...data, updatedAt: serverTimestamp() }),
  );
};

export const hasBookSales = (payment: SalePayment | null) => Boolean(payment && bookItems(payment.items).length > 0);
