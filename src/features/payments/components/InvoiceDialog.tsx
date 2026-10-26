import { Printer } from 'lucide-react';
import Modal from '../../../shared/components/Modal';
import type { AcademicPeriod, Payment, Student } from '../../../types/index';
import type { InvoiceBalance } from '../invoiceBalance';
import { formatInvoiceNumber } from '../services/paymentRecords';
import InvoiceDocument from './InvoiceDocument';
import '../../../shared/components/PrintDocument.css';
import './Invoice.css';

interface InvoiceDialogProps {
  balance: InvoiceBalance | null;
  canPrint: boolean;
  className: string;
  onClose: () => void;
  payment: Payment;
  period: AcademicPeriod | null;
  student: Student | null;
}

// Al imprimir (o "Guardar como PDF") el archivo se llama como el invoice: el navegador usa el título de la página.
const printWithTitle = (title: string) => {
  const previousTitle = document.title;
  const restoreTitle = () => {
    document.title = previousTitle;
    window.removeEventListener('afterprint', restoreTitle);
  };
  window.addEventListener('afterprint', restoreTitle);
  document.title = title;
  window.print();
};

const InvoiceDialog = ({ balance, canPrint, className, onClose, payment, period, student }: InvoiceDialogProps) => {
  const fileTitle = `${formatInvoiceNumber(payment.invoiceNumber)} ${student?.name ?? ''}`.trim();

  return (
    <Modal
      onClose={onClose}
      size="full"
      subtitle="Para el PDF: Imprimir → Destino: Guardar como PDF."
      title={`Invoice ${formatInvoiceNumber(payment.invoiceNumber)}`}
    >
      <div className="modal-body invoice-stage">
        <InvoiceDocument balance={balance} className={className} payment={payment} period={period} student={student} />
      </div>
      <footer className="modal-footer">
        <button className="btn btn-secondary" onClick={onClose} type="button">
          Cerrar
        </button>
        {canPrint && (
          <button className="btn btn-primary" onClick={() => printWithTitle(fileTitle)} type="button">
            <Printer size={18} />
            Imprimir / PDF
          </button>
        )}
      </footer>
    </Modal>
  );
};

export default InvoiceDialog;
