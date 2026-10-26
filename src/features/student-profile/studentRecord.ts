import type {
  AttendanceSheet,
  GradeSheet,
  StudentSubjectRecord,
  TeacherAssignment,
} from '../../types/index';
import { getRelationName } from '../../utils/relations';
import { countMarks } from '../attendance/attendanceMarks';
import { computeGrade } from '../attendance/gradeFormula';
import { getDailyAverage, toStudentScores } from '../attendance/gradeScores';

interface StudentRecordSource {
  attendanceSheets: AttendanceSheet[];
  classAssignments: TeacherAssignment[];
  gradeSheets: GradeSheet[];
  studentId: string;
  subjectNames: Map<string, string>;
  teacherNames: Map<string, string>;
}

// Una fila por materia de la clase del alumno: maestro, notas y conteo de asistencia.
export const buildStudentSubjectRecords = ({
  attendanceSheets,
  classAssignments,
  gradeSheets,
  studentId,
  subjectNames,
  teacherNames,
}: StudentRecordSource): StudentSubjectRecord[] =>
  classAssignments.flatMap((assignment) =>
    assignment.subjectIds.map((subjectId) => {
      const isSameGroup = (sheet: { assignmentId: string; subjectId: string }) =>
        sheet.assignmentId === assignment.id && sheet.subjectId === subjectId;
      const groupSessions = attendanceSheets.filter(isSameGroup);
      const marks = countMarks(groupSessions, studentId);
      const savedScores = toStudentScores(gradeSheets.find(isSameGroup)?.scores[studentId]);
      // La nota diaria sale de las ND de la hoja de asistencia aunque el maestro no haya guardado los exámenes.
      const scores = { ...savedScores, daily: savedScores.daily ?? getDailyAverage(groupSessions, studentId) };
      return {
        absent: marks.absent,
        classId: assignment.classId,
        key: `${assignment.id}_${subjectId}`,
        late: marks.late,
        periodId: assignment.periodId,
        present: marks.present,
        result: computeGrade({ absences: marks.absent, markedSessions: marks.marked, scores }),
        scores,
        subjectId,
        subjectName: getRelationName(subjectNames, subjectId),
        teacherName: getRelationName(teacherNames, assignment.teacherId),
      };
    }),
  );

// Asistencia sobre las clases marcadas: presentes y tardes cuentan como asistió.
export const getAttendanceRate = (records: StudentSubjectRecord[]) => {
  const attended = records.reduce((total, record) => total + record.present + record.late, 0);
  const marked = records.reduce((total, record) => total + record.present + record.late + record.absent, 0);
  return marked > 0 ? Math.round((attended / marked) * 100) : null;
};
