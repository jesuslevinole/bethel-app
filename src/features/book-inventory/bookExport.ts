import type { ExportColumn } from '../../shared/export/exportToExcel';
import type { BookMovement } from '../../types/index';
import { formatDate } from '../../utils/dateFormat';
import type { BookStockRow } from './bookRows';
import { MOVEMENT_KIND_LABELS } from './bookStock';
import { describeMovement } from './movementDetail';

export const BOOK_STOCK_EXPORT_COLUMNS: ExportColumn<BookStockRow>[] = [
  { header: 'Código', value: (row) => row.book.code ?? '', width: 12 },
  { header: 'Libro', value: (row) => row.book.name, width: 44 },
  { header: 'Clase', value: (row) => row.className, width: 12 },
  { header: 'Entrada', value: (row) => row.stock.in, width: 10 },
  { header: 'Salida', value: (row) => row.stock.out, width: 10 },
  { header: 'Venta', value: (row) => row.stock.sold, width: 10 },
  { header: 'Stock', value: (row) => row.stock.stock, width: 10 },
  { header: 'Precio', value: (row) => row.book.price ?? null, width: 10 },
];

export const buildMovementExportColumns = (studentNames: Map<string, string>): ExportColumn<BookMovement>[] => [
  { header: 'Fecha', value: (movement) => formatDate(movement.date), width: 12 },
  { header: 'Libro', value: (movement) => movement.bookName, width: 44 },
  { header: 'Movimiento', value: (movement) => MOVEMENT_KIND_LABELS[movement.kind], width: 12 },
  { header: 'Cantidad', value: (movement) => movement.quantity, width: 10 },
  { header: 'Detalle', value: (movement) => describeMovement(movement, studentNames), width: 40 },
];
