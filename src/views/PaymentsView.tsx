import { Banknote, FileWarning, Plus, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useAcademicPeriod } from '../features/academic-periods/academicPeriodContext';
import { usePermissions, useRowPermissions } from '../features/auth/hooks/usePermissions';
import AccountTable from '../features/payments/components/AccountTable';
import InvoiceDialog from '../features/payments/components/InvoiceDialog';
import PaymentForm from '../features/payments/components/PaymentForm';
import PaymentStats from '../features/payments/components/PaymentStats';
import PaymentTable from '../features/payments/components/PaymentTable';
import { usePaymentsData } from '../features/payments/hooks/usePaymentsData';
import { DEBTOR_EXPORT_COLUMNS, getPaymentExportColumns } from '../features/payments/paymentExport';
import { getInvoiceBalance } from '../features/payments/invoiceBalance';
import { deletePayment, formatInvoiceNumber } from '../features/payments/services/paymentRecords';
import type { AccountStatus } from '../features/payments/studentAccount';
import ConfirmDialog from '../shared/components/ConfirmDialog';
import DateInput from '../shared/components/DateInput';
import EmptyState from '../shared/components/EmptyState';
import ExportButton from '../shared/components/ExportButton';
import Field from '../shared/components/Field';
import FilterChips from '../shared/components/FilterChips';
import NoPeriodState from '../shared/components/NoPeriodState';
import SearchInput from '../shared/components/SearchInput';
import ViewHeader from '../shared/components/ViewHeader';
import { exportToExcel } from '../shared/export/exportToExcel';
import { useCrudScreen } from '../shared/hooks/useCrudScreen';
import type { Payment, SelectOption } from '../types/index';
import { formatMoney } from '../utils/money';
import { getRelationName } from '../utils/relations';
import { matchesSearch } from '../utils/search';
import '../features/payments/components/Payments.css';

type PaymentsTab = 'accounts' | 'payments';

const TAB_OPTIONS: SelectOption[] = [
  { label: 'Pagos registrados', value: 'payments' },
  { label: 'Estado de cuenta', value: 'accounts' },
];

const STATUS_OPTIONS: SelectOption[] = [
  { label: 'Deben', value: 'overdue' },
  { label: 'Al día', value: 'pending' },
  { label: 'Pagado', value: 'paid' },
];

