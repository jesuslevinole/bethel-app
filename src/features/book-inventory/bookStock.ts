import type { BookMovement, BookMovementKind, BookOutReason, BookStock } from '../../types/index';

export const EMPTY_STOCK: BookStock = { in: 0, out: 0, sold: 0, stock: 0 };

// Existencias por libro: entradas menos salidas y ventas. Único lugar donde se calcula.
export const computeBookStock = (movements: BookMovement[]) => {
  const stockByBook = new Map<string, BookStock>();
  movements.forEach((movement) => {
    const current = stockByBook.get(movement.bookId) ?? EMPTY_STOCK;
    const quantity = Math.max(movement.quantity, 0);
    const next = {
      in: current.in + (movement.kind === 'in' ? quantity : 0),
      out: current.out + (movement.kind === 'out' ? quantity : 0),
      sold: current.sold + (movement.kind === 'sale' ? quantity : 0),
    };
    stockByBook.set(movement.bookId, { ...next, stock: next.in - next.out - next.sold });
  });
  return stockByBook;
};

export const MOVEMENT_KIND_LABELS: Record<BookMovementKind, string> = {
  in: 'Entrada',
  out: 'Salida',
  sale: 'Venta',
};

export const MOVEMENT_KIND_BADGES: Record<BookMovementKind, string> = {
  in: 'badge badge-success',
  out: 'badge badge-warning',
  sale: 'badge badge-info',
};

export const OUT_REASON_LABELS: Record<BookOutReason, string> = {
  damaged: 'Dañado',
  gift: 'Regalado',
  other: 'Otro motivo',
};

// Por debajo de esto se avisa que quedan pocos.
export const LOW_STOCK = 5;
