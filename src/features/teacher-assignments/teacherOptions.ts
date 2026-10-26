import type { AppUser, Role, SelectOption, Teacher } from '../../types/index';
import { normalizeText } from '../../utils/search';
import { inferRoleKind } from '../roles/defaultRoles';

// Usuario con rol de personal (Administración, Director…) que aún no está en el catálogo de maestros:
// su valor lleva este prefijo y al guardar se registra como maestro (ver resolveTeacherId).
export const USER_OPTION_PREFIX = 'user:';

interface TeacherOptionSources {
  roles: Role[];
  teachers: Teacher[];
  users: AppUser[];
}

// Quién puede dar materias: los maestros del catálogo y los usuarios con rol Maestro, Director o
// Administración (cualquier rol que no sea de estudiante). Un alumno nunca aparece como maestro.
export const buildTeacherOptions = ({ roles, teachers, users }: TeacherOptionSources): SelectOption[] => {
  const rolesById = new Map(roles.map((role) => [role.id, role]));
  const activeUsers = users.filter((user) => user.active && rolesById.has(user.roleId));
  const isStudentUser = (user: AppUser) => {
    const role = rolesById.get(user.roleId);
    return role ? inferRoleKind(role) === 'student' : false;
  };
  const studentNames = new Set(activeUsers.filter(isStudentUser).map((user) => normalizeText(user.name)));
  const staffUsers = activeUsers.filter((user) => !isStudentUser(user));

  const findUserForTeacher = (teacher: Teacher) =>
    staffUsers.find((user) => user.teacherId === teacher.id) ??
    staffUsers.find((user) => normalizeText(user.name) === normalizeText(teacher.name));

  const teacherOptions = teachers
    .filter((teacher) => !studentNames.has(normalizeText(teacher.name)))
    .map((teacher) => {
      const user = findUserForTeacher(teacher);
      return { detail: user ? rolesById.get(user.roleId)?.name : 'Maestro', label: teacher.name, value: teacher.id };
    });

  const linkedUserIds = new Set(
    teachers.map((teacher) => findUserForTeacher(teacher)?.id).filter((userId): userId is string => Boolean(userId)),
  );
  const userOptions = staffUsers
    .filter((user) => !linkedUserIds.has(user.id))
    .map((user) => ({
      detail: rolesById.get(user.roleId)?.name,
      label: user.name,
      value: `${USER_OPTION_PREFIX}${user.id}`,
    }));

  return [...teacherOptions, ...userOptions].sort((first, second) => first.label.localeCompare(second.label, 'es'));
};
