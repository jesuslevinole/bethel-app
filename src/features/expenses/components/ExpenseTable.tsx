import RowActions from '../../../shared/components/RowActions';
import type { Expense, RowPermissions } from '../../../types/index';
import { formatDate } from '../../../utils/dateFormat';
import { formatMoney } from '../../../utils/money';
import { useColumnLabels } from '../../customization/useColumnLabels';
import { describeExpenseMethod } from '../expenseForm';

interface ExpenseTableProps {
  expenses: Expense[];
  onDelete: (expense: Expense) => void;
  onEdit: (expense: Expense) => void;
  rowPermissions: RowPermissions;
}

const ExpenseTable = ({ expenses, onDelete, onEdit, rowPermissions }: ExpenseTableProps) => {
  const columnLabel = useColumnLabels('expenses');

  return (
    <div className="table-wrap">
      <table className="table table-stack">
        <thead>
          <tr>
            <th scope="col">{columnLabel('date')}</th>
            <th scope="col">{columnLabel('category')}</th>
            <th scope="col">{columnLabel('description')}</th>
            <th scope="col">{columnLabel('method')}</th>
            <th className="cell-num" scope="col">
              {columnLabel('amount')}
            </th>
            <th scope="col">
              <span className="visually-hidden">Acciones</span>
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
                {expense.notes && <span className="cell-note">{expense.notes}</span>}
              </td>
              <td className="cell-muted" data-label={columnLabel('method')}>
                {describeExpenseMethod(expense)}
              </td>
              <td className="cell-num cell-strong" data-label={columnLabel('amount')}>
                {formatMoney(expense.amount)}
              </td>
              <td className="cell-actions">
                <RowActions
                  canDelete={rowPermissions.canDelete}
                  canEdit={rowPermissions.canEdit}
                  itemLabel={`el gasto ${expense.description}`}
                  onDelete={() => onDelete(expense)}
                  onEdit={() => onEdit(expense)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExpenseTable;
