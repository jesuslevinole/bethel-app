// Movimiento del inventario de libros: entrada (llegan libros), salida (dañado, regalado u otro) o venta.
// Las ventas las escribe Pagos al guardar un concepto de libro (paymentId); se borran y rehacen con el pago.
export type BookMovementKind = 'in' | 'out' | 'sale';

export type BookOutReason = 'damaged' | 'gift' | 'other';

export interface BookMovement {
  bookId: string;
  // Copia del nombre del libro: la lista de movimientos se lee sin buscar el catálogo.
  bookName: string;
  date: string;
  id: string;
  // Solo en ventas: número del invoice y alumno.
  invoiceNumber?: number;
  kind: BookMovementKind;
  notes: string;
  paymentId?: string;
  quantity: number;
  // Solo en salidas.
  reason?: BookOutReason;
  studentId?: string;
}

// Existencias de un libro calculadas con sus movimientos (features/book-inventory/bookStock.ts).
export interface BookStock {
  in: number;
  out: number;
  sold: number;
  stock: number;
}
