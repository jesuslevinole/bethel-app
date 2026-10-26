import { collection, documentId, getDocs, query, serverTimestamp, where, writeBatch } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { COLLECTIONS } from '../../../lib/firebase/collections';
import { typedConverter } from '../../../lib/firebase/typedConverter';
import type { Enrollment, RosterStudent, Student, TeacherAssignment } from '../../../types/index';
import { compareByName } from '../../../utils/sorting';

const IN_QUERY_LIMIT = 30;

const getStudentsByIds = async (studentIds: string[]) => {
  const studentsCollection = collection(db, COLLECTIONS.students).withConverter(typedConverter<Student>());
  const chunks = Array.from({ length: Math.ceil(studentIds.length / IN_QUERY_LIMIT) }, (_, index) =>
    studentIds.slice(index * IN_QUERY_LIMIT, (index + 1) * IN_QUERY_LIMIT),
  );
  const snapshots = await Promise.all(
    chunks.map((chunk) => getDocs(query(studentsCollection, where(documentId(), 'in', chunk)))),
  );
  return snapshots.flatMap((snapshot) => snapshot.docs.map((document) => document.data()));
};

const byPeriodAndClass = (periodId: string, classId: string) => [
  where('periodId', '==', periodId),
  where('classId', '==', classId),
];

// Recalcula la lista de alumnos de una clase en un período y la guarda en cada registro de materias de esa clase.
// Así el maestro ve a sus alumnos sin tener acceso a Alumnos ni a Inscripciones.
export const syncClassRoster = async (periodId: string, classId: string) => {
  const enrollmentsQuery = query(
    collection(db, COLLECTIONS.enrollments).withConverter(typedConverter<Enrollment>()),
    ...byPeriodAndClass(periodId, classId),
  );
  const assignmentsQuery = query(
    collection(db, COLLECTIONS.teacherAssignments).withConverter(typedConverter<TeacherAssignment>()),
    ...byPeriodAndClass(periodId, classId),
  );
  const [enrollmentsSnapshot, assignmentsSnapshot] = await Promise.all([getDocs(enrollmentsQuery), getDocs(assignmentsQuery)]);
  if (assignmentsSnapshot.empty) return;

  const studentIds = enrollmentsSnapshot.docs.map((document) => document.data().studentId);
  const students = studentIds.length > 0 ? await getStudentsByIds(studentIds) : [];
  const roster: RosterStudent[] = students
    .sort(compareByName)
    .map((student) => ({ code: student.code, id: student.id, name: student.name }));

  const batch = writeBatch(db);
  assignmentsSnapshot.docs.forEach((document) => {
    batch.update(document.ref, { roster, updatedAt: serverTimestamp() });
  });
  await batch.commit();
};

// Varias clases (p. ej. una inscripción que cambió de clase), sin repetir la misma clase dos veces.
export const syncClassRosters = async (groups: { classId: string; periodId: string }[]) => {
  const uniqueGroups = [...new Map(groups.map((group) => [`${group.periodId}|${group.classId}`, group])).values()];
  await Promise.all(uniqueGroups.map(({ classId, periodId }) => syncClassRoster(periodId, classId)));
};

// Todas las listas del período (botón "Actualizar listas de alumnos").
export const syncPeriodRosters = async (periodAssignments: TeacherAssignment[]) => {
  await syncClassRosters(periodAssignments.map(({ classId, periodId }) => ({ classId, periodId })));
};

// Las listas de un alumno que cambió de nombre o código.
export const syncStudentRosters = async (studentId: string) => {
  const enrollmentsQuery = query(
    collection(db, COLLECTIONS.enrollments).withConverter(typedConverter<Enrollment>()),
    where('studentId', '==', studentId),
  );
  const snapshot = await getDocs(enrollmentsQuery);
  await syncClassRosters(snapshot.docs.map((document) => document.data()));
};
