// Notas de un alumno en una materia. null = todavía sin nota.
// daily = promedio de las ND de la hoja de asistencia (se guarda al guardar exámenes).
// project = proyecto, opcional: si la materia no lleva, queda en null y no cuenta en el promedio.
// Planillas guardadas antes del proyecto no traen ese campo: se leen con { ...EMPTY_SCORES, ...guardado }.
export interface StudentScores {
  daily: number | null;
  firstExam: number | null;
  project: number | null;
  secondExam: number | null;
}

export type ScoreField = keyof StudentScores;

// Planilla de notas de UNA materia de un registro de maestro (todo el período).
// Id del documento: `${assignmentId}_${subjectId}` (gradeSheetId).
export interface GradeSheet {
  assignmentId: string;
  classId: string;
  id: string;
  periodId: string;
  scores: Record<string, Partial<StudentScores>>;
  subjectId: string;
  teacherId: string;
}

// Resultado de la fórmula del instituto para un alumno en una materia (features/attendance/gradeFormula.ts).
export interface GradeResult {
  // Nota diaria que va en la boleta: promedio de ND menos 1 punto por falta.
  adjustedDaily: number | null;
  // Asistencia sobre 10: 10 menos las faltas, mínimo 3.
  attendanceScore: number | null;
  // Promedio ("Average Credit"): 1er examen + nota diaria + 2do examen (+ proyecto si tiene) entre 3 (o 4).
  average: number | null;
  gpa: string | null;
}
