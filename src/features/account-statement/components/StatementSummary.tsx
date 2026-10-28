import { ArrowDownLeft, ArrowUpRight, Scale } from 'lucide-react';
import { formatMoney } from '../../../utils/money';
import type { AccountStatement, StatementGroup } from '../statementData';

interface StatementSummaryProps {
  statement: AccountStatement;
}

interface GroupListProps {
  emptyText: string;
  groups: StatementGroup[];
}

const GroupList = ({ emptyText, groups }: GroupListProps) => {
  if (groups.length === 0) return <p className="statement-empty">{emptyText}</p>;
  return (
    <ul className="statement-groups">
      {groups.map((group) => (
        <li key={group.name}>
          <span>{group.name}</span>
          <strong>{formatMoney(group.amount)}</strong>
        </li>
      ))}
    </ul>
  );
};

// Totales del rango: entró, salió y queda; con el desglose por forma de pago y por categoría.
const StatementSummary = ({ statement }: StatementSummaryProps) => {
  const balanceClassName = statement.balance < 0 ? 'statement-total is-negative' : 'statement-total is-balance';

  return (
    <div className="statement-summary">
      <article className="panel panel-padded statement-total is-income">
        <span className="statement-total-icon">
          <ArrowDownLeft size={20} />
        </span>
        <span className="statement-total-label">Entradas</span>
        <strong className="statement-total-value">{formatMoney(statement.incomeTotal)}</strong>
        <GroupList emptyText="Sin pagos en estas fechas." groups={statement.incomeByMethod} />
      </article>
      <article className="panel panel-padded statement-total is-expense">
        <span className="statement-total-icon">
          <ArrowUpRight size={20} />
        </span>
        <span className="statement-total-label">Salidas</span>
        <strong className="statement-total-value">{formatMoney(statement.expenseTotal)}</strong>
        <GroupList emptyText="Sin gastos en estas fechas." groups={statement.expenseByCategory} />
      </article>
      <article className={`panel panel-padded ${balanceClassName}`}>
        <span className="statement-total-icon">
          <Scale size={20} />
        </span>
        <span className="statement-total-label">Saldo del rango</span>
        <strong className="statement-total-value">{formatMoney(statement.balance)}</strong>
        <p className="statement-empty">Entradas menos salidas.</p>
      </article>
    </div>
  );
};

export default StatementSummary;
