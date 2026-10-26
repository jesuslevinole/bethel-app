import { Printer } from 'lucide-react';
import Modal from '../../../shared/components/Modal';
import type { AcademicPeriod, Student } from '../../../types/index';
import IdCard from './IdCard';

interface IdCardDialogProps {
  className: string | null;
  onClose: () => void;
  period: AcademicPeriod | null;
  photoUrl: string | null;
  student: Student;
}

const IdCardDialog = ({ className, onClose, period, photoUrl, student }: IdCardDialogProps) => (
  <Modal onClose={onClose} subtitle="Se imprime a tamaño tarjeta (85.6 × 54 mm)." title="Carnet del alumno">
    <div className="modal-body">
      <IdCard className={className} period={period} photoUrl={photoUrl} student={student} />
      {!photoUrl && <p className="id-card-hint">Sube la foto del alumno en su ficha para que aparezca en el carnet.</p>}
    </div>
    <footer className="modal-footer">
      <button className="btn btn-secondary" onClick={onClose} type="button">
        Cerrar
      </button>
      <button className="btn btn-primary" onClick={() => window.print()} type="button">
        <Printer size={18} />
        Imprimir carnet
      </button>
    </footer>
  </Modal>
);

export default IdCardDialog;
