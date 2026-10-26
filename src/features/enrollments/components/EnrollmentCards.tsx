import { Link } from 'react-router-dom';
import { buildStudentDetailPath } from '../../../routes/paths';
import RowActions from '../../../shared/components/RowActions';
import type { Enrollment, EnrollmentRow, RowPermissions } from '../../../types/index';
import { formatDate } from '../../../utils/dateFormat';

interface EnrollmentCardsProps {
  rowPermissions: RowPermissions;
  onDelete: (enrollment: Enrollment) => void;
  onEdit: (enrollment: Enrollment) => void;
  rows: EnrollmentRow[];
}

const EnrollmentCards = ({ onDelete, onEdit, rowPermissions, rows }: EnrollmentCardsProps) => (
  <ul className="record-cards">
    {rows.map(({ className, enrollment, studentCode, studentName }) => (
      <li className="record-card" key={enrollment.id}>
        <div className="record-card-header">
          <div>
            <Link className="cell-link record-card-title" to={buildStudentDetailPath(enrollment.studentId)}>
              {studentName}
            </Link>
            <span className="cell-id">{studentCode}</span>
          </div>
          <RowActions
            canDelete={rowPermissions.canDelete}
            canEdit={rowPermissions.canEdit}
            itemLabel={`la inscripción de ${studentName}`}
            onDelete={() => onDelete(enrollment)}
            onEdit={() => onEdit(enrollment)}
          />
        </div>
        <dl className="record-card-meta">
          <dt>Clase</dt>
          <dd>{className}</dd>
          <dt>Inscrito</dt>
          <dd>{formatDate(enrollment.date)}</dd>
        </dl>
      </li>
    ))}
  </ul>
);

export default EnrollmentCards;
