import { Plus } from 'lucide-react';
import { formatDate } from '../../../utils/dateFormat';
import { formatMoney } from '../../../utils/money';
import type { AccountRow } from '../accountRows';
import { ACCOUNT_STATUS_BADGES, ACCOUNT_STATUS_LABELS } from '../studentAccount';

interface AccountTableProps {
  onRegisterPayment?: (studentId: string) => void;
  rows: AccountRow[];
}

// Estado de cuenta de cada alumno inscrito: total, pagado, vencido a la fecha y saldo.
const AccountTable = ({ onRegisterPayment, rows }: AccountTableProps) => (
  <div className="table-wrap">
    <table className="table account-list">
      <thead>
        <tr>
          <th scope="col">Alumno</th>
          <th scope="col">Clase</th>
          <th className="cell-num" scope="col">
            Total programa
          </th>
          <th className="cell-num" scope="col">
            Pagado
          </th>
          <th className="cell-num" scope="col">
            Vencido
          </th>
          <th className="cell-num" scope="col">
            Saldo
          </th>
          <th scope="col">Estado</th>
          <th scope="col">Último pago</th>
          {onRegisterPayment && (
            <th scope="col">
              <span className="visually-hidden">Acciones</span>
            </th>
          )}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.enrollment.id}>
            <td>
              <span className="account-student">
                <span className="cell-strong">{row.studentName}</span>
                <span className="cell-id">{row.studentCode}</span>
              </span>
            </td>
            <td>{row.className}</td>
            <td className="cell-num">{formatMoney(row.account.programTotal)}</td>
            <td className="cell-num">{formatMoney(row.account.paid)}</td>
            <td className={`cell-num${row.account.overdue > 0 ? ' account-overdue' : ''}`}>
              {formatMoney(row.account.overdue)}
            </td>
            <td className="cell-num cell-strong">{formatMoney(row.account.balance)}</td>
            <td>
              <span className={ACCOUNT_STATUS_BADGES[row.status]}>{ACCOUNT_STATUS_LABELS[row.status]}</span>
            </td>
            <td className="cell-date">
              {row.account.lastPaymentDate ? formatDate(row.account.lastPaymentDate) : 'Sin pagos'}
            </td>
            {onRegisterPayment && (
              <td className="cell-actions">
                <button
                  className="btn btn-ghost btn-compact"
                  onClick={() => onRegisterPayment(row.enrollment.studentId)}
                  type="button"
                >
                  <Plus size={16} />
                  Pago
                </button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default AccountTable;
