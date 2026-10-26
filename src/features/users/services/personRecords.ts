import { studentsService } from '../../../services/studentsService';
import { teachersService } from '../../../services/teachersService';
import type { AppUser, RoleKind, Student, Teacher } from '../../../types/index';
import { getNextStudentCode } from '../../../utils/studentCode';
import { findLinkedStudent, findLinkedTeacher } from '../personLink';

interface PersonSources {
  currentUser: AppUser | null;
  students: Student[];
  teachers: Teacher[];
}

export interface PersonLink {
  studentId: string | null;
  teacherId: string | null;
}

// Liga el usuario a su maestro o alumno; si no existe uno con ese nombre, lo registra.
// Con un usuario de prueba, el maestro o alumno nuevo también queda como prueba (Borrar datos de prueba lo limpia).
export const ensurePersonRecord = async (
  kind: RoleKind,
  name: string,
  sources: PersonSources,
  isTest = false,
): Promise<PersonLink> => {
  const cleanName = name.trim();
  const testFlag = isTest ? { isTest: true } : {};
  if (kind === 'teacher') {
    const teacher = findLinkedTeacher(cleanName, sources);
    const teacherId = teacher?.id ?? (await teachersService.create({ name: cleanName, phone: '', ...testFlag }));
    return { studentId: null, teacherId };
  }
  if (kind === 'student') {
    const student = findLinkedStudent(cleanName, sources);
    const newStudent = {
      address: '',
      church: '',
      city: '',
      code: getNextStudentCode(sources.students),
      name: cleanName,
      pastor: '',
      ...testFlag,
    };
    const studentId = student?.id ?? (await studentsService.create(newStudent));
    return { studentId, teacherId: null };
  }
  return { studentId: null, teacherId: null };
};
