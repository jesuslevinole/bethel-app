import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { COLLECTIONS, type CollectionName } from '../../../lib/firebase/collections';
import { typedConverter } from '../../../lib/firebase/typedConverter';
import { deleteInChunks, type DeleteOperation } from '../../../shared/data/batchWrites';
import type { Enrollment, Student } from '../../../types/index';
import { syncClassRosters } from '../../teacher-assignments/services/rosterSync';

const findIds = async <T extends { id: string }>(collectionName: CollectionName, field: string, value: unknown) => {
  const snapshot = await getDocs(
    query(collection(db, collectionName).withConverter(typedConverter<T>()), where(field, '==', value)),
  );
  return snapshot.docs.map((document) => document.data());
};

export interface TestDataSummary {
  costs: number;
  enrollments: number;
  payments: number;
  students: number;
}

// Borra los datos de prueba: alumnos marcados como prueba con sus inscripciones (de todos los períodos),
// sus pagos y su foto, y los costos del curso creados como prueba. Después actualiza las listas de los maestros.
// La asistencia y las notas que se les pusieron quedan en las planillas, pero ya no salen (no están en la lista).
export const deleteTestData = async (testStudents: Student[]): Promise<TestDataSummary> => {
  const operations: DeleteOperation[] = [];
  const affectedGroups: { classId: string; periodId: string }[] = [];
  let enrollmentCount = 0;
  let paymentCount = 0;

  for (const student of testStudents) {
    const [enrollments, payments] = await Promise.all([
      findIds<Enrollment>(COLLECTIONS.enrollments, 'studentId', student.id),
      findIds<{ id: string }>(COLLECTIONS.payments, 'studentId', student.id),
    ]);
    enrollments.forEach((enrollment) => {
      operations.push({ collectionName: COLLECTIONS.enrollments, id: enrollment.id });
      affectedGroups.push({ classId: enrollment.classId, periodId: enrollment.periodId });
    });
    payments.forEach((payment) => operations.push({ collectionName: COLLECTIONS.payments, id: payment.id }));
    operations.push({ collectionName: COLLECTIONS.studentPhotos, id: student.id });
    operations.push({ collectionName: COLLECTIONS.students, id: student.id });
    enrollmentCount += enrollments.length;
    paymentCount += payments.length;
  }
  const testCosts = await findIds<{ id: string }>(COLLECTIONS.courseCosts, 'isTest', true);
  testCosts.forEach((cost) => operations.push({ collectionName: COLLECTIONS.courseCosts, id: cost.id }));

  await deleteInChunks(operations);
  if (affectedGroups.length > 0) await syncClassRosters(affectedGroups);
  return { costs: testCosts.length, enrollments: enrollmentCount, payments: paymentCount, students: testStudents.length };
};
