import RowActions from '../../../shared/components/RowActions';
import type { AssignmentRow, RowPermissions, TeacherAssignment } from '../../../types/index';
import SubjectChips from './SubjectChips';

interface AssignmentCardsProps {
  rowPermissions: RowPermissions;
  onDelete: (assignment: TeacherAssignment) => void;
  onEdit: (assignment: TeacherAssignment) => void;
  rows: AssignmentRow[];
}

const AssignmentCards = ({ onDelete, onEdit, rowPermissions, rows }: AssignmentCardsProps) => (
  <ul className="record-cards">
    {rows.map(({ assignment, className, subjectNames, teacherName }) => (
      <li className="record-card" key={assignment.id}>
        <div className="record-card-header">
          <div>
            <h3 className="record-card-title">{teacherName}</h3>
            <span className="cell-muted">{className}</span>
          </div>
          <RowActions
            canDelete={rowPermissions.canDelete}
            canEdit={rowPermissions.canEdit}
            itemLabel={`las materias de ${teacherName}`}
            onDelete={() => onDelete(assignment)}
            onEdit={() => onEdit(assignment)}
          />
        </div>
        <SubjectChips subjectNames={subjectNames} />
        <span className="cell-muted">{assignment.roster?.length ?? 0} alumnos en la lista</span>
      </li>
    ))}
  </ul>
);

export default AssignmentCards;
