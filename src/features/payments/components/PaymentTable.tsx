import { FileText } from 'lucide-react';
import RowActions from '../../../shared/components/RowActions';
import type { Payment, RowPermissions } from '../../../types/index';
import { formatMonth } from '../../../utils/courseCost';
import { formatDate } from '../../../utils/dateFormat';
import { formatMoney } from '../../../utils/money';
import { getRelationName } from '../../../utils/relations';
import { formatInvoiceNumber } from '../services/paymentRecords';
import { useColumnLabels } from '../../customization/useColumnLabels';

interface PaymentTableProps {
  classNames: Map<string, string>;
  onDelete?: (payment: Payment) => void;
  onEdit?: (payment: Payment) => void;
  onOpenInvoice: (payment: Payment) => void;
  payments: Payment[];
  rowPermissions: RowPermissions;
  studentNames?: Map<string, string>;
}

const describeItems = (payment: Payment) =>
  payment.items
    .map((item) => (item.month ? `${item.paymentTypeName} ${formatMonth(item.month)}` : item.paymentTypeName))
    .join(', ');

// Histórico de pagos. Sin studentNames (vista del estudiante) no se muestra la columna Alumno.
const PaymentTable = ({
  classNames,
  onDelete,
  onEdit,
  onOpenInvoice,
  payments,
  rowPermissions,
  studentNames,
}: PaymentTableProps) => {
  const columnLabel = useColumnLabels('payments');

  return (
    <div className="table-wrap">
      <table className="table payment-table">
        <thead>
          <tr>
            <th scope="col">{columnLabel('invoice')}</th>
            <th scope="col">{columnLabel('date')}</th>
            {studentNames && <th scope="col">{columnLabel('student')}</th>}
            <th scope="col">{columnLabel('className')}</th>
            <th scope="col">{columnLabel('concepts')}</th>
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
          {payments.map((payment) => (
            <tr key={payment.id}>
              <td className="cell-id">{formatInvoiceNumber(payment.invoiceNumber)}</td>
              <td className="cell-date">{formatDate(payment.date)}</td>
              {studentNames && <td className="cell-strong">{getRelationName(studentNames, payment.studentId)}</td>}
              <td>{getRelationName(classNames, payment.classId)}</td>
              <td className="payment-concepts">{describeItems(payment)}</td>
              <td>
                {payment.incomeTypeName}
                {payment.bankName && <span className="payment-bank">{payment.bankName}</span>}
              </td>
              <td className="cell-num cell-strong">{formatMoney(payment.total)}</td>
              <td className="cell-actions">
                <div className="payment-row-actions">
                  <button className="btn btn-ghost btn-compact" onClick={() => onOpenInvoice(payment)} type="button">
                    <FileText size={16} />
                    Invoice
                  </button>
                  {onEdit && onDelete && (
                    <RowActions
                      canDelete={rowPermissions.canDelete}
                      canEdit={rowPermissions.canEdit}
                      itemLabel={`el pago ${formatInvoiceNumber(payment.invoiceNumber)}`}
                      onDelete={() => onDelete(payment)}
                      onEdit={() => onEdit(payment)}
                    />
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentTable;
