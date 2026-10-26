import { Check, Clock, X, type LucideIcon } from 'lucide-react';
import type { AttendanceMark } from '../../../types/index';
import { ATTENDANCE_LABELS, ATTENDANCE_MARKS } from '../attendanceMarks';

interface MarkButtonsProps {
  disabled: boolean;
  onMark: (mark: AttendanceMark) => void;
  selectedMark: AttendanceMark | undefined;
  studentName: string;
}

const MARK_ICONS: Record<AttendanceMark, LucideIcon> = { absent: X, late: Clock, present: Check };

const MarkButtons = ({ disabled, onMark, selectedMark, studentName }: MarkButtonsProps) => (
  <div aria-label={`Asistencia de ${studentName}`} className="roll-marks" role="group">
    {ATTENDANCE_MARKS.map((mark) => {
      const Icon = MARK_ICONS[mark];
      const isSelected = mark === selectedMark;
      return (
        <button
          aria-pressed={isSelected}
          className={`is-${mark} mark-button${isSelected ? ' is-selected' : ''}`}
          disabled={disabled}
          key={mark}
          onClick={() => onMark(mark)}
          title={ATTENDANCE_LABELS[mark]}
          type="button"
        >
          <Icon size={15} />
          <span className="mark-button-label">{ATTENDANCE_LABELS[mark]}</span>
        </button>
      );
    })}
  </div>
);

export default MarkButtons;
