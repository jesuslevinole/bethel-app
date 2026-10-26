import type { AttendanceSheet, ScoreField, StudentScores } from '../../types/index';
import { roundMoney } from '../../utils/money';

// Notas que escribe el maestro (la diaria sale de la hoja de asistencia). El proyecto es opcional.
export const EXAM_FIELDS: { field: Exclude<ScoreField, 'daily'>; label: string }[] = [
  { field: 'firstExam', label: 'Primer examen' },
  { field: 'secondExam', label: 'Segundo examen' },
  { field: 'project', label: 'Proyecto' },
];

export const EMPTY_SCORES: StudentScores = { daily: null, firstExam: null, project: null, secondExam: null };

// Planillas viejas no traen todos los campos.
export const toStudentScores = (saved: Partial<StudentScores> | undefined): StudentScores => ({ ...EMPTY_SCORES, ...saved });

export const MAX_SCORE = 100;

// Texto del input → nota (vacío = sin nota). Se limita a 0–100 con dos decimales.
export const parseScore = (text: string) => {
  if (!text.trim()) return null;
  const score = Number.parseFloat(text);
  if (!Number.isFinite(score)) return null;
  return roundMoney(Math.min(Math.max(score, 0), MAX_SCORE));
};

export const formatScore = (score: number | null | undefined) => (score === null || score === undefined ? '—' : String(score));

export const averageScores = (scores: (number | null | undefined)[]) => {
  const validScores = scores.filter((score): score is number => typeof score === 'number');
  if (validScores.length === 0) return null;
  return roundMoney(validScores.reduce((total, score) => total + score, 0) / validScores.length);
};

// Nota diaria del período = promedio de las ND que el alumno tiene en la hoja de asistencia.
export const getDailyAverage = (sessions: Pick<AttendanceSheet, 'dailyScores'>[], studentId: string) =>
  averageScores(sessions.map((session) => session.dailyScores?.[studentId]));
