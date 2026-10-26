import { Banknote } from 'lucide-react';
import { useState } from 'react';
import { useAcademicPeriod } from '../features/academic-periods/academicPeriodContext';
import { usePermissions } from '../features/auth/hooks/usePermissions';
import AccountSummary from '../features/payments/components/AccountSummary';
import InvoiceDialog from '../features/payments/components/InvoiceDialog';
import MonthStatusGrid from '../features/payments/components/MonthStatusGrid';
import PaymentTable from '../features/payments/components/PaymentTable';
import { usePaymentsData } from '../features/payments/hooks/usePaymentsData';
import { getInvoiceBalance } from '../features/payments/invoiceBalance';
import { ACCOUNT_STATUS_BADGES, ACCOUNT_STATUS_LABELS } from '../features/payments/studentAccount';
import EmptyState from '../shared/components/EmptyState';
import ListSkeleton from '../shared/components/ListSkeleton';
import NoPeriodState from '../shared/components/NoPeriodState';
import ViewHeader from '../shared/components/ViewHeader';
import { getRelationName } from '../utils/relations';
import '../features/payments/components/Payments.css';

const NO_ACTIONS = { canDelete: false, canEdit: false };

// Estudiante: su estado de cuenta, sus mensualidades y sus pagos con invoice. Solo lectura
// (las reglas tampoco le dejan agregar, editar ni eliminar).
const MyPaymentsView = () => {
  const { isLoading: isLoadingPeriods, selectedPeriod } = useAcademicPeriod();
  const data = usePaymentsData(selectedPeriod?.id ?? null);
  const permissions = usePermissions();
  const [invoicePaymentId, setInvoicePaymentId] = useState<string | null>(null);

  const accountRow = data.accountRows[0] ?? null;
  const invoicePayment = data.payments.find((payment) => payment.id === invoicePaymentId) ?? null;
  const showNoPeriod = !isLoadingPeriods && !selectedPeriod;

  return (
    <div className="view">
      <ViewHeader subtitle={selectedPeriod?.name ?? 'Sin período académico'} title="Mis pagos" />
      {showNoPeriod && <NoPeriodState />}
      {selectedPeriod && data.isLoading && <ListSkeleton rows={6} />}
      {selectedPeriod && !data.isLoading && !accountRow && (
        <section className="panel">
          <EmptyState
            icon={Banknote}
            text="No estás inscrito en este período. Si crees que es un error, habla con Administración."
            title="Sin estado de cuenta"
          />
        </section>
      )}
      {selectedPeriod && accountRow && (
        <>
          <section className="panel my-account">
            <header className="panel-header">
              <div>
                <h2 className="panel-title">Estado de cuenta</h2>
                <p className="view-subtitle">{accountRow.className}</p>
              </div>
              <span className={ACCOUNT_STATUS_BADGES[accountRow.status]}>{ACCOUNT_STATUS_LABELS[accountRow.status]}</span>
            </header>
            <div className="my-account-body">
              <AccountSummary account={accountRow.account} />
              <div>
                <h3 className="form-section-title">Mensualidades</h3>
                <MonthStatusGrid months={accountRow.account.months} />
              </div>
            </div>
          </section>
          <section className="panel panel-body-flush">
            <header className="panel-header">
              <h2 className="panel-title">Mis pagos</h2>
            </header>
            {data.payments.length > 0 ? (
              <PaymentTable
                classNames={data.classNames}
                onOpenInvoice={(payment) => setInvoicePaymentId(payment.id)}
                payments={data.payments}
                rowPermissions={NO_ACTIONS}
              />
            ) : (
              <EmptyState icon={Banknote} text="Todavía no hay pagos registrados en este período." title="Sin pagos" />
            )}
          </section>
        </>
      )}
      {invoicePayment && (
        <InvoiceDialog
          balance={getInvoiceBalance(
            data.costs.find((cost) => cost.classId === invoicePayment.classId) ?? null,
            data.payments,
            invoicePayment,
          )}
          canPrint={permissions.can('payments', 'print')}
          className={getRelationName(data.classNames, invoicePayment.classId)}
          onClose={() => setInvoicePaymentId(null)}
          payment={invoicePayment}
          period={selectedPeriod}
          student={accountRow?.student ?? null}
        />
      )}
    </div>
  );
};

export default MyPaymentsView;
