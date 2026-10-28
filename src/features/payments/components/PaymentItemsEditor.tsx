import { Plus, Trash2 } from 'lucide-react';
import MoneyInput from '../../../shared/components/MoneyInput';
import type { Book, BookStock, PaymentType, StudentAccount } from '../../../types/index';
import { formatMonth } from '../../../utils/courseCost';
import { formatMoney, roundMoney, sumMoney } from '../../../utils/money';
import { createItemRow, getPaymentTypeKind, suggestItem, type PaymentItemRow } from '../paymentForm';

interface PaymentItemsEditorProps {
  account: StudentAccount | null;
  books: Book[];
  items: PaymentItemRow[];
  months: string[];
  onChange: (items: PaymentItemRow[]) => void;
  paymentTypes: PaymentType[];
  // null = sin acceso a las existencias (no se muestra cuántos quedan).
  stockByBook: Map<string, BookStock> | null;
}

const describeStock = (stockByBook: Map<string, BookStock> | null, bookId: string) => {
  if (!stockByBook || !bookId) return null;
  const stock = stockByBook.get(bookId)?.stock ?? 0;
  if (stock <= 0) return 'No quedan en el inventario';
  return stock === 1 ? 'Queda 1' : `Quedan ${stock}`;
};

// Conceptos del pago (líneas del invoice). Al elegir el tipo se sugiere el monto que falta;
// en mensualidades se elige el mes; en libros, qué libro se entrega (sale del inventario).
const PaymentItemsEditor = ({
  account,
  books,
  items,
  months,
  onChange,
  paymentTypes,
  stockByBook,
}: PaymentItemsEditorProps) => {
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
        item.rowId === row.rowId ? { ...createItemRow({ description: '', paymentTypeId }), ...suggestion } : item,
      ),
    );
  };

  // Elegir un libro pone su precio (por la cantidad) y vuelve a crear la fila para que el monto se vea.
  const handleBookChange = (row: PaymentItemRow, bookId: string) => {
    const price = books.find((book) => book.id === bookId)?.price;
    const amount = bookId && price ? roundMoney(price * row.quantity) : row.amount;
    onChange(
      items.map((item) => (item.rowId === row.rowId ? { ...item, amount, bookId, rowId: crypto.randomUUID() } : item)),
    );
  };

  const handleQuantityChange = (row: PaymentItemRow, rawQuantity: string) => {
    const quantity = Math.max(Number.parseInt(rawQuantity, 10) || 0, 0);
    const price = books.find((book) => book.id === row.bookId)?.price;
    const amount = price ? roundMoney(price * quantity) : row.amount;
    updateRow(row.rowId, { amount, quantity });
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
          const kind = getPaymentTypeKind(paymentTypes, item.paymentTypeId);
          const isMonthly = kind === 'monthly';
          const isBook = kind === 'books';
          const stockText = describeStock(stockByBook, item.bookId);
          return (
            <li className={isBook ? 'payment-item is-book' : 'payment-item'} key={item.rowId}>
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
              {isMonthly && (
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
              )}
              {!isMonthly && !isBook && (
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
              {isBook && (
                <div className="payment-item-book">
                  <select
                    aria-label={`Libro ${index + 1}`}
                    className="input input-select"
                    onChange={(event) => handleBookChange(item, event.target.value)}
                    value={item.bookId}
                  >
                    <option value="">Sin entregar libro</option>
                    {books.map((book) => (
                      <option key={book.id} value={book.id}>
                        {book.code ? `${book.name} (${book.code})` : book.name}
                      </option>
                    ))}
                  </select>
                  {item.bookId && (
                    <label className="payment-item-quantity">
                      Cantidad
                      <input
                        className="input"
                        inputMode="numeric"
                        min={1}
                        onChange={(event) => handleQuantityChange(item, event.target.value)}
                        type="number"
                        value={item.quantity || ''}
                      />
                    </label>
                  )}
                  {stockText && <span className="payment-item-stock">{stockText}</span>}
                </div>
              )}
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
