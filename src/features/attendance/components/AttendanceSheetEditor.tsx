import { CalendarPlus, Printer } from 'lucide-react';
import { useState } from 'react';
import ConfirmDialog from '../../../shared/components/ConfirmDialog';
import DateInput from '../../../shared/components/DateInput';
import ExportButton from '../../../shared/components/ExportButton';
import { exportToExcel } from '../../../shared/export/exportToExcel';
import { useAsyncAction } from '../../../shared/hooks/useAsyncAction';
import { INSTITUTE } from '../../../config/institute';
import FilterChips from '../../../shared/components/FilterChips';
import type { AcademicPeriod, AttendanceSheet, RosterStudent, SessionDraft, TeachingGroup } from '../../../types/index';
import { getSemesterIndex, listClassDates, pickDefaultClassDate, SEMESTER_NAMES } from '../../../utils/classDays';
import { formatDate, todayIso } from '../../../utils/dateFormat';
import { usePermissions } from '../../auth/hooks/usePermissions';
import { getSheetExportColumns } from '../attendanceExport';
import { getNextMark } from '../attendanceMarks';
import { getGroupLabel } from '../teachingGroups';
import { deleteAttendanceSession, saveAttendanceSessions } from '../services/attendanceSheets';
import { EMPTY_DRAFT, isSameDraft, keepRosterOnly, toSessionDraft } from '../sessionDrafts';
import SaveState from './SaveState';
import SheetHeader from './SheetHeader';
import SheetTable, { type SheetColumn } from './SheetTable';

interface AttendanceSheetEditorProps {
  group: TeachingGroup;
  period: AcademicPeriod;
  sessions: AttendanceSheet[];
  students: RosterStudent[];
}

// Hoja de asistencia del período: una columna por clase (fecha) con A (asistencia) y ND (nota diaria).
// "edits" guarda solo las clases tocadas; el resto se lee en vivo de lo guardado.
const ALL_SEMESTERS = '';

