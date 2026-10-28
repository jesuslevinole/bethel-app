import type { Expense, Payment } from '../../types/index';
import { roundMoney, sumMoney } from '../../utils/money';

export interface StatementGroup {
  amount: number;
  count: number;
  name: string;
}

// Una línea del estado de cuenta (entrada o salida) con el saldo acumulado hasta ella.
export interface StatementLine {
  amount: number;
  balance: number;
  date: string;
  detail: string;
  id: string;
  kind: 'expense' | 'income';
}

export interface AccountStatement {
  balance: number;
  expenseByCategory: StatementGroup[];
  expenseTotal: number;
  incomeByMethod: StatementGroup[];
  incomeTotal: number;
  lines: StatementLine[];
}

const groupBy = <Item>(items: Item[], getName: (item: Item) => string, getAmount: (item: Item) => number) => {
  const groups = new Map<string, StatementGroup>();
  items.forEach((item) => {
    const name = getName(item) || 'Sin especificar';
    const current = groups.get(name) ?? { amount: 0, count: 0, name };
    groups.set(name, { amount: roundMoney(current.amount + getAmount(item)), count: current.count + 1, name });
  });
  return [...groups.values()].sort((first, second) => second.amount - first.amount);
};

// Entradas (pagos) y salidas (gastos) de un rango de fechas. Único lugar donde se suman.
export const buildAccountStatement = (
  payments: Payment[],
  expenses: Expense[],
  describePayment: (payment: Payment) => string,
): AccountStatement => {
  const incomeTotal = sumMoney(payments.map((payment) => payment.total));
  const expenseTotal = sumMoney(expenses.map((expense) => expense.amount));
  const unsorted = [
    ...payments.map((payment) => ({
      amount: payment.total,
      date: payment.date,
      detail: describePayment(payment),
      id: `income-${payment.id}`,
      kind: 'income' as const,
    })),
    ...expenses.map((expense) => ({
      amount: expense.amount,
      date: expense.date,
      detail: `${expense.categoryName}: ${expense.description}`,
      id: `expense-${expense.id}`,
      kind: 'expense' as const,
    })),
  ].sort((first, second) => first.date.localeCompare(second.date) || first.kind.localeCompare(second.kind));
  let running = 0;
  const lines = unsorted.map((line) => {
    running = roundMoney(running + (line.kind === 'income' ? line.amount : -line.amount));
    return { ...line, balance: running };
  });
  return {
    balance: roundMoney(incomeTotal - expenseTotal),
    expenseByCategory: groupBy(
      expenses,
      (expense) => expense.categoryName,
      (expense) => expense.amount,
    ),
    expenseTotal,
    incomeByMethod: groupBy(
      payments,
      (payment) => payment.incomeTypeName,
      (payment) => payment.total,
    ),
    incomeTotal,
    lines,
  };
};
