import type { MonthStatus } from '../../../types/index';
import { formatMonth } from '../../../utils/courseCost';
import { formatMoney } from '../../../utils/money';

interface MonthStatusGridProps {
  months: MonthStatus[];
}

type MonthState = 'due' | 'paid' | 'upcoming';

const getMonthState = (status: MonthStatus): MonthState => {
  if (status.due > 0 && status.paid >= status.due) return 'paid';
  return status.isDue ? 'due' : 'upcoming';
};

const STATE_LABELS: Record<MonthState, string> = { due: 'Vencido', paid: 'Pagado', upcoming: 'Por venir' };

// Mensualidades del período, una tarjeta por mes (como la tabla de meses de la hoja de PAGOS).
const MonthStatusGrid = ({ months }: MonthStatusGridProps) => {
  const chargedMonths = months.filter((status) => status.due > 0);
  if (chargedMonths.length === 0) return <p className="month-grid-empty">Esta clase no tiene mensualidades en Costos del curso.</p>;

  return (
    <ul className="month-grid">
      {chargedMonths.map((status) => {
        const state = getMonthState(status);
        return (
          <li className={`month-card is-${state}`} key={status.month}>
            <span className="month-card-name">{formatMonth(status.month)}</span>
            <span className="month-card-amount">
              {formatMoney(status.paid)} / {formatMoney(status.due)}
            </span>
            <span className="month-card-state">{STATE_LABELS[state]}</span>
          </li>
        );
      })}
    </ul>
  );
};

export default MonthStatusGrid;
