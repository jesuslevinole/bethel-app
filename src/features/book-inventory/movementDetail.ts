import type { BookMovement } from '../../types/index';
import { formatInvoiceNumber } from '../payments/services/paymentRecords';
import { OUT_REASON_LABELS } from './bookStock';

// Detalle de un movimiento en una línea: motivo de la salida, alumno e invoice de la venta, o notas.
export const describeMovement = (movement: BookMovement, studentNames: Map<string, string>) => {
  if (movement.kind === 'sale') {
    const student = movement.studentId ? studentNames.get(movement.studentId) : undefined;
    const invoice = movement.invoiceNumber ? formatInvoiceNumber(movement.invoiceNumber) : '';
    return [invoice, student].filter(Boolean).join(', ') || 'Venta registrada en Pagos';
  }
  const reason = movement.kind === 'out' && movement.reason ? OUT_REASON_LABELS[movement.reason] : '';
  return [reason, movement.notes].filter(Boolean).join(': ') || '—';
};
