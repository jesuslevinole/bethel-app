import { Plus, Trash2 } from 'lucide-react';
import MoneyInput from '../../../shared/components/MoneyInput';
import type { PaymentType, StudentAccount } from '../../../types/index';
import { formatMonth } from '../../../utils/courseCost';
import { formatMoney, sumMoney } from '../../../utils/money';
import { createItemRow, getPaymentTypeKind, suggestItem, type PaymentItemRow } from '../paymentForm';

interface PaymentItemsEditorProps {
  account: StudentAccount | null;
  items: PaymentItemRow[];
  months: string[];
  onChange: (items: PaymentItemRow[]) => void;
  paymentTypes: PaymentType[];
}

// Conceptos del pago (líneas del invoice). Al elegir el tipo se sugiere el monto que falta;
// en mensualidades se elige el mes.
const PaymentItemsEditor = ({ account, items, months, onChange, paymentTypes }: PaymentItemsEditorProps) => {
  const total = sumMoney(items.map((item) => item.amount));

  const updateRow = (rowId: string, changes: Partial<PaymentItemRow>) =>
    onChange(items.map((item) => (item.rowId === rowId ? { ...item, ...changes } : item)));

  // Cambiar el tipo crea la fila de nuevo (nuevo rowId) para que el campo de monto muestre la sugerencia.
  const handleTypeChange = (row: PaymentItemRow, paymentTypeId: string) => {
    const kind = getPaymentTypeKind(paymentTypes, paymentTypeId);
    const otherRows = items.filter((item) => item.rowId !== row.rowId);
    const suggestion = suggestItem(kind, account, otherRows);
    onChange(
      items.map((item) =>
        item.rowId === row.rowId
          ? { ...createItemRow({ description: '', paymentTypeId }), ...suggestion }
          : item,
      ),
    );
  };

  const handleRemove = (rowId: string) => {
    const remaining = items.filter((item) => item.rowId !== rowId);
    onChange(remaining.length > 0 ? remaining : [createItemRow()]);
  };

  return (
    <div className="form-column">
      <h3 className="form-section-title">Conceptos</h3>
      <ol className="payment-items">
        {items.map((item, index) => {
          const isMonthly = getPaymentTypeKind(paymentTypes, item.paymentTypeId) === 'monthly';
          return (
            <li className="payment-item" key={item.rowId}>
              <select
                aria-label={`Tipo de pago ${index + 1}`}
                className="input input-select"
                onChange={(event) => handleTypeChange(item, event.target.value)}
                value={item.paymentTypeId}
              >
                <option value="">Tipo de pago</option>
                {paymentTypes.map((paymentType) => (
                  <option key={paymentType.id} value={paymentType.id}>
                    {paymentType.name}
                  </option>
                ))}
              </select>
              {isMonthly ? (
                <select
                  aria-label={`Mes ${index + 1}`}
                  className="input input-select"
                  onChange={(event) => updateRow(item.rowId, { month: event.target.value })}
                  value={item.month}
                >
                  <option value="">Mes</option>
                  {months.map((month) => (
                    <option key={month} value={month}>
                      {formatMonth(month)}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  aria-label={`Detalle ${index + 1}`}
                  className="input"
                  onChange={(event) => updateRow(item.rowId, { description: event.target.value })}
                  placeholder="Detalle (opcional)"
                  value={item.description}
                />
              )}
              <MoneyInput
                ariaLabel={`Monto ${index + 1}`}
                onChange={(amount) => updateRow(item.rowId, { amount })}
                value={item.amount}
              />
              <button
                aria-label={`Quitar concepto ${index + 1}`}
                className="btn btn-icon is-danger"
                onClick={() => handleRemove(item.rowId)}
                type="button"
              >
                <Trash2 size={17} />
              </button>
            </li>
          );
        })}
      </ol>
      <div className="payment-items-footer">
        <button className="btn btn-ghost" onClick={() => onChange([...items, createItemRow()])} type="button">
          <Plus size={18} />
          Agregar concepto
        </button>
        <span className="payment-items-total">
          Total
          <strong>{formatMoney(total)}</strong>
        </span>
      </div>
    </div>
  );
};

export default PaymentItemsEditor;
