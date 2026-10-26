import { COLLECTIONS } from '../../../lib/firebase/collections';
import { createInChunks, newDocumentId, type CreateOperation } from '../../../shared/data/batchWrites';
import type { AcademicPeriod, CourseCost, Enrollment, SchoolClass, Student } from '../../../types/index';
import { listPeriodMonths } from '../../../utils/courseCost';
import { todayIso } from '../../../utils/dateFormat';
import { getNextStudentCode } from '../../../utils/studentCode';
import { syncClassRosters } from '../../teacher-assignments/services/rosterSync';
import type { ImportRow } from './parseStudentList';

export interface ImportOptions {
  // '' = según la columna Año de la lista; un id = todos a esa clase.
  classId: string;
  createCosts: boolean;
  enroll: boolean;
  isTest: boolean;
}

export interface ImportSources {
  classes: SchoolClass[];
  costs: CourseCost[];
  enrollments: Enrollment[];
  period: AcademicPeriod | null;
  students: Student[];
}

export type ImportRowStatus = 'existing' | 'new';

export interface ImportPlanRow {
  classId: string;
  code: string;
  existingStudent: Student | null;
  isAlreadyEnrolled: boolean;
  row: ImportRow;
  status: ImportRowStatus;
}

// Año 1 → la clase con orden 1 (Primer), Año 2 → Segundo…
export const findClassForYear = (classes: SchoolClass[], year: number | null) =>
  year === null ? '' : (classes.find((schoolClass) => schoolClass.order === year)?.id ?? '');

// Qué pasará con cada fila antes de importar: alumno nuevo o ya registrado (mismo código), y su clase.
// Las filas sin código reciben uno nuevo (BBI-…).
export const planImport = (rows: ImportRow[], options: ImportOptions, sources: ImportSources): ImportPlanRow[] => {
  const studentsByCode = new Map(sources.students.map((student) => [student.code.trim().toLowerCase(), student]));
  const assignedCodes: Student[] = [...sources.students];
  return rows.map((row) => {
    const existingStudent = row.code ? (studentsByCode.get(row.code.toLowerCase()) ?? null) : null;
    const code = row.code || getNextStudentCode(assignedCodes);
    if (!row.code) assignedCodes.push({ address: '', church: '', city: '', code, id: '', name: row.name, pastor: '' });
    const classId = options.classId || findClassForYear(sources.classes, row.year);
    const isAlreadyEnrolled = Boolean(
      existingStudent && sources.enrollments.some((enrollment) => enrollment.studentId === existingStudent.id),
    );
    return { classId, code, existingStudent, isAlreadyEnrolled, row, status: existingStudent ? 'existing' : 'new' };
  });
};

export interface ImportSummary {
  costs: number;
  enrollments: number;
  students: number;
}

// Crea los alumnos nuevos, los inscribe en el período y (si se pidió) crea los costos de la clase con la
// mensualidad de la lista para cada mes. Todo en lotes; al final actualiza las listas de los maestros.
export const importStudents = async (plan: ImportPlanRow[], options: ImportOptions, sources: ImportSources) => {
  const testFlag = options.isTest ? { isTest: true } : {};
  const operations: CreateOperation[] = [];
  const enrollmentGroups: { classId: string; periodId: string }[] = [];
  let studentCount = 0;
  let enrollmentCount = 0;
  let costCount = 0;

  plan.forEach((planRow) => {
    let studentId = planRow.existingStudent?.id ?? '';
    if (!planRow.existingStudent) {
      studentId = newDocumentId(COLLECTIONS.students);
      operations.push({
        collectionName: COLLECTIONS.students,
        data: { address: '', church: '', city: '', code: planRow.code, name: planRow.row.name, pastor: '', ...testFlag },
        id: studentId,
      });
      studentCount += 1;
    }
    if (options.enroll && sources.period && planRow.classId && !planRow.isAlreadyEnrolled) {
      operations.push({
        collectionName: COLLECTIONS.enrollments,
        data: { classId: planRow.classId, date: todayIso(), periodId: sources.period.id, studentId, ...testFlag },
      });
      enrollmentGroups.push({ classId: planRow.classId, periodId: sources.period.id });
      enrollmentCount += 1;
    }
  });

  if (options.createCosts && sources.period) {
    const period = sources.period;
    const feesByClass = new Map<string, number>();
    plan.forEach((planRow) => {
      if (planRow.classId && planRow.row.monthlyFee && !feesByClass.has(planRow.classId)) {
        feesByClass.set(planRow.classId, planRow.row.monthlyFee);
      }
    });
    feesByClass.forEach((monthlyFee, classId) => {
      if (sources.costs.some((cost) => cost.classId === classId)) return;
      const months = listPeriodMonths(period);
      operations.push({
        collectionName: COLLECTIONS.courseCosts,
        data: {
          books: [],
          classId,
          date: todayIso(),
          enrollmentFee: 0,
          graduationFee: 0,
          monthlyFees: months.map((month) => ({ amount: monthlyFee, month })),
          months: months.length,
          periodId: period.id,
          ...testFlag,
        },
      });
      costCount += 1;
    });
  }

  await createInChunks(operations);
  if (enrollmentGroups.length > 0) await syncClassRosters(enrollmentGroups);
  return { costs: costCount, enrollments: enrollmentCount, students: studentCount } satisfies ImportSummary;
};
