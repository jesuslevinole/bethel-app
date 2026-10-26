import type { AttendanceMark } from '../../../types/index';
import { ATTENDANCE_LABELS, ATTENDANCE_LETTERS } from '../attendanceMarks';

interface MarkCellProps {
  isEditable: boolean;
  label: string;
  mark: AttendanceMark | undefined;
  onToggle: () => void;
}

// Celda "A": cada toque cambia vacío → P → T → F.
const MarkCell = ({ isEditable, label, mark, onToggle }: MarkCellProps) => {
  const markClass = mark ? ` is-${mark}` : '';
  const title = mark ? ATTENDANCE_LABELS[mark] : 'Sin marcar';

  return (
    <button
      aria-label={`${label}: ${title}`}
      className={`mark-cell${markClass}`}
      disabled={!isEditable}
      onClick={onToggle}
      title={title}
      type="button"
    >
      {mark ? ATTENDANCE_LETTERS[mark] : '·'}
    </button>
  );
};

export default MarkCell;
