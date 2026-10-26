import type { AppUser, Role, Student, Teacher, UserRow } from '../../types/index';
import { DELETED_LABEL } from '../../utils/relations';
import { inferRoleKind, ROLE_KIND_LABELS } from '../roles/defaultRoles';

interface UserRowSources {
  currentUid: string | null;
  roles: Role[];
  students: Student[];
  teachers: Teacher[];
}

// "Registrado como": el tipo del rol y, para maestros y alumnos, su registro.
const getRegisteredAs = (user: AppUser, role: Role | undefined, teachers: Teacher[], students: Student[]) => {
  if (!role) return '—';
  const kind = inferRoleKind(role);
  if (kind === 'teacher') return `Maestro: ${teachers.find((teacher) => teacher.id === user.teacherId)?.name ?? DELETED_LABEL}`;
  if (kind === 'student') return `Alumno: ${students.find((student) => student.id === user.studentId)?.name ?? DELETED_LABEL}`;
  return ROLE_KIND_LABELS.staff;
};

export const toUserRows = (users: AppUser[], { currentUid, roles, students, teachers }: UserRowSources): UserRow[] =>
  users.map((user) => {
    const role = roles.find((candidate) => candidate.id === user.roleId);
    return {
      isCurrentUser: user.id === currentUid,
      linkLabel: getRegisteredAs(user, role, teachers, students),
      roleName: role?.name ?? 'Sin rol',
      user,
    };
  });
