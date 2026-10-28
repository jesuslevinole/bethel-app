import type { Payment } from '../../../types/index';
import { formatDate } from '../../../utils/dateFormat';
import { formatMoney } from '../../../utils/money';
import { useColumnLabels } from '../../customization/useColumnLabels';
import { formatInvoiceNumber } from '../../payments/services/paymentRecords';

interface StatementIncomeTableProps {
  payments: Payment[];
  studentNames: Map<string, string>;
}

// Entradas del rango: cada pago con su invoice.
const StatementIncomeTable = ({ payments, studentNames }: StatementIncomeTableProps) => {
  const columnLabel = useColumnLabels('statementIncome');

  return (
    <div className="table-wrap">
      <table className="table table-stack">
        <thead>
          <tr>
            <th scope="col">{columnLabel('date')}</th>
            <th scope="col">{columnLabel('invoice')}</th>
            <th scope="col">{columnLabel('student')}</th>
            <th scope="col">{columnLabel('method')}</th>
            <th className="cell-num" scope="col">
              {columnLabel('amount')}
            </th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr key={payment.id}>
              <td className="cell-date" data-label={columnLabel('date')}>
                {formatDate(payment.date)}
              </td>
              <td className="cell-id" data-label={columnLabel('invoice')}>
                {formatInvoiceNumber(payment.invoiceNumber)}
              </td>
              <td className="cell-strong" data-label={columnLabel('student')}>
                {studentNames.get(payment.studentId) ?? '—'}
              </td>
              <td className="cell-muted" data-label={columnLabel('method')}>
                {payment.incomeTypeName || '—'}
              </td>
              <td className="cell-num cell-strong" data-label={columnLabel('amount')}>
                {formatMoney(payment.total)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StatementIncomeTable;
