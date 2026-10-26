import type { AttendanceMark } from '../../types/index';

export const ATTENDANCE_LABELS: Record<AttendanceMark, string> = {
  absent: 'Falta',
  late: 'Tarde',
  present: 'Presente',
};

// Letra que se ve en la celda "A" de la hoja.
export const ATTENDANCE_LETTERS: Record<AttendanceMark, string> = {
  absent: 'F',
  late: 'T',
  present: 'P',
};

// Cada toque en la celda pasa al siguiente: vacío → P → T → F → vacío.
const MARK_CYCLE: (AttendanceMark | null)[] = [null, 'present', 'late', 'absent'];

export const getNextMark = (mark: AttendanceMark | undefined) => {
  const currentIndex = MARK_CYCLE.indexOf(mark ?? null);
  return MARK_CYCLE[(currentIndex + 1) % MARK_CYCLE.length];
};

// Cuántas clases tiene marcadas un alumno en la hoja, por tipo.
export const countMarks = (sessions: { marks: Record<string, AttendanceMark> }[], studentId: string) => {
  const marks = sessions.map((session) => session.marks[studentId]).filter(Boolean);
  return {
    absent: marks.filter((mark) => mark === 'absent').length,
    late: marks.filter((mark) => mark === 'late').length,
    marked: marks.length,
    present: marks.filter((mark) => mark === 'present').length,
  };
};
