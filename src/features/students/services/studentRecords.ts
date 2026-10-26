import { COLLECTIONS } from '../../../lib/firebase/collections';
import { studentsService } from '../../../services/studentsService';
import { assertNotReferenced } from '../../../shared/data/references';
import type { NewRecord, Student } from '../../../types/index';
import { syncStudentRosters } from '../../teacher-assignments/services/rosterSync';

// Un alumno con inscripciones no se borra: las inscripciones quedarían sin alumno.
export const deleteStudent = async (student: Student) => {
  await assertNotReferenced(
    [{ collectionName: COLLECTIONS.enrollments, field: 'studentId', label: 'Inscripciones', operator: '==' }],
    student.id,
  );
  await studentsService.delete(student.id);
};

// Si cambió el nombre o el código, se actualizan las listas de los maestros donde está inscrito.
export const updateStudent = async (student: Student, data: NewRecord<Student>) => {
  await studentsService.update(student.id, data);
  if (student.name !== data.name || student.code !== data.code) await syncStudentRosters(student.id);
};
