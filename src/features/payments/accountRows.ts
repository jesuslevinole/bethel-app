import type { CourseCost, Enrollment, Payment, Student, StudentAccount } from '../../types/index';
import { getRelationName } from '../../utils/relations';
import { buildStudentAccount, getAccountStatus, type AccountStatus } from './studentAccount';

export interface AccountRow {
  account: StudentAccount;
  className: string;
  enrollment: Enrollment;
  status: AccountStatus;
  student: Student | null;
  studentCode: string;
  studentName: string;
}

interface AccountSources {
  classNames: Map<string, string>;
  costs: CourseCost[];
  enrollments: Enrollment[];
  payments: Payment[];
  studentsById: Map<string, Student>;
  today: string;
}

// Un estado de cuenta por alumno inscrito en el período (con los costos de su clase y sus pagos).
export const buildAccountRows = ({
  classNames,
  costs,
  enrollments,
  payments,
  studentsById,
  today,
}: AccountSources): AccountRow[] =>
  enrollments
    .map((enrollment) => {
      const cost = costs.find((candidate) => candidate.classId === enrollment.classId) ?? null;
      const studentPayments = payments.filter((payment) => payment.studentId === enrollment.studentId);
      const account = buildStudentAccount(cost, studentPayments, today);
      const student = studentsById.get(enrollment.studentId) ?? null;
      return {
        account,
        className: getRelationName(classNames, enrollment.classId),
        enrollment,
        status: getAccountStatus(account),
        student,
        studentCode: student?.code ?? '',
        studentName: student?.name ?? 'Alumno eliminado',
      };
    })
    .sort((first, second) => second.account.overdue - first.account.overdue || first.studentName.localeCompare(second.studentName, 'es'));
