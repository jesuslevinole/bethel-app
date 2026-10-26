import { X } from 'lucide-react';
import { Fragment } from 'react';
import type { RosterStudent, SessionDraft } from '../../../types/index';
import { formatDate } from '../../../utils/dateFormat';
import { averageScores, formatScore } from '../gradeScores';
import MarkCell from './MarkCell';
import ScoreCell from './ScoreCell';

export interface SheetColumn {
  date: string;
  draft: SessionDraft;
  isEditable: boolean;
  isSaved: boolean;
  presentCount: number;
}

interface SheetTableProps {
  canDeleteColumn: boolean;
  columns: SheetColumn[];
  onDeleteColumn: (date: string) => void;
  onScoreChange: (date: string, studentId: string, score: number | null) => void;
  onToggleMark: (date: string, studentId: string) => void;
  students: RosterStudent[];
}

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const getWeekday = (isoDate: string) => {
  const [year, month, day] = isoDate.split('-').map(Number);
  return WEEKDAYS[new Date(year, month - 1, day).getDay()];
};

// Resumen de la fila: clases asistidas (presente o tarde) sobre clases marcadas, y promedio de ND.
const getRowSummary = (columns: SheetColumn[], studentId: string) => {
  const marks = columns.map((column) => column.draft.marks[studentId]).filter(Boolean);
  const attended = marks.filter((mark) => mark !== 'absent').length;
  return {
    attendance: marks.length > 0 ? `${attended}/${marks.length}` : '—',
    dailyAverage: formatScore(averageScores(columns.map((column) => column.draft.dailyScores[studentId]))),
  };
};

const SheetTable = ({ canDeleteColumn, columns, onDeleteColumn, onScoreChange, onToggleMark, students }: SheetTableProps) => (
  <div className="sheet-scroll">
    <table className="sheet-table">
      <thead>
        <tr>
          <th className="sheet-student-head" rowSpan={2} scope="col">
            Alumno
          </th>
          {columns.map(({ date, isSaved }) => (
            <th className="sheet-date-head" colSpan={2} key={date} scope="colgroup">
              <span className="sheet-date">{formatDate(date).slice(0, 5)}</span>
              <span className="sheet-weekday">{getWeekday(date)}</span>
              {(canDeleteColumn || !isSaved) && (
                <button
                  aria-label={`Quitar la clase del ${formatDate(date)}`}
                  className="sheet-remove-column"
                  onClick={() => onDeleteColumn(date)}
                  title="Quitar esta clase"
                  type="button"
                >
                  <X size={12} />
                </button>
              )}
            </th>
          ))}
          <th className="sheet-summary-head" rowSpan={2} scope="col">
            Asistencia
          </th>
          <th className="sheet-summary-head" rowSpan={2} scope="col">
            ND prom.
          </th>
        </tr>
        <tr>
          {columns.map(({ date }) => (
            <Fragment key={date}>
              <th className="sheet-sub-head" scope="col" title="Asistencia">
                A
              </th>
              <th className="sheet-sub-head" scope="col" title="Nota diaria">
                ND
              </th>
            </Fragment>
          ))}
        </tr>
      </thead>
      <tbody>
        {students.map((student, index) => {
          const summary = getRowSummary(columns, student.id);
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
              {columns.map(({ date, draft, isEditable }) => (
                <Fragment key={date}>
                  <td className="sheet-cell sheet-cell-mark">
                    <MarkCell
                      isEditable={isEditable}
                      label={`Asistencia de ${student.name} el ${formatDate(date)}`}
                      mark={draft.marks[student.id]}
                      onToggle={() => onToggleMark(date, student.id)}
                    />
                  </td>
                  <td className="sheet-cell sheet-cell-score">
                    <ScoreCell
                      isEditable={isEditable}
                      label={`Nota diaria de ${student.name} el ${formatDate(date)}`}
                      onChange={(score) => onScoreChange(date, student.id, score)}
                      value={draft.dailyScores[student.id]}
                    />
                  </td>
                </Fragment>
              ))}
              <td className="sheet-summary">{summary.attendance}</td>
              <td className="sheet-summary">{summary.dailyAverage}</td>
            </tr>
          );
        })}
      </tbody>
      <tfoot>
        <tr>
          <th className="sheet-student" scope="row">
            Presentes
          </th>
          {columns.map(({ date, presentCount }) => (
            <td className="sheet-total" colSpan={2} key={date}>
              {presentCount}
              <span className="sheet-total-of"> / {students.length}</span>
            </td>
          ))}
          <td className="sheet-summary" colSpan={2} />
        </tr>
      </tfoot>
    </table>
  </div>
);

export default SheetTable;
