import type {
  AcademicPeriod,
  SchoolClass,
  StudentSubjectRecord,
  Subject,
  TranscriptSection,
  TranscriptSummary,
} from '../../types/index';
import { averageScores } from '../attendance/gradeScores';
import { getGpaPoints } from '../attendance/gradeFormula';
import { keepClassSessions } from '../../utils/classDays';
import { roundMoney } from '../../utils/money';
import type { EnrollmentRecordSource } from './services/studentAcademicRecord';
import { buildStudentSubjectRecords } from './studentRecord';

interface TranscriptSources {
  classes: SchoolClass[];
  history: EnrollmentRecordSource[];
  periods: AcademicPeriod[];
  studentId: string;
  subjectNames: Map<string, string>;
  subjects: Subject[];
  teacherNames: Map<string, string>;
}

// MM/AAAA de una fecha AAAA-MM-DD.
const toMonthYear = (isoDate: string) => `${isoDate.slice(5, 7)}/${isoDate.slice(0, 4)}`;

// Todas las clases del programa (Primer a Cuarto), cada una con sus materias del catálogo y lo que el alumno
// lleva en cada una. Si repitió una materia, queda la del período más reciente.
export const buildTranscript = ({
  classes,
  history,
  periods,
  studentId,
  subjectNames,
  subjects,
  teacherNames,
}: TranscriptSources): { sections: TranscriptSection[]; summary: TranscriptSummary } => {
  const periodsById = new Map(periods.map((period) => [period.id, period]));
  const getPeriodStart = (periodId: string) => periodsById.get(periodId)?.startDate ?? '';
  const sortedHistory = [...history].sort((first, second) =>
    getPeriodStart(first.enrollment.periodId).localeCompare(getPeriodStart(second.enrollment.periodId)),
  );

  // Recorre de más viejo a más nuevo: el registro más reciente de cada materia pisa al anterior.
  const latestBySubject = new Map<string, StudentSubjectRecord>();
  const latestPeriodByClass = new Map<string, string>();
  sortedHistory.forEach(({ assignments, attendanceSheets, enrollment, gradeSheets }) => {
    latestPeriodByClass.set(enrollment.classId, enrollment.periodId);
    const period = periodsById.get(enrollment.periodId);
    buildStudentSubjectRecords({
      attendanceSheets: period ? keepClassSessions(attendanceSheets, period) : [],
      classAssignments: assignments,
      gradeSheets,
      studentId,
      subjectNames,
      teacherNames,
    }).forEach((record) => latestBySubject.set(`${record.classId}|${record.subjectId}`, record));
  });

  const semesterBySubject = new Map(subjects.map((subject) => [subject.id, subject.semester]));
  const unnumberedSections = classes.map((schoolClass) => {
    const takenRecords = [...latestBySubject.values()].filter((record) => record.classId === schoolClass.id);
    const takenIds = new Set(takenRecords.map((record) => record.subjectId));
    const pendingSubjects = subjects
      .filter((subject) => subject.classId === schoolClass.id && !takenIds.has(subject.id))
      .sort((first, second) => first.name.localeCompare(second.name, 'es'));
    const periodId = latestPeriodByClass.get(schoolClass.id);
    const rows = [
      ...takenRecords.map((record) => ({ record, subjectId: record.subjectId, subjectName: record.subjectName })),
      ...pendingSubjects.map((subject) => ({ record: null, subjectId: subject.id, subjectName: subject.name })),
    ]
      .map((row) => ({ ...row, semester: semesterBySubject.get(row.subjectId) ?? null }))
      // Como en la hoja: primer semestre, luego segundo; dentro, por nombre.
      .sort(
        (first, second) =>
          (first.semester ?? 3) - (second.semester ?? 3) || first.subjectName.localeCompare(second.subjectName, 'es'),
      );
    return {
      classId: schoolClass.id,
      className: schoolClass.name,
      periodName: periodId ? (periodsById.get(periodId)?.name ?? null) : null,
      rows,
    };
  });
  let rowCount = 0;
  const sections: TranscriptSection[] = unnumberedSections.map((section) => ({
    ...section,
    rows: section.rows.map((row) => {
      rowCount += 1;
      return { ...row, number: rowCount };
    }),
  }));

  const results = [...latestBySubject.values()].map((record) => record.result).filter((result) => result.average !== null);
  const gpaPoints = results.map((result) => (result.gpa ? getGpaPoints(result.gpa) : null));
  const knownPeriods = sortedHistory
    .map(({ enrollment }) => periodsById.get(enrollment.periodId))
    .filter((period): period is AcademicPeriod => Boolean(period));
  const firstPeriod = knownPeriods[0];
  const lastPeriod = knownPeriods[knownPeriods.length - 1];
  const gpaAverage = averageScores(gpaPoints);

  return {
    sections,
    summary: {
      average: averageScores(results.map((result) => result.average)),
      gpa: gpaAverage === null ? null : roundMoney(gpaAverage),
      gradedSubjects: results.length,
      studyYears: firstPeriod && lastPeriod ? `${toMonthYear(firstPeriod.startDate)} – ${toMonthYear(lastPeriod.endDate)}` : null,
    },
  };
};
