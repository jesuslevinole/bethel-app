import type { TeacherAssignment } from './teacherAssignments';

// Registro de materias listo para mostrar, con los nombres ya resueltos.
export interface AssignmentRow {
  assignment: TeacherAssignment;
  className: string;
  subjectNames: string[];
  teacherName: string;
}
