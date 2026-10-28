import type { ExportColumn } from '../../shared/export/exportToExcel';
import { formatDate } from '../../utils/dateFormat';
import type { StatementLine } from './statementData';

export const STATEMENT_EXPORT_COLUMNS: ExportColumn<StatementLine>[] = [
  { header: 'Fecha', value: (line) => formatDate(line.date), width: 12 },
  { header: 'Tipo', value: (line) => (line.kind === 'income' ? 'Entrada' : 'Salida'), width: 10 },
  { header: 'Detalle', value: (line) => line.detail, width: 48 },
  { header: 'Entrada', value: (line) => (line.kind === 'income' ? line.amount : null), width: 12 },
  { header: 'Salida', value: (line) => (line.kind === 'expense' ? line.amount : null), width: 12 },
  { header: 'Saldo', value: (line) => line.balance, width: 12 },
];
