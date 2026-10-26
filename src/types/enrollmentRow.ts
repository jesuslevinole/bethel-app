import type { Enrollment } from './enrollments';

// Inscripción lista para mostrar: con el nombre y código del alumno y el nombre de la clase ya resueltos.
export interface EnrollmentRow {
  className: string;
  enrollment: Enrollment;
  studentCode: string;
  studentName: string;
}
