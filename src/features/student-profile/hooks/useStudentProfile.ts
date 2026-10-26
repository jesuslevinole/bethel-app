import { useMemo } from 'react';
import { COLLECTIONS } from '../../../lib/firebase/collections';
import { useLiveData } from '../../../shared/data/liveCollections';
import { useScopedPeriodData, useStudentDirectory } from '../../../shared/data/useScopedData';
import { useLiveDocument } from '../../../shared/data/useLiveDocument';
import type { StudentPhoto } from '../../../types/index';
import { keepClassSessions } from '../../../utils/classDays';
import { buildNameMap, getRelationName } from '../../../utils/relations';
import { useAcademicPeriod } from '../../academic-periods/academicPeriodContext';
import { usePermissions } from '../../auth/hooks/usePermissions';
import { buildStudentSubjectRecords, getAttendanceRate } from '../studentRecord';
import { useClassAcademicRecord } from './useClassAcademicRecord';

// Todo lo que muestra la ficha de un alumno para el período elegido.
// Las notas y la asistencia se leen por clase completa: solo con "ver todos" en Asistencia y en Notas.
export const useStudentProfile = (studentId: string, periodId: string | null) => {
  const permissions = usePermissions();
  const students = useStudentDirectory();
  const classes = useLiveData('classes');
  const subjects = useLiveData('subjects');
  const teachers = useLiveData('teachers');
  const periodEnrollments = useScopedPeriodData('enrollments', periodId);
  const periodAssignments = useScopedPeriodData('teacherAssignments', periodId);
  const photo = useLiveDocument<StudentPhoto>(COLLECTIONS.studentPhotos, studentId || null);

  const canSeeRecords = permissions.scope('attendance') === 'all' && permissions.scope('grades') === 'all';
  const student = students.data.find((candidate) => candidate.id === studentId) ?? null;
  const enrollment = periodEnrollments.find((candidate) => candidate.studentId === studentId) ?? null;
  const classId = enrollment?.classId ?? null;
  const academicRecord = useClassAcademicRecord(periodId, canSeeRecords ? classId : null);
  const { periods } = useAcademicPeriod();
  const period = periods.find((candidate) => candidate.id === periodId) ?? null;
  const classSessions = useMemo(
    () => (period ? keepClassSessions(academicRecord.attendanceSheets, period) : []),
    [academicRecord.attendanceSheets, period],
  );

  const records = useMemo(
    () =>
      buildStudentSubjectRecords({
        attendanceSheets: classSessions,
        classAssignments: periodAssignments.filter((assignment) => assignment.classId === classId),
        gradeSheets: academicRecord.gradeSheets,
        studentId,
        subjectNames: buildNameMap(subjects),
        teacherNames: buildNameMap(teachers),
      }),
    [classSessions, academicRecord.gradeSheets, classId, periodAssignments, studentId, subjects, teachers],
  );

  return {
    attendanceRate: canSeeRecords ? getAttendanceRate(records) : null,
    canSeeRecords,
    className: classId ? getRelationName(buildNameMap(classes), classId) : null,
    isLoadingRecords: academicRecord.isLoading,
    isLoadingStudent: students.isLoading,
    photoUrl: photo.data?.dataUrl ?? null,
    records,
    recordsError: academicRecord.error,
    student,
  };
};
