import { CheckCheck } from 'lucide-react';
import { useState } from 'react';
import { useAsyncAction } from '../../../shared/hooks/useAsyncAction';
import type { AttendanceMark, Student, TeachingGroup } from '../../../types/index';
import { formatDate } from '../../../utils/dateFormat';
import { countMarks, pickMarks } from '../attendanceMarks';
import { getGroupLabel } from '../teachingGroups';
import { saveAttendance } from '../services/attendanceSheets';
import MarkButtons from './MarkButtons';
import SaveState from './SaveState';

interface AttendanceEditorProps {
  canSave: boolean;
  date: string;
  group: TeachingGroup;
  savedMarks: Record<string, AttendanceMark>;
  students: Student[];
}

const sameMarks = (first: Record<string, AttendanceMark>, second: Record<string, AttendanceMark>) =>
  JSON.stringify(Object.entries(first).sort()) === JSON.stringify(Object.entries(second).sort());

// Se monta de nuevo (key) por cada grupo y fecha: parte siempre de lo guardado en esa planilla.
const AttendanceEditor = ({ canSave, date, group, savedMarks, students }: AttendanceEditorProps) => {
  const studentIds = students.map((student) => student.id);
  const [marks, setMarks] = useState(() => pickMarks(studentIds, savedMarks));
  const [wasSaved, setWasSaved] = useState(false);
  const { error, isRunning, run } = useAsyncAction();

  const counts = countMarks(studentIds, marks);
  const isDirty = !sameMarks(marks, pickMarks(studentIds, savedMarks));

  const handleMark = (studentId: string, mark: AttendanceMark) => {
    setMarks((currentMarks) => ({ ...currentMarks, [studentId]: mark }));
    setWasSaved(false);
  };

  const handleMarkAllPresent = () => {
    setMarks(Object.fromEntries(studentIds.map((studentId) => [studentId, 'present'])) as Record<string, AttendanceMark>);
    setWasSaved(false);
  };

  const handleSave = async () => {
    if (await run(() => saveAttendance(group, date, marks))) setWasSaved(true);
  };

  const summaryItems = [
    { count: counts.present, label: 'Presentes', tone: 'badge-success' },
    { count: counts.late, label: 'Tardes', tone: 'badge-warning' },
    { count: counts.absent, label: 'Faltas', tone: 'badge-danger' },
    { count: counts.unmarked, label: 'Sin marcar', tone: 'badge-muted' },
  ];

  return (
    <div className="session-grid">
      <section className="panel">
        <header className="panel-header">
          <div>
            <h2 className="panel-title">{getGroupLabel(group)}</h2>
            <p className="view-subtitle">{formatDate(date)}</p>
          </div>
          {canSave && (
            <button className="btn btn-secondary" onClick={handleMarkAllPresent} type="button">
              <CheckCheck size={18} />
              Todos presentes
            </button>
          )}
        </header>
        <ol className="roll-list">
          {students.map((student, index) => (
            <li className="roll-row" key={student.id}>
              <span className="roll-number">{index + 1}</span>
              <span className="roll-student">
                <span className="roll-student-name">{student.name}</span>
                <span className="cell-id">{student.code}</span>
              </span>
              <MarkButtons
                disabled={!canSave}
                onMark={(mark) => handleMark(student.id, mark)}
                selectedMark={marks[student.id]}
                studentName={student.name}
              />
            </li>
          ))}
        </ol>
      </section>
      <aside className="panel session-side">
        <h2 className="panel-title">Resumen</h2>
        <dl className="roll-summary">
          {summaryItems.map(({ count, label, tone }) => (
            <div className="roll-summary-item" key={label}>
              <dt>{label}</dt>
              <dd className={`badge ${tone}`}>{count}</dd>
            </div>
          ))}
        </dl>
        {error && <p className="form-alert">{error}</p>}
        {canSave && (
          <button className="btn btn-block btn-primary" disabled={isRunning} onClick={handleSave} type="button">
            {isRunning ? 'Guardando…' : 'Guardar asistencia'}
          </button>
        )}
        <SaveState canSave={canSave} isDirty={isDirty} wasSaved={wasSaved} />
      </aside>
    </div>
  );
};

export default AttendanceEditor;
