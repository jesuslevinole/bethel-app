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

// Una materia de una clase la da un solo maestro por período académico.
export const validateAssignment = (values: AssignmentFormValues, context: AssignmentValidationContext) => {
  if (!values.date || !values.teacherId || !values.classId) return 'Completa la fecha, el maestro y la clase.';
  if (values.subjectIds.length === 0) return 'Elige al menos una materia.';

  const conflict = context.periodAssignments.find(
    (assignment) =>
      assignment.id !== context.ownId &&
      assignment.classId === values.classId &&
      assignment.subjectIds.some((subjectId) => values.subjectIds.includes(subjectId)),
  );
  if (!conflict) return null;

  const takenSubjects = conflict.subjectIds
    .filter((subjectId) => values.subjectIds.includes(subjectId))
    .map((subjectId) => getRelationName(context.subjectNames, subjectId))
    .join(', ');
  const teacherName = getRelationName(context.teacherNames, conflict.teacherId);
  return `${takenSubjects} ya está asignada a ${teacherName} en esa clase este período.`;
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
