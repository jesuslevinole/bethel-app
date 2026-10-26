export type AttendanceMark = 'absent' | 'late' | 'present';

// Una clase (fecha) de UNA materia de un registro de maestro: asistencia (A) y nota diaria (ND) de cada alumno.
// Id del documento: `${assignmentId}_${subjectId}_${date}` (getAttendanceSheetId).
// dailyScores puede faltar en planillas guardadas antes de la hoja de asistencia.
export interface AttendanceSheet {
  assignmentId: string;
  classId: string;
  dailyScores?: Record<string, number | null>;
  date: string;
  id: string;
  marks: Record<string, AttendanceMark>;
  periodId: string;
  subjectId: string;
  teacherId: string;
}

// Lo que se edita de una clase en la hoja (sin los datos del grupo).
export interface SessionDraft {
  dailyScores: Record<string, number | null>;
  marks: Record<string, AttendanceMark>;
}
