import type { Bank, Expense, ExpenseCategory, IncomeType, NewRecord } from '../../types/index';
import { todayIso } from '../../utils/dateFormat';

export interface ExpenseFormValues {
  amount: number;
  bankId: string;
  categoryId: string;
  date: string;
  description: string;
  incomeTypeId: string;
  notes: string;
}

export const toExpenseFormValues = (expense: Expense | null): ExpenseFormValues => ({
  amount: expense?.amount ?? 0,
  bankId: expense?.bankId ?? '',
  categoryId: expense?.categoryId ?? '',
  date: expense?.date ?? todayIso(),
  description: expense?.description ?? '',
  incomeTypeId: expense?.incomeTypeId ?? '',
  notes: expense?.notes ?? '',
});

export interface ExpenseCatalogs {
  banks: Bank[];
  categories: ExpenseCategory[];
  incomeTypes: IncomeType[];
}

const findName = (items: { id: string; name: string }[], id: string) =>
  items.find((item) => item.id === id)?.name ?? '';

export const validateExpense = (values: ExpenseFormValues, catalogs: ExpenseCatalogs) => {
  if (!values.date) return 'Escribe la fecha del gasto.';
  if (!values.categoryId) return 'Elige la categoría.';
  if (!values.description.trim()) return 'Escribe en qué se gastó.';
  if (values.amount <= 0) return 'Escribe el monto.';
  const usesBank = catalogs.incomeTypes.find((type) => type.id === values.incomeTypeId)?.usesBank ?? false;
  if (usesBank && !values.bankId) return 'Elige el banco de donde salió.';
  return null;
};

// Lo que se guarda, con los nombres copiados (como en los pagos).
export const toExpenseData = (values: ExpenseFormValues, catalogs: ExpenseCatalogs): NewRecord<Expense> => {
  const usesBank = catalogs.incomeTypes.find((type) => type.id === values.incomeTypeId)?.usesBank ?? false;
  return {
    amount: values.amount,
    bankId: usesBank ? values.bankId : '',
    bankName: usesBank ? findName(catalogs.banks, values.bankId) : '',
    categoryId: values.categoryId,
    categoryName: findName(catalogs.categories, values.categoryId),
    date: values.date,
    description: values.description.trim(),
    incomeTypeId: values.incomeTypeId,
    incomeTypeName: findName(catalogs.incomeTypes, values.incomeTypeId),
    notes: values.notes.trim(),
  };
};

export const describeExpenseMethod = (expense: Expense) =>
  [expense.incomeTypeName, expense.bankName].filter(Boolean).join(', ') || '—';
