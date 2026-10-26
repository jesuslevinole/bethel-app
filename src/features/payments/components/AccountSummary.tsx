import type { StudentAccount } from '../../../types/index';
import { formatMoney, roundMoney } from '../../../utils/money';
import { CHARGE_LABELS } from '../chargeKinds';

interface AccountSummaryProps {
  account: StudentAccount;
}

const CHARGE_ORDER = ['enrollment', 'books', 'monthly', 'graduation'] as const;

// Estado de cuenta: lo que se cobra por concepto, lo pagado, lo vencido a la fecha y el saldo.
const AccountSummary = ({ account }: AccountSummaryProps) => (
  <div className="account-summary">
    <table className="account-table">
      <thead>
        <tr>
          <th scope="col">Concepto</th>
          <th scope="col">Cargo</th>
          <th scope="col">Pagado</th>
          <th scope="col">Falta</th>
        </tr>
      </thead>
      <tbody>
        {CHARGE_ORDER.map((kind) => {
          const missing = roundMoney(Math.max(account.charges[kind] - account.paidByKind[kind], 0));
          return (
            <tr key={kind}>
              <th scope="row">{CHARGE_LABELS[kind]}</th>
              <td>{formatMoney(account.charges[kind])}</td>
              <td>{formatMoney(account.paidByKind[kind])}</td>
              <td className={missing > 0 ? 'is-missing' : undefined}>{formatMoney(missing)}</td>
            </tr>
          );
        })}
        {account.paidByKind.other > 0 && (
          <tr>
            <th scope="row">Otros pagos</th>
            <td>—</td>
            <td>{formatMoney(account.paidByKind.other)}</td>
            <td>—</td>
          </tr>
        )}
      </tbody>
    </table>
    <dl className="account-totals">
      <div className="account-total">
        <dt>Total del programa</dt>
        <dd>{formatMoney(account.programTotal)}</dd>
      </div>
      <div className="account-total">
        <dt>Pagado</dt>
        <dd>{formatMoney(account.paid)}</dd>
      </div>
      <div className={`account-total${account.overdue > 0 ? ' is-overdue' : ''}`}>
        <dt>Vencido a la fecha</dt>
        <dd>{formatMoney(account.overdue)}</dd>
      </div>
      <div className="account-total is-balance">
        <dt>Saldo</dt>
        <dd>{formatMoney(account.balance)}</dd>
      </div>
    </dl>
  </div>
);

export default AccountSummary;
