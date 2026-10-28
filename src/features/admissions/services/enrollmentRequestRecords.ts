import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { COLLECTIONS } from '../../../lib/firebase/collections';
import { typedConverter } from '../../../lib/firebase/typedConverter';
import { enrollmentRequestsService } from '../../../services/enrollmentRequestsService';
import type { Enrollment, EnrollmentRequest, Student } from '../../../types/index';
import { todayIso } from '../../../utils/dateFormat';
import { UserFacingError } from '../../../utils/userFacingError';
import { saveEnrollment } from '../../enrollments/services/enrollmentRecords';

// El alumno pide inscribirse en una clase de un período; la oficina la confirma.
export const requestEnrollment = async (student: Student, classId: string, periodId: string) => {
  await enrollmentRequestsService.create({
    classId,
    date: todayIso(),
    periodId,
    status: 'pending',
    studentId: student.id,
    studentName: student.name,
  });
};

export const cancelEnrollmentRequest = async (request: EnrollmentRequest) => {
  await enrollmentRequestsService.delete(request.id);
};

const findEnrollment = async (studentId: string, periodId: string) => {
  const snapshot = await getDocs(
    query(
      collection(db, COLLECTIONS.enrollments).withConverter(typedConverter<Enrollment>()),
      where('studentId', '==', studentId),
      where('periodId', '==', periodId),
    ),
  );
  return snapshot.docs[0]?.data() ?? null;
};

// Aprobar = inscribirlo de verdad (con su lista en los maestros). Un alumno, una clase por período.
export const approveEnrollmentRequest = async (request: EnrollmentRequest) => {
  const existing = await findEnrollment(request.studentId, request.periodId);
  if (existing && existing.classId !== request.classId) {
    throw new UserFacingError('Este alumno ya está inscrito en otra clase de ese período. Cámbialo en Inscripciones.');
  }
  if (!existing) {
    await saveEnrollment(null, {
      classId: request.classId,
      date: todayIso(),
      periodId: request.periodId,
      studentId: request.studentId,
    });
  }
  await enrollmentRequestsService.update(request.id, { reviewNote: '', status: 'approved' });
};

export const rejectEnrollmentRequest = async (request: EnrollmentRequest, reviewNote: string) => {
  if (!reviewNote.trim()) throw new UserFacingError('Escribe el motivo para que el alumno sepa qué hacer.');
  await enrollmentRequestsService.update(request.id, { reviewNote: reviewNote.trim(), status: 'rejected' });
};
