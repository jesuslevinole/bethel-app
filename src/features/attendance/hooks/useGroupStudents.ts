import { useMemo } from 'react';
import { useScopedPeriodCollection, useStudentDirectory } from '../../../shared/data/useScopedData';
import type { Student } from '../../../types/index';
import { compareByName } from '../../../utils/sorting';

// Alumnos inscritos en la clase del grupo, en el período del grupo, ordenados por nombre.
// Necesita que el rol vea Inscripciones y Alumnos (todos): si no, la lista sale vacía.
export const useGroupStudents = (periodId: string | null, classId: string | null) => {
  const enrollments = useScopedPeriodCollection('enrollments', periodId);
  const students = useStudentDirectory();

  const groupStudents = useMemo(() => {
    if (!classId) return [];
    const studentsById = new Map(students.data.map((student) => [student.id, student]));
    return enrollments.data
      .filter((enrollment) => enrollment.classId === classId)
      .map((enrollment) => studentsById.get(enrollment.studentId))
      .filter((student): student is Student => Boolean(student))
      .sort(compareByName);
  }, [classId, enrollments.data, students.data]);

  return { isLoading: enrollments.isLoading || students.isLoading, students: groupStudents };
};