const AttendanceSheetEditor = ({ group, period, sessions, students }: AttendanceSheetEditorProps) => {
  const permissions = usePermissions();
  const [edits, setEdits] = useState<Record<string, SessionDraft>>({});
  const classDates = listClassDates(period).map((classDate) => classDate.date);
  const [newDate, setNewDate] = useState(() => {
    const savedDates = new Set(sessions.map((session) => session.date));
    return pickDefaultClassDate(classDates.filter((classDate) => !savedDates.has(classDate)), todayIso());
  });
  // Reinicia el campo de fecha cuando la app cambia la fecha sola (DateInput guarda su texto).
  const [newDateVersion, setNewDateVersion] = useState(0);
  const [semesterFilter, setSemesterFilter] = useState(ALL_SEMESTERS);
  const [dateToDelete, setDateToDelete] = useState<string | null>(null);
  const [wasSaved, setWasSaved] = useState(false);
  const { error, isRunning, run, setError } = useAsyncAction();

  const canCreate = permissions.can('attendance', 'create');
  const canEdit = permissions.can('attendance', 'edit');
  const canDelete = permissions.can('attendance', 'delete');
  const studentIds = students.map((student) => student.id);
  const savedByDate = new Map(sessions.map((session) => [session.date, session]));
  const sheetDates = [...new Set([...savedByDate.keys(), ...Object.keys(edits)])].sort();
  const allDates = sheetDates.filter(
    (date) => semesterFilter === ALL_SEMESTERS || String(getSemesterIndex(period, date)) === semesterFilter,
  );
  const semesterOptions = (period.semesters ?? []).map((_, index) => ({ label: SEMESTER_NAMES[index], value: String(index) }));

  const getDraft = (date: string) => edits[date] ?? toSessionDraft(savedByDate.get(date));
  const isDirty = (date: string) => Boolean(edits[date]) && !isSameDraft(edits[date], toSessionDraft(savedByDate.get(date)));
  const dirtyDates = sheetDates.filter(isDirty);
  const columns: SheetColumn[] = allDates.map((date) => {
    const isSaved = savedByDate.has(date);
    const draft = getDraft(date);
    const presentCount = studentIds.filter((studentId) => draft.marks[studentId] && draft.marks[studentId] !== 'absent').length;
    return { date, draft, isEditable: isSaved ? canEdit : canCreate, isSaved, presentCount };
  });
  const canSaveSomething = canCreate || canEdit;

  const updateDraft = (date: string, change: (draft: SessionDraft) => SessionDraft) => {
    setEdits((currentEdits) => ({ ...currentEdits, [date]: change(currentEdits[date] ?? toSessionDraft(savedByDate.get(date))) }));
    setWasSaved(false);
  };

  const handleToggleMark = (date: string, studentId: string) =>
    updateDraft(date, (draft) => {
      const nextMark = getNextMark(draft.marks[studentId]);
      const marks = { ...draft.marks };
      if (nextMark) marks[studentId] = nextMark;
      else delete marks[studentId];
      return { ...draft, marks };
    });

  const handleScoreChange = (date: string, studentId: string, score: number | null) =>
    updateDraft(date, (draft) => ({ ...draft, dailyScores: { ...draft.dailyScores, [studentId]: score } }));

  const handleAddClass = () => {
    if (!newDate) {
      setError(`Elige un ${INSTITUTE.classWeekdayName} de clase del período que aún no esté en la hoja.`);
      return;
    }
    if (sheetDates.includes(newDate)) {
      setError(`Ya hay una clase el ${formatDate(newDate)} en esta hoja.`);
      return;
    }
    setError(null);
    setEdits((currentEdits) => ({ ...currentEdits, [newDate]: EMPTY_DRAFT }));
    // Deja listo el siguiente día de clase libre.
    setNewDate(classDates.find((classDate) => classDate > newDate && !sheetDates.includes(classDate)) ?? '');
    setNewDateVersion((version) => version + 1);
  };

  const handleRemoveColumn = (date: string) => {
    if (savedByDate.has(date)) {
      setDateToDelete(date);
      return;
    }
    setEdits(({ [date]: _removedDraft, ...remainingEdits }) => remainingEdits);
  };

  const handleDeleteSavedClass = async (date: string) => {
    await deleteAttendanceSession(group, date);
    setEdits(({ [date]: _removedDraft, ...remainingEdits }) => remainingEdits);
  };

  const handleSave = async () => {
    const drafts = Object.fromEntries(dirtyDates.map((date) => [date, keepRosterOnly(edits[date], studentIds)]));
    if (await run(() => saveAttendanceSessions(group, drafts))) {
      setEdits({});
      setWasSaved(true);
    }
  };

  return (
    <section className="attendance-sheet panel">
      <SheetHeader
        className={group.className}
        periodName={period.name}
        subjectName={group.subjectName}
        teacherName={group.teacherName}
      />
      <div className="sheet-toolbar">
        {canCreate && (
          <div className="sheet-add-class">
            <DateInput
              id="sheet-new-date"
              isDateEnabled={(isoDate) => classDates.includes(isoDate) && !sheetDates.includes(isoDate)}
              key={newDateVersion}
              onChange={setNewDate}
              value={newDate}
            />
            <button className="btn btn-secondary" onClick={handleAddClass} type="button">
              <CalendarPlus size={17} />
              Agregar fecha
            </button>
          </div>
        )}
        <div className="sheet-actions">
          <SaveState canSave={canSaveSomething} isDirty={dirtyDates.length > 0} wasSaved={wasSaved} />
          {permissions.can('attendance', 'export') && (
            <ExportButton
              disabled={sessions.length === 0}
              onExport={() => exportToExcel(`Asistencia ${getGroupLabel(group)}`, getSheetExportColumns(sessions), students)}
            />
          )}
          {permissions.can('attendance', 'print') && (
            <button className="btn btn-ghost" onClick={() => window.print()} type="button">
              <Printer size={17} />
              Imprimir
            </button>
          )}
          {canSaveSomething && (
            <button className="btn btn-primary" disabled={isRunning || dirtyDates.length === 0} onClick={handleSave} type="button">
              {isRunning ? 'Guardando…' : 'Guardar hoja'}
            </button>
          )}
        </div>
      </div>
      {semesterOptions.length > 0 && sheetDates.length > 0 && (
        <div className="sheet-semester-filter">
          <FilterChips
            allLabel="Todo el período"
            label="Semestre"
            onChange={setSemesterFilter}
            options={semesterOptions}
            value={semesterFilter}
          />
        </div>
      )}
      {error && <p className="form-alert sheet-alert">{error}</p>}
      {sheetDates.length > 0 && allDates.length === 0 && (
        <p className="sheet-empty">Este semestre todavía no tiene fechas en la hoja.</p>
      )}
      {sheetDates.length === 0 && (
        <p className="sheet-empty">Todavía no hay fechas en esta hoja. Pasa lista en "Clase del día" o elige una fecha y toca "Agregar fecha".</p>
      )}
      {allDates.length > 0 && (
        <SheetTable
          canDeleteColumn={canDelete}
          columns={columns}
          onDeleteColumn={handleRemoveColumn}
          onScoreChange={handleScoreChange}
          onToggleMark={handleToggleMark}
          students={students}
        />
      )}
      <p className="sheet-legend">A: P presente, T tarde, F falta (toca la celda para cambiar). ND: nota diaria de 0 a 100.</p>
      {dateToDelete && (
        <ConfirmDialog
          confirmLabel="Quitar clase"
          description={`Se borrará la asistencia y las notas diarias del ${formatDate(dateToDelete)}.`}
          item={dateToDelete}
          onCancel={() => setDateToDelete(null)}
          onConfirm={handleDeleteSavedClass}
          title="Quitar clase de la hoja"
        />
      )}
    </section>
  );
};

export default AttendanceSheetEditor;
