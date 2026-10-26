import { collection, doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { COLLECTIONS } from '../../../lib/firebase/collections';
import { paymentsService } from '../../../services/paymentsService';
import type { NewRecord, Payment } from '../../../types/index';

type PaymentData = Omit<NewRecord<Payment>, 'invoiceNumber'>;

const FIRST_INVOICE = 1;

// Pago nuevo con su número de invoice: el contador y el pago se escriben juntos (transacción),
// así dos personas registrando a la vez nunca reciben el mismo número.
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
    return next;
  });
  return { id: paymentRef.id, invoiceNumber };
};

// Al editar se conserva el número de invoice.
export const updatePayment = (paymentId: string, data: PaymentData) => paymentsService.update(paymentId, data);

export const deletePayment = (payment: Payment) => paymentsService.delete(payment.id);

// "INV-000123"
export const formatInvoiceNumber = (invoiceNumber: number) => `INV-${String(invoiceNumber).padStart(6, '0')}`;
