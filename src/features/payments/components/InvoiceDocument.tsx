import logoUrl from '../../../assets/bethel-logo.png';
import { INSTITUTE } from '../../../config/institute';
import type { AcademicPeriod, Payment, Student } from '../../../types/index';
import { formatDate } from '../../../utils/dateFormat';
import { formatMoney } from '../../../utils/money';
import type { InvoiceBalance } from '../invoiceBalance';
import { formatInvoiceNumber } from '../services/paymentRecords';

export interface InvoiceDocumentProps {
  balance: InvoiceBalance | null;
  className: string;
  payment: Payment;
  period: AcademicPeriod | null;
  student: Pick<Student, 'address' | 'church' | 'city' | 'code' | 'name'> | null;
}

// Invoice (comprobante de pago) en formato carta: membrete con el logo, datos del alumno y del pago,
// conceptos, total y el estado de cuenta antes y después de este pago.
const InvoiceDocument = ({ balance, className, payment, period, student }: InvoiceDocumentProps) => {
  const addressLine = [student?.address, student?.city].filter(Boolean).join(', ');
  const isFullyPaid = balance !== null && balance.balanceAfter === 0;

  return (
    <article className="print-document invoice">
      <header className="invoice-header">
        <div className="invoice-brand">
          <img alt="" className="invoice-logo" src={logoUrl} />
          <div className="invoice-brand-text">
            <span className="invoice-institute">{INSTITUTE.name}</span>
            <span className="invoice-line">{INSTITUTE.church}</span>
            <span className="invoice-line">{INSTITUTE.address}</span>
          </div>
        </div>
        <div className="invoice-title-block">
          <h2 className="invoice-title">Invoice</h2>
          <dl className="invoice-meta">
            <div>
              <dt>Número</dt>
              <dd>{formatInvoiceNumber(payment.invoiceNumber)}</dd>
            </div>
            <div>
              <dt>Fecha</dt>
              <dd>{formatDate(payment.date)}</dd>
            </div>
          </dl>
          <span className="invoice-stamp">Pagado</span>
        </div>
      </header>

      <section className="invoice-parties">
        <div className="invoice-party">
          <h3 className="invoice-label">Facturado a</h3>
          <span className="invoice-student">{student?.name ?? 'Alumno'}</span>
          {student?.code && <span className="invoice-line-dark">Código {student.code}</span>}
          {addressLine && <span className="invoice-line-dark">{addressLine}</span>}
          {student?.church && <span className="invoice-line-dark">{student.church}</span>}
        </div>
        <div className="invoice-party">
          <h3 className="invoice-label">Detalles del pago</h3>
          <dl className="invoice-details">
            <div>
              <dt>Clase</dt>
              <dd>{className}</dd>
            </div>
            {period && (
              <div>
                <dt>Período</dt>
                <dd>{period.name}</dd>
              </div>
            )}
            <div>
              <dt>Forma de pago</dt>
              <dd>{[payment.incomeTypeName, payment.bankName].filter(Boolean).join(' · ') || '—'}</dd>
            </div>
            {payment.notes && (
              <div>
                <dt>Referencia</dt>
                <dd>{payment.notes}</dd>
              </div>
            )}
          </dl>
        </div>
      </section>

      <table className="invoice-items">
        <thead>
          <tr>
            <th className="invoice-index" scope="col">
              #
            </th>
            <th scope="col">Concepto</th>
            <th scope="col">Detalle</th>
            <th className="invoice-amount" scope="col">
              Monto
            </th>
          </tr>
        </thead>
        <tbody>
          {payment.items.map((item, index) => (
            <tr key={`${item.paymentTypeId}-${item.month}-${index}`}>
              <td className="invoice-index">{index + 1}</td>
              <td className="invoice-concept">{item.paymentTypeName}</td>
              <td className="invoice-detail">{item.description || '—'}</td>
              <td className="invoice-amount">{formatMoney(item.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="invoice-summary">
        <dl className="invoice-totals">
          <div>
            <dt>Subtotal</dt>
            <dd>{formatMoney(payment.total)}</dd>
          </div>
          <div className="invoice-grand-total">
            <dt>Total pagado</dt>
            <dd>{formatMoney(payment.total)}</dd>
          </div>
        </dl>
      </div>

      {balance && (
        <section className="invoice-account">
          <h3 className="invoice-label">Estado de cuenta</h3>
          <dl className="invoice-account-grid">
            <div>
              <dt>Total del programa</dt>
              <dd>{formatMoney(balance.programTotal)}</dd>
            </div>
            <div>
              <dt>Saldo antes de este pago</dt>
              <dd>{formatMoney(balance.balanceBefore)}</dd>
            </div>
            <div>
              <dt>Pagado hasta la fecha</dt>
              <dd>{formatMoney(balance.paidToDate)}</dd>
            </div>
            <div className={isFullyPaid ? 'is-settled' : 'is-pending'}>
              <dt>Saldo pendiente</dt>
              <dd>{isFullyPaid ? 'Pagado' : formatMoney(balance.balanceAfter)}</dd>
            </div>
          </dl>
        </section>
      )}

      <footer className="invoice-footer">
        <div className="invoice-signatures">
          <div className="invoice-signature">
            <span className="invoice-signature-line" />
            <span className="invoice-label">Recibido por</span>
          </div>
          <div className="invoice-signature">
            <span className="invoice-signature-line" />
            <span className="invoice-label">Firma del alumno</span>
          </div>
        </div>
        <p className="invoice-thanks">
          Gracias por su pago. Este documento es el comprobante oficial de su pago a {INSTITUTE.name}.
        </p>
        <p className="invoice-fine">
          Director de educación: {INSTITUTE.principal} · {INSTITUTE.address}
        </p>
      </footer>
    </article>
  );
};

export default InvoiceDocument;
