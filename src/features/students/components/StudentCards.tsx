import { Link } from 'react-router-dom';
import { buildStudentDetailPath } from '../../../routes/paths';
import RowActions from '../../../shared/components/RowActions';
import type { RowPermissions, Student } from '../../../types/index';

interface StudentCardsProps {
  rowPermissions: RowPermissions;
  onDelete: (student: Student) => void;
  onEdit: (student: Student) => void;
  students: Student[];
}

const StudentCards = ({ onDelete, onEdit, rowPermissions, students }: StudentCardsProps) => (
  <ul className="record-cards">
    {students.map((student) => (
      <li className="record-card" key={student.id}>
        <div className="record-card-header">
          <div>
            <Link className="cell-link record-card-title" to={buildStudentDetailPath(student.id)}>
              {student.name}
            </Link>
            {student.isTest && <span className="badge badge-warning test-data-badge">Prueba</span>}
            <span className="cell-id">{student.code}</span>
          </div>
          <RowActions
            canDelete={rowPermissions.canDelete}
            canEdit={rowPermissions.canEdit}
            itemLabel={student.name}
            onDelete={() => onDelete(student)}
            onEdit={() => onEdit(student)}
          />
        </div>
        <dl className="record-card-meta">
          <dt>Ciudad</dt>
          <dd>{student.city || '—'}</dd>
          <dt>Iglesia</dt>
          <dd>{student.church || '—'}</dd>
          <dt>Pastor</dt>
          <dd>{student.pastor || '—'}</dd>
        </dl>
      </li>
    ))}
  </ul>
);

export default StudentCards;
