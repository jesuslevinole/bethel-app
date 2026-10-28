import { Link } from 'react-router-dom';
import { buildStudentDetailPath } from '../../../routes/paths';
import RowActions from '../../../shared/components/RowActions';
import type { RowPermissions, Student } from '../../../types/index';
import { displayId } from '../../../utils/displayId';
import { useColumnLabels } from '../../customization/useColumnLabels';

interface StudentTableProps {
  rowPermissions: RowPermissions;
  onDelete: (student: Student) => void;
  onEdit: (student: Student) => void;
  students: Student[];
}

const StudentTable = ({ onDelete, onEdit, rowPermissions, students }: StudentTableProps) => {
  const columnLabel = useColumnLabels('students');

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th scope="col">{columnLabel('id')}</th>
            <th scope="col">{columnLabel('code')}</th>
            <th scope="col">{columnLabel('name')}</th>
            <th scope="col">{columnLabel('address')}</th>
            <th scope="col">{columnLabel('city')}</th>
            <th scope="col">{columnLabel('church')}</th>
            <th scope="col">{columnLabel('pastor')}</th>
            <th scope="col">
              <span className="visually-hidden">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td className="cell-id">{displayId(student.id)}</td>
              <td className="cell-id">{student.code}</td>
              <td className="cell-strong">
                <Link className="cell-link" to={buildStudentDetailPath(student.id)}>
                  {student.name}
                </Link>
                {student.isTest && <span className="badge badge-warning test-data-badge">Prueba</span>}
              </td>
              <td className="cell-muted">{student.address || '—'}</td>
              <td>{student.city || '—'}</td>
              <td>{student.church || '—'}</td>
              <td>{student.pastor || '—'}</td>
              <td className="cell-actions">
                <RowActions
                  canDelete={rowPermissions.canDelete}
                  canEdit={rowPermissions.canEdit}
                  itemLabel={student.name}
                  onDelete={() => onDelete(student)}
                  onEdit={() => onEdit(student)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentTable;
