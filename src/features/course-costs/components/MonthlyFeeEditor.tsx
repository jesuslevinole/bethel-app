import { CopyCheck } from 'lucide-react';
import { useState } from 'react';
import MoneyInput from '../../../shared/components/MoneyInput';
import type { MonthlyFee } from '../../../types/index';
import { formatMonth, getCourseTotal } from '../../../utils/courseCost';
import { formatMoney } from '../../../utils/money';

interface MonthlyFeeEditorProps {
  fees: MonthlyFee[];
  onChange: (fees: MonthlyFee[]) => void;
}

// Mensualidad de cada mes del período, como la hoja de PAGOS. "Aplicar a todos" llena el mismo monto
// y luego se ajusta el mes que sea distinto (p. ej. junio a $25). Un mes en $0 no se cobra.
const MonthlyFeeEditor = ({ fees, onChange }: MonthlyFeeEditorProps) => {
  const [fillAmount, setFillAmount] = useState(0);
  // MoneyInput guarda su texto: al aplicar a todos se vuelven a montar los campos.
  const [fillVersion, setFillVersion] = useState(0);
  const courseTotal = getCourseTotal({ monthlyFees: fees });

  const handleApplyToAll = () => {
    onChange(fees.map((fee) => ({ ...fee, amount: fillAmount })));
    setFillVersion((version) => version + 1);
  };

  const handleFeeChange = (month: string, amount: number) =>
    onChange(fees.map((fee) => (fee.month === month ? { ...fee, amount } : fee)));

  return (
    <div className="form-column">
      <h3 className="form-section-title">Mensualidades</h3>
      <div className="monthly-fill">
        <MoneyInput ariaLabel="Monto por mes" onChange={setFillAmount} value={fillAmount} />
        <button className="btn btn-secondary" disabled={fillAmount <= 0} onClick={handleApplyToAll} type="button">
          <CopyCheck size={17} />
          Aplicar a todos
        </button>
      </div>
      <ol className="monthly-list">
        {fees.map((fee) => (
          <li className="monthly-row" key={`${fee.month}-${fillVersion}`}>
            <span className="monthly-month">{formatMonth(fee.month)}</span>
            <MoneyInput
              ariaLabel={`Mensualidad de ${formatMonth(fee.month)}`}
              onChange={(amount) => handleFeeChange(fee.month, amount)}
              value={fee.amount}
            />
          </li>
        ))}
      </ol>
      <div className="book-list-footer">
        <span className="cost-form-hint">Un mes en $0 no se cobra.</span>
        <span className="book-list-total">
          Total curso
          <strong>{formatMoney(courseTotal)}</strong>
        </span>
      </div>
    </div>
  );
};

export default MonthlyFeeEditor;
