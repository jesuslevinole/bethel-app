import { useState } from 'react';
import ExportButton from '../../../shared/components/ExportButton';
import { exportToExcel } from '../../../shared/export/exportToExcel';
import { useAsyncAction } from '../../../shared/hooks/useAsyncAction';
import type { AttendanceSheet, RosterStudent, ScoreField, StudentScores, TeachingGroup } from '../../../types/index';
import { usePermissions } from '../../auth/hooks/usePermissions';
import { getGradesExportColumns } from '../attendanceExport';
import { countMarks } from '../attendanceMarks';
import { ATTENDANCE_MAX, computeGrade, formatAttendanceScore } from '../gradeFormula';
import { EMPTY_SCORES, EXAM_FIELDS, formatScore, getDailyAverage, MAX_SCORE, toStudentScores } from '../gradeScores';
import { getGroupLabel } from '../teachingGroups';
import { saveGrades } from '../services/attendanceSheets';
import GpaBadge from './GpaBadge';
import SaveState from './SaveState';
import ScoreCell from './ScoreCell';

interface GradesEditorProps {
  group: TeachingGroup;
  savedScores: Record<string, Partial<StudentScores>> | null;
  sessions: AttendanceSheet[];
  students: RosterStudent[];
}

type ExamField = Exclude<ScoreField, 'daily'>;

// Notas del período con la fórmula del instituto (gradeFormula.ts): la nota diaria sale del promedio de ND
// de la hoja de asistencia; exámenes y proyecto se escriben aquí; asistencia, promedio y GPA se calculan solos.
const GradesEditor = ({ group, savedScores, sessions, students }: GradesEditorProps) => {
  const permissions = usePermissions();
  const [exams, setExams] = useState<Record<string, StudentScores>>(() =>
    Object.fromEntries(Object.entries(savedScores ?? {}).map(([studentId, saved]) => [studentId, toStudentScores(saved)])),
  );
  const [wasSaved, setWasSaved] = useState(false);
  const { error, isRunning, run } = useAsyncAction();
  const canSave = permissions.can('grades', savedScores ? 'edit' : 'create');

  const scoresToSave: Record<string, StudentScores> = Object.fromEntries(
    students.map((student) => {
      const current = exams[student.id] ?? EMPTY_SCORES;
      return [student.id, { ...current, daily: getDailyAverage(sessions, student.id) }];
    }),
  );
  const savedForCompare = Object.fromEntries(
    students.map((student) => [student.id, toStudentScores(savedScores?.[student.id])]),
  );
  const isDirty = JSON.stringify(scoresToSave) !== JSON.stringify(savedForCompare);

  const handleExamChange = (studentId: string, field: ExamField, score: number | null) => {
    setExams((current) => ({ ...current, [studentId]: { ...EMPTY_SCORES, ...current[studentId], [field]: score } }));
    setWasSaved(false);
  };

  const handleSave = async () => {
    if (await run(() => saveGrades(group, scoresToSave))) setWasSaved(true);
  };

  return (
    <section className="attendance-sheet panel">
      <header className="panel-header">
        <div>
          <h2 className="panel-title">{getGroupLabel(group)}</h2>
          <p className="view-subtitle">
            Notas de 0 a {MAX_SCORE}. Promedio = (primer examen + nota diaria + segundo examen + proyecto, si tiene)
            entre 3 o 4. La nota diaria baja 1 punto por falta.
          </p>
        </div>
        <div className="sheet-actions">
          <SaveState canSave={canSave} isDirty={isDirty} wasSaved={wasSaved} />
          {permissions.can('grades', 'export') && (
            <ExportButton
              onExport={() =>
                exportToExcel(`Notas ${getGroupLabel(group)}`, getGradesExportColumns(sessions, scoresToSave), students)
              }
            />
          )}
          {canSave && (
            <button className="btn btn-primary" disabled={isRunning} onClick={handleSave} type="button">
              {isRunning ? 'Guardando…' : 'Guardar notas'}
            </button>
          )}
        </div>
      </header>
      {error && <p className="form-alert sheet-alert">{error}</p>}
      <div className="sheet-scroll">
        <table className="grades-table sheet-table">
          <thead>
            <tr>
              <th className="sheet-student-head" scope="col">
                Alumno
              </th>
              <th className="sheet-sub-head" scope="col" title="Promedio de las ND menos 1 punto por falta">
                Nota diaria
              </th>
              {EXAM_FIELDS.map(({ field, label }) => (
                <th className="sheet-sub-head" key={field} scope="col">
                  {label}
                </th>
              ))}
              <th className="sheet-sub-head" scope="col">
                Faltas
              </th>
              <th className="sheet-sub-head" scope="col">
                Asistencia
              </th>
              <th className="sheet-summary-head" scope="col">
                Promedio
              </th>
              <th className="sheet-summary-head" scope="col">
                GPA
              </th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => {
              const marks = countMarks(sessions, student.id);
              const result = computeGrade({
                absences: marks.absent,
                markedSessions: marks.marked,
                scores: scoresToSave[student.id],
              });
              return (
                <tr key={student.id}>
                  <th className="sheet-student" scope="row">
                    <span className="sheet-student-inner">
                      <span className="sheet-student-number">{index + 1}</span>
                      <span className="sheet-student-text">
                        <span className="sheet-student-name">{student.name}</span>
                        <span className="sheet-student-code">{student.code}</span>
                      </span>
                    </span>
                  </th>
                  <td className="sheet-summary">{formatScore(result.adjustedDaily)}</td>
                  {EXAM_FIELDS.map(({ field, label }) => (
                    <td className="sheet-cell sheet-cell-exam" key={field}>
                      <ScoreCell
                        isEditable={canSave}
                        label={`${label} de ${student.name}`}
                        onChange={(score) => handleExamChange(student.id, field, score)}
                        value={exams[student.id]?.[field]}
                      />
                    </td>
                  ))}
                  <td className="sheet-summary">{marks.absent}</td>
                  <td className="sheet-summary">{formatAttendanceScore(result.attendanceScore)}</td>
                  <td className="sheet-summary sheet-grade-average">{formatScore(result.average)}</td>
                  <td className="sheet-summary">
                    <GpaBadge gpa={result.gpa} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="sheet-legend">
        Asistencia sobre {ATTENDANCE_MAX}: 10 sin faltas, 1 punto menos por falta, mínimo 3. GPA: 93+ = 4.0, 90 = 3.7,
        85 = 3.3, 80 = 2.7, 77 = 2.3, 73 = 2.0, 70 = 1.7, menos de 70 = F. Proyecto: déjalo vacío si la materia no lleva.
      </p>
    </section>
  );
};

export default GradesEditor;
