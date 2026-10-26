import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { COLLECTIONS, type CollectionName } from '../../../lib/firebase/collections';
import { typedConverter } from '../../../lib/firebase/typedConverter';
import type { AttendanceSheet, Enrollment, GradeSheet, TeacherAssignment } from '../../../types/index';

// Documentos de la clase del alumno en un período (planillas o registros de materias), lectura única.
// Solo igualdades: Firestore las resuelve sin índice compuesto.
const getClassSheets = async <T extends { id: string }>(
  collectionName: CollectionName,
  periodId: string,
  classId: string,
) => {
  const sheetsQuery = query(
    collection(db, collectionName).withConverter(typedConverter<T>()),
    where('periodId', '==', periodId),
    where('classId', '==', classId),
  );
  const snapshot = await getDocs(sheetsQuery);
  return snapshot.docs.map((document) => document.data());
};

export const getClassAcademicRecord = async (periodId: string, classId: string) => {
  const [attendanceSheets, gradeSheets] = await Promise.all([
    getClassSheets<AttendanceSheet>(COLLECTIONS.attendance, periodId, classId),
    getClassSheets<GradeSheet>(COLLECTIONS.grades, periodId, classId),
  ]);
  return { attendanceSheets, gradeSheets };
};

export interface EnrollmentRecordSource {
  assignments: TeacherAssignment[];
  attendanceSheets: AttendanceSheet[];
  enrollment: Enrollment;
  gradeSheets: GradeSheet[];
}

// Todo lo que el alumno lleva en el instituto: cada inscripción (de cualquier período) con los registros de
// materias de su clase y sus planillas. Se lee una vez al abrir el expediente (son varias lecturas).
export const getStudentHistory = async (studentId: string): Promise<EnrollmentRecordSource[]> => {
  const enrollmentsQuery = query(
    collection(db, COLLECTIONS.enrollments).withConverter(typedConverter<Enrollment>()),
    where('studentId', '==', studentId),
  );
  const enrollments = (await getDocs(enrollmentsQuery)).docs.map((document) => document.data());
  return Promise.all(
    enrollments.map(async (enrollment) => {
      const [assignments, record] = await Promise.all([
        getClassSheets<TeacherAssignment>(COLLECTIONS.teacherAssignments, enrollment.periodId, enrollment.classId),
        getClassAcademicRecord(enrollment.periodId, enrollment.classId),
      ]);
      return { assignments, enrollment, ...record };
    }),
  );
};
