import type { FormEvent } from 'react';
import DateInput from '../../../shared/components/DateInput';
import Field from '../../../shared/components/Field';
import Modal from '../../../shared/components/Modal';
import SearchSelect from '../../../shared/components/SearchSelect';
import { useAsyncAction } from '../../../shared/hooks/useAsyncAction';
import { useFormFields } from '../../../shared/hooks/useFormFields';
import type {
  AcademicPeriod,
  Bank,
  CourseCost,
  Enrollment,
  IncomeType,
  Payment,
  PaymentType,
  SelectOption,
} from '../../../types/index';
import { listPeriodMonths } from '../../../utils/courseCost';
import { todayIso } from '../../../utils/dateFormat';
import { getRelationName } from '../../../utils/relations';
import { toPaymentData, toPaymentFormValues, validatePayment, type PaymentFormValues } from '../paymentForm';
import { createPayment, updatePayment } from '../services/paymentRecords';
import { buildStudentAccount } from '../studentAccount';
import AccountSummary from './AccountSummary';
import PaymentItemsEditor from './PaymentItemsEditor';
import './Payments.css';

interface PaymentFormProps {
  banks: Bank[];
  classNames: Map<string, string>;
  costs: CourseCost[];
  defaultStudentId?: string;
  enrollments: Enrollment[];
  incomeTypes: IncomeType[];
  onClose: () => void;
  onSaved: (paymentId: string) => void;
  payment: Payment | null;
  paymentTypes: PaymentType[];
  payments: Payment[];
  period: AcademicPeriod;
  studentOptions: SelectOption[];
}

// Registrar o corregir un pago: alumno (inscrito en el período), forma de pago y conceptos.
// A la izquierda se ve su estado de cuenta para saber qué le falta.
const PaymentForm = ({
  banks,
  classNames,
  costs,
  defaultStudentId,
  enrollments,
  incomeTypes,
  onClose,
  onSaved,
  payment,
  paymentTypes,
  payments,
  period,
  studentOptions,
}: PaymentFormProps) => {
  const { setField, values } = useFormFields<PaymentFormValues>(toPaymentFormValues(payment, defaultStudentId));
  const { error, isRunning, run, setError } = useAsyncAction();

  const enrollment = enrollments.find((candidate) => candidate.studentId === values.studentId) ?? null;
  const cost = enrollment ? (costs.find((candidate) => candidate.classId === enrollment.classId) ?? null) : null;
  // Al editar, el propio pago no cuenta en "lo que falta".
  const otherPayments = payments.filter(
    (candidate) => candidate.studentId === values.studentId && candidate.id !== payment?.id,
  );
  const account = enrollment ? buildStudentAccount(cost, otherPayments, todayIso()) : null;
  const months = cost?.monthlyFees?.length ? cost.monthlyFees.map((fee) => fee.month) : listPeriodMonths(period);
  const selectedIncomeType = incomeTypes.find((type) => type.id === values.incomeTypeId) ?? null;
  const catalogs = { banks, incomeTypes, paymentTypes };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validatePayment(values, { ...catalogs, enrollment });
    if (validationError || !enrollment) {
      setError(validationError);
      return;
    }
    const paymentData = toPaymentData(values, enrollment, catalogs);
    let savedId = payment?.id ?? '';
    const savePayment = async () => {
      if (payment) await updatePayment(payment.id, paymentData);
      else savedId = (await createPayment(paymentData)).id;
    };
    if (await run(savePayment)) onSaved(savedId);
  };

  const title = payment ? 'Editar pago' : 'Registrar pago';

  return (
    <Modal onClose={onClose} size="full" subtitle={`Período académico ${period.name}`} title={title}>
      <form className="modal-form" noValidate onSubmit={handleSave}>
        <div className="modal-body">
          <div className="payment-form-columns form-columns">
            <div className="form-column">
              <h3 className="form-section-title">Alumno</h3>
              <Field htmlFor="payment-student" label="Alumno">
                <SearchSelect
                  emptyText="Ningún alumno inscrito coincide. Inscríbelo primero en Inscripciones."
                  id="payment-student"
                  onChange={(studentId) => setField('studentId', studentId)}
                  options={studentOptions}
                  placeholder="Busca un alumno inscrito"
                  value={values.studentId}
                />
              </Field>
              {enrollment && (
                <p className="payment-form-class">
                  {getRelationName(classNames, enrollment.classId)} · {period.name}
                  {!cost && ' · Sin costos del curso para esta clase'}
                </p>
              )}
              {account && <AccountSummary account={account} />}
            </div>
            <div className="form-column">
              <h3 className="form-section-title">Pago</h3>
              <Field htmlFor="payment-date" label="Fecha">
                <DateInput id="payment-date" onChange={(isoDate) => setField('date', isoDate)} value={values.date} />
              </Field>
              <Field htmlFor="payment-income-type" label="Forma de pago">
                <select
                  className="input input-select"
                  id="payment-income-type"
                  onChange={(event) => setField('incomeTypeId', event.target.value)}
                  value={values.incomeTypeId}
                >
                  <option value="">Elige la forma de pago</option>
                  {incomeTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </Field>
              {selectedIncomeType?.usesBank && (
                <Field htmlFor="payment-bank" label="Banco">
                  <select
                    className="input input-select"
                    id="payment-bank"
                    onChange={(event) => setField('bankId', event.target.value)}
                    value={values.bankId}
                  >
                    <option value="">Elige el banco</option>
                    {banks.map((bank) => (
                      <option key={bank.id} value={bank.id}>
                        {bank.accountNumber ? `${bank.name} · ${bank.accountNumber}` : bank.name}
                      </option>
                    ))}
                  </select>
                </Field>
              )}
              <Field htmlFor="payment-notes" label="Notas">
                <textarea
                  className="input payment-notes"
                  id="payment-notes"
                  onChange={(event) => setField('notes', event.target.value)}
                  placeholder="Opcional: número de cheque, referencia…"
                  rows={3}
                  value={values.notes}
                />
              </Field>
            </div>
            <PaymentItemsEditor
              account={account}
              items={values.items}
              months={months}
              onChange={(items) => setField('items', items)}
              paymentTypes={paymentTypes}
            />
          </div>
          {error && <p className="form-alert">{error}</p>}
        </div>
        <footer className="modal-footer">
          <button className="btn btn-secondary" disabled={isRunning} onClick={onClose} type="button">
            Cancelar
          </button>
          <button className="btn btn-primary" disabled={isRunning} type="submit">
            {isRunning ? 'Guardando…' : payment ? 'Guardar cambios' : 'Registrar y ver invoice'}
          </button>
        </footer>
      </form>
    </Modal>
  );
};

export default PaymentForm;
