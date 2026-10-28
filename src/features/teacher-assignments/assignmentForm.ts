import type { NewRecord, Subject, TeacherAssignment } from '../../types/index';
import { todayIso } from '../../utils/dateFormat';
import { getRelationName } from '../../utils/relations';

export type AssignmentFormValues = Omit<NewRecord<TeacherAssignment>, 'periodId'>;

export const toAssignmentFormValues = (assignment: TeacherAssignment | null): AssignmentFormValues => ({
  classId: assignment?.classId ?? '',
  date: assignment?.date ?? todayIso(),
  subjectIds: assignment?.subjectIds ?? [],
  teacherId: assignment?.teacherId ?? '',
});

interface AssignmentValidationContext {
  ownId?: string;
  periodAssignments: TeacherAssignment[];
  subjectNames: Map<string, string>;
  teacherNames: Map<string, string>;
}

// Materias que ya tienen maestro en el período (sin contar el registro que se está editando): materia → maestro.
// Regla: una materia la da un solo maestro por período académico.
export const getTakenSubjects = (periodAssignments: TeacherAssignment[], ownId?: string) => {
  const taken = new Map<string, string>();
  periodAssignments
    .filter((assignment) => assignment.id !== ownId)
    .forEach((assignment) => assignment.subjectIds.forEach((subjectId) => taken.set(subjectId, assignment.teacherId)));
  return taken;
};

export const validateAssignment = (values: AssignmentFormValues, context: AssignmentValidationContext) => {
  if (!values.date || !values.teacherId || !values.classId) return 'Completa la fecha, el maestro y la clase.';
  if (values.subjectIds.length === 0) return 'Elige al menos una materia.';

  const taken = getTakenSubjects(context.periodAssignments, context.ownId);
  const conflicts = values.subjectIds
    .filter((subjectId) => taken.has(subjectId))
    .map(
      (subjectId) =>
        `${getRelationName(context.subjectNames, subjectId)} (${getRelationName(context.teacherNames, taken.get(subjectId) ?? '')})`,
    );
  if (conflicts.length === 0) return null;
  const verb = conflicts.length === 1 ? 'ya tiene maestro' : 'ya tienen maestro';
  return `${conflicts.join(', ')} ${verb} en este período. Quítala${conflicts.length === 1 ? '' : 's'} para guardar.`;
};

// Materias repetidas en el período (registros guardados antes de esta regla): materia → maestros que la tienen.
export const findRepeatedSubjects = (periodAssignments: TeacherAssignment[]) => {
  const teachersBySubject = new Map<string, string[]>();
  periodAssignments.forEach((assignment) =>
    assignment.subjectIds.forEach((subjectId) =>
      teachersBySubject.set(subjectId, [...(teachersBySubject.get(subjectId) ?? []), assignment.teacherId]),
    ),
  );
  return [...teachersBySubject].filter(([, teacherIds]) => teacherIds.length > 1);
};

// Materias que se ofrecen para la clase elegida: las de esa clase, las que aún no tienen clase
// (guardadas antes de ese campo) y las ya elegidas, para no ocultar nada de un registro existente.
export const getClassSubjects = (subjects: Subject[], classId: string, selectedIds: string[]) => {
  const offered = classId
    ? subjects.filter((subject) => !subject.classId || subject.classId === classId || selectedIds.includes(subject.id))
    : subjects.filter((subject) => selectedIds.includes(subject.id));
  // Primero las del primer semestre, luego las del segundo.
  return [...offered].sort(
    (first, second) => (first.semester ?? 3) - (second.semester ?? 3) || first.name.localeCompare(second.name, 'es'),
  );
};
