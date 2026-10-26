// Inscripción de un alumno a una clase en un período académico. El nombre y el código del alumno
// se leen en vivo de `students` (no se copian) para que un cambio de nombre se vea en todas partes.
export interface Enrollment {
  classId: string;
  date: string;
  id: string;
  isTest?: boolean;
  periodId: string;
  studentId: string;
}
