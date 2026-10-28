import { Printer } from 'lucide-react';
import Modal from '../../../shared/components/Modal';
import type { DateRange } from '../../../types/index';
import type { AccountStatement } from '../statementData';
import StatementDocument from './StatementDocument';
import '../../../shared/components/PrintDocument.css';

interface StatementDialogProps {
  onClose: () => void;
  range: DateRange;
  statement: AccountStatement;
}

const StatementDialog = ({ onClose, range, statement }: StatementDialogProps) => (
  <Modal
    onClose={onClose}
    size="full"
    subtitle="Para el PDF: Imprimir → Destino: Guardar como PDF."
    title="Estado de cuenta"
  >
    <div className="modal-body statement-stage">
      <StatementDocument range={range} statement={statement} />
    </div>
    <footer className="modal-footer">
      <button className="btn btn-secondary" onClick={onClose} type="button">
        Cerrar
      </button>
      <button className="btn btn-primary" onClick={() => window.print()} type="button">
        <Printer size={18} />
        Imprimir / PDF
      </button>
    </footer>
  </Modal>
);

export default StatementDialog;
