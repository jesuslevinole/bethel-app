import { INSTITUTE } from '../../../config/institute';
import Barcode from '../../../shared/components/Barcode';
import Crest from '../../../shared/components/Crest';
import type { AcademicPeriod, Student } from '../../../types/index';
import { formatDate } from '../../../utils/dateFormat';
import StudentPhoto from './StudentPhoto';
import './IdCard.css';

interface IdCardProps {
  className: string | null;
  period: AcademicPeriod | null;
  photoUrl: string | null;
  student: Student;
}

// .id-card es el contenedor de medidas (cqw); .id-card-inner y su contenido se miden contra él.
const IdCard = ({ className, period, photoUrl, student }: IdCardProps) => {
  const address = [student.address, student.city].filter(Boolean).join(', ') || '—';
  const periodText = period ? `${formatDate(period.startDate)} – ${formatDate(period.endDate)}` : '—';

  return (
    <article aria-label={`Carnet de ${student.name}`} className="id-card">
      <div className="id-card-inner">
        <header className="id-card-header">
          <Crest inverted size={34} />
          <div>
            <span className="id-card-name">{INSTITUTE.name}</span>
            <span className="id-card-address">{INSTITUTE.address}</span>
          </div>
        </header>
        <div className="id-card-body">
          <StudentPhoto className="id-card-photo" dataUrl={photoUrl} name={student.name} />
          <dl className="id-card-fields">
            <div className="id-card-field">
              <dt>Nombre</dt>
              <dd className="id-card-student">{student.name}</dd>
            </div>
            <div className="id-card-field">
              <dt>Dirección</dt>
              <dd>{address}</dd>
            </div>
            <div className="id-card-field">
              <dt>Clase</dt>
              <dd>{className ?? 'Sin inscripción'}</dd>
            </div>
            <div className="id-card-field">
              <dt>Período</dt>
              <dd>{periodText}</dd>
            </div>
            <div className="id-card-footer">
              <span className="id-card-code">ID {student.code}</span>
              <Barcode className="id-card-barcode" value={student.code} />
            </div>
          </dl>
        </div>
      </div>
    </article>
  );
};

export default IdCard;
