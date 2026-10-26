import { Link } from 'react-router-dom';
import { buildStudentDetailPath } from '../../../routes/paths';
import RowActions from '../../../shared/components/RowActions';
import type { RowPermissions, Student } from '../../../types/index';
import { displayId } from '../../../utils/displayId';

interface StudentTableProps {
  rowPermissions: RowPermissions;
  onDelete: (student: Student) => void;
  onEdit: (student: Student) => void;
  students: Student[];
}

const StudentTable = ({ onDelete, onEdit, rowPermissions, students }: StudentTableProps) => (
  <div className="table-wrap">
    <table className="table">
      <thead>
        <tr>
          <th scope="col">ID</th>
          <th scope="col">Código</th>
          <th scope="col">Alumno</th>
          <th scope="col">Dirección</th>
          <th scope="col">Ciudad</th>
          <th scope="col">Iglesia</th>
          <th scope="col">Pastor</th>
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

export default StudentTable;
