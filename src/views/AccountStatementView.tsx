import { ArrowDownLeft, ArrowUpRight, Printer } from 'lucide-react';
import { useState } from 'react';
import { useAcademicPeriod } from '../features/academic-periods/academicPeriodContext';
import StatementDialog from '../features/account-statement/components/StatementDialog';
import StatementExpenseTable from '../features/account-statement/components/StatementExpenseTable';
import StatementIncomeTable from '../features/account-statement/components/StatementIncomeTable';
import StatementSummary from '../features/account-statement/components/StatementSummary';
import { buildAccountStatement } from '../features/account-statement/statementData';
import { STATEMENT_EXPORT_COLUMNS } from '../features/account-statement/statementExport';
import { usePermissions } from '../features/auth/hooks/usePermissions';
import { formatInvoiceNumber } from '../features/payments/services/paymentRecords';
import DateRangeFilter from '../shared/components/DateRangeFilter';
import EmptyState from '../shared/components/EmptyState';
import ExportButton from '../shared/components/ExportButton';
import ListSkeleton from '../shared/components/ListSkeleton';
import ViewHeader from '../shared/components/ViewHeader';
import { useLiveRangeCollection } from '../shared/data/liveCollections';
import { useStudentDirectory } from '../shared/data/useScopedData';
import { exportToExcel } from '../shared/export/exportToExcel';
import type { DateRange, Payment } from '../types/index';
import { formatDateRange } from '../utils/dateFormat';
import { getMonthRange } from '../utils/dateRanges';
import { buildNameMap } from '../utils/relations';
import '../features/account-statement/components/AccountStatement.css';

// Estado de cuenta del instituto: lo que entró (pagos) y lo que salió (gastos) entre dos fechas.
const AccountStatementView = () => {
  const { selectedPeriod } = useAcademicPeriod();
  const permissions = usePermissions();
  const [range, setRange] = useState<DateRange>(() => getMonthRange());
  const [isPrinting, setIsPrinting] = useState(false);
  const payments = useLiveRangeCollection('payments', range.startDate, range.endDate);
  const expenses = useLiveRangeCollection('expenses', range.startDate, range.endDate);
  const { data: students } = useStudentDirectory();
  const studentNames = buildNameMap(students);

  const describePayment = (payment: Payment) =>
    [formatInvoiceNumber(payment.invoiceNumber), studentNames.get(payment.studentId)].filter(Boolean).join(', ');
  const statement = buildAccountStatement(payments.data, expenses.data, describePayment);
  const isLoading = payments.isLoading || expenses.isLoading;
  const loadError = payments.error ?? expenses.error;
  const rangeText = formatDateRange(range.startDate, range.endDate);

  return (
    <div className="view">
      <ViewHeader subtitle={`Entradas y salidas del ${rangeText}`} title="Estado de cuenta">
        {permissions.can('accountStatement', 'export') && (
          <ExportButton
            disabled={statement.lines.length === 0}
            onExport={() => exportToExcel(`Estado de cuenta ${rangeText}`, STATEMENT_EXPORT_COLUMNS, statement.lines)}
          />
        )}
        {permissions.can('accountStatement', 'print') && (
          <button className="btn btn-primary" disabled={isLoading} onClick={() => setIsPrinting(true)} type="button">
            <Printer size={18} />
            Imprimir
          </button>
        )}
      </ViewHeader>
      <section className="panel panel-padded">
        <DateRangeFilter onChange={setRange} period={selectedPeriod} value={range} />
      </section>
      {loadError && (
        <p className="form-alert">No se pudieron leer los movimientos. Revisa que las reglas estén publicadas.</p>
      )}
      {isLoading && <ListSkeleton rows={6} />}
      {!isLoading && (
        <>
          <StatementSummary statement={statement} />
          <div className="statement-columns">
            <section className="panel panel-body-flush statement-column">
              <h2 className="statement-column-title">
                <ArrowDownLeft size={18} />
                Entradas
              </h2>
              {payments.data.length === 0 ? (
                <EmptyState
                  icon={ArrowDownLeft}
                  text="No hay pagos registrados en estas fechas."
                  title="Sin entradas"
                />
              ) : (
                <StatementIncomeTable payments={payments.data} studentNames={studentNames} />
              )}
            </section>
            <section className="panel panel-body-flush statement-column">
              <h2 className="statement-column-title">
                <ArrowUpRight size={18} />
                Salidas
              </h2>
              {expenses.data.length === 0 ? (
                <EmptyState icon={ArrowUpRight} text="No hay gastos en estas fechas." title="Sin salidas" />
              ) : (
                <StatementExpenseTable expenses={expenses.data} />
              )}
            </section>
          </div>
        </>
      )}
      {isPrinting && <StatementDialog onClose={() => setIsPrinting(false)} range={range} statement={statement} />}
    </div>
  );
};

export default AccountStatementView;
