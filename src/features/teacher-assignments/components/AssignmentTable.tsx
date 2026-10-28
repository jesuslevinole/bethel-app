import RowActions from '../../../shared/components/RowActions';
import type { AssignmentRow, RowPermissions, TeacherAssignment } from '../../../types/index';
import { formatDate } from '../../../utils/dateFormat';
import { displayId } from '../../../utils/displayId';
import SubjectChips from './SubjectChips';
import './AssignmentTable.css';
import { useColumnLabels } from '../../customization/useColumnLabels';

interface AssignmentTableProps {
  rowPermissions: RowPermissions;
  onDelete: (assignment: TeacherAssignment) => void;
  onEdit: (assignment: TeacherAssignment) => void;
  rows: AssignmentRow[];
}

const AssignmentTable = ({ onDelete, onEdit, rowPermissions, rows }: AssignmentTableProps) => {
  const columnLabel = useColumnLabels('teacherAssignments');

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th scope="col">{columnLabel('id')}</th>
            <th scope="col">{columnLabel('date')}</th>
            <th scope="col">{columnLabel('teacher')}</th>
            <th scope="col">{columnLabel('className')}</th>
            <th scope="col">{columnLabel('subjects')}</th>
            <th className="cell-num" scope="col">
              {columnLabel('students')}
            </th>
            <th scope="col">
              <span className="visually-hidden">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ assignment, className, subjectNames, teacherName }) => (
            <tr key={assignment.id}>
              <td className="cell-id">{displayId(assignment.id)}</td>
              <td className="cell-date">{formatDate(assignment.date)}</td>
              <td className="cell-strong">{teacherName}</td>
              <td>{className}</td>
              <td className="assignment-subjects">
                <SubjectChips subjectNames={subjectNames} />
              </td>
              <td className="cell-num">{assignment.roster?.length ?? 0}</td>
              <td className="cell-actions">
                <RowActions
                  canDelete={rowPermissions.canDelete}
                  canEdit={rowPermissions.canEdit}
                  itemLabel={`las materias de ${teacherName}`}
                  onDelete={() => onDelete(assignment)}
                  onEdit={() => onEdit(assignment)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AssignmentTable;
