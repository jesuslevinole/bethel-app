import type { ExportColumn } from '../../shared/export/exportToExcel';
import type { AttendanceSheet, RosterStudent, StudentScores } from '../../types/index';
import { formatDate } from '../../utils/dateFormat';
import { ATTENDANCE_LETTERS, countMarks } from './attendanceMarks';
import { computeGrade, formatAttendanceScore } from './gradeFormula';
import { getDailyAverage } from './gradeScores';

const studentColumns: ExportColumn<RosterStudent>[] = [
  { header: 'Código', value: (student) => student.code, width: 14 },
  { header: 'Alumno', value: (student) => student.name, width: 30 },
];

// Hoja completa: por cada fecha, A (P/T/F) y ND; al final asistencia y promedio de ND.
export const getSheetExportColumns = (sessions: AttendanceSheet[]): ExportColumn<RosterStudent>[] => [
  ...studentColumns,
  ...sessions.flatMap<ExportColumn<RosterStudent>>((session) => [
    {
      header: `${formatDate(session.date).slice(0, 5)} A`,
      value: (student) => {
        const mark = session.marks[student.id];
        return mark ? ATTENDANCE_LETTERS[mark] : '';
      },
      width: 9,
    },
    { header: `${formatDate(session.date).slice(0, 5)} ND`, value: (student) => session.dailyScores?.[student.id], width: 9 },
  ]),
  {
    header: 'Asistió',
    value: (student) => {
      const marks = countMarks(sessions, student.id);
      return marks.marked > 0 ? `${marks.present + marks.late}/${marks.marked}` : '';
    },
    width: 10,
  },
  { header: 'Promedio ND', value: (student) => getDailyAverage(sessions, student.id), width: 13 },
];

// Notas de exámenes con la fórmula del instituto.
export const getGradesExportColumns = (
  sessions: AttendanceSheet[],
  scores: Record<string, StudentScores>,
): ExportColumn<RosterStudent>[] => {
  const getResult = (student: RosterStudent) => {
    const marks = countMarks(sessions, student.id);
    return computeGrade({ absences: marks.absent, markedSessions: marks.marked, scores: scores[student.id] });
  };
  return [
    ...studentColumns,
    { header: 'Nota diaria', value: (student) => getResult(student).adjustedDaily, width: 12 },
    { header: 'Primer examen', value: (student) => scores[student.id]?.firstExam, width: 14 },
    { header: 'Segundo examen', value: (student) => scores[student.id]?.secondExam, width: 15 },
    { header: 'Proyecto', value: (student) => scores[student.id]?.project, width: 11 },
    { header: 'Faltas', value: (student) => countMarks(sessions, student.id).absent, width: 9 },
    {
      header: 'Asistencia',
      value: (student) => {
        const score = getResult(student).attendanceScore;
        return score === null ? '' : formatAttendanceScore(score);
      },
      width: 11,
    },
    { header: 'Promedio', value: (student) => getResult(student).average, width: 11 },
    { header: 'GPA', value: (student) => getResult(student).gpa, width: 8 },
  ];
};
