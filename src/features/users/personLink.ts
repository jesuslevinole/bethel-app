import type { AppUser, RoleKind, Student, Teacher } from '../../types/index';
import { normalizeText } from '../../utils/search';

// A qué registro queda ligado un usuario según el tipo de su rol:
// Maestro → un maestro del catálogo; Estudiante → un alumno; Personal → ninguno.
// Se busca por el mismo nombre; si no existe, se crea al guardar el usuario.
export type PersonLinkPreview =
  | { kind: 'staff' }
  | { existingName: string | null; kind: 'student' | 'teacher'; name: string };

interface LinkSources {
  currentUser: AppUser | null;
  students: Student[];
  teachers: Teacher[];
}

const findByName = <T extends { name: string }>(records: T[], name: string) =>
  records.find((record) => normalizeText(record.name) === normalizeText(name)) ?? null;

// El vínculo que ya tiene el usuario se respeta mientras su rol siga siendo del mismo tipo.
export const findLinkedTeacher = (name: string, { currentUser, teachers }: LinkSources) =>
  teachers.find((teacher) => teacher.id === currentUser?.teacherId) ?? findByName(teachers, name);

export const findLinkedStudent = (name: string, { currentUser, students }: LinkSources) =>
  students.find((student) => student.id === currentUser?.studentId) ?? findByName(students, name);

export const previewPersonLink = (kind: RoleKind, name: string, sources: LinkSources): PersonLinkPreview => {
  if (kind === 'staff') return { kind };
  const linkedRecord = kind === 'teacher' ? findLinkedTeacher(name, sources) : findLinkedStudent(name, sources);
  return { existingName: linkedRecord?.name ?? null, kind, name: name.trim() };
};
