import type { FormEvent } from 'react';
import { expensesService } from '../../../services/expensesService';
import DateInput from '../../../shared/components/DateInput';
import Field from '../../../shared/components/Field';
import Modal from '../../../shared/components/Modal';
import MoneyInput from '../../../shared/components/MoneyInput';
import { useAsyncAction } from '../../../shared/hooks/useAsyncAction';
import { useFormFields } from '../../../shared/hooks/useFormFields';
import type { Expense } from '../../../types/index';
import {
  toExpenseData,
  toExpenseFormValues,
  validateExpense,
  type ExpenseCatalogs,
  type ExpenseFormValues,
} from '../expenseForm';

interface ExpenseFormProps extends ExpenseCatalogs {
  expense: Expense | null;
  onClose: () => void;
}

// Un gasto: fecha, categoría, en qué se gastó, cuánto y cómo se pagó.
const ExpenseForm = ({ banks, categories, expense, incomeTypes, onClose }: ExpenseFormProps) => {
  const { setField, values } = useFormFields<ExpenseFormValues>(toExpenseFormValues(expense));
  const { error, isRunning, run, setError } = useAsyncAction();
  const catalogs = { banks, categories, incomeTypes };
  const usesBank = incomeTypes.find((type) => type.id === values.incomeTypeId)?.usesBank ?? false;

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validateExpense(values, catalogs);
    if (validationError) {
      setError(validationError);
      return;
    }
    const data = toExpenseData(values, catalogs);
    const saveExpense = async () => {
      if (expense) await expensesService.update(expense.id, data);
      else await expensesService.create(data);
    };
    if (await run(saveExpense)) onClose();
  };

  return (
    <Modal onClose={onClose} title={expense ? 'Editar gasto' : 'Registrar gasto'}>
      <form className="modal-form" noValidate onSubmit={handleSave}>
        <div className="modal-body">
          <div className="form-grid">
            <Field htmlFor="expense-date" label="Fecha">
              <DateInput id="expense-date" onChange={(isoDate) => setField('date', isoDate)} value={values.date} />
            </Field>
            <Field htmlFor="expense-amount" label="Monto">
              <MoneyInput id="expense-amount" onChange={(amount) => setField('amount', amount)} value={values.amount} />
            </Field>
            <Field
              hint={categories.length === 0 ? 'Agrega categorías en Catálogos → Categorías de gasto.' : undefined}
              htmlFor="expense-category"
              label="Categoría"
            >
              <select
                className="input input-select"
                id="expense-category"
                onChange={(event) => setField('categoryId', event.target.value)}
                value={values.categoryId}
              >
                <option value="">Elige la categoría</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field htmlFor="expense-method" label="Forma de pago">
              <select
                className="input input-select"
                id="expense-method"
                onChange={(event) => setField('incomeTypeId', event.target.value)}
                value={values.incomeTypeId}
              >
                <option value="">Sin especificar</option>
                {incomeTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </Field>
            {usesBank && (
              <Field htmlFor="expense-bank" label="Banco">
                <select
                  className="input input-select"
                  id="expense-bank"
                  onChange={(event) => setField('bankId', event.target.value)}
                  value={values.bankId}
                >
                  <option value="">Elige el banco</option>
                  {banks.map((bank) => (
                    <option key={bank.id} value={bank.id}>
                      {bank.name}
                    </option>
                  ))}
                </select>
              </Field>
            )}
            <Field className="span-all" htmlFor="expense-description" label="En qué se gastó">
              <input
                className="input"
                id="expense-description"
                onChange={(event) => setField('description', event.target.value)}
                placeholder="Ej.: pago a maestros de octubre, materiales, renta…"
                value={values.description}
              />
            </Field>
            <Field className="span-all" htmlFor="expense-notes" label="Notas">
              <input
                className="input"
                id="expense-notes"
                onChange={(event) => setField('notes', event.target.value)}
                placeholder="Opcional: número de cheque, recibo…"
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
            {isRunning ? 'Guardando…' : 'Guardar gasto'}
          </button>
        </footer>
      </form>
    </Modal>
  );
};

export default ExpenseForm;
