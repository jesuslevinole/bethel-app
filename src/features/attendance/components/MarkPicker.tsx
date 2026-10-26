import type { AttendanceMark } from '../../../types/index';
import { ATTENDANCE_LABELS, ATTENDANCE_LETTERS } from '../attendanceMarks';

interface MarkPickerProps {
  isEditable: boolean;
  mark: AttendanceMark | undefined;
  onChange: (mark: AttendanceMark | null) => void;
  studentName: string;
}

const MARK_OPTIONS: AttendanceMark[] = ['present', 'late', 'absent'];

// Presente / Tarde / Falta en un solo toque. Tocar la opción marcada la quita.
const MarkPicker = ({ isEditable, mark, onChange, studentName }: MarkPickerProps) => (
  <div aria-label={`Asistencia de ${studentName}`} className="mark-picker" role="group">
    {MARK_OPTIONS.map((option) => (
      <button
        aria-pressed={mark === option}
        className={`mark-picker-option is-${option}${mark === option ? ' is-selected' : ''}`}
        disabled={!isEditable}
        key={option}
        onClick={() => onChange(mark === option ? null : option)}
        title={ATTENDANCE_LABELS[option]}
        type="button"
      >
        <span className="mark-picker-letter">{ATTENDANCE_LETTERS[option]}</span>
        <span className="mark-picker-label">{ATTENDANCE_LABELS[option]}</span>
      </button>
    ))}
  </div>
);

export default MarkPicker;
