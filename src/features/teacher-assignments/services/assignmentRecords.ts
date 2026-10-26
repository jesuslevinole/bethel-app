import { teacherAssignmentsService } from '../../../services/teacherAssignmentsService';
import { teachersService } from '../../../services/teachersService';
import type { AppUser, NewRecord, Teacher, TeacherAssignment } from '../../../types/index';
import { normalizeText } from '../../../utils/search';
import { UserFacingError } from '../../../utils/userFacingError';
import { USER_OPTION_PREFIX } from '../teacherOptions';
import { syncClassRosters } from './rosterSync';

// Si se eligió un usuario (Director, Administración…) que aún no es maestro del catálogo, se registra
// como maestro con su nombre (o se usa el que ya tenga ese nombre) y se devuelve ese id.
export const resolveTeacherId = async (selectedValue: string, teachers: Teacher[], users: AppUser[]) => {
  if (!selectedValue.startsWith(USER_OPTION_PREFIX)) return selectedValue;
  const user = users.find((candidate) => candidate.id === selectedValue.slice(USER_OPTION_PREFIX.length));
  if (!user) throw new UserFacingError('Ese usuario ya no existe. Elige otro maestro.');
  const existingTeacher = teachers.find((teacher) => normalizeText(teacher.name) === normalizeText(user.name));
  return existingTeacher?.id ?? teachersService.create({ name: user.name.trim(), phone: '' });
};

// Guardar un registro de materias le carga la lista de alumnos de su clase.
export const saveAssignment = async (assignment: TeacherAssignment | null, data: NewRecord<TeacherAssignment>) => {
  if (assignment) await teacherAssignmentsService.update(assignment.id, data);
  else await teacherAssignmentsService.create(data);
  await syncClassRosters([data]);
};

export const deleteAssignment = async (assignment: TeacherAssignment) => {
  await teacherAssignmentsService.delete(assignment.id);
};
