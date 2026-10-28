import { collection, doc, runTransaction, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { COLLECTIONS } from '../../../lib/firebase/collections';
import type { NewRecord, Payment } from '../../../types/index';
import { writeBookSales } from '../../book-inventory/services/bookSales';

type PaymentData = Omit<NewRecord<Payment>, 'invoiceNumber'>;

const FIRST_INVOICE = 1;

// Pago nuevo con su número de invoice: el contador, el pago y sus ventas de libros se escriben juntos
// (transacción), así dos personas registrando a la vez nunca reciben el mismo número.
export const createPayment = async (data: PaymentData) => {
  const counterRef = doc(db, COLLECTIONS.counters, 'payments');
  const paymentRef = doc(collection(db, COLLECTIONS.payments));
  const invoiceNumber = await runTransaction(db, async (transaction) => {
    const counter = await transaction.get(counterRef);
    const next = counter.exists() ? Number(counter.data().next) || FIRST_INVOICE : FIRST_INVOICE;
    transaction.set(counterRef, { next: next + 1, updatedAt: serverTimestamp() });
    transaction.set(paymentRef, {
      ...data,
      createdAt: serverTimestamp(),
      invoiceNumber: next,
      updatedAt: serverTimestamp(),
    });
    writeBookSales(transaction, paymentRef.id, { ...data, invoiceNumber: next }, null);
    return next;
  });
  return { id: paymentRef.id, invoiceNumber };
};

// Al editar se conserva el número de invoice; las ventas de libros se rehacen con el pago.
export const updatePayment = async (payment: Payment, data: PaymentData) => {
  const batch = writeBatch(db);
  batch.update(doc(db, COLLECTIONS.payments, payment.id), { ...data, updatedAt: serverTimestamp() });
  writeBookSales(batch, payment.id, { ...data, invoiceNumber: payment.invoiceNumber }, payment);
  await batch.commit();
};

// Borrar un pago devuelve al inventario los libros que vendió.
export const deletePayment = async (payment: Payment) => {
  const batch = writeBatch(db);
  batch.delete(doc(db, COLLECTIONS.payments, payment.id));
  writeBookSales(batch, payment.id, null, payment);
  await batch.commit();
};

// "INV-000123"
export const formatInvoiceNumber = (invoiceNumber: number) => `INV-${String(invoiceNumber).padStart(6, '0')}`;
