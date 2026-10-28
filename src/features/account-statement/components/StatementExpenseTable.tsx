import type { Expense } from '../../../types/index';
import { formatDate } from '../../../utils/dateFormat';
import { formatMoney } from '../../../utils/money';
import { useColumnLabels } from '../../customization/useColumnLabels';

interface StatementExpenseTableProps {
  expenses: Expense[];
}

// Salidas del rango: cada gasto con su categoría.
const StatementExpenseTable = ({ expenses }: StatementExpenseTableProps) => {
  const columnLabel = useColumnLabels('statementExpenses');

  return (
    <div className="table-wrap">
      <table className="table table-stack">
        <thead>
          <tr>
            <th scope="col">{columnLabel('date')}</th>
            <th scope="col">{columnLabel('category')}</th>
            <th scope="col">{columnLabel('description')}</th>
            <th className="cell-num" scope="col">
              {columnLabel('amount')}
            </th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr key={expense.id}>
              <td className="cell-date" data-label={columnLabel('date')}>
                {formatDate(expense.date)}
              </td>
              <td data-label={columnLabel('category')}>
                <span className="chip">{expense.categoryName}</span>
              </td>
              <td className="cell-strong" data-label={columnLabel('description')}>
                {expense.description}
              </td>
              <td className="cell-num cell-strong" data-label={columnLabel('amount')}>
                {formatMoney(expense.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StatementExpenseTable;
