import type { StudentSubjectRecord } from './studentRecord';

// Expediente académico ("Total Credit Record Accumulation"): una sección por clase (año) del programa.
export interface TranscriptRow {
  // Número corrido en todo el expediente (1, 2, 3… de Primer a Cuarto), como en la hoja.
  number: number;
  // null = materia del programa que el alumno todavía no ha cursado.
  record: StudentSubjectRecord | null;
  // Semestre de la materia en el catálogo (1 o 2); null si no lo tiene.
  semester: number | null;
  subjectId: string;
  subjectName: string;
}

export interface TranscriptSection {
  classId: string;
  className: string;
  // Período en que cursó esa clase (el más reciente si la repitió); null si aún no la cursa.
  periodName: string | null;
  rows: TranscriptRow[];
}

export interface TranscriptSummary {
  average: number | null;
  gpa: number | null;
  gradedSubjects: number;
  // "07/2026 – 04/2027": del primer período al último en que estuvo inscrito.
  studyYears: string | null;
}
