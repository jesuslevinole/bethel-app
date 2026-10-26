import type { GradeResult, StudentScores } from '../../types/index';
import { roundMoney } from '../../utils/money';

// Fórmula de la hoja "Instituto" (Trabajo + Reporte Total de Asignatura), con sus errores corregidos.
// Único lugar donde se calcula: si el instituto la cambia, se cambia aquí.

export const ATTENDANCE_MAX = 10;
const ATTENDANCE_MIN = 3;

// Escala de GPA de la hoja (de mayor a menor). Debajo de 70 es F.
const GPA_SCALE: { gpa: string; minimum: number }[] = [
  { gpa: '4.0', minimum: 93 },
  { gpa: '3.7', minimum: 90 },
  { gpa: '3.3', minimum: 85 },
  { gpa: '2.7', minimum: 80 },
  { gpa: '2.3', minimum: 77 },
  { gpa: '2.0', minimum: 73 },
  { gpa: '1.7', minimum: 70 },
];
export const FAILING_GPA = 'F';

// Puntos de cada GPA para promediar el expediente (F vale 0).
export const getGpaPoints = (gpa: string) => (gpa === FAILING_GPA ? 0 : Number.parseFloat(gpa));

// 0 faltas = 10, 1 = 9 … 7 o más = 3.
export const getAttendanceScore = (absences: number) => Math.max(ATTENDANCE_MAX - absences, ATTENDANCE_MIN);

// La nota diaria baja 1 punto por cada falta (nunca menos de 0).
export const getAdjustedDaily = (dailyAverage: number | null, absences: number) =>
  dailyAverage === null ? null : roundMoney(Math.max(dailyAverage - absences, 0));

export const getGpa = (average: number) =>
  GPA_SCALE.find((step) => average >= step.minimum)?.gpa ?? FAILING_GPA;

interface GradeInputs {
  // Faltas en la hoja de asistencia de esa materia.
  absences: number;
  // Clases (fechas) con asistencia marcada para el alumno.
  markedSessions: number;
  scores: StudentScores;
}

// Como en la hoja, una nota vacía cuenta como 0 en el promedio; el proyecto solo cuenta si tiene nota.
export const computeGrade = ({ absences, markedSessions, scores }: GradeInputs): GradeResult => {
  const adjustedDaily = getAdjustedDaily(scores.daily, absences);
  const hasAnyScore = [scores.firstExam, scores.daily, scores.secondExam, scores.project].some(
    (score) => score !== null,
  );
  const parts = [scores.firstExam ?? 0, adjustedDaily ?? 0, scores.secondExam ?? 0];
  if (scores.project !== null) parts.push(scores.project);
  const average = hasAnyScore ? roundMoney(parts.reduce((total, part) => total + part, 0) / parts.length) : null;

  return {
    adjustedDaily,
    attendanceScore: markedSessions > 0 || hasAnyScore ? getAttendanceScore(absences) : null,
    average,
    gpa: average === null ? null : getGpa(average),
  };
};

export const formatAttendanceScore = (score: number | null) => (score === null ? '—' : `${score}/${ATTENDANCE_MAX}`);
