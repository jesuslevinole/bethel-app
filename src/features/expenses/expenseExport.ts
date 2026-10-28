import type { ExportColumn } from '../../shared/export/exportToExcel';
import type { Expense } from '../../types/index';
import { formatDate } from '../../utils/dateFormat';
import { describeExpenseMethod } from './expenseForm';

export const EXPENSE_EXPORT_COLUMNS: ExportColumn<Expense>[] = [
  { header: 'Fecha', value: (expense) => formatDate(expense.date), width: 12 },
  { header: 'Categoría', value: (expense) => expense.categoryName, width: 22 },
  { header: 'Descripción', value: (expense) => expense.description, width: 40 },
  { header: 'Forma de pago', value: describeExpenseMethod, width: 22 },
  { header: 'Monto', value: (expense) => expense.amount, width: 12 },
  { header: 'Notas', value: (expense) => expense.notes, width: 30 },
];
