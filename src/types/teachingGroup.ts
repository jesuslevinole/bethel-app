import type { TeacherAssignment } from './teacherAssignments';

// Un grupo de clase = una materia de un registro de maestro (p. ej. "Primer · Pentateuco y geografía").
// Es la unidad sobre la que se pasa asistencia y se ponen notas.
export interface TeachingGroup {
  assignment: TeacherAssignment;
  className: string;
  key: string;
  subjectId: string;
  subjectName: string;
  teacherName: string;
}
