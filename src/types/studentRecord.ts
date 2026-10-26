import type { GradeResult, StudentScores } from './grades';

// Una fila de la ficha del alumno: lo que lleva en una materia de un período.
export interface StudentSubjectRecord {
  absent: number;
  classId: string;
  key: string;
  late: number;
  periodId: string;
  present: number;
  result: GradeResult;
  scores: StudentScores;
  subjectId: string;
  subjectName: string;
  teacherName: string;
}
