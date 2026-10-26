import type { Enrollment, EnrollmentRow, Student } from '../../types/index';
import { DELETED_LABEL, getRelationName } from '../../utils/relations';

export const toEnrollmentRows = (
  enrollments: Enrollment[],
  studentsById: Map<string, Student>,
  classNames: Map<string, string>,
): EnrollmentRow[] =>
  enrollments.map((enrollment) => {
    const student = studentsById.get(enrollment.studentId);
    return {
      className: getRelationName(classNames, enrollment.classId),
      enrollment,
      studentCode: student?.code ?? '—',
      studentName: student?.name ?? DELETED_LABEL,
    };
  });
