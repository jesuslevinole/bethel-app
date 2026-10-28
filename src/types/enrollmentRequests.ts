// Solicitud de inscripción que hace el estudiante (ya aprobado como alumno). La oficina la confirma:
// al aprobarla se crea la inscripción de verdad (enrollments).
export type EnrollmentRequestStatus = 'approved' | 'pending' | 'rejected';

export interface EnrollmentRequest {
  classId: string;
  date: string;
  id: string;
  periodId: string;
  reviewNote?: string;
  status: EnrollmentRequestStatus;
  studentId: string;
  // Copia del nombre: la oficina ve la lista aunque el alumno cambie de nombre después.
  studentName: string;
}
