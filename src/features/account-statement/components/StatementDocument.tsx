import logoUrl from '../../../assets/bethel-logo.png';
import { INSTITUTE } from '../../../config/institute';
import type { DateRange } from '../../../types/index';
import { formatDate, formatDateRange, todayIso } from '../../../utils/dateFormat';
import { formatMoney } from '../../../utils/money';
import type { AccountStatement } from '../statementData';

interface StatementDocumentProps {
  range: DateRange;
  statement: AccountStatement;
}

// Estado de cuenta para imprimir (carta): totales, desglose y cada movimiento con el saldo acumulado.
const StatementDocument = ({ range, statement }: StatementDocumentProps) => (
  <article className="print-document statement-document">
    <header className="statement-document-header">
      <img alt="" className="statement-document-logo" src={logoUrl} />
      <div>
        <span className="statement-document-institute">{INSTITUTE.name}</span>
        <span className="statement-document-line">{INSTITUTE.church}</span>
        <span className="statement-document-line">{INSTITUTE.address}</span>
      </div>
      <div className="statement-document-title">
        <h2>Estado de cuenta</h2>
        <span>{formatDateRange(range.startDate, range.endDate)}</span>
        <span>Impreso el {formatDate(todayIso())}</span>
      </div>
    </header>
    <dl className="statement-document-totals">
      <div>
        <dt>Entradas</dt>
        <dd>{formatMoney(statement.incomeTotal)}</dd>
      </div>
      <div>
        <dt>Salidas</dt>
        <dd>{formatMoney(statement.expenseTotal)}</dd>
      </div>
      <div className={statement.balance < 0 ? 'is-negative' : ''}>
        <dt>Saldo</dt>
        <dd>{formatMoney(statement.balance)}</dd>
      </div>
    </dl>
    <table className="statement-document-table">
      <thead>
        <tr>
          <th scope="col">Fecha</th>
          <th scope="col">Detalle</th>
          <th className="cell-num" scope="col">
            Entrada
          </th>
          <th className="cell-num" scope="col">
            Salida
          </th>
          <th className="cell-num" scope="col">
            Saldo
          </th>
        </tr>
      </thead>
      <tbody>
        {statement.lines.map((line) => (
          <tr key={line.id}>
            <td>{formatDate(line.date)}</td>
            <td>{line.detail}</td>
            <td className="cell-num">{line.kind === 'income' ? formatMoney(line.amount) : ''}</td>
            <td className="cell-num">{line.kind === 'expense' ? formatMoney(line.amount) : ''}</td>
            <td className="cell-num">{formatMoney(line.balance)}</td>
          </tr>
        ))}
      </tbody>
    </table>
    {statement.lines.length === 0 && <p className="statement-empty">Sin movimientos en estas fechas.</p>}
  </article>
);

export default StatementDocument;
