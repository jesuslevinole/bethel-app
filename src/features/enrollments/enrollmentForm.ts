import type { Enrollment, NewRecord } from '../../types/index';
import { todayIso } from '../../utils/dateFormat';
import { getRelationName } from '../../utils/relations';

export type EnrollmentFormValues = Omit<NewRecord<Enrollment>, 'periodId'>;

export const toEnrollmentFormValues = (enrollment: Enrollment | null): EnrollmentFormValues => ({
  classId: enrollment?.classId ?? '',
  date: enrollment?.date ?? todayIso(),
  studentId: enrollment?.studentId ?? '',
});

// Un alumno cursa una sola clase por período académico.
export const validateEnrollment = (
  values: EnrollmentFormValues,
  periodEnrollments: Enrollment[],
  classNames: Map<string, string>,
  ownId?: string,
) => {
  if (!values.date || !values.studentId || !values.classId) return 'Completa la fecha, el alumno y la clase.';
  const existing = periodEnrollments.find(
    (enrollment) => enrollment.id !== ownId && enrollment.studentId === values.studentId,
  );
  if (!existing) return null;
  return `Este alumno ya está inscrito en ${getRelationName(classNames, existing.classId)} en este período.`;
};
