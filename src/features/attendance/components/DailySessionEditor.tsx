import { CalendarX2, CheckCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { INSTITUTE } from '../../../config/institute';
import EmptyState from '../../../shared/components/EmptyState';
import DateInput from '../../../shared/components/DateInput';
import { useAsyncAction } from '../../../shared/hooks/useAsyncAction';
import type {
  AcademicPeriod,
  AttendanceMark,
  AttendanceSheet,
  RosterStudent,
  SessionDraft,
  TeachingGroup,
} from '../../../types/index';
import { getSemesterIndex, listClassDates, pickDefaultClassDate, SEMESTER_NAMES } from '../../../utils/classDays';
import { formatLongDate, todayIso } from '../../../utils/dateFormat';
import { pluralize } from '../../../utils/plural';
import { usePermissions } from '../../auth/hooks/usePermissions';
import { formatScore, getDailyAverage } from '../gradeScores';
import { saveAttendanceSessions } from '../services/attendanceSheets';
import { isSameDraft, keepRosterOnly, toSessionDraft } from '../sessionDrafts';
import MarkPicker from './MarkPicker';
import SaveState from './SaveState';
import ScoreCell from './ScoreCell';
import { useColumnLabels } from '../../customization/useColumnLabels';

interface DailySessionEditorProps {
  group: TeachingGroup;
  period: AcademicPeriod;
  sessions: AttendanceSheet[];
  students: RosterStudent[];
}

// Clase del día: todos los alumnos del grupo con su asistencia y nota del día. Solo cambia la fecha,
// y solo entre los días de clase (INSTITUTE.classWeekday) del primero al último del período.
// Los cambios se guardan por fecha en "edits": si pasas a otro día sin guardar, no se pierden.
const DailySessionEditor = ({ group, period, sessions, students }: DailySessionEditorProps) => {
  const columnLabel = useColumnLabels('dailySession');
  const permissions = usePermissions();
  const classDates = listClassDates(period).map((classDate) => classDate.date);
  // Solo los días de clase del período (miércoles dentro de los semestres).
  const availableDates = classDates;
  // Abre en el día de clase de esta semana (o el último que pasó).
  const currentClassDate = pickDefaultClassDate(classDates, todayIso());
  const [date, setDate] = useState(currentClassDate);
  // Solo cambia con las flechas u "Hoy": reinicia el campo de fecha sin interrumpir a quien escribe.
  const [dateFieldVersion, setDateFieldVersion] = useState(0);
  const [edits, setEdits] = useState<Record<string, SessionDraft>>({});
  const [wasSaved, setWasSaved] = useState(false);
  const { error, isRunning, run } = useAsyncAction();

  const savedByDate = new Map(sessions.map((session) => [session.date, session]));
  const savedSession = savedByDate.get(date);
  const draft = edits[date] ?? toSessionDraft(savedSession);
  const isEditable = savedSession ? permissions.can('attendance', 'edit') : permissions.can('attendance', 'create');
  const canSaveSomething = permissions.can('attendance', 'create') || permissions.can('attendance', 'edit');
  const studentIds = students.map((student) => student.id);
  const dirtyDates = Object.keys(edits).filter(
    (editedDate) => !isSameDraft(edits[editedDate], toSessionDraft(savedByDate.get(editedDate))),
  );
  const dateIndex = availableDates.indexOf(date);
  const previousDate = dateIndex > 0 ? availableDates[dateIndex - 1] : null;
  const nextDate = dateIndex >= 0 && dateIndex < availableDates.length - 1 ? availableDates[dateIndex + 1] : null;
  const semesterIndex = getSemesterIndex(period, date);
  const positionText = [
    `Clase ${dateIndex + 1} de ${availableDates.length}`,
    semesterIndex === null ? null : SEMESTER_NAMES[semesterIndex],
    savedSession ? 'guardada' : 'nueva',
  ]
    .filter(Boolean)
    .join(' · ');

  const counts = students.reduce(
    (totals, student) => {
      const mark = draft.marks[student.id];
      return { ...totals, [mark ?? 'unmarked']: totals[mark ?? 'unmarked'] + 1 };
    },
    { absent: 0, late: 0, present: 0, unmarked: 0 },
  );

  // El promedio usa lo guardado y, para el día abierto, lo que se está escribiendo.
  const sessionsWithDraft = [
    ...sessions.filter((session) => session.date !== date),
    { dailyScores: draft.dailyScores },
  ];

  const moveToDate = (nextDate: string) => {
    setDate(nextDate);
    setDateFieldVersion((version) => version + 1);
  };

  const handleTypedDate = (isoDate: string) => {
    if (isoDate && availableDates.includes(isoDate)) setDate(isoDate);
  };

  if (availableDates.length === 0) {
    return (
      <section className="panel">
        <EmptyState
          icon={CalendarX2}
          text={`El período no tiene ${INSTITUTE.classWeekdayName} de clase. Revisa sus fechas y semestres en Períodos académicos.`}
          title="Sin días de clase"
        />
      </section>
    );
  }

  const updateDraft = (change: (current: SessionDraft) => SessionDraft) => {
    setEdits((currentEdits) => ({
      ...currentEdits,
      [date]: change(currentEdits[date] ?? toSessionDraft(savedSession)),
    }));
    setWasSaved(false);
  };

  const handleMarkChange = (studentId: string, mark: AttendanceMark | null) =>
    updateDraft((current) => {
      const marks = { ...current.marks };
      if (mark) marks[studentId] = mark;
      else delete marks[studentId];
      return { ...current, marks };
    });

  const handleScoreChange = (studentId: string, score: number | null) =>
    updateDraft((current) => ({ ...current, dailyScores: { ...current.dailyScores, [studentId]: score } }));

  // Marca "Presente" a quien aún no tiene marca (no cambia tardes ni faltas ya puestas).
  const handleMarkAllPresent = () =>
    updateDraft((current) => ({
      ...current,
      marks: Object.fromEntries(studentIds.map((studentId) => [studentId, current.marks[studentId] ?? 'present'])),
    }));

  const handleSave = async () => {
    const drafts = Object.fromEntries(
      dirtyDates.map((dirtyDate) => [dirtyDate, keepRosterOnly(edits[dirtyDate], studentIds)]),
    );
    if (await run(() => saveAttendanceSessions(group, drafts))) {
      setEdits({});
      setWasSaved(true);
    }
  };

  const dirtyText =
    dirtyDates.length > 1 ? `Hay cambios sin guardar en ${pluralize(dirtyDates.length, 'día', 'días')}` : undefined;

  return (
    <section className="day-session panel">
      <div className="day-session-top">
        <div className="day-session-date">
          <button
            aria-label="Clase anterior"
            className="btn btn-icon"
            disabled={!previousDate}
            onClick={() => previousDate && moveToDate(previousDate)}
            type="button"
          >
            <ChevronLeft size={20} />
          </button>
          <DateInput
            id="day-session-date"
            isDateEnabled={(isoDate) => availableDates.includes(isoDate)}
            key={dateFieldVersion}
            onChange={handleTypedDate}
            value={date}
          />
          <button
            aria-label="Clase siguiente"
            className="btn btn-icon"
            disabled={!nextDate}
            onClick={() => nextDate && moveToDate(nextDate)}
            type="button"
          >
            <ChevronRight size={20} />
          </button>
          {date !== currentClassDate && (
            <button className="btn btn-ghost" onClick={() => moveToDate(currentClassDate)} type="button">
              Esta semana
            </button>
          )}
        </div>
        <div className="day-session-heading">
          <h2 className="day-session-title">{formatLongDate(date)}</h2>
          <p className="day-session-subtitle">
            {group.className} · {group.subjectName} · {positionText}
          </p>
        </div>
        <div className="day-session-actions">
          <SaveState
            canSave={canSaveSomething}
            isDirty={dirtyDates.length > 0}
            message={dirtyText}
            wasSaved={wasSaved}
          />
          {canSaveSomething && (
            <button
              className="btn btn-primary"
              disabled={isRunning || dirtyDates.length === 0}
              onClick={handleSave}
              type="button"
            >
              {isRunning ? 'Guardando…' : 'Guardar'}
            </button>
          )}
        </div>
      </div>
      <div className="day-session-summary">
        <span className="day-count is-present">{pluralize(counts.present, 'presente', 'presentes')}</span>
        <span className="day-count is-late">{pluralize(counts.late, 'tarde', 'tardes')}</span>
        <span className="day-count is-absent">{pluralize(counts.absent, 'falta', 'faltas')}</span>
        {counts.unmarked > 0 && <span className="day-count">{counts.unmarked} sin marcar</span>}
        {isEditable && counts.unmarked > 0 && (
          <button className="btn btn-ghost day-mark-all" onClick={handleMarkAllPresent} type="button">
            <CheckCheck size={17} />
            Marcar presentes a los que faltan
          </button>
        )}
      </div>
      {error && <p className="form-alert sheet-alert">{error}</p>}
      <div className="table-wrap">
        <table className="day-table">
          <thead>
            <tr>
              <th className="day-number-head" scope="col">
                {columnLabel('number')}
              </th>
              <th scope="col">{columnLabel('student')}</th>
              <th scope="col">{columnLabel('attendance')}</th>
              <th className="day-score-head" scope="col">
                {columnLabel('dailyScore')}
              </th>
              <th className="day-average-head" scope="col">
                {columnLabel('average')}
              </th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr key={student.id}>
                <td className="day-number">{index + 1}</td>
                <td>
                  <div className="day-student">
                    <span className="day-student-name">{student.name}</span>
                    <span className="day-student-code">{student.code}</span>
                  </div>
                </td>
                <td>
                  <MarkPicker
                    isEditable={isEditable}
                    mark={draft.marks[student.id]}
                    onChange={(mark) => handleMarkChange(student.id, mark)}
                    studentName={student.name}
                  />
                </td>
                <td className="day-score">
                  <div className="day-score-inner">
                    <ScoreCell
                      className="day-score-input"
                      isEditable={isEditable}
                      key={`${date}-${student.id}`}
                      label={`Nota del día de ${student.name}`}
                      onChange={(score) => handleScoreChange(student.id, score)}
                      value={draft.dailyScores[student.id]}
                    />
                    <span className="day-score-max">/100</span>
                  </div>
                </td>
                <td className="day-average">{formatScore(getDailyAverage(sessionsWithDraft, student.id))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="sheet-legend">
        Las clases son los {INSTITUTE.classWeekdayName}: las flechas pasan de una clase a otra y el calendario solo deja
        elegir esos días. Para ver todas las fechas o imprimir, usa "Hoja completa".
      </p>
    </section>
  );
};

export default DailySessionEditor;
