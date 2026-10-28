import { Link } from 'react-router-dom';
import { buildStudentDetailPath } from '../../../routes/paths';
import RowActions from '../../../shared/components/RowActions';
import type { Enrollment, EnrollmentRow, RowPermissions } from '../../../types/index';
import { formatDate } from '../../../utils/dateFormat';
import { displayId } from '../../../utils/displayId';
import { useColumnLabels } from '../../customization/useColumnLabels';

interface EnrollmentTableProps {
  rowPermissions: RowPermissions;
  onDelete: (enrollment: Enrollment) => void;
  onEdit: (enrollment: Enrollment) => void;
  rows: EnrollmentRow[];
}

const EnrollmentTable = ({ onDelete, onEdit, rowPermissions, rows }: EnrollmentTableProps) => {
  const columnLabel = useColumnLabels('enrollments');

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th scope="col">{columnLabel('id')}</th>
            <th scope="col">{columnLabel('date')}</th>
            <th scope="col">{columnLabel('studentCode')}</th>
            <th scope="col">{columnLabel('studentName')}</th>
            <th scope="col">{columnLabel('className')}</th>
            <th scope="col">
              <span className="visually-hidden">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ className, enrollment, studentCode, studentName }) => (
            <tr key={enrollment.id}>
              <td className="cell-id">{displayId(enrollment.id)}</td>
              <td className="cell-date">{formatDate(enrollment.date)}</td>
              <td className="cell-id">{studentCode}</td>
              <td className="cell-strong">
                <Link className="cell-link" to={buildStudentDetailPath(enrollment.studentId)}>
                  {studentName}
                </Link>
              </td>
              <td>{className}</td>
              <td className="cell-actions">
                <RowActions
                  canDelete={rowPermissions.canDelete}
                  canEdit={rowPermissions.canEdit}
                  itemLabel={`la inscripción de ${studentName}`}
                  onDelete={() => onDelete(enrollment)}
                  onEdit={() => onEdit(enrollment)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EnrollmentTable;
