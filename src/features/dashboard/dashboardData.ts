import type { Enrollment, SchoolClass, Subject, Teacher, TeacherAssignment } from '../../types/index';

export interface LoadBar {
  id: string;
  label: string;
  value: number;
}

interface DashboardSource {
  classes: SchoolClass[];
  periodAssignments: TeacherAssignment[];
  periodEnrollments: Enrollment[];
  subjects: Subject[];
  teachers: Teacher[];
}

// Números del Resumen para el período elegido, calculados con lo que ya está en vivo (sin lecturas extra).
export const buildDashboardData = ({ classes, periodAssignments, periodEnrollments, subjects, teachers }: DashboardSource) => {
  const activeTeacherIds = new Set(periodAssignments.map((assignment) => assignment.teacherId));
  const assignedSubjectIds = new Set(periodAssignments.flatMap((assignment) => assignment.subjectIds));

  const studentsByClass: LoadBar[] = classes.map((schoolClass) => ({
    id: schoolClass.id,
    label: schoolClass.name,
    value: periodEnrollments.filter((enrollment) => enrollment.classId === schoolClass.id).length,
  }));

  const subjectsByTeacher: LoadBar[] = teachers
    .map((teacher) => ({
      id: teacher.id,
      label: teacher.name,
      value: periodAssignments
        .filter((assignment) => assignment.teacherId === teacher.id)
        .reduce((total, assignment) => total + assignment.subjectIds.length, 0),
    }))
    .filter((bar) => bar.value > 0)
    .sort((first, second) => second.value - first.value);

  return {
    activeTeacherCount: activeTeacherIds.size,
    recentEnrollments: periodEnrollments.slice(0, 6),
    studentsByClass,
    subjectsByTeacher,
    subjectsWithoutTeacher: subjects.filter((subject) => !assignedSubjectIds.has(subject.id)).length,
  };
};
