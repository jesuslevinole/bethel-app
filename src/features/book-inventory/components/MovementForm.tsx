import type { FormEvent } from 'react';
import DateInput from '../../../shared/components/DateInput';
import Field from '../../../shared/components/Field';
import Modal from '../../../shared/components/Modal';
import SearchSelect from '../../../shared/components/SearchSelect';
import { useAsyncAction } from '../../../shared/hooks/useAsyncAction';
import { useFormFields } from '../../../shared/hooks/useFormFields';
import type { Book, BookMovement, BookOutReason, BookStock } from '../../../types/index';
import { todayIso } from '../../../utils/dateFormat';
import { EMPTY_STOCK, OUT_REASON_LABELS } from '../bookStock';
import { saveManualMovement } from '../services/bookRecords';
import '../../../shared/components/FilterChips.css';

interface MovementFormProps {
  books: Book[];
  defaultBookId: string;
  kind: 'in' | 'out';
  movement: BookMovement | null;
  onClose: () => void;
  stockByBook: Map<string, BookStock>;
}

interface MovementFormValues {
  bookId: string;
  date: string;
  notes: string;
  quantity: string;
  reason: BookOutReason;
}

const OUT_REASONS = Object.entries(OUT_REASON_LABELS) as [BookOutReason, string][];

// Entrada (llegaron libros) o salida (dañado, regalado u otro) hecha a mano.
const MovementForm = ({ books, defaultBookId, kind, movement, onClose, stockByBook }: MovementFormProps) => {
  const { setField, values } = useFormFields<MovementFormValues>({
    bookId: movement?.bookId ?? defaultBookId,
    date: movement?.date ?? todayIso(),
    notes: movement?.notes ?? '',
    quantity: movement ? String(movement.quantity) : '',
    reason: movement?.reason ?? 'damaged',
  });
  const { error, isRunning, run, setError } = useAsyncAction();
  const isIn = kind === 'in';
  const book = books.find((candidate) => candidate.id === values.bookId) ?? null;
  const stock = (stockByBook.get(values.bookId) ?? EMPTY_STOCK).stock;
  // Al editar una salida, su propia cantidad vuelve a estar disponible.
  const availableForOut = stock + (movement && movement.kind === 'out' ? movement.quantity : 0);
  const bookOptions = books.map((candidate) => ({
    detail: `Stock ${(stockByBook.get(candidate.id) ?? EMPTY_STOCK).stock}`,
    label: candidate.code ? `${candidate.name} (${candidate.code})` : candidate.name,
    value: candidate.id,
  }));

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const quantity = Number.parseInt(values.quantity, 10);
    if (!book) {
      setError('Elige el libro.');
      return;
    }
    if (!values.date) {
      setError('Escribe la fecha.');
      return;
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      setError('Escribe cuántos libros (1 o más).');
      return;
    }
    if (!isIn && quantity > availableForOut) {
      setError(`Solo hay ${availableForOut} en el inventario.`);
      return;
    }
    const data = {
      bookId: book.id,
      bookName: book.name,
      date: values.date,
      kind,
      notes: values.notes.trim(),
      quantity,
      ...(isIn ? {} : { reason: values.reason }),
    };
    if (await run(() => saveManualMovement(movement, data))) onClose();
  };

  const title = isIn ? 'Registrar entrada de libros' : 'Registrar salida de libros';
  const subtitle = isIn
    ? 'Libros que llegaron al instituto (pedido, donación…).'
    : 'Libros que salen sin venderse. Las ventas se registran en Pagos.';

  return (
    <Modal onClose={onClose} subtitle={subtitle} title={movement ? 'Corregir movimiento' : title}>
      <form className="modal-form" noValidate onSubmit={handleSave}>
        <div className="modal-body">
          <div className="form-grid">
            <Field className="span-all" htmlFor="movement-book" label="Libro">
              <SearchSelect
                emptyText="Ningún libro coincide. Agrégalo primero."
                id="movement-book"
                onChange={(bookId) => setField('bookId', bookId)}
                options={bookOptions}
                placeholder="Busca el libro"
                value={values.bookId}
              />
            </Field>
            <Field
              hint={book ? `Hay ${stock} en el inventario.` : undefined}
              htmlFor="movement-quantity"
              label="Cantidad"
            >
              <input
                className="input"
                id="movement-quantity"
                inputMode="numeric"
                min={1}
                onChange={(event) => setField('quantity', event.target.value)}
                type="number"
                value={values.quantity}
              />
            </Field>
            <Field htmlFor="movement-date" label="Fecha">
              <DateInput id="movement-date" onChange={(isoDate) => setField('date', isoDate)} value={values.date} />
            </Field>
            {!isIn && (
              <Field className="span-all" label="Motivo">
                <div className="movement-reasons" role="radiogroup">
                  {OUT_REASONS.map(([reason, label]) => (
                    <button
                      aria-checked={values.reason === reason}
                      className={`filter-chip${values.reason === reason ? ' is-active' : ''}`}
                      key={reason}
                      onClick={() => setField('reason', reason)}
                      role="radio"
                      type="button"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </Field>
            )}
            <Field className="span-all" htmlFor="movement-notes" label="Notas">
              <input
                className="input"
                id="movement-notes"
                onChange={(event) => setField('notes', event.target.value)}
                placeholder={isIn ? 'Opcional: pedido, proveedor…' : 'Opcional: a quién se regaló, qué pasó…'}
                value={values.notes}
              />
            </Field>
          </div>
          {error && <p className="form-alert">{error}</p>}
        </div>
        <footer className="modal-footer">
          <button className="btn btn-secondary" disabled={isRunning} onClick={onClose} type="button">
            Cancelar
          </button>
          <button className="btn btn-primary" disabled={isRunning} type="submit">
            {isRunning ? 'Guardando…' : isIn ? 'Guardar entrada' : 'Guardar salida'}
          </button>
        </footer>
      </form>
    </Modal>
  );
};

export default MovementForm;