// Pagos del período (como las hojas INFORMACIÓN / PAGOS / HISTÓRICO): registrar pagos con su invoice,
// el estado de cuenta de cada alumno y el reporte de deudores.
const PaymentsView = () => {
  const { isLoading: isLoadingPeriods, selectedPeriod } = useAcademicPeriod();
  const data = usePaymentsData(selectedPeriod?.id ?? null);
  const permissions = usePermissions();
  const rowPermissions = useRowPermissions('payments');
  const { askDelete, cancelDelete, closeEditor, editingRecord, editor, openEdit, openNew, recordToDelete } =
    useCrudScreen<Payment>();
  const [tab, setTab] = useState<PaymentsTab>('payments');
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [defaultStudentId, setDefaultStudentId] = useState('');
  const [invoicePaymentId, setInvoicePaymentId] = useState<string | null>(null);

  const studentNames = useMemo(
    () => new Map([...data.studentsById.values()].map((student) => [student.id, student.name])),
    [data.studentsById],
  );
  const studentCodes = useMemo(
    () => new Map([...data.studentsById.values()].map((student) => [student.id, student.code])),
    [data.studentsById],
  );
  const studentOptions: SelectOption[] = data.enrollments.map((enrollment) => {
    const student = data.studentsById.get(enrollment.studentId);
    return {
      detail: `${student?.code ?? ''} · ${getRelationName(data.classNames, enrollment.classId)}`,
      label: student?.name ?? 'Alumno eliminado',
      value: enrollment.studentId,
    };
  });

  const visiblePayments = data.payments.filter(
    (payment) =>
      (!classFilter || payment.classId === classFilter) &&
      (!fromDate || payment.date >= fromDate) &&
      (!toDate || payment.date <= toDate) &&
      matchesSearch(
        [
          getRelationName(studentNames, payment.studentId),
          studentCodes.get(payment.studentId) ?? '',
          formatInvoiceNumber(payment.invoiceNumber),
        ],
        search,
      ),
  );
  const visibleAccounts = data.accountRows.filter(
    (row) =>
      (!classFilter || row.enrollment.classId === classFilter) &&
      (!statusFilter || row.status === (statusFilter as AccountStatus)) &&
      matchesSearch([row.studentName, row.studentCode], search),
  );
  const debtors = data.accountRows.filter((row) => row.account.overdue > 0);

  const invoicePayment = data.payments.find((payment) => payment.id === invoicePaymentId) ?? null;
  const invoiceBalance = invoicePayment
    ? getInvoiceBalance(
        data.costs.find((cost) => cost.classId === invoicePayment.classId) ?? null,
        data.payments.filter((payment) => payment.studentId === invoicePayment.studentId),
        invoicePayment,
      )
    : null;
  const invoiceStudent = invoicePayment ? (data.studentsById.get(invoicePayment.studentId) ?? null) : null;

  const handleNew = (studentId = '') => {
    setDefaultStudentId(studentId);
    openNew();
  };

  const handleSaved = (paymentId: string) => {
    const isNewPayment = !editingRecord;
    closeEditor();
    if (isNewPayment) setInvoicePaymentId(paymentId);
  };

  const showNoPeriod = !isLoadingPeriods && !selectedPeriod;
  const periodName = selectedPeriod?.name ?? '';
  const classOptions: SelectOption[] = data.classes.map((schoolClass) => ({ label: schoolClass.name, value: schoolClass.id }));

  return (
    <div className="view">
      <ViewHeader subtitle={selectedPeriod ? `Pagos de ${periodName}` : 'Sin período académico'} title="Pagos">
        <SearchInput label="Buscar pago" onChange={setSearch} placeholder="Alumno, código o invoice…" value={search} />
        {permissions.can('payments', 'export') && selectedPeriod && (
          <>
            <ExportButton
              disabled={visiblePayments.length === 0}
              onExport={() =>
                exportToExcel(
                  `Pagos ${periodName}`,
                  getPaymentExportColumns({ classNames: data.classNames, studentCodes, studentNames }),
                  visiblePayments,
                )
              }
            />
            <button
              className="btn btn-secondary"
              disabled={debtors.length === 0}
              onClick={() => void exportToExcel(`Deudores ${periodName}`, DEBTOR_EXPORT_COLUMNS, debtors)}
              title={debtors.length === 0 ? 'Nadie tiene pagos vencidos' : 'Descargar en Excel'}
              type="button"
            >
              <FileWarning size={17} />
              Reporte de deudores
            </button>
          </>
        )}
        {permissions.can('payments', 'create') && (
          <button className="btn btn-primary" disabled={!selectedPeriod} onClick={() => handleNew()} type="button">
            <Plus size={18} />
            Registrar pago
          </button>
        )}
      </ViewHeader>
      {showNoPeriod && <NoPeriodState />}
      {selectedPeriod && (
        <>
          <PaymentStats accountRows={data.accountRows} payments={data.payments} />
          <div className="payment-toolbar">
            <FilterChips label="Vista" onChange={(value) => setTab(value as PaymentsTab)} options={TAB_OPTIONS} value={tab} />
            <div className="payment-filters">
              <Field htmlFor="payment-class-filter" label="Clase">
                <select
                  className="input input-select"
                  id="payment-class-filter"
                  onChange={(event) => setClassFilter(event.target.value)}
                  value={classFilter}
                >
                  <option value="">Todas las clases</option>
                  {classOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>
              {tab === 'payments' && (
                <>
                  <Field htmlFor="payment-from" label="Desde">
                    <DateInput id="payment-from" onChange={setFromDate} value={fromDate} />
                  </Field>
                  <Field htmlFor="payment-to" label="Hasta">
                    <DateInput id="payment-to" onChange={setToDate} value={toDate} />
                  </Field>
                </>
              )}
            </div>
          </div>
          {tab === 'accounts' && (
            <FilterChips
              allLabel="Todos"
              label="Estado"
              onChange={setStatusFilter}
              options={STATUS_OPTIONS}
              value={statusFilter}
            />
          )}
          <section className="panel panel-body-flush">
            {tab === 'payments' && visiblePayments.length > 0 && (
              <PaymentTable
                classNames={data.classNames}
                onDelete={askDelete}
                onEdit={openEdit}
                onOpenInvoice={(payment) => setInvoicePaymentId(payment.id)}
                payments={visiblePayments}
                rowPermissions={rowPermissions}
                studentNames={studentNames}
              />
            )}
            {tab === 'payments' && !data.isLoading && visiblePayments.length === 0 && (
              <EmptyState
                icon={Banknote}
                text={data.payments.length === 0 ? 'Registra el primer pago del período.' : 'Ningún pago coincide con los filtros.'}
                title="Sin pagos"
              />
            )}
            {tab === 'accounts' && visibleAccounts.length > 0 && (
              <AccountTable
                onRegisterPayment={permissions.can('payments', 'create') ? handleNew : undefined}
                rows={visibleAccounts}
              />
            )}
            {tab === 'accounts' && visibleAccounts.length === 0 && (
              <EmptyState
                icon={Users}
                text={data.accountRows.length === 0 ? 'Inscribe alumnos en este período para ver su estado de cuenta.' : 'Ningún alumno coincide con los filtros.'}
                title="Sin alumnos"
              />
            )}
          </section>
        </>
      )}
      {selectedPeriod && editor.mode !== 'closed' && (
        <PaymentForm
          banks={data.banks}
          classNames={data.classNames}
          costs={data.costs}
          defaultStudentId={defaultStudentId}
          enrollments={data.enrollments}
          incomeTypes={data.incomeTypes}
          key={editingRecord?.id ?? `new-${defaultStudentId}`}
          onClose={closeEditor}
          onSaved={handleSaved}
          payment={editingRecord}
          paymentTypes={data.paymentTypes}
          payments={data.payments}
          period={selectedPeriod}
          studentOptions={studentOptions}
        />
      )}
      {invoicePayment && (
        <InvoiceDialog
          balance={invoiceBalance}
          canPrint={permissions.can('payments', 'print')}
          className={getRelationName(data.classNames, invoicePayment.classId)}
          onClose={() => setInvoicePaymentId(null)}
          payment={invoicePayment}
          period={selectedPeriod}
          student={invoiceStudent}
        />
      )}
      {recordToDelete && (
        <ConfirmDialog
          confirmLabel="Eliminar pago"
          description={`Se eliminará el pago ${formatInvoiceNumber(recordToDelete.invoiceNumber)} de ${getRelationName(studentNames, recordToDelete.studentId)} (${formatMoney(recordToDelete.total)}). El número de invoice no se vuelve a usar.`}
          item={recordToDelete}
          onCancel={cancelDelete}
          onConfirm={deletePayment}
          title="Eliminar pago"
        />
      )}
    </div>
  );
};

export default PaymentsView;
